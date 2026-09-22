"use client";

import React from "react";
import Link from "next/link";
import { Menu, Plus, User } from "lucide-react";
import { NotificationMenu } from "./notification-menu";
import { NotificationItem, UserProfile } from "@/lib/types/dashboard";
import { useAppSelector } from "@/redux/hooks";

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
  const authUser = useAppSelector((state) => state.auth.user);
  const firstName = authUser?.firstName || user.firstName;
  const lastName = authUser?.lastName || user.lastName;

  return (
    <header className="h-16 sm:h-20 bg-white border-b border-[#D9E4EC] px-3 sm:px-6 lg:px-8 flex items-center justify-between fixed top-0 right-0 left-0 lg:left-64 z-30 shadow-xs box-border">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
        {/* Mobile menu trigger button */}
        <button
          onClick={onOpenMobileMenu}
          aria-label="Open menu"
          className="lg:hidden p-2 sm:p-2.5 rounded-xl border border-[#D9E4EC] text-[#243746] hover:bg-[#F7FAFC] cursor-pointer shrink-0"
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="min-w-0 hidden sm:block">
          <h2 className="text-base sm:text-lg lg:text-xl font-black text-[#243746] truncate leading-tight">
            My AgeWellRI Portal
          </h2>
          <p className="text-[11px] sm:text-xs text-[#64748B] hidden md:block truncate">
            Member Access &amp; Safety Oversight
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3 shrink-0">
        {/* Schedule a Visit CTA Button */}
        <button
          onClick={onOpenScheduleModal}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] shrink-0"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Schedule Visit</span>
        </button>

        {/* Notifications */}
        <div className="shrink-0">
          <NotificationMenu notifications={notifications} />
        </div>

        {/* Profile Pill */}
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-[#F7FAFC] border border-[#D9E4EC] hover:bg-[#EAF3F8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] shrink-0 max-w-[160px]"
        >
          <div className="w-8 h-8 rounded-lg bg-[#5E8FB2] text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 shadow-2xs">
            {firstName[0]}
            {lastName[0]}
          </div>
          <span className="hidden md:inline-block font-bold text-xs sm:text-sm text-[#243746] truncate">
            {firstName} {lastName}
          </span>
        </Link>
      </div>
    </header>
  );
}
