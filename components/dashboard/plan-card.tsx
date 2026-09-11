"use client";

import React, { useState } from "react";
import { CheckCircle2, ShieldCheck, Sparkles, AlertTriangle, Clock, CreditCard } from "lucide-react";
import { ServicePlan } from "@/lib/types/dashboard";
import { BillingOverviewData } from "@/redux/features/payment/paymentTypes";
import { CancelRenewalModal } from "./cancel-renewal-modal";

interface PlanCardProps {
  plan: ServicePlan;
  isLoading?: boolean;
  billing?: BillingOverviewData;
  onRefresh?: () => void;
}

export function PlanCard({ plan, isLoading = false, billing, onRefresh }: PlanCardProps) {
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const isCancelled =
    billing?.cancelAtPeriodEnd ||
    billing?.subscriptionStatus === "CANCELLATION_REQUESTED" ||
    billing?.subscriptionStatus === "CANCELLED";

  // Normalize plan visit numbers to ensure no 0 of 0 display glitch
  const safetyTotal = plan.safetyVisitsTotal || 6;
  const safetyCompleted = plan.safetyVisitsCompleted || 0;
  const cleaningTotal = plan.cleaningVisitsTotal || 0;
  const cleaningCompleted = plan.cleaningVisitsCompleted || 0;

  const totalVisits =
    plan.totalVisits && plan.totalVisits > 0
      ? plan.totalVisits
      : safetyTotal + cleaningTotal;

  const completedVisits =
    plan.completedVisits !== undefined && plan.completedVisits > 0
      ? plan.completedVisits
      : safetyCompleted + cleaningCompleted;

  const remainingVisits =
    plan.remainingVisits !== undefined && plan.totalVisits > 0
      ? plan.remainingVisits
      : Math.max(0, totalVisits - completedVisits);

  const percentage =
    totalVisits > 0
      ? Math.min(100, Math.round((completedVisits / totalVisits) * 100))
      : 0;

  return (
    <>
      <div className="bg-gradient-to-br from-white via-[#F8FAFC] to-[#F0F5F9] rounded-2xl sm:rounded-3xl border-2 border-[#5E8FB2] p-6 sm:p-8 shadow-sm relative flex flex-col justify-between space-y-6 transition-all hover:shadow-md">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-[#294B68] text-white">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#294B68]">
                  Current Active Plan
                </span>
              </div>
              {isLoading ? (
                <div className="h-8 bg-[#E2E8F0] rounded-xl w-52 animate-pulse mt-1" />
              ) : (
                <h3 className="text-2xl sm:text-3xl font-black text-[#243746] tracking-tight">
                  {plan.name}
                </h3>
              )}
            </div>

            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border shadow-2xs shrink-0 ${
                isCancelled
                  ? "bg-amber-50 text-amber-800 border-amber-300"
                  : billing?.isPendingFirstBilling
                  ? "bg-sky-50 text-sky-800 border-sky-300"
                  : "bg-[#EAF3F8] text-[#166534] border-emerald-300"
              }`}
            >
              {isCancelled ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Ending Period</span>
                </>
              ) : billing?.isPendingFirstBilling ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-sky-600" />
                  <span>Scheduled on 1st</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Active Coverage</span>
                </>
              )}
            </span>
          </div>

          {/* Subscription Key Metrics Overview (Price, Next Billing, Auto-Renewal) */}
          <div className="mt-4 p-3.5 bg-white rounded-2xl border border-[#D9E4EC] grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[11px] text-[#64748B] font-semibold block">Monthly Price</span>
              <span className="text-sm font-black text-[#243746] mt-0.5 block">
                {billing?.nextPaymentAmount || "$295.00"}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-[#64748B] font-semibold block">
                {isCancelled ? "Service End Date" : "Next Billing Date"}
              </span>
              <span className="text-sm font-bold text-[#294B68] mt-0.5 block">
                {isCancelled && billing?.cancellationEffectiveAt
                  ? new Date(billing.cancellationEffectiveAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    )
                  : billing?.nextPaymentDate || plan.renewalDate}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 flex flex-col justify-between">
              <span className="text-[11px] text-[#64748B] font-semibold block">Auto-Renewal</span>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <span
                  className={`text-xs font-bold ${
                    isCancelled ? "text-amber-700" : "text-emerald-700"
                  }`}
                >
                  {isCancelled ? "Cancelled" : "Active (Auto-Pay)"}
                </span>

                {!isCancelled && (
                  <button
                    type="button"
                    onClick={() => setIsCancelModalOpen(true)}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-0.5 rounded-lg border border-red-200 transition-colors cursor-pointer"
                    title="Cancel automatic subscription renewal"
                  >
                    Cancel Plan
                  </button>
                )}
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm font-semibold text-[#64748B] mt-2.5">
            Current Service Period:{" "}
            {isLoading ? (
              <span className="inline-block h-4 bg-[#F1F5F9] rounded w-36 align-middle animate-pulse ml-1" />
            ) : (
              <strong className="text-[#243746] font-bold">{plan.currentPeriod}</strong>
            )}
          </p>
        </div>

      {/* Progress Bar & Breakdown */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-sm font-bold text-[#243746]">
          <span className="font-extrabold">Monthly Visit Allowance</span>
          <span className="text-[#294B68] font-black">
            {isLoading ? (
              <span className="inline-block h-4 bg-[#E2E8F0] rounded w-28 align-middle animate-pulse" />
            ) : (
              `${completedVisits} of ${totalVisits} visits completed`
            )}
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-[#E2E8F0] h-3.5 rounded-full overflow-hidden p-0.5 border border-[#D9E4EC]">
          {isLoading ? (
            <div className="bg-[#E2E8F0] h-full rounded-full w-1/3 animate-pulse" />
          ) : (
            <div
              className="bg-[#294B68] h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-white border border-[#D9E4EC] text-center shadow-2xs">
            <span className="text-xs text-[#64748B] font-bold uppercase tracking-wider block">Completed</span>
            {isLoading ? (
              <div className="h-6 bg-[#E2E8F0] rounded-md w-8 mx-auto mt-1 animate-pulse" />
            ) : (
              <span className="text-2xl font-black text-[#243746]">
                {completedVisits}
              </span>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-[#EAF3F8] border border-[#5E8FB2]/30 text-center shadow-2xs">
            <span className="text-xs text-[#294B68] font-bold uppercase tracking-wider block">Remaining</span>
            {isLoading ? (
              <div className="h-6 bg-[#E2E8F0] rounded-md w-8 mx-auto mt-1 animate-pulse" />
            ) : (
              <span className="text-2xl font-black text-[#294B68]">
                {remainingVisits}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Breakdown per service type */}
      <div className="pt-3 border-t border-[#D9E4EC] flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#64748B]">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#294B68]" />
          <span>
            Safety Oversight:{" "}
            {isLoading ? "..." : `${safetyCompleted} / ${safetyTotal}`}
          </span>
        </div>

        {cleaningTotal > 0 && (
          <div>
            <span>
              Cleaning Support:{" "}
              {isLoading ? "..." : `${cleaningCompleted} / ${cleaningTotal}`}
            </span>
          </div>
        )}
      </div>
    </div>

    <CancelRenewalModal
      isOpen={isCancelModalOpen}
      onClose={() => setIsCancelModalOpen(false)}
      planName={plan.name}
      endDate={
        billing?.cancellationEffectiveAt ||
        billing?.nextPaymentDate ||
        plan.renewalDate
      }
      cancellationCutoffDate={billing?.cancellationCutoffDate}
      onSuccess={() => {
        if (onRefresh) onRefresh();
      }}
    />
  </>
  );
}
