"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  useGetAdminAgreementsQuery,
  useSendAgreementReminderMutation,
  AdminAgreementRecord,
} from "@/redux/features/client/clientApi";
import { FileText, ShieldCheck, AlertCircle, Send, Download, Loader2, Search } from "lucide-react";
import {
  confirmCriticalAction,
  showSuccessAlert,
  showErrorAlert,
  showToast,
} from "@/lib/alerts/sweetalert";
import { TablePagination } from "@/components/ui/table-pagination";
import { AgreementPreviewModal } from "@/components/admin/agreement-preview-modal";
import { downloadAgreementPdf } from "@/lib/utils/agreement-pdf";

export default function AgreementsAdminPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [previewAgreement, setPreviewAgreement] = useState<AdminAgreementRecord | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: agreementsRes, isLoading, refetch } = useGetAdminAgreementsQuery({
    state: stateFilter,
    search: searchTerm,
  });

  const [sendReminder, { isLoading: isSendingReminder }] =
    useSendAgreementReminderMutation();

  const agreements = agreementsRes?.data || [];

  const handleSendReminder = async (agr: AdminAgreementRecord) => {
    const confirmed = await confirmCriticalAction({
      title: `Send Signature Reminder?`,
      text: `Send an automated email reminder to ${agr.clientName} (${agr.clientEmail}) with an e-signature link for ${agr.title}?`,
      confirmButtonText: "Yes, Send Reminder",
      isDestructive: false,
    });

    if (!confirmed) return;

    try {
      const res = await sendReminder(agr.id).unwrap();
      if (res.success) {
        await showSuccessAlert(
          "Reminder Dispatched",
          `An agreement signature reminder has been sent to ${agr.clientName}.`
        );
      }
    } catch (err: any) {
      showErrorAlert("Reminder Failed", err?.data?.message || "Failed to dispatch reminder.");
    }
  };

  const handleDownload = async (agr: AdminAgreementRecord) => {
    try {
      setDownloadingId(agr.id);
      showToast(`Generating agreement PDF for ${agr.clientName}...`);
      await downloadAgreementPdf({
        ...agr,
        clientFullName: agr.clientName,
        email: agr.clientEmail,
      });
    } catch (err: any) {
      console.error("Failed to download agreement PDF:", err);
      showErrorAlert("Download Failed", "Failed to generate agreement PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredAgreements = agreements.filter((agr) => {
    const term = searchTerm.toLowerCase();
    return (
      agr.clientName.toLowerCase().includes(term) ||
      agr.clientEmail.toLowerCase().includes(term) ||
      agr.state.toLowerCase().includes(term) ||
      agr.signerName.toLowerCase().includes(term)
    );
  });

  const totalItems = filteredAgreements.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedAgreements = filteredAgreements.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#D9E4EC]/60">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
          Service Agreements Lifecycle
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          Monitor AgeWellRI Member Service Agreements, track e-signature execution, and dispatch signature reminders.
        </p>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 shadow-xs space-y-6">
        {/* Search and filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by client, email, signer..."
              className="w-full h-11 pl-10 pr-4 text-sm text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
            />
          </div>

          <div>
            <select
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 px-3.5 text-xs font-bold text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
            >
              <option value="ALL">Rhode Island (RI)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#D9E4EC] text-xs font-bold text-[#64748B] uppercase tracking-wider">
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Agreement Document</th>
                <th className="py-3.5 px-4">Signer / Authority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Signed Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E4EC]/60">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4 space-y-2">
                      <div className="h-4 bg-[#E2E8F0] rounded-md w-32"></div>
                      <div className="h-3 bg-[#F1F5F9] rounded-md w-40"></div>
                    </td>
                    <td className="py-4 px-4 space-y-2">
                      <div className="h-4 bg-[#E2E8F0] rounded-md w-44"></div>
                      <div className="h-3 bg-[#F1F5F9] rounded-md w-24"></div>
                    </td>
                    <td className="py-4 px-4 space-y-1.5">
                      <div className="h-4 bg-[#E2E8F0] rounded-md w-28"></div>
                      <div className="h-3 bg-[#F1F5F9] rounded-md w-16"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 bg-[#E2E8F0] rounded-full w-24"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-[#E2E8F0] rounded-md w-20"></div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-8 bg-[#E2E8F0] rounded-xl w-24 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : paginatedAgreements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#64748B]">
                    No service agreements found.
                  </td>
                </tr>
              ) : (
                paginatedAgreements.map((agr) => {
                  const statusUpper = (agr.status || "").toUpperCase();
                  const isExecuted =
                    statusUpper === "EXECUTED" ||
                    statusUpper === "SIGNED" ||
                    statusUpper === "ACTIVE" ||
                    statusUpper === "COMPLETED" ||
                    Boolean(agr.signedDate);

                  return (
                    <tr key={agr.id} className="hover:bg-[#F7FAFC]">
                      <td className="py-4 px-4 font-bold">
                        <Link href={`/admin/clients/${agr.clientId}`} className="hover:underline text-[#243746]">
                          {agr.clientName}
                        </Link>
                        <span className="block text-xs font-mono text-[#64748B] font-normal">{agr.clientEmail}</span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="text-[#294B68] font-bold block">{agr.title}</span>
                        <span className="text-xs text-[#64748B] font-mono">Version: {agr.version}</span>
                      </td>

                      <td className="py-4 px-4 text-xs">
                        <span className="font-bold text-[#243746] block">{agr.signerName}</span>
                        <span className="text-[#64748B] capitalize">
                          {agr.signerRole.replace(/_/g, " ").toLowerCase()}{" "}
                          {agr.legalAuthority ? `(${agr.legalAuthority.replace(/_/g, " ")})` : ""}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        {isExecuted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EBF8F2] text-[#166534]">
                            <ShieldCheck className="w-3.5 h-3.5" /> Executed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-[#C28A3A]">
                            <AlertCircle className="w-3.5 h-3.5" /> Pending Signature
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-xs text-[#64748B]">
                        {agr.signedDate || "Awaiting Signature"}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Direct PDF Download Button */}
                          <button
                            type="button"
                            onClick={() => handleDownload(agr)}
                            disabled={downloadingId === agr.id}
                            className="p-2 text-[#294B68] hover:bg-[#EAF3F8] rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            title="Download Official Agreement PDF"
                          >
                            {downloadingId === agr.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-[#294B68]" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>

                          {/* Agreement Preview Document Button */}
                          <button
                            type="button"
                            onClick={() => setPreviewAgreement(agr)}
                            className="p-2 text-[#294B68] hover:bg-[#EAF3F8] rounded-lg transition-colors inline-block cursor-pointer"
                            title="Preview Agreement Document"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* Send Reminder button if pending signature */}
                          {!isExecuted && (
                            <button
                              type="button"
                              onClick={() => handleSendReminder(agr)}
                              disabled={isSendingReminder}
                              className="px-2.5 py-1.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
                              title="Send Signature Email Reminder"
                            >
                              <Send className="w-3 h-3" />
                              <span className="hidden sm:inline">Reminder</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          currentPage={validCurrentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="agreements"
        />
      </div>

      {/* Agreement Preview & Download Modal */}
      <AgreementPreviewModal
        agreement={previewAgreement}
        isOpen={Boolean(previewAgreement)}
        onClose={() => setPreviewAgreement(null)}
      />
    </div>
  );
}
