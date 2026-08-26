"use client";

import React, { useState } from "react";
import { useGetMyAppointmentsQuery } from "@/redux/features/appointment/appointmentApi";
import { useGetVisitEntitlementsQuery } from "@/redux/features/payment/paymentApi";
import { VisitCard } from "@/components/dashboard/visit-card";
import { ScheduleVisitModal } from "@/components/dashboard/schedule-visit-modal";
import { Calendar, Plus, Loader2 } from "lucide-react";

export default function AppointmentsPage() {
  const { data: apptRes, isLoading: isApptLoading } = useGetMyAppointmentsQuery();
  const { data: entitlementsRes, isLoading: isEntLoading } = useGetVisitEntitlementsQuery();
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const appointments = apptRes?.data || [];
  const entitlementData = entitlementsRes?.data;

  if (isApptLoading || isEntLoading) {
    return (
      <div className="p-16 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#294B68]" />
        <p className="font-bold text-sm text-[#243746]">Loading your scheduled care visits...</p>
      </div>
    );
  }

  const upcomingVisits = appointments.filter(
    (a) => a.status === "scheduled" || a.status === "confirmed" || a.status === "rescheduled"
  );
  const pastVisits = appointments.filter((a) => a.status === "completed");

  const totalRemaining = entitlementData?.totalRemaining ?? 0;
  const totalAllocated = entitlementData?.totalAllocated ?? 12;

  return (
    <div className="space-y-8 text-[#243746]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9E4EC]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746] tracking-tight">
            My Home Visits
          </h1>
          <p className="text-sm text-[#64748B] mt-1 font-medium">
            Manage scheduled Safety Oversight and Cleaning visits for your residence.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right text-xs font-semibold text-[#64748B] hidden sm:block">
            <span>Visits remaining this quarter:</span>
            <strong className="text-[#294B68] block text-base font-extrabold">
              {totalRemaining} of {totalAllocated}
            </strong>
          </div>

          <button
            onClick={() => setScheduleModalOpen(true)}
            className="px-4 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Visit</span>
          </button>
        </div>
      </div>

      {/* Section 1: Upcoming Visits */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#243746] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#294B68]" />
            Upcoming Visits ({upcomingVisits.length})
          </h2>
        </div>

        {upcomingVisits.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#D9E4EC] text-sm text-[#64748B] space-y-3">
            <p>No upcoming visits scheduled right now.</p>
            <button
              onClick={() => setScheduleModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#EAF3F8] text-[#294B68] text-xs font-bold rounded-xl hover:bg-[#D9E4EC] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Book Your Next Home Visit</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingVisits.map((appt: any) => (
              <VisitCard key={appt.id} appointment={appt} />
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Past Visits */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-[#243746] flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#5E8FB2]" />
          Past Completed Visits ({pastVisits.length})
        </h2>

        {pastVisits.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#D9E4EC] text-sm text-[#64748B]">
            No completed past visits yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastVisits.map((appt: any) => (
              <VisitCard key={appt.id} appointment={appt} />
            ))}
          </div>
        )}
      </div>

      {/* Schedule Visit Modal */}
      <ScheduleVisitModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
      />
    </div>
  );
}
