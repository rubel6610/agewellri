"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wrench,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  LogOut,
  Phone,
  User,
  ShieldCheck,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/features/auth/authSlice";

export default function TechnicianPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleSignOut = () => {
    dispatch(logout());
    router.push("/login");
  };

  const technicianName = user?.firstName ? `${user.firstName} ${user.lastName}` : "Field Technician";

  const todayVisits = [
    {
      id: "v-1",
      clientName: "Eleanor Vance",
      address: "148 Hope Street, Providence, RI",
      time: "09:30 AM - 11:00 AM",
      type: "Safety Audit & HEPA Air Cleaning",
      phone: "(401) 555-0199",
      status: "COMPLETED",
    },
    {
      id: "v-2",
      clientName: "Robert Sterling",
      address: "72 Wayland Ave, Providence, RI",
      time: "01:00 PM - 02:30 PM",
      type: "Fall Prevention & Smoke Detector Check",
      phone: "(401) 555-0142",
      status: "IN_PROGRESS",
    },
    {
      id: "v-3",
      clientName: "Margaret Higgins",
      address: "215 Blackstone Blvd, Providence, RI",
      time: "03:30 PM - 05:00 PM",
      type: "Quarterly Comprehensive Inspection",
      phone: "(401) 555-0188",
      status: "SCHEDULED",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-[#D9E4EC] px-6 py-4 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="AgeWellRI Logo"
              width={200}
              height={50}
              priority
              className="h-auto w-auto max-h-10 object-contain"
            />
            <div className="hidden sm:block border-l border-[#D9E4EC] pl-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#294B68] bg-[#EAF3F8] px-2.5 py-1 rounded-md">
                Technician Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 text-right">
              <div className="w-9 h-9 rounded-xl bg-[#294B68] text-white flex items-center justify-center font-bold text-sm">
                {user?.firstName?.[0] || "T"}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold text-[#243746]">{technicianName}</p>
                <p className="text-xs text-[#64748B]">Certified Safety Specialist</p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="px-3.5 py-2 text-xs font-bold text-[#C95C5C] hover:bg-red-50 border border-red-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 sm:p-8 space-y-8">
        {/* Welcome Hero */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D9E4EC] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
              Welcome back, {user?.firstName || "Technician"}!
            </h1>
            <p className="text-sm sm:text-base text-[#64748B] mt-1">
              You have <strong className="text-[#243746]">3 visits scheduled</strong> for today in the Providence area.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#EAF3F8] text-[#294B68] text-sm font-bold rounded-xl border border-[#5E8FB2]/30">
              <ShieldCheck className="w-4 h-4 text-[#3F8F6B]" />
              <span>Status: Active On-Duty</span>
            </span>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#D9E4EC] shadow-xs space-y-1">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Assigned Today
            </span>
            <p className="text-2xl font-black text-[#243746]">3 Visits</p>
            <span className="text-xs text-[#5E8FB2] font-semibold">100% On Schedule</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#D9E4EC] shadow-xs space-y-1">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Completed Today
            </span>
            <p className="text-2xl font-black text-[#3F8F6B]">1 Visit</p>
            <span className="text-xs text-[#64748B]">Audited &amp; Signed</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#D9E4EC] shadow-xs space-y-1">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Pending Reports
            </span>
            <p className="text-2xl font-black text-amber-600">2 Reports</p>
            <span className="text-xs text-[#64748B]">Due by 6:00 PM</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#D9E4EC] shadow-xs space-y-1">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Safety Score Avg
            </span>
            <p className="text-2xl font-black text-[#294B68]">96 / 100</p>
            <span className="text-xs text-[#3F8F6B] font-semibold">Excellent Rating</span>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-3xl border border-[#D9E4EC] shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#D9E4EC]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EAF3F8] text-[#294B68] flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#243746]">
                  Today&apos;s Field Schedule
                </h2>
                <p className="text-xs text-[#64748B]">
                  Field service appointments, home visits, and safety checklists
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {todayVisits.map((visit) => (
              <div
                key={visit.id}
                className="p-5 bg-[#F7FAFC] rounded-2xl border border-[#D9E4EC] hover:border-[#5E8FB2] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-base text-[#243746]">
                      {visit.clientName}
                    </h3>
                    <span
                      className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                        visit.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : visit.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {visit.status.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-[#294B68]">
                    {visit.type}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B]">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#5E8FB2]" />
                      {visit.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#5E8FB2]" />
                      {visit.address}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#5E8FB2]" />
                      {visit.phone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => alert(`Starting inspection for ${visit.clientName}`)}
                    className="px-4 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
                  >
                    Open Checklist
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
