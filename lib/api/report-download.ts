import { getAuthToken } from "@/lib/auth/token";
import { showErrorAlert } from "@/lib/alerts/sweetalert";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1").replace(/\/$/, "");

/**
 * Get authenticated download URL for a report PDF
 */
export function getReportDownloadUrl(reportId: string): string {
  const token = getAuthToken();
  const tokenParam = token ? `?token=${encodeURIComponent(token)}` : "";
  return `${API_BASE}/reports/${reportId}/download${tokenParam}`;
}

/**
 * Get authenticated preview/file streaming URL for a report PDF (for iframe or tab)
 */
export function getReportFileUrl(reportId: string): string {
  const token = getAuthToken();
  const tokenParam = token ? `?token=${encodeURIComponent(token)}` : "";
  return `${API_BASE}/reports/${reportId}/file${tokenParam}`;
}

/**
 * Authenticated blob download for report PDFs
 */
export async function downloadReportPdf(reportId: string, customFileName?: string): Promise<void> {
  try {
    const token = getAuthToken();
    const downloadUrl = `${API_BASE}/reports/${reportId}/download`;

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(token ? `${downloadUrl}?token=${encodeURIComponent(token)}` : downloadUrl, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      let errMsg = "Failed to download report PDF.";
      try {
        const errorJson = await res.json();
        errMsg = errorJson.message || errMsg;
      } catch {
        // use fallback message
      }
      throw new Error(errMsg);
    }

    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    // Extract filename from header if available
    let fileName = customFileName || `AgeWellRI_Report_${reportId}.pdf`;
    const disposition = res.headers.get("content-disposition");
    if (disposition && disposition.includes("filename=")) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        fileName = match[1];
      }
    }

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (err: any) {
    console.error("PDF Download error:", err);
    showErrorAlert("Download Error", err?.message || "Failed to download PDF report document.");
  }
}
