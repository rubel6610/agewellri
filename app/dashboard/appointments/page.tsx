"use client";

import React, { useEffect, useState } from "react";
import { getAppointments, getCurrentPlan } from "@/lib/api/dashboard";
import { Appointment, ServicePlan } from "@/lib/types/dashboard";
import { VisitCard } from "@/components/dashboard/visit-card";
import { Calendar } from "lucide-react";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [plan, setPlan] = useState<ServicePlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAppointments(), getCurrentPlan()]).then(([apptData, planData]) => {
      setAppointments(apptData);
      setPlan(planData);
      setLoading(false);
    });
  }, []);

  if (loading || !plan) {
    return (
      <div className="p-12 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC]">
        Loading visits...
      </div>
    );
  }

  const upcomingVisits = appointments.filter((a) => a.status === "scheduled");
  const pastVisits = appointments.filter((a) => a.status === "completed");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9E4EC]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
            My Home Visits
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Manage scheduled Safety Oversight and Cleaning visits for your home.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs font-semibold text-[#64748B] hidden sm:block">
            <span>Visits remaining this quarter:</span>
            <strong className="text-[#294B68] block text-base font-extrabold">
              {plan.remainingVisits} of {plan.totalVisits}
            </strong>
          </div>
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
          <div className="p-8 text-center bg-white rounded-2xl border border-[#D9E4EC] text-sm text-[#64748B]">
            No upcoming visits scheduled right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingVisits.map((appt) => (
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
            {pastVisits.map((appt) => (
              <VisitCard key={appt.id} appointment={appt} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
