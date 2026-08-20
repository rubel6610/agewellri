"use client";

import React from "react";
import { FileText, Download, CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { Report } from "@/lib/types/dashboard";

interface ReportCardProps {
  report: Report;
}

export function ReportCard({ report }: ReportCardProps) {
  const isAvailable = report.status === "available";

  return (
    <div className="bg-white rounded-2xl border border-[#D9E4EC] p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#5E8FB2] transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-[#EAF3F8] rounded-xl text-[#294B68] shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-[#243746] text-base sm:text-lg">
              {report.title}
            </h4>
            <p className="text-xs text-[#64748B] mt-0.5">
              Completed Visit Date: <strong>{report.visitDate}</strong>
            </p>
          </div>
        </div>

        {isAvailable && report.score !== undefined && (
          <div className="text-right shrink-0">
            <span className="text-2xl font-extrabold text-[#294B68]">
              {report.score}
            </span>
            <span className="text-xs text-[#64748B] block font-semibold">/100 Score</span>
          </div>
        )}
      </div>

      {/* Summary Box */}
      <div className="p-4 bg-[#F7FAFC] rounded-xl border border-[#D9E4EC] text-sm text-[#243746]">
        <p className="text-xs text-[#64748B] font-bold uppercase tracking-wider mb-1">
          Specialist Assessment Summary
        </p>
        <p className="leading-relaxed">{report.summary}</p>

        {report.recommendationsCount > 0 && (
          <div className="mt-2 text-xs font-semibold text-[#5E8FB2] flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{report.recommendationsCount} safety recommendations outlined in report</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-[#D9E4EC]">
        {isAvailable ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#3F8F6B]">
            <CheckCircle2 className="w-4 h-4" />
            Report available
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#C28A3A]">
            <Clock className="w-4 h-4" />
            Report pending preparation
          </span>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert(`Opening ${report.title} online view`)}
            disabled={!isAvailable}
            className="px-3.5 py-2 text-xs font-bold text-[#294B68] bg-[#EAF3F8] hover:bg-[#D9E4EC] rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            View Report
          </button>
          <button
            onClick={() => alert(`Downloading PDF for ${report.title}`)}
            disabled={!isAvailable}
            aria-label={`Download PDF for ${report.title}`}
            className="p-2 text-xs font-bold text-white bg-[#294B68] hover:bg-[#1E374D] rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
