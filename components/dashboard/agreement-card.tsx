"use client";

import React from "react";
import Link from "next/link";
import { FileCheck, Download, ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";
import { Agreement } from "@/lib/types/dashboard";
import { showSuccessAlert, showToast } from "@/lib/alerts/sweetalert";

interface AgreementCardProps {
  agreement: Agreement;
}

export function AgreementCard({ agreement }: AgreementCardProps) {
  const isExecuted = agreement.status === "executed" || agreement.status === "signed";

  const handleDownload = () => {
    showToast("Downloading Agreement PDF...");
  };

  return (
    <div className="bg-white rounded-2xl border border-[#D9E4EC] p-6 shadow-xs space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3.5 bg-[#EAF3F8] text-[#294B68] rounded-2xl shrink-0">
            <FileCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#243746]">
              {agreement.title}
            </h3>
            <p className="text-xs text-[#64748B] mt-1">
              Document Version: <strong>{agreement.version}</strong>
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
            isExecuted
              ? "bg-[#EAF3F8] text-[#3F8F6B] border border-[#3F8F6B]/30"
              : "bg-amber-50 text-[#C28A3A] border border-[#C28A3A]/30"
          }`}
        >
          {isExecuted ? (
            <ShieldCheck className="w-4 h-4 text-[#3F8F6B]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#C28A3A]" />
          )}
          {isExecuted ? "Executed & Valid" : "Requires Signature"}
        </span>
      </div>

      {/* Details Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#F7FAFC] rounded-2xl border border-[#D9E4EC] text-sm">
        <div>
          <span className="text-xs text-[#64748B] font-semibold block">Signed Date</span>
          <span className="font-bold text-[#243746]">
            {agreement.signedDate || "Not signed yet"}
          </span>
        </div>
        <div>
          <span className="text-xs text-[#64748B] font-semibold block">Last Updated</span>
          <span className="font-bold text-[#243746]">{agreement.lastUpdated}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        {isExecuted ? (
          <>
            <Link
              href="/agreement"
              className="w-full sm:w-auto px-5 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Agreement</span>
            </Link>
            <button
              type="button"
              onClick={handleDownload}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#EAF3F8] hover:bg-[#D9E4EC] text-[#294B68] font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </>
        ) : (
          <Link
            href="/agreement"
            className="w-full sm:w-auto px-6 py-3 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-base rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileCheck className="w-5 h-5" />
            <span>Review &amp; Sign Agreement</span>
          </Link>
        )}
      </div>
    </div>
  );
}
