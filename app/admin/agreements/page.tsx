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

export default function AgreementsAdminPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("ALL");

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

  const handleDownload = (agr: AdminAgreementRecord) => {
    showToast(`Downloading agreement document for ${agr.clientName}...`);
    window.open(`/dashboard/agreements`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#294B68]" />
        <p className="font-bold text-sm text-[#243746]">Loading service agreements from database...</p>
      </div>
    );
  }

  const filteredAgreements = agreements.filter((agr) => {
    const term = searchTerm.toLowerCase();
    return (
      agr.clientName.toLowerCase().includes(term) ||
      agr.clientEmail.toLowerCase().includes(term) ||
      agr.state.toLowerCase().includes(term) ||
      agr.signerName.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#D9E4EC]/60">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
          Service Agreements Lifecycle
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          Monitor AgeWellRI Member Service Agreements across RI, CT, and MA, track e-signature execution, and dispatch signature reminders.
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
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by client, email, signer..."
              className="w-full h-11 pl-10 pr-4 text-sm text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
            />
          </div>

          <div>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="h-11 px-3.5 text-xs font-bold text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
            >
              <option value="ALL">All States (RI, CT, MA)</option>
              <option value="RI">Rhode Island (RI)</option>
              <option value="CT">Connecticut (CT)</option>
              <option value="MA">Massachusetts (MA)</option>
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
            <tbody className="divide-y divide-[#D9E4EC]/60 text-sm font-medium text-[#243746]">
              {filteredAgreements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#64748B]">
                    No service agreements found.
                  </td>
                </tr>
              ) : (
                filteredAgreements.map((agr) => {
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
                        {isExecuted ? (
                          <Link
                            href={`/admin/clients/${agr.clientId}`}
                            className="p-2 text-[#294B68] hover:bg-[#EAF3F8] rounded-lg transition-colors inline-block cursor-pointer"
                            title="View Agreement Document"
                          >
                            <FileText className="w-4 h-4" />
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleSendReminder(agr)}
                            disabled={isSendingReminder}
                            className="px-3 py-1.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Reminder</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
