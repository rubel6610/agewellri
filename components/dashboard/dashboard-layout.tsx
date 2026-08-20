"use client";

import React, { useState } from "react";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardHeader } from "./dashboard-header";
import { MobileNavigation } from "./mobile-navigation";

import { UserProfile, NotificationItem, ServicePlan } from "@/lib/types/dashboard";
import { ScheduleVisitModal } from "./schedule-visit-modal";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: UserProfile;
  plan: ServicePlan;
  notifications: NotificationItem[];
}

export function DashboardLayout({
  children,
  user,
  plan,
  notifications,
}: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col lg:flex-row antialiased text-[#243746]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>

      {/* Mobile Drawer Navigation */}
      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenScheduleModal={() => setScheduleModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          user={user}
          notifications={notifications}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenScheduleModal={() => setScheduleModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>

      {/* Global Interactive 4-Step Booking Flow Modal */}
      <ScheduleVisitModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        plan={plan}
      />
    </div>
  );
}
