"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  Download,
  Printer,
  ShieldCheck,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { AdminAgreementRecord } from "@/redux/features/client/clientApi";
import { downloadAgreementPdf } from "@/lib/utils/agreement-pdf";
import { showToast, showErrorAlert } from "@/lib/alerts/sweetalert";

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

  const isExecuted =
    agreement.status === "EXECUTED" ||
    agreement.status === "SIGNED" ||
    Boolean(agreement.clientSignature) ||
    Boolean(agreement.signedDate);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      showToast(`Generating official PDF for ${agreement.clientName}...`);
      await downloadAgreementPdf({
        ...agreement,
        clientFullName: agreement.clientName,
        email: agreement.clientEmail,
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
                ID: {agreement.clientNumber} • Version {agreement.version}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

        {/* Modal Scrollable Agreement Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-[#243746] bg-white">
          {/* Header Banner */}
          <div className="p-6 bg-[#243746] text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="AgeWellRI Logo"
                width={140}
                height={36}
                className="h-8 w-auto brightness-0 invert object-contain"
              />
              <div className="border-l border-white/20 pl-3">
                <h3 className="text-sm font-bold text-white">
                  Client Service Agreement
                </h3>
                <p className="text-xs text-[#9EC8E2]">
                  {agreement.state} Statutory Master Copy
                </p>
              </div>
            </div>

            <div>
              {isExecuted ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Executed & Active</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Pending Signature</span>
                </span>
              )}
            </div>
          </div>

          {/* Section 1: Client Overview */}
          <div className="border border-[#D9E4EC] rounded-2xl p-5 bg-[#F7FAFC] space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#5E8FB2]">
              1. Client Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[#64748B] block font-semibold">
                  Client Name:
                </span>
                <strong className="text-sm text-[#243746]">
                  {agreement.clientName}
                </strong>
              </div>
              <div>
                <span className="text-[#64748B] block font-semibold">
                  Client ID / Number:
                </span>
                <strong className="text-sm text-[#243746]">
                  {agreement.clientNumber}
                </strong>
              </div>
              <div>
                <span className="text-[#64748B] block font-semibold">
                  Primary Contact Email:
                </span>
                <span className="text-[#243746] font-medium">
                  {agreement.clientEmail}
                </span>
              </div>
              <div>
                <span className="text-[#64748B] block font-semibold">
                  Jurisdiction State:
                </span>
                <span className="text-[#243746] font-medium">
                  {agreement.state}
                </span>
              </div>
              <div>
                <span className="text-[#64748B] block font-semibold">
                  Selected Service Plan:
                </span>
                <strong className="text-[#294B68]">{agreement.planName}</strong>
              </div>
              <div>
                <span className="text-[#64748B] block font-semibold">
                  Light Cleaning Add-on:
                </span>
                <span className="text-[#243746] font-medium">
                  {agreement.hasCleaningAddon
                    ? "Enrolled (+6 visits/yr)"
                    : "Not Enrolled"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Statutory 3-Day Right to Cancel */}
          <div className="border border-rose-200 bg-rose-50/60 rounded-2xl p-5 space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>
                2. State Statutory Consumer Rights ({agreement.state})
              </span>
            </h4>
            <p className="text-xs text-rose-900 leading-relaxed">
              Under {agreement.state} Consumer Protection Regulations, you may
              cancel this agreement at any time prior to midnight of the third
              business day after the date of this transaction without any
              penalty or obligation.
            </p>
            {agreement.cancellationDeadline && (
              <div className="text-xs font-bold text-rose-950 pt-1">
                Statutory Cancellation Deadline:{" "}
                {agreement.cancellationDeadline}
              </div>
            )}
          </div>

          {/* Section 3: Signatures */}
          <div className="border border-[#D9E4EC] rounded-2xl p-5 bg-[#F7FAFC] space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#5E8FB2]">
              3. Execution & E-Signatures
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-xl border border-[#D9E4EC] space-y-2">
                <div className="text-[11px] font-bold text-[#64748B] uppercase">
                  Client / Representative Signature
                </div>
                <div className="h-14 flex items-center border-b border-dashed border-[#D9E4EC]">
                  {agreement.clientSignature ? (
                    agreement.clientSignature.startsWith("data:image") ? (
                      <img
                        src={agreement.clientSignature}
                        alt="Client Signature"
                        className="max-h-12 w-auto object-contain"
                      />
                    ) : (
                      <span className="font-serif italic text-lg text-[#294B68]">
                        {agreement.clientSignature}
                      </span>
                    )
                  ) : (
                    <span className="text-xs italic text-[#64748B]">
                      Pending Signature
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#64748B] space-y-0.5">
                  <div>
                    <strong>Signer:</strong> {agreement.signerName} (
                    {agreement.signerRole})
                  </div>
                  <div>
                    <strong>Date:</strong>{" "}
                    {agreement.signedDate || "Awaiting Signature"}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-[#D9E4EC] space-y-2">
                <div className="text-[11px] font-bold text-[#64748B] uppercase">
                  AgeWellRI Authorized Officer
                </div>
                <div className="h-14 flex items-center border-b border-dashed border-[#D9E4EC]">
                  <span className="font-serif italic text-lg text-[#294B68]">
                    Sarah Jenkins, Director of Operations
                  </span>
                </div>
                <div className="text-[11px] text-[#64748B] space-y-0.5">
                  <div>
                    <strong>Officer:</strong> Sarah Jenkins
                  </div>
                  <div>
                    <strong>Status:</strong> Verified AgeWellRI Safety Oversight
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="px-6 py-4 border-t border-[#D9E4EC] bg-[#F7FAFC] flex items-center justify-between shrink-0">
          <span className="text-xs text-[#64748B]">
            Official legal document for <strong>{agreement.clientName}</strong>
          </span>
          <div className="flex items-center gap-2">
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
