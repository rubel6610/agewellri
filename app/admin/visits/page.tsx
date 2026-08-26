"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminVisits } from "@/lib/api/admin-api";
import { AdminVisit } from "@/lib/types/admin";
import { Sparkles, FileUp, CheckCircle2, Clock } from "lucide-react";
import { ReportUploadModal } from "@/components/admin/report-upload-modal";
import { TablePagination } from "@/components/ui/table-pagination";

export default function VisitsAdminPage() {
  const [visits, setVisits] = useState<AdminVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState("vst_01");
  const [selectedClientId, setSelectedClientId] = useState("AW-1001");

  useEffect(() => {
    getAdminVisits().then((data) => {
      setVisits(data);
      setLoading(false);
    });
  }, []);

  const totalItems = visits.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedVisits = visits.slice(startIndex, endIndex);

  const handleOpenUploadModal = (visitId: string, clientId: string) => {
    setSelectedVisitId(visitId);
    setSelectedClientId(clientId);
    setUploadModalOpen(true);
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC]">
        Loading visit tracking...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#D9E4EC]/60">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
          Field Visit Operations
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          Track field specialist progress, visit completions, and Home Safety report status.
        </p>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#D9E4EC] text-xs font-bold text-[#64748B] uppercase tracking-wider">
                <th className="py-3.5 px-4">Visit ID</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Service</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Specialist</th>
                <th className="py-3.5 px-4">Visit Status</th>
                <th className="py-3.5 px-4">Report Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E4EC]/60 text-sm font-medium text-[#243746]">
              {paginatedVisits.map((v) => (
                <tr key={v.id} className="hover:bg-[#F7FAFC]">
                  <td className="py-4 px-4 font-mono text-xs font-bold text-[#294B68]">{v.id}</td>
                  <td className="py-4 px-4 font-bold">
                    <Link href={`/admin/clients/${v.clientId}`} className="hover:underline">
                      {v.clientName}
                    </Link>
                  </td>
                  <td className="py-4 px-4 text-[#294B68] font-semibold">{v.serviceType}</td>
                  <td className="py-4 px-4 text-xs">{v.date}</td>
                  <td className="py-4 px-4 text-xs font-semibold">{v.technicianName}</td>
                  <td className="py-4 px-4 capitalize">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAF3F8] text-[#294B68]">
                      {v.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {v.reportStatus === "uploaded" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#3F8F6B]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Score: {v.reportScore}/100
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#C28A3A]">
                        <Clock className="w-3.5 h-3.5" /> Pending Upload
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    {v.reportStatus !== "uploaded" ? (
                      <button
                        onClick={() => handleOpenUploadModal(v.id, v.clientId)}
                        className="px-3 py-1.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <FileUp className="w-3.5 h-3.5" /> Upload Report
                      </button>
                    ) : (
                      <Link
                        href="/admin/reports"
                        className="text-xs font-bold text-[#5E8FB2] hover:underline"
                      >
                        View Report
                      </Link>
                    )}
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
          itemLabel="visits"
        />
      </div>

      <ReportUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        defaultVisitId={selectedVisitId}
        defaultClientId={selectedClientId}
      />
    </div>
  );
}
