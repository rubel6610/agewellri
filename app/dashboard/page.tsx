"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import {
  getMemberProfile,
  getCurrentPlan,
  getReports,
} from "@/lib/api/dashboard";
import { UserProfile, ServicePlan, Report } from "@/lib/types/dashboard";
import { useGetMyAppointmentsQuery } from "@/redux/features/appointment/appointmentApi";
import { PlanCard } from "@/components/dashboard/plan-card";
import { NextVisitCard } from "@/components/dashboard/next-visit-card";
import { VisitEntitlementsCard } from "@/components/dashboard/visit-entitlements-card";
import { ReportCard } from "@/components/dashboard/report-card";
import { OnboardingBanner } from "@/components/dashboard/onboarding-banner";
import { ScheduleVisitModal } from "@/components/dashboard/schedule-visit-modal";

export default function DashboardHomePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<ServicePlan | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const { data: apptsRes } = useGetMyAppointmentsQuery();
  const realAppointments = apptsRes?.data || [];

  useEffect(() => {
    Promise.all([
      getMemberProfile(),
      getCurrentPlan(),
      getReports(),
    ]).then(([userData, planData, reportData]) => {
      setUser(userData);
      setPlan(planData);
      setReports(reportData);
      setLoading(false);
    });
  }, []);

  if (loading || !user || !plan) {
    return (
      <div className="p-12 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC]">
        Loading your AgeWellRI portal...
      </div>
    );
  }

  const nextVisit = realAppointments.find((a) => a.status === "scheduled" || a.status === "confirmed");

  return (
    <div className="space-y-8">
      {/* Onboarding State Banner (if pending) */}
      <OnboardingBanner status={user.accountStatus} />

      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#D9E4EC]/60">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#243746] tracking-tight">
            Welcome back, {user.firstName}
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] mt-1">
            Here is your AgeWellRI service overview and care schedule.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#294B68] bg-[#EAF3F8] px-3.5 py-2 rounded-xl border border-[#5E8FB2]/30 shrink-0">
          <Clock className="w-4 h-4 text-[#5E8FB2]" />
          <span>Next Quarter Renewal: <strong>{plan.renewalDate}</strong></span>
        </div>
      </div>

      {/* Level 1: Plan & Next Visit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <PlanCard plan={plan} />
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
              Your next AgeWellRI quarter begins on <strong>{plan.renewalDate}</strong> (12 visits included). Payment will auto-process via Visa ending 4242.
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
            <span>View All Reports ({reports.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.slice(0, 2).map((rep) => (
            <ReportCard key={rep.id} report={rep} />
          ))}
        </div>
      </div>

      {/* Schedule Visit Modal */}
      <ScheduleVisitModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        plan={plan}
      />
    </div>
  );
}
