"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar as CalendarIcon, Clock, UserCheck, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { AdminAppointment } from "@/lib/types/admin";

interface AdminCalendarViewProps {
  appointments: AdminAppointment[];
  onOpenScheduleModal?: () => void;
}

export function AdminCalendarView({ appointments, onOpenScheduleModal }: AdminCalendarViewProps) {
  const [view, setView] = useState<"day" | "week" | "month">("week");

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-xs space-y-6">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9E4EC]">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-[#243746]">September 2026</h3>
          <div className="flex items-center gap-1 border border-[#D9E4EC] rounded-xl p-1">
            <button className="p-1 hover:bg-[#EAF3F8] rounded-lg text-[#243746]">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-[#EAF3F8] rounded-lg text-[#243746]">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#F7FAFC] p-1 border border-[#D9E4EC] rounded-xl text-xs font-bold">
            <button
              onClick={() => setView("day")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                view === "day" ? "bg-[#294B68] text-white" : "text-[#64748B]"
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setView("week")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                view === "week" ? "bg-[#294B68] text-white" : "text-[#64748B]"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView("month")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                view === "month" ? "bg-[#294B68] text-white" : "text-[#64748B]"
              }`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Appointment Timeline List View */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
          Scheduled Field Appointments
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="p-4 rounded-2xl border border-[#D9E4EC] bg-[#F7FAFC] hover:border-[#5E8FB2] transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EAF3F8] text-[#294B68]">
                  {appt.serviceType}
                </span>
                <span className="text-xs font-semibold text-[#64748B]">{appt.date}</span>
              </div>

              <div>
                <Link
                  href={`/admin/clients/${appt.clientId}`}
                  className="font-bold text-[#243746] text-base hover:underline"
                >
                  {appt.clientName}
                </Link>
                <p className="text-xs text-[#64748B] mt-0.5">{appt.clientAddress}</p>
              </div>

              <div className="pt-2 border-t border-[#D9E4EC]/60 space-y-1 text-xs text-[#64748B]">
                <div className="flex items-center gap-1.5 font-semibold text-[#243746]">
                  <Clock className="w-3.5 h-3.5 text-[#5E8FB2]" />
                  <span>{appt.timeSlot}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#294B68]" />
                  <span>Specialist: <strong>{appt.technicianName}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
