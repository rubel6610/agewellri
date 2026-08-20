"use client";

import React, { useState } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import { AdminMobileNav } from "./admin-mobile-nav";
import { AddClientModal } from "./add-client-modal";
import { AdminScheduleModal } from "./admin-schedule-modal";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [addClientModalOpen, setAddClientModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedClientIdForSchedule, setSelectedClientIdForSchedule] = useState<string | undefined>(undefined);

  const handleOpenScheduleModal = (clientId?: string) => {
    setSelectedClientIdForSchedule(clientId);
    setScheduleModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col lg:flex-row antialiased text-[#243746]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebarContainer />
      </div>

      {/* Mobile Drawer */}
      <AdminMobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenAddClientModal={() => setAddClientModalOpen(true)}
        onOpenScheduleModal={() => handleOpenScheduleModal()}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenAddClientModal={() => setAddClientModalOpen(true)}
          onOpenScheduleModal={() => handleOpenScheduleModal()}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>

      {/* Modals */}
      <AddClientModal
        isOpen={addClientModalOpen}
        onClose={() => setAddClientModalOpen(false)}
      />

      <AdminScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        defaultClientId={selectedClientIdForSchedule}
      />
    </div>
  );
}

function DashboardSidebarContainer() {
  return <AdminSidebar />;
}
