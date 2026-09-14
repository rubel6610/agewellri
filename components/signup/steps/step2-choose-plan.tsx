"use client";

import React, { useState } from "react";
import {
  Shield,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Star,
} from "lucide-react";
import { useGetActivePlansQuery } from "@/redux/features/plan/planApi";
import { ActivePlan } from "@/redux/features/plan/planTypes";

interface Step2ChoosePlanProps {
  selectedPlanId?: string;
  onSelectPlan: (plan: {
    planId: string;
    planCode: string;
    planName: string;
    planPrice: number;
    billingInterval: string;
    totalVisits: number;
    services: Array<{ serviceName: string; allocatedVisits: number }>;
  }) => void;
  onBack?: () => void;
}

export function Step2ChoosePlan({
  selectedPlanId,
  onSelectPlan,
  onBack,
}: Step2ChoosePlanProps) {
  const { data: plans = [], isLoading } = useGetActivePlansQuery();

  // Fallback plans if database has not returned yet or during loading
  const displayPlans: ActivePlan[] =
    plans.length > 0
      ? plans
      : [
          {
            id: "premium_safety_safeguard",
            code: "PREMIUM_SAFETY_SAFEGUARD",
            name: "Premium Safety Safeguard",
            description:
              "Comprehensive home safety maintenance, seasonal check-ins, and proactive senior independence support.",
            price: 295,
            billingInterval: "MONTHLY",
            totalVisits: 12,
            services: [
              {
                serviceTypeId: "srv_safety",
                serviceName: "Monthly Safety & Upkeep Visits",
                allocatedVisits: 4,
                unit: "VISITS",
              },
              {
                serviceTypeId: "srv_seasonal",
                serviceName: "Seasonal Transition Check-Ins",
                allocatedVisits: 4,
                unit: "VISITS",
              },
              {
                serviceTypeId: "srv_hazard",
                serviceName: "Home Hazard Prevention & Testing",
                allocatedVisits: 4,
                unit: "VISITS",
              },
            ],
            isActive: true,
            subscribersCount: 0,
          },
          {
            id: "independence_upkeep_plan",
            code: "INDEPENDENCE_UPKEEP_PLAN",
            name: "Independence & Upkeep Plan",
            description:
              "Our premier safety oversight and home upkeep service for total peace of mind and complete home preservation.",
            price: 495,
            billingInterval: "MONTHLY",
            totalVisits: 24,
            services: [
              {
                serviceTypeId: "srv_upkeep",
                serviceName: "Monthly Dedicated Upkeep & Safety Visits",
                allocatedVisits: 12,
                unit: "VISITS",
              },
              {
                serviceTypeId: "srv_audit",
                serviceName: "Comprehensive Mechanical & Plumbing Audits",
                allocatedVisits: 6,
                unit: "VISITS",
              },
              {
                serviceTypeId: "srv_priority",
                serviceName: "Priority Rapid Technician Response",
                allocatedVisits: 6,
                unit: "VISITS",
              },
            ],
            isActive: true,
            subscribersCount: 0,
          },
        ];

  const [currentSelectedId, setCurrentSelectedId] = useState<string>(
    selectedPlanId || displayPlans[0]?.id || displayPlans[0]?.code,
  );

  const selectedPlan =
    displayPlans.find(
      (p) => p.id === currentSelectedId || p.code === currentSelectedId,
    ) || displayPlans[0];

  const handleContinue = () => {
    if (selectedPlan) {
      onSelectPlan({
        planId: selectedPlan.id,
        planCode: selectedPlan.code,
        planName: selectedPlan.name,
        planPrice: selectedPlan.price,
        billingInterval: selectedPlan.billingInterval || "MONTHLY",
        totalVisits: selectedPlan.totalVisits || 12,
        services: selectedPlan.services || [],
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EAF3F8] text-[#294B68] text-xs font-bold uppercase tracking-wider">
          Step 2 of 9
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
          Choose Your Service Plan
        </h2>
        <p className="text-sm text-[#5E8FB2] max-w-lg mx-auto">
          Select the membership plan tailored to your household. Plans include
          dedicated home visits, safety inspections, and authorized family
          updates.
        </p>
      </div>

      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#294B68] mx-auto" />
          <p className="text-sm font-semibold text-[#64748B]">
            Loading available service plans...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayPlans.map((plan) => {
            const isSelected =
              plan.id === currentSelectedId || plan.code === currentSelectedId;
            const isPopular =
              plan.code.includes("INDEPENDENCE") ||
              plan.name.includes("Independence");

            return (
              <div
                key={plan.id || plan.code}
                onClick={() => setCurrentSelectedId(plan.id || plan.code)}
                className={`relative rounded-3xl p-6 sm:p-8 cursor-pointer transition-all duration-200 border-2 flex flex-col justify-between ${
                  isSelected
                    ? "bg-white border-[#294B68] shadow-xl ring-2 ring-[#294B68]/20"
                    : "bg-[#F8FAFC] border-[#D9E4EC] hover:bg-white hover:border-[#5E8FB2] shadow-sm"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 right-6 px-3.5 py-1 bg-[#294B68] text-white text-[11px] font-extrabold uppercase tracking-wider rounded-full shadow-md flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>Most Popular</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-black text-[#243746]">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-[#64748B] mt-1 leading-relaxed line-clamp-2">
                        {plan.shortDescription ||
                          "Comprehensive Home Safety Oversight & Proactive Hazard Removal."}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="pt-2 pb-4 border-b border-[#D9E4EC]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-[#243746]">
                        ${plan.price}
                      </span>
                      <span className="text-sm font-bold text-[#64748B]">
                        / month
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-[#3F8F6B] mt-1 block">
                      {plan.totalVisits} Dedicated Home Visits / month
                    </span>
                  </div>

                  {/* Services / Inclusions */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] block">
                      Plan Inclusions:
                    </span>
                    {(plan.services || []).map((svc, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-start gap-2.5 text-xs text-[#475569]"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#3F8F6B] shrink-0 mt-0.5" />
                        <span>
                          <strong>{svc.allocatedVisits} visits</strong> &bull;{" "}
                          {svc.serviceName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selection Check Indicator */}
                <div className="pt-6 mt-6 border-t border-[#D9E4EC] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#64748B]">
                    {isSelected ? "Plan Selected" : "Click to Select"}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-[#294B68] text-white"
                        : "border-2 border-[#CBD5E1] bg-white"
                    }`}
                  >
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 fill-[#294B68] text-white" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Navigation Buttons */}
      <div
        className={`flex items-center ${onBack ? "justify-between" : "justify-end"} pt-4`}
      >
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-[#D9E4EC] bg-white text-sm font-bold text-[#64748B] hover:text-[#243746] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleContinue}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#294B68] hover:bg-[#1E374D] text-white text-sm font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer group"
        >
          <span>Continue to Resident Details</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
