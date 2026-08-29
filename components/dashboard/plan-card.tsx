import React from "react";
import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { ServicePlan } from "@/lib/types/dashboard";

interface PlanCardProps {
  plan: ServicePlan;
  isLoading?: boolean;
}

export function PlanCard({ plan, isLoading = false }: PlanCardProps) {
  const percentage =
    plan.totalVisits > 0
      ? Math.round((plan.completedVisits / plan.totalVisits) * 100)
      : 0;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-xs relative flex flex-col justify-between space-y-6">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#294B68]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Current Service Plan
              </span>
            </div>
            {isLoading ? (
              <div className="h-8 bg-[#E2E8F0] rounded-xl w-52 animate-pulse mt-1" />
            ) : (
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
                {plan.name}
              </h3>
            )}
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#EAF3F8] text-[#294B68] border border-[#5E8FB2]/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3F8F6B]" />
            Active
          </span>
        </div>

        <p className="text-xs sm:text-sm font-medium text-[#64748B] mt-2">
          Current Service Period:{" "}
          {isLoading ? (
            <span className="inline-block h-4 bg-[#F1F5F9] rounded w-36 align-middle animate-pulse ml-1" />
          ) : (
            <strong className="text-[#243746]">{plan.currentPeriod}</strong>
          )}
        </p>
      </div>

      {/* Progress Bar & Breakdown */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-sm font-bold text-[#243746]">
          <span>Quarterly Visit Allowance</span>
          <span className="text-[#294B68]">
            {isLoading ? (
              <span className="inline-block h-4 bg-[#E2E8F0] rounded w-28 align-middle animate-pulse" />
            ) : (
              `${plan.completedVisits} of ${plan.totalVisits} visits completed`
            )}
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-[#EAF3F8] h-3.5 rounded-full overflow-hidden p-0.5 border border-[#D9E4EC]">
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
          <div className="p-3 rounded-xl bg-[#F7FAFC] border border-[#D9E4EC] text-center">
            <span className="text-xs text-[#64748B] font-semibold block">Completed</span>
            {isLoading ? (
              <div className="h-6 bg-[#E2E8F0] rounded-md w-8 mx-auto mt-1 animate-pulse" />
            ) : (
              <span className="text-xl font-extrabold text-[#243746]">
                {plan.completedVisits}
              </span>
            )}
          </div>

          <div className="p-3 rounded-xl bg-[#EAF3F8]/60 border border-[#5E8FB2]/20 text-center">
            <span className="text-xs text-[#294B68] font-semibold block">Remaining</span>
            {isLoading ? (
              <div className="h-6 bg-[#E2E8F0] rounded-md w-8 mx-auto mt-1 animate-pulse" />
            ) : (
              <span className="text-xl font-extrabold text-[#294B68]">
                {plan.remainingVisits}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Breakdown per service type */}
      <div className="pt-3 border-t border-[#D9E4EC] flex items-center justify-between text-xs font-semibold text-[#64748B]">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#5E8FB2]" />
          <span>
            Safety Oversight:{" "}
            {isLoading ? "..." : `${plan.safetyVisitsCompleted}/${plan.safetyVisitsTotal}`}
          </span>
        </div>
        <div>
          <span>
            Cleaning:{" "}
            {isLoading ? "..." : `${plan.cleaningVisitsCompleted}/${plan.cleaningVisitsTotal}`}
          </span>
        </div>
      </div>
    </div>
  );
}
