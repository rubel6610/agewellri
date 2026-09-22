"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  CalendarCheck,
  FileCheck2,
  FileText,
  CreditCard,
  Users,
  User,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/features/auth/authSlice";
import { confirmCriticalAction, showSuccessAlert } from "@/lib/alerts/sweetalert";

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleSignOut = async () => {
    const confirmed = await confirmCriticalAction({
      title: "Sign Out of AgeWellRI?",
      text: "Are you sure you want to end your current session?",
      confirmButtonText: "Yes, Sign Out",
      isDestructive: false,
    });

    if (!confirmed) return;

    dispatch(logout());
    router.push("/login");
  };

  const handleHelp = (e: React.MouseEvent) => {
    e.preventDefault();
    showSuccessAlert(
      "AgeWellRI Member Concierge",
      `Support Line: (401) 212-3002\nEmail: agewellri@gmail.com\nHours: Mon–Fri, 8am–6pm`
    );  
  };

  const navItems = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "My Calendar",
      href: "/dashboard/calendar",
      icon: CalendarDays,
    },
    {
      label: "My Safety Visits",
      href: "/dashboard/appointments",
      icon: CalendarCheck,
    },
    {
      label: "My Reports",
      href: "/dashboard/reports",
      icon: FileCheck2,
    },
    {
      label: "My Agreements",
      href: "/dashboard/agreements",
      icon: FileText,
    },
    {
      label: "My Billings",
      href: "/dashboard/billing",
      icon: CreditCard,
    },
    // {
    //   label: "My Family Members",
    //   href: "/dashboard/family-members",
    //   icon: Users,
    // },
    {
      label: "My Profile",
      href: "/dashboard/profile",
      icon: User,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#D9E4EC] flex flex-col justify-between h-screen fixed top-0 left-0 bottom-0 shrink-0 z-30">
      {/* Top Logo */}
      <div>
        <div className="px-5 py-4 border-b border-[#D9E4EC]/60">
          <Link
            href="/dashboard"
            className="block focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] rounded-lg transition-transform hover:scale-[1.02]"
          >
            <Image
              src="/logo.png"
              alt="AgeWellRI Portal"
              width={260}
              height={70}
              priority
              className="w-full max-w-[220px] h-auto max-h-14 object-contain"
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
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${isActive
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
        <button
          type="button"
          onClick={handleHelp}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#64748B] hover:bg-[#EAF3F8] hover:text-[#294B68] transition-colors cursor-pointer text-left"
        >
          <HelpCircle className="w-5 h-5 text-[#5E8FB2]" />
          <span>Help & Support</span>
        </button>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-[#C95C5C] hover:bg-red-50 transition-colors cursor-pointer text-left"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
