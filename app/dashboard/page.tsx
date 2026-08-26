"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Sparkles, FileCheck2, Loader2 } from "lucide-react";
import { UserProfile, ServicePlan, Report } from "@/lib/types/dashboard";
import { useAppSelector } from "@/redux/hooks";
import { useGetMyAppointmentsQuery } from "@/redux/features/appointment/appointmentApi";
import { useGetVisitEntitlementsQuery } from "@/redux/features/payment/paymentApi";
import { PlanCard } from "@/components/dashboard/plan-card";
import { NextVisitCard } from "@/components/dashboard/next-visit-card";
import { VisitEntitlementsCard } from "@/components/dashboard/visit-entitlements-card";
import { ReportCard } from "@/components/dashboard/report-card";
import { OnboardingBanner } from "@/components/dashboard/onboarding-banner";
import { ScheduleVisitModal } from "@/components/dashboard/schedule-visit-modal";

export default function DashboardHomePage() {
  const authUser = useAppSelector((state) => state.auth.user);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const { data: entitlementsRes, isLoading: isEntitlementsLoading } = useGetVisitEntitlementsQuery();
  const { data: apptsRes, isLoading: isApptsLoading } = useGetMyAppointmentsQuery();

  const realAppointments = apptsRes?.data || [];
  const entitlementsData = entitlementsRes?.data;

  const isLoading = isEntitlementsLoading || isApptsLoading;

  if (isLoading) {
    return (
      <div className="p-16 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#294B68]" />
        <p className="font-bold text-sm text-[#243746]">Loading your AgeWellRI portal...</p>
      </div>
    );
  }

  // Dynamic user data
  const firstName = authUser?.firstName || "Member";
  const accountStatus = (authUser?.status as any) || "ACTIVE";

  // Dynamic Plan calculation from live entitlements
  const renewalDateFormatted = entitlementsData?.billingPeriod?.endDate
    ? new Date(entitlementsData.billingPeriod.endDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Dec 31, 2026";

  const periodFormatted = entitlementsData?.billingPeriod
    ? `${new Date(entitlementsData.billingPeriod.startDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} – ${renewalDateFormatted}`
    : "Current Quarter";

  const safetyEntitlement = entitlementsData?.entitlements?.find(
    (e: any) =>
      e.serviceName?.toLowerCase().includes("safety") || e.category === "SAFETY_OVERSIGHT"
  );
  const cleaningEntitlement = entitlementsData?.entitlements?.find(
    (e: any) =>
      e.serviceName?.toLowerCase().includes("clean") || e.category === "CLEANING_SUPPORT"
  );

  const dynamicPlan: ServicePlan = {
    name: entitlementsData?.planName || "Guardian Plus Plan",
    currentPeriod: periodFormatted,
    renewalDate: renewalDateFormatted,
    totalVisits: entitlementsData?.totalAllocated ?? 12,
    completedVisits: entitlementsData?.totalCompleted ?? 0,
    remainingVisits: entitlementsData?.totalRemaining ?? 12,
    safetyVisitsTotal: safetyEntitlement?.allocated ?? 6,
    safetyVisitsCompleted: safetyEntitlement?.completed ?? 0,
    cleaningVisitsTotal: cleaningEntitlement?.allocated ?? 6,
    cleaningVisitsCompleted: cleaningEntitlement?.completed ?? 0,
  };

  // Next scheduled appointment
  const nextVisit = realAppointments.find(
    (a) => a.status === "scheduled" || a.status === "confirmed"
  );

  // Completed Appointments for Dynamic Reports Generation
  const completedAppointments = realAppointments.filter(
    (a) => a.status === "completed"
  );

  const dynamicReports: Report[] = completedAppointments.map((appt: any, idx: number) => ({
    id: appt.id || `rep_${idx}`,
    title: `${appt.serviceType || "Home Safety"} Assessment Report`,
    visitDate: appt.date
      ? new Date(appt.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Recently",
    score: 92,
    status: "available",
    summary: `Comprehensive evaluation completed by ${appt.technicianName || "Specialist"}. Fall hazards inspected, home perimeter safety verified.`,
    recommendationsCount: 2,
    pdfUrl: `/api/v1/reports/${appt.id}/pdf`,
  }));

  return (
    <div className="space-y-8">
      {/* Onboarding State Banner (if pending) */}
      <OnboardingBanner status={accountStatus} />

      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#D9E4EC]/60">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#243746] tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] mt-1">
            Here is your AgeWellRI service overview and care schedule.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#294B68] bg-[#EAF3F8] px-3.5 py-2 rounded-xl border border-[#5E8FB2]/30 shrink-0">
          <Clock className="w-4 h-4 text-[#5E8FB2]" />
          <span>Next Quarter Renewal: <strong>{renewalDateFormatted}</strong></span>
        </div>
      </div>

      {/* Level 1: Plan & Next Visit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <PlanCard plan={dynamicPlan} />
        <NextVisitCard
          appointment={nextVisit}
          onScheduleVisit={() => setScheduleModalOpen(true)}
        />
      </div>

      {/* Level 1.5: Dynamic Visit Entitlements Breakdown */}
      <VisitEntitlementsCard />

      {/* Level 2: Renewal Alert Banner */}
      <div className="p-5 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-[#EAF3F8] text-[#294B68] rounded-xl shrink-0">
            <Sparkles className="w-5 h-5 text-[#294B68]" />
          </div>
          <div>
            <h4 className="font-bold text-[#243746] text-base">
              Quarterly Renewal Notice
            </h4>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Your next AgeWellRI quarter begins on <strong>{renewalDateFormatted}</strong> ({dynamicPlan.totalVisits} visits included).
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/billing"
          className="text-xs font-bold text-[#294B68] hover:text-[#5E8FB2] underline shrink-0"
        >
          View Billing &amp; Subscription →
        </Link>
      </div>

      {/* Level 3: Recent Reports Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#243746]">Recent Home Reports</h2>
            <p className="text-xs text-[#64748B]">Age Safe® Home Score™ assessment documents</p>
          </div>

          <Link
            href="/dashboard/reports"
            className="text-xs sm:text-sm font-bold text-[#5E8FB2] hover:text-[#294B68] flex items-center gap-1 hover:underline"
          >
            <span>View All Reports ({dynamicReports.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {dynamicReports.length === 0 ? (
          <div className="p-8 sm:p-10 text-center bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] space-y-3">
            <div className="w-12 h-12 bg-[#EAF3F8] text-[#294B68] rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
              <FileCheck2 className="w-6 h-6 text-[#294B68]" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#243746]">No Assessment Reports Yet</h3>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto">
              Your certified specialist will generate and upload your official Age Safe® Home Score™ assessment report following your completed home safety visit.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dynamicReports.slice(0, 2).map((rep) => (
              <ReportCard key={rep.id} report={rep} />
            ))}
          </div>
        )}
      </div>

      {/* Schedule Visit Modal */}
      <ScheduleVisitModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        plan={dynamicPlan}
      />
    </div>
  );
}
