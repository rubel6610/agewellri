"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  FileCheck2,
  FileText,
  CreditCard,
  User,
  HelpCircle,
  LogOut,
} from "lucide-react";

export function DashboardSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "My Visits",
      href: "/dashboard/appointments",
      icon: CalendarCheck,
    },
    {
      label: "My Reports",
      href: "/dashboard/reports",
      icon: FileCheck2,
    },
    {
      label: "My Agreement",
      href: "/dashboard/agreements",
      icon: FileText,
    },
    {
      label: "Billing",
      href: "/dashboard/billing",
      icon: CreditCard,
    },
    {
      label: "My Profile",
      href: "/dashboard/profile",
      icon: User,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#D9E4EC] flex flex-col justify-between h-screen sticky top-0 shrink-0">
      {/* Top Logo */}
      <div>
        <div className="p-6 border-b border-[#D9E4EC]/60">
          <Link href="/dashboard" className="inline-block focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] rounded-lg">
            <Image
              src="/logo.png"
              alt="AgeWellRI Portal"
              width={180}
              height={100}
              priority
              className="h-auto w-auto max-h-11 object-cover"
            />
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="p-4 space-y-1.5" aria-label="Main Navigation">
          <p className="px-3 text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
            My Portal
          </p>
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
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-[#294B68] text-white shadow-sm"
                    : "text-[#243746] hover:bg-[#EAF3F8] hover:text-[#294B68]"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-[#5E8FB2]"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-[#D9E4EC] space-y-1">
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault();
            alert("Help & Support line: (401) 555-AGEWELL (available 24/7)");
          }}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#64748B] hover:bg-[#EAF3F8] hover:text-[#294B68] transition-colors"
        >
          <HelpCircle className="w-5 h-5 text-[#5E8FB2]" />
          <span>Help & Support</span>
        </Link>

        <Link
          href="/login"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-[#C95C5C] hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </Link>
      </div>
    </aside>
  );
}
