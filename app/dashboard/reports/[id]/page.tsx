"use client";

import React, { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Calendar,
  UserCheck,
  MapPin,
  Clock,
  Loader2,
  FileText,
  AlertTriangle,
  ExternalLink,
  FileCheck2,
} from "lucide-react";
import { useGetReportByIdQuery } from "@/redux/features/report/reportApi";
import { downloadReportPdf, getReportFileUrl } from "@/lib/api/report-download";

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { data: reportRes, isLoading, error } = useGetReportByIdQuery(resolvedParams.id);
  const report = reportRes?.data;

  if (isLoading) {
    return (
      <div className="p-16 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#294B68]" />
        <p className="font-bold text-sm text-[#243746]">Loading your visit report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-[#D9E4EC] space-y-4 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#243746]">Report Not Found</h2>
        <p className="text-sm text-[#64748B]">
          The requested visit report could not be found or you do not have permission to view it.
        </p>
        <Link
          href="/dashboard/reports"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#294B68] text-white text-xs font-bold rounded-xl hover:bg-[#1E374D]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Reports</span>
        </Link>
      </div>
    );
  }

  const handleDownload = () => {
    downloadReportPdf(report.id, `${report.title || "Visit_Report"}.pdf`);
  };

  const fileUrl = getReportFileUrl(report.id);

  const formattedUploadDate = report.uploadedAt
    ? new Date(report.uploadedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-[#243746]">
      {/* Back Button */}
      <div>
        <Link
          href="/dashboard/reports"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#5E8FB2] hover:text-[#294B68] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Reports</span>
        </Link>
      </div>

      {/* Main Report Document Card */}
      <div className="bg-white rounded-3xl border border-[#D9E4EC] shadow-sm overflow-hidden space-y-8 p-6 sm:p-10">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D9E4EC]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EAF3F8] text-[#294B68] flex items-center gap-1 border border-[#5E8FB2]/20">
                <FileCheck2 className="w-3.5 h-3.5" /> Official Visit Report
              </span>
              <span className="text-xs text-[#64748B] font-semibold">{report.reportNumber}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746] tracking-tight">
              {report.title || `${report.serviceType} Report`}
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Visit completed on <strong>{report.formattedVisitDate}</strong> by specialist{" "}
              <strong>{report.specialistName}</strong> ({report.specialistTitle}).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="px-5 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Member & Visit Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-[#F7FAFC] rounded-2xl border border-[#D9E4EC]">
          <div className="space-y-1">
            <span className="text-xs text-[#64748B] font-bold uppercase tracking-wider block">Member</span>
            <p className="font-bold text-sm text-[#243746]">{report.clientName}</p>
            <p className="text-xs text-[#64748B]">{report.clientNumber}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-[#64748B] font-bold uppercase tracking-wider block">Service</span>
            <p className="font-bold text-sm text-[#243746]">{report.serviceType}</p>
            <p className="text-xs text-[#64748B]">Completed Visit</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-[#64748B] font-bold uppercase tracking-wider block">Assigned Specialist</span>
            <p className="font-bold text-sm text-[#243746]">{report.specialistName}</p>
            <p className="text-xs text-[#64748B]">{report.specialistTitle}</p>
          </div>
        </div>

        {/* Specialist Summary Box */}
        {report.summary && (
          <div className="p-5 bg-white rounded-2xl border border-[#D9E4EC] space-y-2">
            <h4 className="text-xs font-bold uppercase text-[#64748B] tracking-wider">
              Specialist Summary &amp; Notes
            </h4>
            <p className="text-sm text-[#243746] leading-relaxed">
              {report.summary}
            </p>
            {formattedUploadDate && (
              <p className="text-xs text-[#94A3B8] pt-2 border-t border-[#D9E4EC]/60">
                Uploaded &amp; published by AgeWellRI team on {formattedUploadDate}.
              </p>
            )}
          </div>
        )}

        {/* Embedded PDF Viewer */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#243746] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#294B68]" />
              <span>Official Technician Report Document</span>
            </h3>

            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#5E8FB2] hover:text-[#294B68] inline-flex items-center gap-1 hover:underline"
            >
              <span>Open in New Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="w-full bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] overflow-hidden">
            <iframe
              src={fileUrl}
              className="w-full h-[650px] border-0"
              title={report.title || "Visit Report PDF"}
            />
          </div>
        </div>

        {/* Help & Support Footer */}
        <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] text-xs text-[#64748B] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Have questions about this visit report? Contact AgeWellRI Safety Support at{" "}
            <a href="mailto:support@agewellri.com" className="font-bold text-[#294B68] underline">
              support@agewellri.com
            </a>{" "}
            or (401) 555-0199.
          </div>
          <button
            type="button"
            onClick={handleDownload}
            className="px-3.5 py-1.5 bg-[#294B68] text-white text-xs font-bold rounded-lg shrink-0 cursor-pointer"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
