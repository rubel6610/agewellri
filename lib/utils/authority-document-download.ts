import { getAuthToken } from "@/lib/auth/token";
import { showErrorAlert, showToast } from "@/lib/alerts/sweetalert";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5173/api/v1"
).replace(/\/$/, "");
const BACKEND_BASE = API_BASE.replace(/\/api\/v1$/, "");

export interface DownloadAuthorityDocOptions {
  url?: string | null;
  agreementId?: string | null;
  fileName?: string | null;
  customName?: string | null;
}

/**
 * Resolve any authority document URL to point to backend storage
 */
export function resolveBackendUrl(url?: string | null): string {
  if (!url) return "";

  // If url contains /uploads/, ensure it always resolves to BACKEND_BASE
  if (url.includes("/uploads/")) {
    const uploadPath = url.substring(url.indexOf("/uploads/"));
    return `${BACKEND_BASE}${uploadPath}`;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Relative path
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${BACKEND_BASE}${cleanPath}`;
}

/**
 * Get authenticated download URL for a Legal Authority Document (POA / Guardianship)
 */
export function getAuthorityDocumentDownloadUrl({
  url,
  agreementId,
  inline = false,
}: {
  url?: string | null;
  agreementId?: string | null;
  inline?: boolean;
}): string {
  const token = getAuthToken();
  const tokenParam = token ? `token=${encodeURIComponent(token)}` : "";
  const endpoint = inline ? "file" : "download";

  if (agreementId && !url) {
    return `${API_BASE}/agreements/${agreementId}/authority-document/${endpoint}${tokenParam ? `?${tokenParam}` : ""}`;
  }

  if (url) {
    const fullUrl = resolveBackendUrl(url);
    const separator = fullUrl.includes("?") ? "&" : "?";
    return tokenParam ? `${fullUrl}${separator}${tokenParam}` : fullUrl;
  }

  return `${API_BASE}/agreements/my-agreement/authority-document/${endpoint}${tokenParam ? `?${tokenParam}` : ""}`;
}

/**
 * Get preview / inline viewing URL for a Legal Authority Document
 */
export function getAuthorityDocumentPreviewUrl({
  url,
  agreementId,
}: {
  url?: string | null;
  agreementId?: string | null;
}): string {
  return getAuthorityDocumentDownloadUrl({
    url,
    agreementId,
    inline: true,
  });
}

/**
 * Download Legal Authority Document as a file directly in browser
 */
export async function downloadAuthorityDocument({
  url,
  agreementId,
  fileName,
  customName,
}: DownloadAuthorityDocOptions): Promise<void> {
  try {
    const token = getAuthToken();
    showToast("Downloading legal authority document...");

    let targetUrl: string;

    if (agreementId && !url) {
      targetUrl = `${API_BASE}/agreements/${agreementId}/authority-document/download`;
    } else if (url) {
      targetUrl = resolveBackendUrl(url);
    } else {
      targetUrl = `${API_BASE}/agreements/my-agreement/authority-document/download`;
    }

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const fetchUrl =
      token && !targetUrl.includes("token=")
        ? `${targetUrl}${targetUrl.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`
        : targetUrl;

    const res = await fetch(fetchUrl, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      let errMsg = "Failed to download authority document.";
      try {
        const errJson = await res.json();
        errMsg = errJson.message || errMsg;
      } catch {
        // Fallback
      }
      throw new Error(errMsg);
    }

    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    // 1. Detect actual extension from the URL or MIME type
    let actualExt = "";
    const cleanUrl = (url || targetUrl).split("?")[0].split("#")[0];
    const urlExtMatch = cleanUrl.match(/\.(pdf|png|jpe?g|webp|gif|svg|docx?)$/i);
    if (urlExtMatch) {
      actualExt = urlExtMatch[0].toLowerCase();
      if (actualExt === ".jpeg") actualExt = ".jpg";
    }

    if (!actualExt) {
      const mime = (res.headers.get("content-type") || blob.type || "").toLowerCase();
      if (mime.includes("pdf")) actualExt = ".pdf";
      else if (mime.includes("png")) actualExt = ".png";
      else if (mime.includes("jpeg") || mime.includes("jpg")) actualExt = ".jpg";
      else if (mime.includes("webp")) actualExt = ".webp";
      else if (mime.includes("gif")) actualExt = ".gif";
    }

    if (!actualExt) actualExt = ".pdf";

    // 2. Check if the server sent a filename in Content-Disposition
    let finalFileName = "";
    const disposition = res.headers.get("content-disposition");
    if (disposition && disposition.includes("filename=")) {
      const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
      if (match && match[1]) {
        try {
          finalFileName = decodeURIComponent(match[1]);
        } catch {
          finalFileName = match[1];
        }
      }
    }

    // 3. Fallback to provided names, ensuring correct extension
    if (!finalFileName) {
      const providedName = (customName || fileName || "").trim();
      if (providedName) {
        // If providedName already has an extension, replace it with the true actualExt
        const hasExt = /\.(pdf|png|jpe?g|webp|gif|svg|docx?)$/i.test(providedName);
        if (hasExt) {
          finalFileName = providedName.replace(/\.(pdf|png|jpe?g|webp|gif|svg|docx?)$/i, actualExt);
        } else {
          finalFileName = `${providedName}${actualExt}`;
        }
      } else {
        const rawName = cleanUrl.split("/").pop();
        if (rawName && /\.[a-z0-9]+$/i.test(rawName)) {
          finalFileName = rawName;
        } else {
          finalFileName = `AgeWellRI_Legal_Authority_Document${actualExt}`;
        }
      }
    }

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = finalFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (err: any) {
    console.error("Authority document download error:", err);
    showErrorAlert(
      "Download Error",
      err?.message || "Failed to download legal authority document."
    );
  }
}
