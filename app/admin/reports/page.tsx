"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminReports } from "@/lib/api/admin-api";
import { AdminReport } from "@/lib/types/admin";
import { FileCheck2, FileUp, Download, CheckCircle2, Clock } from "lucide-react";
import { ReportUploadModal } from "@/components/admin/report-upload-modal";
import { showToast } from "@/lib/alerts/sweetalert";

export default function ReportsAdminPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  useEffect(() => {
    getAdminReports().then((data) => {
      setReports(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC]">
        Loading reports...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9E4EC]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
            Home Safety Reports Management
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Review, upload, and publish Age Safe® Home Score™ assessment documents to client portals.
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="px-4 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
        >
          <FileUp className="w-4 h-4" />
          <span>Upload Assessment PDF</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#D9E4EC] text-xs font-bold text-[#64748B] uppercase tracking-wider">
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Report Title</th>
                <th className="py-3.5 px-4">Visit Date</th>
                <th className="py-3.5 px-4">Home Score</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E4EC]/60 text-sm font-medium text-[#243746]">
              {reports.map((rep) => (
                <tr key={rep.id} className="hover:bg-[#F7FAFC]">
                  <td className="py-4 px-4 font-bold">
                    <Link href={`/admin/clients/${rep.clientId}`} className="hover:underline">
                      {rep.clientName}
                    </Link>
                  </td>
                  <td className="py-4 px-4 text-[#294B68] font-bold">{rep.title}</td>
                  <td className="py-4 px-4 text-xs text-[#64748B]">{rep.visitDate}</td>
                  <td className="py-4 px-4 font-extrabold text-[#294B68]">
                    {rep.score ? `${rep.score}/100` : "N/A"}
                  </td>
                  <td className="py-4 px-4">
                    {rep.status === "uploaded" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAF3F8] text-[#3F8F6B]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-[#C28A3A]">
                        <Clock className="w-3.5 h-3.5" /> Pending Upload
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    {rep.status === "uploaded" ? (
                      <button
                        onClick={() => showToast(`Downloading PDF for ${rep.title}...`)}
                        className="p-2 text-[#294B68] hover:bg-[#EAF3F8] rounded-lg transition-colors cursor-pointer"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setUploadModalOpen(true)}
                        className="text-xs font-bold text-[#294B68] hover:underline"
                      >
                        Upload Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ReportUploadModal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} />
    </div>
  );
}
