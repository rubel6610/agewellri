"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  Sparkles,
  FileCheck2,
  FileText,
  CreditCard,
  RefreshCw,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Clients", href: "/admin/clients", icon: Users, badge: "128" },
    { label: "Appointments", href: "/admin/appointments", icon: CalendarCheck },
    { label: "Calendar", href: "/admin/calendar", icon: CalendarDays },
    { label: "Visits", href: "/admin/visits", icon: Sparkles },
    { label: "Reports", href: "/admin/reports", icon: FileCheck2, badge: "5" },
    { label: "Agreements", href: "/admin/agreements", icon: FileText },
    { label: "Billing", href: "/admin/billing", icon: CreditCard },
    { label: "Subscriptions", href: "/admin/subscriptions", icon: RefreshCw },
    { label: "Notifications", href: "/admin/notifications", icon: Bell, badge: "2" },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#D9E4EC] flex flex-col justify-between h-screen sticky top-0 shrink-0 z-30">
      {/* Top Header Logo & Badge */}
      <div>
        <div className="p-5 border-b border-[#D9E4EC]/60 flex items-center justify-between">
          <Link href="/admin" className="inline-block focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] rounded-lg">
            <Image
              src="/logo.png"
              alt="AgeWellRI Admin Control"
              width={160}
              height={40}
              priority
              className="h-auto w-auto max-h-10 object-contain"
            />
          </Link>
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-[#294B68] text-white rounded-md tracking-wider">
            ADMIN
          </span>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]" aria-label="Admin Navigation">
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
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  isActive
                    ? "bg-[#294B68] text-white shadow-xs"
                    : "text-[#243746] hover:bg-[#EAF3F8] hover:text-[#294B68]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#5E8FB2]"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-xs font-extrabold rounded-full ${
                      isActive
                        ? "bg-white text-[#294B68]"
                        : "bg-[#EAF3F8] text-[#294B68]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sign Out */}
      <div className="p-3 border-t border-[#D9E4EC]">
        <Link
          href="/login"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-[#C95C5C] hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Link>
      </div>
    </aside>
  );
}
