"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useGetAdminAppointmentsQuery } from "@/redux/features/appointment/appointmentApi";
import {
  FileUp,
  CheckCircle2,
  Clock,
  Loader2,
  CalendarCheck,
  Search,
  Download,
  Eye,
  RefreshCw,
} from "lucide-react";
import { ReportUploadModal } from "@/components/admin/report-upload-modal";
import { TablePagination } from "@/components/ui/table-pagination";
import { downloadReportPdf } from "@/lib/api/report-download";

export default function VisitsAdminPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);

  const { data: apptsRes, isLoading } = useGetAdminAppointmentsQuery({
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const appointments = apptsRes?.data || [];

  const totalItems = appointments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedVisits = appointments.slice(startIndex, endIndex);

  const handleOpenUploadModal = (appt: any) => {
    setSelectedAppt(appt);
    setUploadModalOpen(true);
  };

  const handleDownloadPdf = (reportId: string, clientName?: string, serviceType?: string) => {
    downloadReportPdf(reportId, `${clientName || "Client"}_${serviceType || "Visit"}_Report.pdf`);
  };

  return (
    <div className="space-y-6 text-[#243746]">
      {/* Header */}
      <div className="pb-4 border-b border-[#D9E4EC]/60">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746] tracking-tight">
          Field Visit Operations
        </h1>
        <p className="text-sm text-[#64748B] mt-1 font-medium">
          Track field specialist progress, visit completions, and official visit report uploads.
        </p>
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
            placeholder="Search by client, ID, service, or specialist..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#294B68]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs font-semibold bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#294B68] w-full sm:w-auto"
          >
            <option value="">All Statuses</option>
            <option value="COMPLETED">Completed Visits Only</option>
            <option value="SCHEDULED">Scheduled Visits</option>
            <option value="CONFIRMED">Confirmed Visits</option>
            <option value="CANCELLED">Cancelled Visits</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 shadow-xs space-y-4">
        {isLoading && appointments.length === 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#D9E4EC] text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Visit Date &amp; Time</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Specialist</th>
                  <th className="py-3.5 px-4">Visit Status</th>
                  <th className="py-3.5 px-4">Report Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
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
                      <div className="h-4 bg-[#E2E8F0] rounded-md w-36"></div>
                      <div className="h-3 bg-[#F1F5F9] rounded-md w-20"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-[#E2E8F0] rounded-md w-28"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-[#E2E8F0] rounded-md w-28"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 bg-[#E2E8F0] rounded-full w-20"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 bg-[#E2E8F0] rounded-full w-24"></div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-8 bg-[#E2E8F0] rounded-xl w-24 ml-auto"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center text-[#64748B] bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] space-y-2">
            <CalendarCheck className="w-8 h-8 mx-auto text-[#94A3B8]" />
            <p className="font-bold text-sm text-[#243746]">No Field Visits Found</p>
            <p className="text-xs text-[#64748B]">No visit records matched your filter criteria.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D9E4EC] text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    <th className="py-3.5 px-4">Visit Date &amp; Time</th>
                    <th className="py-3.5 px-4">Client</th>
                    <th className="py-3.5 px-4">Service</th>
                    <th className="py-3.5 px-4">Specialist</th>
                    <th className="py-3.5 px-4">Visit Status</th>
                    <th className="py-3.5 px-4">Report Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E4EC]/60 text-sm font-medium text-[#243746]">
                  {paginatedVisits.map((v) => {
                    const isCompleted = v.status === "completed";
                    const hasReport = Boolean(v.hasReport || v.reportStatus === "uploaded");

                    return (
                      <tr key={v.id} className="hover:bg-[#F7FAFC]">
                        <td className="py-4 px-4 font-semibold">
                          <span className="block font-bold text-[#243746]">{v.date}</span>
                          <span className="text-xs text-[#64748B]">{v.timeSlot}</span>
                        </td>
                        <td className="py-4 px-4 font-bold">
                          <Link href={`/admin/clients/${v.clientId}`} className="hover:underline text-[#294B68]">
                            {v.clientName}
                          </Link>
                          <span className="block text-xs font-normal text-[#64748B]">
                            {v.clientNumber}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-[#294B68] font-semibold">{v.serviceType}</td>
                        <td className="py-4 px-4 text-xs font-semibold text-[#243746]">{v.technicianName}</td>
                        <td className="py-4 px-4 capitalize">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              isCompleted
                                ? "bg-emerald-100 text-emerald-800"
                                : v.status === "cancelled"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-[#EAF3F8] text-[#294B68]"
                            }`}
                          >
                            {v.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {isCompleted ? (
                            hasReport ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#3F8F6B]">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Report Uploaded
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#C28A3A]">
                                <Clock className="w-3.5 h-3.5" /> Pending Upload
                              </span>
                            )
                          ) : (
                            <span className="text-xs text-[#94A3B8]">—</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {isCompleted ? (
                            !hasReport ? (
                              <button
                                onClick={() => handleOpenUploadModal(v)}
                                className="px-3 py-1.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs rounded-xl transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1"
                              >
                                <FileUp className="w-3.5 h-3.5" /> Upload Report
                              </button>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5">
                                {v.reportId && (
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadPdf(v.reportId!, v.clientName, v.serviceType)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#294B68] hover:bg-[#1E374D] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                    title="Download PDF Report"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download PDF</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => handleOpenUploadModal(v)}
                                  className="p-1.5 text-[#64748B] hover:text-[#243746] hover:bg-[#F8FAFC] rounded-lg transition-colors cursor-pointer"
                                  title="Replace PDF Report"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )
                          ) : (
                            <span className="text-xs text-[#94A3B8]">Incomplete</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <TablePagination
              currentPage={validCurrentPage}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              itemLabel="visits"
            />
          </>
        )}
      </div>

      <ReportUploadModal
        isOpen={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false);
          setSelectedAppt(null);
        }}
        appointment={selectedAppt}
      />
    </div>
  );
}
