"use client";

import React, { useState } from "react";
import { useGetAdminClientsQuery } from "@/redux/features/client/clientApi";
import { ClientTable } from "@/components/admin/client-table";
import { AddClientModal } from "@/components/admin/add-client-modal";
import { AdminScheduleModal } from "@/components/admin/admin-schedule-modal";
import { Loader2, UserPlus, Users } from "lucide-react";

export default function ClientsDirectoryPage() {
  const { data: clientsRes, isLoading, refetch } = useGetAdminClientsQuery();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);
  const [selectedClientName, setSelectedClientName] = useState<string | undefined>(undefined);

  const clients = (clientsRes?.data || []) as any[];

  const handleOpenScheduleModal = (clientId?: string, clientName?: string) => {
    setSelectedClientId(clientId);
    setSelectedClientName(clientName);
    setScheduleModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#294B68]" />
        <p className="font-bold text-sm text-[#243746]">Loading client directory from database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9E4EC]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
            Master Client Directory
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Manage AgeWellRI client accounts, onboarding progress, state-specific legal agreements, and active subscriptions.
          </p>
        </div>

        <div>
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Send Welcome Link</span>
          </button>
        </div>
      </div>

      <ClientTable
        clients={clients}
        onOpenAddClientModal={() => setAddModalOpen(true)}
        onOpenScheduleModal={handleOpenScheduleModal}
      />

      <AddClientModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => refetch()}
      />

      <AdminScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        defaultClientId={selectedClientId}
        clientName={selectedClientName}
      />
    </div>
  );
}
