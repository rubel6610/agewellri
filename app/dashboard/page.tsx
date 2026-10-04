"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { ServicePlan } from "@/lib/types/dashboard";
import { useAppSelector } from "@/redux/hooks";
import { useGetMyAppointmentsQuery } from "@/redux/features/appointment/appointmentApi";
import { useGetVisitEntitlementsQuery, useGetBillingOverviewQuery } from "@/redux/features/payment/paymentApi";
import { PlanCard } from "@/components/dashboard/plan-card";
import { NextVisitCard } from "@/components/dashboard/next-visit-card";
import { VisitEntitlementsCard } from "@/components/dashboard/visit-entitlements-card";
import { OnboardingBanner } from "@/components/dashboard/onboarding-banner";
import { ScheduleVisitModal } from "@/components/dashboard/schedule-visit-modal";

export default function DashboardHomePage() {
  const authUser = useAppSelector((state) => state.auth.user);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const { data: entitlementsRes, isLoading: isEntitlementsLoading, refetch: refetchEntitlements } = useGetVisitEntitlementsQuery();
  const { data: billingRes, isLoading: isBillingLoading, refetch: refetchBilling } = useGetBillingOverviewQuery();
  const { data: apptsRes, isLoading: isApptsLoading, refetch: refetchAppts } = useGetMyAppointmentsQuery();

  const realAppointments = apptsRes?.data || [];
  const entitlementsData = entitlementsRes?.data;

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

  // Resolve base Service Commencement Date as a Date object
  const serviceBeginsDate = (() => {
    if (billingRes?.data?.serviceCommencementDate) {
      const parsed = new Date(billingRes.data.serviceCommencementDate);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    if (billingRes?.data?.firstBillingDate) {
      const parsed = new Date(billingRes.data.firstBillingDate);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    if (entitlementsData?.billingPeriod?.startDate) {
      const parsed = new Date(entitlementsData.billingPeriod.startDate);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  })();

  // Service Begins: 1st day of commencement month (e.g. October 1, 2026 for a Sept signup)
  const serviceBeginsFormatted = serviceBeginsDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Next Monthly Renewal: ALWAYS the 1st of the month AFTER Service Begins (e.g. November 1, 2026 for an Oct commencement)
  const nextRenewalFormatted = (() => {
    if (billingRes?.data?.nextPaymentDate) {
      const parsedNext = new Date(billingRes.data.nextPaymentDate);
      if (
        !isNaN(parsedNext.getTime()) &&
        parsedNext.getTime() > serviceBeginsDate.getTime()
      ) {
        return parsedNext.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
      }
    }

    const nextMonthFirst = new Date(
      serviceBeginsDate.getFullYear(),
      serviceBeginsDate.getMonth() + 1,
      1
    );

    return nextMonthFirst.toLocaleDateString("en-US", {
      month: "long",
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
        month: "long",
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

  const scheduledVisits =
    entitlementsData?.totalScheduled !== undefined && entitlementsData.totalScheduled >= 0
      ? entitlementsData.totalScheduled
      : 0;

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
    scheduledVisits,
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
          className={`flex items-center gap-3 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl border shrink-0 ${
            isPlanCancelled
              ? "text-amber-800 bg-amber-50 border-amber-300"
              : "text-[#294B68] bg-[#EAF3F8] border-[#5E8FB2]/30"
          }`}
        >
          <Clock className={`w-4 h-4 shrink-0 ${isPlanCancelled ? "text-amber-600" : "text-[#5E8FB2]"}`} />
          {isEntitlementsLoading || isBillingLoading ? (
            <span className="inline-block h-4 bg-[#5E8FB2]/30 rounded w-48 align-middle animate-pulse" />
          ) : (
            <div className="flex flex-col gap-0.5 text-xs sm:text-sm leading-snug">
              <div>
                Service Begins: <strong>{serviceBeginsFormatted}</strong>
              </div>
              <div>
                {isPlanCancelled ? "Service Ending: " : "Next Monthly Renewal: "}
                <strong>{isPlanCancelled ? serviceEndDateFormatted : nextRenewalFormatted}</strong>
              </div>
            </div>
          )}
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
          onRefetch={() => {
            refetchAppts();
            refetchEntitlements();
            refetchBilling();
          }}
        />
      </div>

      {/* Level 1.5: Dynamic Visit Entitlements Breakdown */}
      <VisitEntitlementsCard />

      {/* Schedule Visit Modal */}
      <ScheduleVisitModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        plan={dynamicPlan}
      />
    </div>
  );
}
