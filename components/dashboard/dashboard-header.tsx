"use client";

import React from "react";
import Link from "next/link";
import { Menu, Plus, User } from "lucide-react";
import { NotificationMenu } from "./notification-menu";
import { NotificationItem, UserProfile } from "@/lib/types/dashboard";

interface DashboardHeaderProps {
  user: UserProfile;
  notifications: NotificationItem[];
  onOpenMobileMenu: () => void;
  onOpenScheduleModal: () => void;
}

export function DashboardHeader({
  user,
  notifications,
  onOpenMobileMenu,
  onOpenScheduleModal,
}: DashboardHeaderProps) {
  return (
    <header className="h-20 bg-white border-b border-[#D9E4EC] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger button */}
        <button
          onClick={onOpenMobileMenu}
          aria-label="Open menu"
          className="lg:hidden p-2.5 rounded-xl border border-[#D9E4EC] text-[#243746] hover:bg-[#F7FAFC] cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#243746]">
            My AgeWellRI Portal
          </h2>
          <p className="text-xs text-[#64748B] hidden sm:block">
            Member Access &amp; Care Management
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Schedule a Visit CTA Button */}
        <button
          onClick={onOpenScheduleModal}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-sm rounded-xl transition-all shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Visit</span>
        </button>

        {/* Notifications */}
        <NotificationMenu notifications={notifications} />

        {/* Profile Pill */}
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-[#F7FAFC] border border-[#D9E4EC] hover:bg-[#EAF3F8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
        >
          <div className="w-8 h-8 rounded-lg bg-[#5E8FB2] text-white flex items-center justify-center font-bold text-sm shrink-0">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
          <span className="hidden md:inline-block font-bold text-sm text-[#243746]">
            {user.firstName} {user.lastName}
          </span>
        </Link>
      </div>
    </header>
  );
}
