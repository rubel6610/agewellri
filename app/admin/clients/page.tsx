"use client";

import React, { useEffect, useState } from "react";
import { getAdminClients } from "@/lib/api/admin-api";
import { MasterClientRecord } from "@/lib/types/admin";
import { ClientTable } from "@/components/admin/client-table";
import { AddClientModal } from "@/components/admin/add-client-modal";
import { AdminScheduleModal } from "@/components/admin/admin-schedule-modal";

export default function ClientsDirectoryPage() {
  const [clients, setClients] = useState<MasterClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);

  useEffect(() => {
    getAdminClients().then((data) => {
      setClients(data);
      setLoading(false);
    });
  }, []);

  const handleOpenScheduleModal = (clientId?: string) => {
    setSelectedClientId(clientId);
    setScheduleModalOpen(true);
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC]">
        Loading client directory...
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
            Manage AgeWellRI client accounts, onboarding progress, agreements, and active subscriptions.
          </p>
        </div>
      </div>

      <ClientTable
        clients={clients}
        onOpenAddClientModal={() => setAddModalOpen(true)}
        onOpenScheduleModal={handleOpenScheduleModal}
      />

      <AddClientModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
      <AdminScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        defaultClientId={selectedClientId}
      />
    </div>
  );
}
