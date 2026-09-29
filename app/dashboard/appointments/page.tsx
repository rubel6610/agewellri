"use client";

import React, { useState, useMemo } from "react";
import { useGetMyAppointmentsQuery } from "@/redux/features/appointment/appointmentApi";
import { useGetVisitEntitlementsQuery } from "@/redux/features/payment/paymentApi";
import { VisitCard } from "@/components/dashboard/visit-card";
import { ScheduleVisitModal } from "@/components/dashboard/schedule-visit-modal";
import { RescheduleVisitModal } from "@/components/dashboard/reschedule-visit-modal";
import { Calendar, Plus, CheckCircle2 } from "lucide-react";

export default function AppointmentsPage() {
  const { data: apptRes, isLoading: isApptLoading } = useGetMyAppointmentsQuery();
  const { data: entitlementsRes, isLoading: isEntLoading } = useGetVisitEntitlementsQuery();
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedRescheduleAppt, setSelectedRescheduleAppt] = useState<any>(null);
  const [statusTab, setStatusTab] = useState<"ALL" | "UPCOMING" | "COMPLETED">("ALL");

  const appointments = apptRes?.data || [];
  const entitlementData = entitlementsRes?.data;

  const upcomingVisits = useMemo(
    () =>
      appointments.filter(
        (a) =>
          a.status === "scheduled" ||
          a.status === "confirmed" ||
          a.status === "rescheduled" ||
          a.status === "requested" ||
          (!a.technicianId && a.status !== "cancelled" && a.status !== "completed")
      ),
    [appointments]
  );

  const pastVisits = useMemo(
    () => appointments.filter((a) => a.status === "completed"),
    [appointments]
  );

  const totalRemaining = entitlementData?.totalRemaining ?? 0;
  const totalAllocated = entitlementData?.totalAllocated ?? 12;

  return (
    <div className="space-y-8 text-[#243746]">
      {/* Header - ALWAYS VISIBLE IMMEDIATELY */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9E4EC]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746] tracking-tight">
            My Safety Visits
          </h1>
          <p className="text-sm text-[#64748B] mt-1 font-medium">
            Manage your scheduled safety oversight and hazard-mitigation visits, and review past visits for your residence.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* <div className="text-right text-xs font-semibold text-[#64748B] hidden sm:block">
            <span>Visits remaining this month:</span>
            {isEntLoading ? (
              <span className="block h-5 bg-[#E2E8F0] rounded w-16 ml-auto animate-pulse mt-0.5" />
            ) : (
              <strong className="text-[#294B68] block text-base font-extrabold">
                {totalRemaining} of {totalAllocated}
              </strong>
            )}
          </div> */}
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setStatusTab("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            statusTab === "ALL"
              ? "bg-[#294B68] text-white shadow-xs"
              : "bg-white text-[#243746] hover:bg-[#EAF3F8] border border-[#D9E4EC]"
          }`}
        >
          <span>All Active Visits ({upcomingVisits.length + pastVisits.length})</span>
        </button>

        <button
          onClick={() => setStatusTab("UPCOMING")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            statusTab === "UPCOMING"
              ? "bg-[#294B68] text-white shadow-xs"
              : "bg-white text-[#243746] hover:bg-[#EAF3F8] border border-[#D9E4EC]"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Upcoming &amp; Requested ({upcomingVisits.length})</span>
        </button>

        <button
          onClick={() => setStatusTab("COMPLETED")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            statusTab === "COMPLETED"
              ? "bg-[#294B68] text-white shadow-xs"
              : "bg-white text-[#243746] hover:bg-[#EAF3F8] border border-[#D9E4EC]"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Completed Visits ({pastVisits.length})</span>
        </button>
      </div>

      {/* Section 1: Upcoming & Requested Visits */}
      {(statusTab === "ALL" || statusTab === "UPCOMING") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#243746] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#294B68]" />
              <span>Upcoming Visits {isApptLoading ? "" : `(${upcomingVisits.length})`}</span>
            </h2>
          </div>

          {isApptLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="p-6 bg-white rounded-3xl border border-[#D9E4EC] space-y-4 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#E2E8F0]"></div>
                      <div className="space-y-1.5">
                        <div className="h-4 bg-[#E2E8F0] rounded-md w-28"></div>
                        <div className="h-3 bg-[#F1F5F9] rounded-md w-36"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-[#E2E8F0] rounded-full w-20"></div>
                  </div>
                  <div className="p-3.5 bg-[#F8FAFC] rounded-2xl space-y-2">
                    <div className="h-3.5 bg-[#E2E8F0] rounded-md w-40"></div>
                    <div className="h-3 bg-[#F1F5F9] rounded-md w-56"></div>
                  </div>
                  <div className="pt-2 flex justify-between items-center">
                    <div className="h-4 bg-[#E2E8F0] rounded-md w-24"></div>
                    <div className="h-8 bg-[#E2E8F0] rounded-xl w-28"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : upcomingVisits.length === 0 ? (
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
                <VisitCard
                  key={appt.id}
                  appointment={appt}
                  onReschedule={(targetAppt) => {
                    setSelectedRescheduleAppt(targetAppt);
                    setRescheduleModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Section 2: Past Completed Visits */}
      {(statusTab === "ALL" || statusTab === "COMPLETED") && (
        <div className="space-y-4 pt-4 border-t border-[#D9E4EC]/60">
          <h2 className="text-xl font-bold text-[#243746] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#3F8F6B]" />
            <span>Past Completed Visits {isApptLoading ? "" : `(${pastVisits.length})`}</span>
          </h2>

          {isApptLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="p-6 bg-white rounded-3xl border border-[#D9E4EC] space-y-4 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#E2E8F0]"></div>
                      <div className="space-y-1.5">
                        <div className="h-4 bg-[#E2E8F0] rounded-md w-28"></div>
                        <div className="h-3 bg-[#F1F5F9] rounded-md w-36"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-[#E2E8F0] rounded-full w-20"></div>
                  </div>
                  <div className="p-3.5 bg-[#F8FAFC] rounded-2xl space-y-2">
                    <div className="h-3.5 bg-[#E2E8F0] rounded-md w-40"></div>
                    <div className="h-3 bg-[#F1F5F9] rounded-md w-56"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : pastVisits.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#D9E4EC] text-sm text-[#64748B]">
              <p>No completed past visits yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pastVisits.map((appt: any) => (
                <VisitCard key={appt.id} appointment={appt} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Schedule Visit Modal */}
      <ScheduleVisitModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
      />

      {/* Reschedule Visit Modal */}
      <RescheduleVisitModal
        isOpen={rescheduleModalOpen}
        onClose={() => {
          setRescheduleModalOpen(false);
          setSelectedRescheduleAppt(null);
        }}
        appointment={selectedRescheduleAppt}
      />
    </div>
  );
}
