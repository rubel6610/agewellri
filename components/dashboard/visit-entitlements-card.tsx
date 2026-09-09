"use client";

import React from "react";
import { Sparkles, CalendarCheck, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { useGetVisitEntitlementsQuery } from "@/redux/features/payment/paymentApi";

export function VisitEntitlementsCard() {
  const { data: entitlementsRes, isLoading, isError } = useGetVisitEntitlementsQuery();

  const data = entitlementsRes?.data;
  const entitlements = data?.entitlements || [];
  const billingPeriod = data?.billingPeriod;

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] shadow-2xs space-y-4 animate-pulse">
        <div className="h-5 bg-slate-100 rounded w-1/3" />
        <div className="space-y-3">
          <div className="h-16 bg-slate-50 rounded-xl" />
          <div className="h-16 bg-slate-50 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !data || entitlements.length === 0) {
    return null;
  }

  const periodFormatted = billingPeriod
    ? `${new Date(billingPeriod.startDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} – ${new Date(billingPeriod.endDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`
    : "Current Month";

  return (
    <div className="p-6 sm:p-7 bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] shadow-xs space-y-5 text-[#243746]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D9E4EC]/70">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#EAF3F8] text-[#294B68]">
              <Sparkles className="w-4 h-4 text-[#294B68]" />
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#243746] tracking-tight">
              Included Visits &amp; Safety Allocation
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] font-medium">
            Your {data.planName} coverage for {periodFormatted}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EBF8F2] border border-[#3F8F6B]/30 text-xs font-bold text-[#166534] shrink-0 self-start sm:self-auto">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#3F8F6B]" />
          <span>
            {data.totalRemaining} of {data.totalAllocated} Total Visits Remaining
          </span>
        </div>
      </div>

      {/* Entitlement Service Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {entitlements.map((item) => {
          const percentUsed =
            item.allocated > 0
              ? Math.min(100, Math.round(((item.completed + item.scheduled) / item.allocated) * 100))
              : 0;

          return (
            <div
              key={item.id}
              className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-[#D9E4EC] space-y-3 transition-all hover:border-[#5E8FB2]/60 hover:bg-[#F0F5F9]/50"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-[#243746] tracking-tight">
                    {item.serviceName}
                  </h4>
                  <span className="text-xs font-semibold text-[#5E8FB2]">
                    {item.durationMinutes} min / visit
                  </span>
                </div>

                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-[#294B68] text-white shrink-0 shadow-2xs">
                  {item.allocated} Included
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full bg-[#E2E8F0] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#294B68] h-full rounded-full transition-all duration-300"
                    style={{ width: `${percentUsed}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-[#64748B] font-medium pt-0.5">
                  <span>
                    {item.completed} completed • {item.scheduled} scheduled
                  </span>
                  <span className="font-extrabold text-[#294B68]">
                    {item.remaining} remaining
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
