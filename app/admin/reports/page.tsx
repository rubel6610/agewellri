"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useGetAdminReportsQuery } from "@/redux/features/report/reportApi";
import { ReportItem } from "@/redux/features/report/reportTypes";
import {
  FileCheck2,
  FileUp,
  Download,
  CheckCircle2,
  Loader2,
  Search,
  Eye,
  Calendar,
  User,
} from "lucide-react";
import { TablePagination } from "@/components/ui/table-pagination";
import { downloadReportPdf } from "@/lib/api/report-download";

export default function ReportsAdminPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: reportsRes, isLoading } = useGetAdminReportsQuery({
    search: search || undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
  });

  const reports: ReportItem[] = reportsRes?.data || [];

  const totalItems = reports.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedReports = reports.slice(startIndex, endIndex);

  const handleDownloadPdf = (reportId: string, clientName?: string, serviceType?: string) => {
    downloadReportPdf(reportId, `${clientName || "Client"}_${serviceType || "Visit"}_Report.pdf`);
  };

  return (
    <div className="space-y-6 text-[#243746]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9E4EC]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746] tracking-tight">
            Client Visit Reports
          </h1>
          <p className="text-sm text-[#64748B] mt-1 font-medium">
            Review, download, and manage official technician visit reports uploaded to client member portals.
          </p>
        </div>

        <Link
          href="/admin/appointments"
          className="px-4 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
        >
          <FileUp className="w-4 h-4" />
          <span>Upload Report to Completed Visit</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#D9E4EC] p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by client name, ID, or report title..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#294B68]"
          />
        </div>

     
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 shadow-xs space-y-4">
        {isLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#D9E4EC] text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Report Title</th>
                  <th className="py-3.5 px-4">Visit Date</th>
                  <th className="py-3.5 px-4">Specialist</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E4EC]/60">
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4 space-y-2">
                      <div className="h-4 bg-[#E2E8F0] rounded-md w-28"></div>
                      <div className="h-3 bg-[#F1F5F9] rounded-md w-16"></div>
                    </td>
                    <td className="py-4 px-4 space-y-2">
                      <div className="h-4 bg-[#E2E8F0] rounded-md w-40"></div>
                      <div className="h-3 bg-[#F1F5F9] rounded-md w-24"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-[#E2E8F0] rounded-md w-24"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-[#E2E8F0] rounded-md w-28"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 bg-[#E2E8F0] rounded-full w-20"></div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-8 bg-[#E2E8F0] rounded-xl w-24 ml-auto"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center text-[#64748B] bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] space-y-3">
            <FileCheck2 className="w-8 h-8 mx-auto text-[#94A3B8]" />
            <p className="font-bold text-sm text-[#243746]">No Uploaded Reports Found</p>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">
              When a visit is marked completed in Appointments, upload the technician&apos;s PDF report to publish it here.
            </p>
            <Link
              href="/admin/appointments"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#294B68] text-white text-xs font-bold rounded-xl"
            >
              <span>Go to Appointments</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D9E4EC] text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    <th className="py-3.5 px-4">Client</th>
                    <th className="py-3.5 px-4">Report Title</th>
                    <th className="py-3.5 px-4">Visit Date</th>
                    <th className="py-3.5 px-4">Specialist</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E4EC]/60 text-sm font-medium text-[#243746]">
                  {paginatedReports.map((rep) => (
                    <tr key={rep.id} className="hover:bg-[#F7FAFC]">
                      <td className="py-4 px-4 font-bold">
                        <Link href={`/admin/clients/${rep.clientId}`} className="hover:underline text-[#294B68]">
                          {rep.clientName}
                        </Link>
                        <span className="block text-xs font-normal text-[#64748B]">
                          {rep.clientNumber}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-[#243746]">
                        {rep.title}
                        <span className="block text-xs font-normal text-[#64748B]">
                          {rep.serviceType}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-[#64748B] font-semibold">{rep.formattedVisitDate}</td>
                      <td className="py-4 px-4 text-xs font-semibold text-[#243746]">
                        {rep.specialistName}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Published
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleDownloadPdf(rep.id, rep.clientName, rep.serviceType)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#294B68] hover:bg-[#1E374D] text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
                            title="Download PDF Report"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <TablePagination
              currentPage={validCurrentPage}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              itemLabel="reports"
            />
          </>
        )}
      </div>
    </div>
  );
}
