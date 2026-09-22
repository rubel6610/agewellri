"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  X,
  LayoutDashboard,
  CalendarDays,
  CalendarCheck,
  FileCheck2,
  FileText,
  CreditCard,
  User,
  HelpCircle,
  LogOut,
  Plus,
} from "lucide-react";
import { useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/features/auth/authSlice";
import {
  confirmCriticalAction,
  showSuccessAlert,
} from "@/lib/alerts/sweetalert";

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenScheduleModal: () => void;
}

export function MobileNavigation({
  isOpen,
  onClose,
  onOpenScheduleModal,
}: MobileNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  if (!isOpen) return null;

  const handleSignOut = async () => {
    const confirmed = await confirmCriticalAction({
      title: "Sign Out of AgeWellRI?",
      text: "Are you sure you want to end your current session?",
      confirmButtonText: "Yes, Sign Out",
      isDestructive: false,
    });

    if (!confirmed) return;

    onClose();
    dispatch(logout());
    router.push("/login");
  };

  const handleHelp = (e: React.MouseEvent) => {
    e.preventDefault();
    showSuccessAlert(
      "AgeWellRI Member Concierge",
      "24/7 Safety Support Line: (401) 555-AGEWELL (243-9355)\n\nEmail: agewellri@gmail.com\nDedicated Rhode Island Staff",
    );
  };

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Calendar", href: "/dashboard/calendar", icon: CalendarDays },
    {
      label: "My Safety Visits",
      href: "/dashboard/appointments",
      icon: CalendarCheck,
    },
    { label: "My Reports", href: "/dashboard/reports", icon: FileCheck2 },
    { label: "My Agreements", href: "/dashboard/agreements", icon: FileText },
    { label: "My Billings", href: "/dashboard/billing", icon: CreditCard },
    { label: "My Profile", href: "/dashboard/profile", icon: User },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between p-6 z-10 animate-in slide-in-from-left duration-250">
        <div>
          <div className="flex items-center justify-between pb-5 border-b border-[#D9E4EC]">
            <Image
              src="/logo.png"
              alt="AgeWellRI Logo"
              width={220}
              height={60}
              priority
              className="w-auto max-w-[190px] h-auto max-h-12 object-contain"
            />
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="p-2 text-[#64748B] hover:text-[#243746] rounded-xl border border-[#D9E4EC] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick schedule CTA for mobile */}
          <div className="pt-4 pb-2">
            <button
              onClick={() => {
                onClose();
                onOpenScheduleModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#294B68] text-white font-bold rounded-xl shadow-xs text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule a Visit</span>
            </button>
          </div>

          <nav className="space-y-1 mt-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-base transition-colors ${
                    isActive
                      ? "bg-[#294B68] text-white"
                      : "text-[#243746] hover:bg-[#EAF3F8]"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? "text-white" : "text-[#5E8FB2]"}`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-[#D9E4EC] space-y-2">
          <button
            type="button"
            onClick={handleHelp}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[#64748B] hover:bg-[#EAF3F8] cursor-pointer text-left"
          >
            <HelpCircle className="w-5 h-5 text-[#5E8FB2]" />
            <span>Help & Support</span>
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#C95C5C] hover:bg-red-50 cursor-pointer text-left"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
