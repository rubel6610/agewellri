"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  X,
  LayoutDashboard,
  Users,
  UserCheck,
  CalendarCheck,
  FileCheck2,
  FileText,
  CreditCard,
  RefreshCw,
  Package,
  Layers,
  Bell,
  Settings,
  LogOut,
  Plus,
} from "lucide-react";
import { useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/features/auth/authSlice";

interface AdminMobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddClientModal: () => void;
  onOpenScheduleModal: () => void;
}

export function AdminMobileNav({
  isOpen,
  onClose,
  onOpenAddClientModal,
  onOpenScheduleModal,
}: AdminMobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  if (!isOpen) return null;

  const handleSignOut = () => {
    onClose();
    dispatch(logout());
    router.push("/login");
  };

  const navItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Clients", href: "/admin/clients", icon: Users },
    { label: "Specialists", href: "/admin/specialists", icon: UserCheck },
    { label: "Service Plans", href: "/admin/plans", icon: Package },
    { label: "Appointments", href: "/admin/appointments", icon: CalendarCheck },
    { label: "Reports", href: "/admin/reports", icon: FileCheck2 },
    { label: "Agreements", href: "/admin/agreements", icon: FileText },
    { label: "Billing", href: "/admin/billing", icon: CreditCard },
    { label: "Subscriptions", href: "/admin/subscriptions", icon: RefreshCw },
    { label: "Admin Profile", href: "/admin/profile", icon: UserCheck },
    { label: "Notifications", href: "/admin/notifications", icon: Bell },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between p-5 z-10 animate-in slide-in-from-left duration-250">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-[#D9E4EC]">
            <Image
              src="/logo.png"
              alt="AgeWellRI Admin"
              width={150}
              height={36}
              priority
              className="h-auto w-auto max-h-9 object-contain"
            />
            <button
              onClick={onClose}
              className="p-2 text-[#64748B] hover:text-[#243746] rounded-xl border border-[#D9E4EC]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4 pb-2">
            <button
              onClick={() => {
                onClose();
                onOpenAddClientModal();
              }}
              className="py-2.5 px-3 bg-[#EAF3F8] text-[#294B68] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-[#5E8FB2]/30 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Invite Client</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenScheduleModal();
              }}
              className="py-2.5 px-3 bg-[#294B68] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule</span>
            </button>
          </div>

          <nav className="space-y-1 mt-3 overflow-y-auto max-h-[calc(100vh-220px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-bold text-sm transition-colors ${
                    isActive
                      ? "bg-[#294B68] text-white"
                      : "text-[#243746] hover:bg-[#EAF3F8]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${isActive ? "text-white" : "text-[#5E8FB2]"}`}
                    />
                    <span>{item.label}</span>
                  </div>
                
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-[#D9E4EC]">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-sm text-[#C95C5C] hover:bg-red-50 cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
