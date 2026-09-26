"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Sparkles, FileCheck2 } from "lucide-react";
import { ServicePlan } from "@/lib/types/dashboard";
import { useAppSelector } from "@/redux/hooks";
import { useGetMyAppointmentsQuery } from "@/redux/features/appointment/appointmentApi";
import { useGetVisitEntitlementsQuery, useGetBillingOverviewQuery } from "@/redux/features/payment/paymentApi";
import { useGetMyReportsQuery } from "@/redux/features/report/reportApi";
import { PlanCard } from "@/components/dashboard/plan-card";
import { NextVisitCard } from "@/components/dashboard/next-visit-card";
import { VisitEntitlementsCard } from "@/components/dashboard/visit-entitlements-card";
import { ReportCard } from "@/components/dashboard/report-card";
import { OnboardingBanner } from "@/components/dashboard/onboarding-banner";
import { ScheduleVisitModal } from "@/components/dashboard/schedule-visit-modal";

export default function DashboardHomePage() {
  const authUser = useAppSelector((state) => state.auth.user);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const { data: entitlementsRes, isLoading: isEntitlementsLoading, refetch: refetchEntitlements } = useGetVisitEntitlementsQuery();
  const { data: billingRes, isLoading: isBillingLoading, refetch: refetchBilling } = useGetBillingOverviewQuery();
  const { data: apptsRes, isLoading: isApptsLoading } = useGetMyAppointmentsQuery();
  const { data: reportsRes, isLoading: isReportsLoading } = useGetMyReportsQuery();

  const realAppointments = apptsRes?.data || [];
  const entitlementsData = entitlementsRes?.data;
  const dynamicReports = reportsRes?.data || [];

  // Dynamic user data
  const firstName = authUser?.firstName || "Member";
  const accountStatus = (authUser?.status as any) || "ACTIVE";

  // Dynamic Plan calculation from live entitlements
  const periodEndFormatted = entitlementsData?.billingPeriod?.endDate
    ? new Date(entitlementsData.billingPeriod.endDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : (() => {
        const now = new Date();
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const curMonth = new Date(now.getFullYear(), now.getMonth(), lastDay);
        return curMonth.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      })();

  const periodFormatted = entitlementsData?.billingPeriod
    ? `${new Date(entitlementsData.billingPeriod.startDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} – ${periodEndFormatted}`
    : "Current Period";

  // Next Monthly Renewal: ALWAYS the 1st of the next month (e.g. Nov 1, 2026 for an Oct cycle)
  const nextRenewalFormatted = (() => {
    // 1. If backend explicitly returned a next payment date that is day 1 of a month, format and use it
    if (billingRes?.data?.nextPaymentDate) {
      const parsed = new Date(billingRes.data.nextPaymentDate);
      if (!isNaN(parsed.getTime())) {
        const utcDay = parsed.getUTCDate();
        const localDay = parsed.getDate();
        if (utcDay === 1 || localDay === 1) {
          return parsed.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        }
      }
    }

    // 2. Otherwise calculate 1st of next month directly from the entitlements billing period or current date
    const refDate = entitlementsData?.billingPeriod?.startDate
      ? new Date(entitlementsData.billingPeriod.startDate)
      : entitlementsData?.billingPeriod?.endDate
      ? new Date(entitlementsData.billingPeriod.endDate)
      : new Date();

    const nextMonthFirst = new Date(
      refDate.getFullYear(),
      refDate.getMonth() + 1,
      1
    );

    return nextMonthFirst.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  })();

  const isPlanCancelled =
    billingRes?.data?.cancelAtPeriodEnd ||
    billingRes?.data?.subscriptionStatus === "CANCELLATION_REQUESTED" ||
    billingRes?.data?.subscriptionStatus === "CANCELLED";

  const serviceEndDateFormatted = billingRes?.data?.cancellationEffectiveAt
    ? new Date(billingRes.data.cancellationEffectiveAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : periodEndFormatted;

  const safetyEntitlement = entitlementsData?.entitlements?.find(
    (e: any) =>
      e.serviceName?.toLowerCase().includes("safety") || e.category === "SAFETY_OVERSIGHT"
  );

  const rawPlanName = entitlementsData?.planName || authUser?.client?.selectedPlan || "Member Service Plan";
  let formattedPlanName = rawPlanName;
  if (formattedPlanName.includes("_") || formattedPlanName.includes("-")) {
    formattedPlanName = formattedPlanName
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  const safetyTotal = safetyEntitlement?.allocated ?? entitlementsData?.totalAllocated ?? 2;
  const safetyCompleted = safetyEntitlement?.completed ?? entitlementsData?.totalCompleted ?? 0;

  const totalVisits =
    entitlementsData?.totalAllocated && entitlementsData.totalAllocated > 0
      ? entitlementsData.totalAllocated
      : safetyTotal;

  const completedVisits =
    entitlementsData?.totalCompleted !== undefined && entitlementsData.totalCompleted >= 0
      ? entitlementsData.totalCompleted
      : safetyCompleted;

  const remainingVisits =
    entitlementsData?.totalRemaining !== undefined && entitlementsData.totalAllocated && entitlementsData.totalAllocated > 0
      ? entitlementsData.totalRemaining
      : Math.max(0, totalVisits - completedVisits);

  const dynamicPlan: ServicePlan = {
    name: formattedPlanName,
    currentPeriod: periodFormatted,
    renewalDate: isPlanCancelled ? serviceEndDateFormatted : nextRenewalFormatted,
    totalVisits,
    completedVisits,
    remainingVisits,
    safetyVisitsTotal: safetyTotal,
    safetyVisitsCompleted: safetyCompleted,
    cleaningVisitsTotal: 0,
    cleaningVisitsCompleted: 0,
  };

  // Next scheduled appointment
  const nextVisit = realAppointments.find(
    (a) => a.status === "scheduled" || a.status === "confirmed"
  );

  return (
    <div className="space-y-8">
      {/* Onboarding State Banner (if pending) */}
      <OnboardingBanner status={accountStatus} />

      {/* Top Welcome Header - ALWAYS VISIBLE IMMEDIATELY */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#D9E4EC]/60">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#243746] tracking-tight">
            Welcome, {firstName}
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] mt-1">
            Here is your AgeWellRI service overview and safety schedule.
          </p>
        </div>

        <div
          className={`flex items-center gap-2 text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl border shrink-0 ${
            isPlanCancelled
              ? "text-amber-800 bg-amber-50 border-amber-300"
              : "text-[#294B68] bg-[#EAF3F8] border-[#5E8FB2]/30"
          }`}
        >
          <Clock className={`w-4 h-4 ${isPlanCancelled ? "text-amber-600" : "text-[#5E8FB2]"}`} />
          <span>
            {isPlanCancelled ? "Service Ending: " : "Next Monthly Renewal: "}
            {isEntitlementsLoading || isBillingLoading ? (
              <span className="inline-block h-3 bg-[#5E8FB2]/30 rounded w-16 align-middle animate-pulse ml-1" />
            ) : (
              <strong>{isPlanCancelled ? serviceEndDateFormatted : nextRenewalFormatted}</strong>
            )}
          </span>
        </div>
      </div>

      {/* Level 1: Plan & Next Visit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <PlanCard
          plan={dynamicPlan}
          isLoading={isEntitlementsLoading || isBillingLoading}
          billing={billingRes?.data}
          onRefresh={() => {
            refetchBilling();
            refetchEntitlements();
          }}
        />
        <NextVisitCard
          appointment={nextVisit}
          isLoading={isApptsLoading}
          onScheduleVisit={() => setScheduleModalOpen(true)}
        />
      </div>

      {/* Level 1.5: Dynamic Visit Entitlements Breakdown */}
      <VisitEntitlementsCard />

      {/* Level 2: Renewal Alert Banner / Cancellation Notice */}
      {isPlanCancelled ? (
        <div className="p-5 sm:p-6 bg-amber-50 rounded-2xl sm:rounded-3xl border border-amber-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl shrink-0">
              <Clock className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h4 className="font-bold text-amber-900 text-base">
                Automatic Renewal Cancelled
              </h4>
              <p className="text-xs sm:text-sm text-amber-800 mt-0.5">
                Your AgeWellRI coverage remains active through{" "}
                {isBillingLoading ? (
                  <span className="inline-block h-3 bg-amber-200 rounded w-20 align-middle animate-pulse" />
                ) : (
                  <strong>{serviceEndDateFormatted}</strong>
                )}
                . You will not be billed for subsequent monthly periods.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/billing"
            className="text-xs font-bold text-amber-900 hover:text-amber-950 underline shrink-0"
          >
            Manage Subscription →
          </Link>
        </div>
      ) : (
        <div className="p-5 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-[#EAF3F8] text-[#294B68] rounded-xl shrink-0">
              <Sparkles className="w-5 h-5 text-[#294B68]" />
            </div>
            <div>
              <h4 className="font-bold text-[#243746] text-base">
                Monthly Renewal Notice
              </h4>
              <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                Your next AgeWellRI monthly period begins on{" "}
                {isEntitlementsLoading ? (
                  <span className="inline-block h-3 bg-[#E2E8F0] rounded w-20 align-middle animate-pulse" />
                ) : (
                  <strong>{nextRenewalFormatted}</strong>
                )}{" "}
                ({dynamicPlan.totalVisits} visits included).
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
      )}

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

        {isReportsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="p-6 bg-white rounded-3xl border border-[#D9E4EC] space-y-4 shadow-xs">
                <div className="flex justify-between items-center">
                  <div className="h-5 bg-[#E2E8F0] rounded-md w-36"></div>
                  <div className="h-5 bg-[#E2E8F0] rounded-full w-20"></div>
                </div>
                <div className="h-3 bg-[#F1F5F9] rounded-md w-full"></div>
                <div className="h-3 bg-[#F1F5F9] rounded-md w-3/4"></div>
                <div className="pt-4 border-t border-[#D9E4EC]/60 flex justify-between items-center">
                  <div className="h-4 bg-[#E2E8F0] rounded-md w-24"></div>
                  <div className="h-9 bg-[#E2E8F0] rounded-xl w-28"></div>
                </div>
              </div>
            ))}
          </div>
        ) : dynamicReports.length === 0 ? (
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
