import { getAuthToken } from "@/lib/auth/token";
import { showErrorAlert, showToast } from "@/lib/alerts/sweetalert";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");
const BACKEND_BASE = API_BASE.replace(/\/api\/v1$/, "");

export interface DownloadAuthorityDocOptions {
  url?: string | null;
  agreementId?: string | null;
  fileName?: string | null;
  customName?: string | null;
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

  if (agreementId) {
    return `${API_BASE}/agreements/${agreementId}/authority-document/${endpoint}${tokenParam ? `?${tokenParam}` : ""}`;
  }

  if (url) {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      const separator = url.includes("?") ? "&" : "?";
      return tokenParam ? `${url}${separator}${tokenParam}` : url;
    }
    // Direct static or relative backend path
    const fullUrl = `${BACKEND_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
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

    if (agreementId) {
      targetUrl = `${API_BASE}/agreements/${agreementId}/authority-document/download`;
    } else if (url) {
      if (url.startsWith("http://") || url.startsWith("https://")) {
        targetUrl = url;
      } else {
        targetUrl = `${BACKEND_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
      }
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

    // Extract filename from header or fallback
    let finalFileName =
      customName ||
      fileName ||
      "AgeWellRI_Legal_Authority_Document.pdf";

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
    } else if (url && !fileName && !customName) {
      const rawName = url.split("/").pop()?.split("?")[0];
      if (rawName) {
        finalFileName = rawName;
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
