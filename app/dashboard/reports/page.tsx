"use client";

import React from "react";
import { ReportCard } from "@/components/dashboard/report-card";
import { FileCheck2, FileText } from "lucide-react";
import { useGetMyReportsQuery } from "@/redux/features/report/reportApi";
import { ReportItem } from "@/redux/features/report/reportTypes";

export default function ReportsPage() {
  const { data: reportsRes, isLoading } = useGetMyReportsQuery();
  const reports: ReportItem[] = reportsRes?.data || [];

  return (
    <div className="space-y-8 text-[#243746]">
      {/* Header - ALWAYS VISIBLE IMMEDIATELY */}
      <div className="pb-4 border-b border-[#D9E4EC]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EAF3F8] text-[#294B68] flex items-center gap-1 border border-[#5E8FB2]/20">
              <FileText className="w-3.5 h-3.5" /> Care &amp; Safety Documentation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746] tracking-tight">
            My Visit Reports
          </h1>
          <p className="text-sm text-[#64748B] mt-1 font-medium">
            Your official visit documentation and safety reports from completed caregiver visits are securely accessible here.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="p-6 bg-white rounded-3xl border border-[#D9E4EC] space-y-4 shadow-xs">
              <div className="flex justify-between items-center">
                <div className="h-6 bg-[#E2E8F0] rounded-xl w-32"></div>
                <div className="h-6 bg-[#E2E8F0] rounded-full w-20"></div>
              </div>
              <div className="h-4 bg-[#F1F5F9] rounded-md w-full"></div>
              <div className="h-4 bg-[#F1F5F9] rounded-md w-3/4"></div>
              <div className="pt-4 border-t border-[#D9E4EC]/60 flex justify-between items-center">
                <div className="h-4 bg-[#E2E8F0] rounded-md w-24"></div>
                <div className="h-9 bg-[#E2E8F0] rounded-xl w-28"></div>
              </div>
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#D9E4EC] space-y-3 shadow-xs">
          <div className="w-12 h-12 bg-[#EAF3F8] text-[#294B68] rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
            <FileCheck2 className="w-6 h-6 text-[#294B68]" />
          </div>
          <h3 className="text-lg font-bold text-[#243746]">No Reports Available Yet</h3>
          <p className="text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
            Following each completed home visit, your specialist&apos;s official PDF visit report will be uploaded by the AgeWellRI team and made available here for you to view and download.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
