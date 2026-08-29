"use client";

import React from "react";
import { FileText, Download, CheckCircle2, Clock, UserCheck } from "lucide-react";
import { ReportItem } from "@/redux/features/report/reportTypes";
import { downloadReportPdf } from "@/lib/api/report-download";

interface ReportCardProps {
  report: ReportItem | any;
}

export function ReportCard({ report }: ReportCardProps) {
  const isAvailable =
    report.status === "available" ||
    report.status === "UPLOADED" ||
    report.status === "GENERATED" ||
    report.reportStatus === "UPLOADED";

  const formattedDate =
    report.formattedVisitDate ||
    (report.visitDate
      ? new Date(report.visitDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Recent Visit");

  const handleDownload = () => {
    const reportId = report.id || report.reportId;
    downloadReportPdf(reportId, `${report.title || "Visit_Report"}.pdf`);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#D9E4EC] p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#5E8FB2] transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-[#EAF3F8] rounded-xl text-[#294B68] shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-[#243746] text-base sm:text-lg">
              {report.title || `${report.serviceType || "Visit"} Report`}
            </h4>
            <p className="text-xs text-[#64748B] mt-0.5">
              Service: <strong className="text-[#243746]">{report.serviceType || "Home Safety Visit"}</strong>
            </p>
            <p className="text-xs text-[#64748B] mt-0.5">
              Visit Date: <strong>{formattedDate}</strong>
            </p>
          </div>
        </div>

        {report.specialistName && (
          <div className="text-right shrink-0 hidden sm:block">
            <span className="text-[11px] text-[#94A3B8] block uppercase font-bold">Specialist</span>
            <span className="text-xs font-bold text-[#294B68] flex items-center justify-end gap-1">
              <UserCheck className="w-3.5 h-3.5 text-[#5E8FB2]" />
              {report.specialistName}
            </span>
          </div>
        )}
      </div>

      {/* Summary Box */}
      <div className="p-4 bg-[#F7FAFC] rounded-xl border border-[#D9E4EC] text-sm text-[#243746]">
        <p className="text-xs text-[#64748B] font-bold uppercase tracking-wider mb-1">
          Specialist Visit Summary
        </p>
        <p className="leading-relaxed text-xs sm:text-sm">
          {report.summary ||
            "Official visit report uploaded following your completed AgeWellRI service visit."}
        </p>
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

        <button
          type="button"
          onClick={handleDownload}
          disabled={!isAvailable}
          aria-label={`Download PDF for ${report.title}`}
          className="px-4 py-2 text-xs font-bold text-white bg-[#294B68] hover:bg-[#1E374D] rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </button>
      </div>
    </div>
  );
}
