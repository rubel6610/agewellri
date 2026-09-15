"use client";

import React, { useState } from "react";
import {
  FileCheck,
  Download,
  Printer,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { AgreementDocument } from "@/redux/features/auth/authTypes";
import { downloadAgreementPdf } from "@/lib/utils/agreement-pdf";
import { downloadAuthorityDocument } from "@/lib/utils/authority-document-download";
import { showErrorAlert, showToast } from "@/lib/alerts/sweetalert";
import { AgreementDocumentContent } from "./agreement-document-content";

interface FullAgreementViewerProps {
  agreement: AgreementDocument;
}

export function FullAgreementViewer({ agreement }: FullAgreementViewerProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const authDocUrl = agreement.authorityDocumentUrl || agreement.documentUrl;
  const signerName =
    agreement.repFullName ||
    agreement.signerName ||
    agreement.authorizedRepName ||
    agreement.clientFullName ||
    "Signer";

  const statusUpper = (agreement.status || "").toUpperCase();
  const isExecuted =
    Boolean(agreement.clientSignature) ||
    statusUpper === "EXECUTED" ||
    statusUpper === "SIGNED" ||
    statusUpper === "ACTIVE" ||
    statusUpper === "COMPLETED" ||
    Boolean(agreement.signedAt) ||
    Boolean(agreement.executedAt);

  const rawDate =
    agreement.agreementDate ||
    agreement.signedAt ||
    agreement.executedAt ||
    agreement.createdAt;

  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : isExecuted
      ? "Executed & Active"
      : "Pending Execution";

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      showToast("Generating comprehensive agreement PDF...");
      await downloadAgreementPdf({
        ...agreement,
        clientName: agreement.clientFullName,
      });
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      showErrorAlert(
        "PDF Generation Error",
        "Unable to generate PDF directly. You can also use the Print button to Save as PDF.",
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Actions Bar (Hidden during Print) */}
      <div className="print:hidden bg-white rounded-3xl border border-[#D9E4EC] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF3F8] text-[#294B68] flex items-center justify-center shrink-0 border border-[#5E8FB2]/30">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-bold text-[#243746]">
                Client Service Agreement
              </h2>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isExecuted
                    ? "bg-[#EBF8F2] text-[#166534] border border-[#166534]/20"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  {isExecuted ? "Executed & Active" : "Pending Signature"}
                </span>
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Client ID:{" "}
              <strong>{agreement.clientNumber || "AW-MEMBER"}</strong> •
              Template Version:{" "}
              <strong>{agreement.templateVersion || "v2.0"}</strong> •
              Executed: <strong>{formattedDate}</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          {/* {authDocUrl ? (
            <button
              type="button"
              onClick={() =>
                downloadAuthorityDocument({
                  url: authDocUrl,
                  agreementId: agreement.id,
                  customName: `AgeWellRI_Legal_Authority_${signerName.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
                })
              }
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs sm:text-sm rounded-xl border border-emerald-300 transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
              title="Download Uploaded Legal Authority Document (POA / Guardianship)"
            >
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Authority Doc</span>
              <Download className="w-3.5 h-3.5 text-emerald-700" />
            </button>
          ) : null} */}

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 bg-[#F7FAFC] hover:bg-[#EAF3F8] text-[#243746] font-bold text-xs sm:text-sm rounded-xl border border-[#D9E4EC] transition-colors flex items-center gap-2 cursor-pointer"
            title="Print or Save as PDF"
          >
            <Printer className="w-4 h-4 text-[#5E8FB2]" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="px-5 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Canonical Agreement Document Content */}
      <AgreementDocumentContent agreement={agreement} />
    </div>
  );
}

