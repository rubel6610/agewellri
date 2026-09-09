import React from "react";
import Link from "next/link";
import { AlertTriangle, CreditCard, FileCheck, ArrowRight } from "lucide-react";
import { AccountStatus } from "@/lib/types/dashboard";

interface OnboardingBannerProps {
  status: AccountStatus;
}

export function OnboardingBanner({ status }: OnboardingBannerProps) {
  if (status === "active") return null;

  if (status === "pending_agreement") {
    return (
      <div className="p-5 sm:p-6 bg-amber-50 border-2 border-[#C28A3A]/40 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-[#C28A3A] text-white rounded-xl shrink-0 mt-0.5">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-bold text-[#243746]">
              Action Required: Complete your AgeWellRI setup
            </h4>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Your service agreement still needs your signature before visits can be scheduled.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/agreements"
          className="px-5 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0 w-full sm:w-auto justify-center"
        >
          <span>Review &amp; Sign Agreement</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (status === "pending_payment") {
    return (
      <div className="p-5 sm:p-6 bg-[#EAF3F8] border-2 border-[#5E8FB2]/40 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-[#294B68] text-white rounded-xl shrink-0 mt-0.5">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-bold text-[#243746]">
              Action Required: Complete your first payment
            </h4>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Your AgeWellRI service is ready to begin once your initial monthly payment is scheduled.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/billing"
          className="px-5 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0 w-full sm:w-auto justify-center"
        >
          <span>Complete Payment</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return null;
}
