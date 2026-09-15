"use client";

import React, { useState } from "react";
import {
  X,
  Download,
  Printer,
  FileText,
  Loader2,
} from "lucide-react";
import { AdminAgreementRecord } from "@/redux/features/client/clientApi";
import { downloadAgreementPdf } from "@/lib/utils/agreement-pdf";
import { downloadAuthorityDocument } from "@/lib/utils/authority-document-download";
import { showToast, showErrorAlert } from "@/lib/alerts/sweetalert";
import { AgreementDocumentContent } from "../dashboard/agreement-document-content";

interface AgreementPreviewModalProps {
  agreement: AdminAgreementRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AgreementPreviewModal({
  agreement,
  isOpen,
  onClose,
}: AgreementPreviewModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !agreement) return null;

  const authDocUrl = agreement.authorityDocumentUrl || agreement.documentUrl;
  const signerName =
    agreement.signerName ||
    agreement.clientFullName ||
    agreement.clientName ||
    "Signer";

  const rawDate =
    agreement.agreementDate ||
    agreement.signedAt ||
    agreement.executedAt ||
    agreement.signedDate;

  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Executed & Active";

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      showToast(`Generating official PDF for ${agreement.clientName}...`);
      await downloadAgreementPdf({
        ...agreement,
        clientFullName: agreement.clientFullName || agreement.clientName,
        email: agreement.email || agreement.clientEmail,
      });
    } catch (err: any) {
      console.error("PDF Download error:", err);
      showErrorAlert("Download Failed", "Failed to generate agreement PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#243746]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-[#D9E4EC] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Top Action Bar */}
        <div className="px-6 py-4 border-b border-[#D9E4EC] bg-[#F7FAFC] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF3F8] text-[#294B68] flex items-center justify-center border border-[#5E8FB2]/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#243746] flex items-center gap-2">
                <span>{agreement.clientName}</span>
                <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-[#294B68]/10 text-[#294B68]">
                  {agreement.state} Agreement
                </span>
              </h2>
              <p className="text-xs text-[#64748B]">
                ID: {agreement.clientNumber} • Version {agreement.version || "v2.0"} • {formattedDate}
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {authDocUrl ? (
              <button
                type="button"
                onClick={() =>
                  downloadAuthorityDocument({
                    url: authDocUrl,
                    agreementId: agreement.id,
                    customName: `AgeWellRI_Legal_Authority_${signerName.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
                  })
                }
                className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                title="Download Uploaded Legal Authority Document (POA / Guardianship)"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>Authority Doc</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-3.5 py-2 rounded-xl bg-[#294B68] hover:bg-[#1E374D] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#D9E4EC] bg-white hover:bg-[#F8FAFC] text-[#243746] text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-[#D9E4EC] bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-[#64748B] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Agreement Body (Same Canonical Renderer) */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-[#F8FAFC]">
          <AgreementDocumentContent agreement={agreement} />
        </div>

        {/* Modal Bottom Bar */}
        <div className="px-6 py-4 border-t border-[#D9E4EC] bg-[#F7FAFC] flex items-center justify-between shrink-0">
          <span className="text-xs text-[#64748B]">
            Official legal service agreement record for <strong>{agreement.clientName}</strong>
          </span>
          <div className="flex items-center gap-2">
            {authDocUrl ? (
              <button
                type="button"
                onClick={() =>
                  downloadAuthorityDocument({
                    url: authDocUrl,
                    agreementId: agreement.id,
                    customName: `AgeWellRI_Legal_Authority_${signerName.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
                  })
                }
                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>Authority Doc</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-4 py-2 rounded-xl bg-[#294B68] hover:bg-[#1E374D] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Download Official PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#D9E4EC] bg-white hover:bg-[#F8FAFC] text-[#243746] text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

