"use client";

import Link from "next/link";
import { Plus, Menu, UserPlus, UserCheck } from "lucide-react";
import { NotificationMenu } from "../dashboard/notification-menu";
import { useAppSelector } from "@/redux/hooks";

interface AdminHeaderProps {
  onOpenMobileMenu: () => void;
  onOpenAddClientModal: () => void;
  onOpenScheduleModal: () => void;
}

export function AdminHeader({
  onOpenMobileMenu,
  onOpenAddClientModal,
  onOpenScheduleModal,
}: AdminHeaderProps) {
  const authUser = useAppSelector((state) => state.auth.user);

  const firstName = authUser?.firstName || "Sarah";
  const lastName = authUser?.lastName || "Jenkins";
  const roleLabel = authUser?.role === "ADMIN" ? "System Administrator" : "Operations Manager";

  return (
    <header className="h-16 sm:h-20 bg-white border-b border-[#D9E4EC] px-3 sm:px-6 lg:px-8 flex items-center justify-between fixed top-0 right-0 left-0 lg:left-64 z-30 shadow-xs box-border">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 sm:p-2.5 rounded-xl border border-[#D9E4EC] text-[#243746] hover:bg-[#F7FAFC] cursor-pointer shrink-0"
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="min-w-0 hidden sm:block">
          <h2 className="text-base sm:text-lg lg:text-xl font-black text-[#243746] truncate leading-tight">
            AgeWellRI Administration
          </h2>
          <p className="text-[11px] sm:text-xs text-[#64748B] hidden md:block truncate">
            Member Lifecycle, Dispatch &amp; Plan Management
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3 shrink-0">
        {/* Quick actions: Invite Client (md+) */}
        <button
          onClick={onOpenAddClientModal}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 bg-[#EAF3F8] hover:bg-[#D9E4EC] text-[#294B68] font-bold text-xs sm:text-sm rounded-xl transition-all border border-[#5E8FB2]/30 cursor-pointer shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Invite Client</span>
        </button>

        {/* Schedule Visit (Responsive text for xs vs sm+) */}
        <button
          onClick={onOpenScheduleModal}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Schedule Visit</span>
          <span className="sm:hidden">Schedule</span>
        </button>

        {/* Notifications */}
        <div className="shrink-0">
          <NotificationMenu />
        </div>

        {/* Admin Profile Link */}
        <Link
          href="/admin/profile"
          title="Manage Administrator Profile & Credentials"
          className="flex items-center gap-2 pl-1.5 sm:pl-2 border-l border-[#D9E4EC] shrink-0 p-1 sm:p-1.5 rounded-xl hover:bg-[#EAF3F8] transition-colors group cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#294B68] group-hover:bg-[#1E374D] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs transition-colors">
            {firstName[0]}
            {lastName[0]}
          </div>
          <div className="hidden xl:block text-left text-xs max-w-[140px]">
            <span className="font-bold text-[#243746] block truncate group-hover:text-[#294B68] transition-colors">{firstName} {lastName}</span>
            <span className="text-[#64748B] text-[11px] block truncate">{roleLabel}</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
