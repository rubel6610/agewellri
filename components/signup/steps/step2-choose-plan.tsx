"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Star,
  Package,
} from "lucide-react";
import { useGetActivePlansQuery } from "@/redux/features/plan/planApi";
import {
  ActivePlan,
  formatPlanDuration,
} from "@/redux/features/plan/planTypes";

interface Step2ChoosePlanProps {
  selectedPlanId?: string;
  onSelectPlan: (plan: {
    planId: string;
    planCode: string;
    planName: string;
    planPrice: number;
    billingInterval: string;
    totalVisits: number;
    times?: string;
    features?: string[];
    services?: Array<{ serviceName: string; allocatedVisits: number }>;
  }) => void;
  onBack?: () => void;
}

export function Step2ChoosePlan({
  selectedPlanId,
  onSelectPlan,
  onBack,
}: Step2ChoosePlanProps) {
  const { data: plans = [], isLoading } = useGetActivePlansQuery();

  const displayPlans: ActivePlan[] = useMemo(() => {
    if (!plans || plans.length === 0) return [];
    return [...plans].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (dateA && dateB && dateA !== dateB) return dateB - dateA;
      return (b.displayOrder ?? 0) - (a.displayOrder ?? 0);
    });
  }, [plans]);

  const [currentSelectedId, setCurrentSelectedId] = useState<string>(
    selectedPlanId || displayPlans[0]?.id || displayPlans[0]?.code || "",
  );

  useEffect(() => {
    if (!currentSelectedId && displayPlans.length > 0) {
      setCurrentSelectedId(displayPlans[0].id || displayPlans[0].code);
    }
  }, [displayPlans, currentSelectedId]);

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
        totalVisits: selectedPlan.totalVisits || 1,
        times: formatPlanDuration(selectedPlan.times),
        features: selectedPlan.features || [],
        services: [],
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
      ) : displayPlans.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-[#F8FAFC] rounded-3xl border border-[#D9E4EC]">
          <Package className="w-10 h-10 text-[#5E8FB2] mx-auto" />
          <h3 className="text-base font-bold text-[#243746]">
            No Service Plans Available
          </h3>
          <p className="text-xs text-[#64748B]">
            Please contact support or check back shortly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayPlans.map((plan) => {
            const isSelected =
              plan.id === (selectedPlan?.id || currentSelectedId) ||
              plan.code === (selectedPlan?.code || currentSelectedId);
            const isPopular =
              plan.code.includes("PEACE_OF_MIND") ||
              plan.name.includes("Peace of Mind");

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
                      {plan.shortDescription && (
                        <p className="text-xs text-[#64748B] mt-1 leading-relaxed line-clamp-2">
                          {plan.shortDescription}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="pt-2 pb-4  border-[#D9E4EC]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-[#243746]">
                        ${plan.price}
                      </span>
                      <span className="text-sm font-bold text-[#64748B]">
                        / {plan.billingInterval?.toLowerCase() || "month"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-xs font-bold text-[#3F8F6B]">
                        {plan.totalVisits || 1}{" "}
                        {plan.totalVisits === 1
                          ? "Dedicated Home Visit"
                          : "Dedicated Home Visits"}{" "}
                        / mo
                      </span>
                      <span className="text-xs font-extrabold text-[#294B68] bg-[#EAF3F8] px-2 py-0.5 rounded-md">
                        {formatPlanDuration(plan.times)}
                      </span>
                    </div>
                  </div>

                  {/* Features / Inclusions Bullet Points */}
                  <div className="">
                    {plan.features && plan.features.length > 0 && (
                      <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] block">
                        Plan Inclusions &amp; Features:
                      </span>
                    )}
                    {(plan.features || []).map((feat, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex items-start gap-2.5 text-xs text-[#475569]"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#3F8F6B] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selection Check Indicator */}
                <div className="pt-2   border-[#D9E4EC] flex items-center justify-between">
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
          disabled={!selectedPlan}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#294B68] hover:bg-[#1E374D] text-white text-sm font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer group disabled:opacity-50"
        >
          <span>Continue to Resident Details</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
