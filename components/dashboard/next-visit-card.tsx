"use client";

import React from "react";
import Link from "next/link";
import { Calendar, Clock, UserCheck, ArrowRight, Plus, ShieldCheck } from "lucide-react";
import { Appointment } from "@/lib/types/dashboard";
import { AppointmentItem } from "@/redux/features/appointment/appointmentTypes";

interface NextVisitCardProps {
  appointment?: Appointment | AppointmentItem | any;
  isLoading?: boolean;
  onScheduleVisit: () => void;
}

export function NextVisitCard({
  appointment,
  isLoading = false,
  onScheduleVisit,
}: NextVisitCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6 animate-pulse">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Your Next Visit
            </span>
            <div className="h-6 bg-[#E2E8F0] rounded-full w-20"></div>
          </div>
          <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC]/60 space-y-2.5">
            <div className="h-5 bg-[#E2E8F0] rounded-md w-40"></div>
            <div className="h-3 bg-[#F1F5F9] rounded-md w-56"></div>
            <div className="h-3 bg-[#F1F5F9] rounded-md w-32"></div>
          </div>
        </div>
        <div className="h-11 bg-[#E2E8F0] rounded-xl w-full"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Your Next Visit
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-[#243746] mt-1">
            No upcoming visit scheduled
          </h3>
          <p className="text-sm text-[#64748B] mt-2">
            Your next AgeWellRI safety oversight visit has not been scheduled yet.
          </p>
        </div>

        <button
          onClick={onScheduleVisit}
          className="w-full py-3 px-4 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-base rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Schedule a Visit</span>
        </button>
      </div>
    );
  }

  // Format date readable e.g. "Tuesday, September 15, 2026"
  const formattedDate = new Date(appointment.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isRequested =
    appointment.status === "requested" ||
    (!appointment.technicianId && appointment.status !== "cancelled");

  return (
    <div className="bg-[#294B68] text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-md relative flex flex-col justify-between space-y-6">
      <div>
        <div className="flex items-center justify-between gap-2">
          {isRequested ? (
            <span className="text-xs font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30">
              Visit Requested
            </span>
          ) : (
            <span className="text-xs font-bold uppercase tracking-wider text-[#5E8FB2] bg-white/10 px-3 py-1 rounded-full border border-white/15">
              Your Next Visit
            </span>
          )}
          {appointment.bookedBy && (
            <span className="text-xs font-medium text-white/80 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5E8FB2]" />
              Booked by {appointment.bookedBy}
            </span>
          )}
        </div>

        <div className="mt-4 space-y-1">
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {appointment.serviceType}
          </h3>
          <p className="text-sm text-white/90 flex items-center gap-2 font-medium">
            <Calendar className="w-4 h-4 text-[#5E8FB2]" />
            {formattedDate}
          </p>
        </div>
      </div>

      <div className="space-y-3 bg-white/10 p-4 rounded-xl border border-white/15 backdrop-blur-xs">
        <div className="flex items-center gap-2.5 text-sm text-white font-semibold">
          <Clock className="w-4 h-4 text-[#5E8FB2]" />
          <span>{appointment.timeSlot}</span>
        </div>

        <div className="flex items-center gap-2.5 text-xs sm:text-sm text-white/90 pt-1 border-t border-white/10">
          <UserCheck className="w-4 h-4 text-[#5E8FB2]" />
          <div>
            <span className="font-bold block">
              {isRequested ? "Pending Admin Specialist Assignment" : appointment.technicianName}
            </span>
            <span className="text-xs text-white/70">
              {isRequested ? "Our team is assigning a specialist" : appointment.technicianTitle}
            </span>
          </div>
        </div>
      </div>

      <Link
        href={`/dashboard/appointments/${appointment.id}`}
        className="w-full py-3 px-4 bg-white hover:bg-[#EAF3F8] text-[#294B68] font-bold text-base rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
      >
        <span>View Visit Details</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
