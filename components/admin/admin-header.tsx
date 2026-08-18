"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Bell, Plus, Menu, UserCheck } from "lucide-react";
import { NotificationMenu } from "../dashboard/notification-menu";
import { MOCK_NOTIFICATIONS } from "@/lib/api/mock-data";
import { useAppSelector } from "@/lib/redux/hooks";

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
  const [searchQuery, setSearchQuery] = useState("");
  const authUser = useAppSelector((state) => state.auth.user);

  const firstName = authUser?.firstName || "Sarah";
  const lastName = authUser?.lastName || "Jenkins";
  const roleLabel = authUser?.role === "ADMIN" ? "System Administrator" : "Operations Manager";

  return (
    <header className="h-20 bg-white border-b border-[#D9E4EC] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden p-2.5 rounded-xl border border-[#D9E4EC] text-[#243746] hover:bg-[#F7FAFC] cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Admin Search Bar */}
        <div className="relative hidden sm:block w-72 md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients, ID, appointments..."
            className="w-full h-11 pl-10 pr-4 text-sm text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] focus:bg-white placeholder:text-[#94A3B8]"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick actions */}
        <button
          onClick={onOpenAddClientModal}
          className="hidden sm:flex items-center gap-2 px-3.5 py-2.5 bg-[#EAF3F8] hover:bg-[#D9E4EC] text-[#294B68] font-bold text-xs sm:text-sm rounded-xl transition-all border border-[#5E8FB2]/30 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client</span>
        </button>

        <button
          onClick={onOpenScheduleModal}
          className="flex items-center gap-2 px-3.5 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Visit</span>
        </button>

        {/* Notifications */}
        <NotificationMenu notifications={MOCK_NOTIFICATIONS} />

        {/* Admin Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#D9E4EC]">
          <div className="w-9 h-9 rounded-xl bg-[#294B68] text-white font-bold text-xs flex items-center justify-center shrink-0">
            {firstName[0]}
            {lastName[0]}
          </div>
          <div className="hidden xl:block text-left text-xs">
            <span className="font-bold text-[#243746] block">{firstName} {lastName}</span>
            <span className="text-[#64748B] text-[11px]">{roleLabel}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
