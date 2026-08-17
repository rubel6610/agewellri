"use client";

import React from "react";
import { CreditCard, Calendar, CheckCircle2, ShieldCheck } from "lucide-react";
import { BillingInfo } from "@/lib/types/dashboard";

interface BillingCardProps {
  billing: BillingInfo;
}

export function BillingCard({ billing }: BillingCardProps) {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Subscription &amp; Billing
          </span>
          <h3 className="text-2xl font-extrabold text-[#243746] mt-1">
            {billing.currentPlanName}
          </h3>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#EAF3F8] text-[#3F8F6B] border border-[#3F8F6B]/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Active Account
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Billing frequency */}
        <div className="p-4 bg-[#F7FAFC] rounded-2xl border border-[#D9E4EC]">
          <span className="text-xs text-[#64748B] font-semibold block">Billing Frequency</span>
          <span className="text-base font-bold text-[#243746] mt-1 block">
            {billing.billingFrequency}
          </span>
        </div>

        {/* Payment Method */}
        <div className="p-4 bg-[#F7FAFC] rounded-2xl border border-[#D9E4EC]">
          <span className="text-xs text-[#64748B] font-semibold block">Payment Method</span>
          <div className="flex items-center gap-2 mt-1">
            <CreditCard className="w-4 h-4 text-[#294B68]" />
            <span className="text-base font-bold text-[#243746]">
              {billing.paymentMethod.brand} •••• {billing.paymentMethod.last4}
            </span>
          </div>
        </div>

        {/* Next payment */}
        <div className="p-4 bg-[#EAF3F8]/60 rounded-2xl border border-[#5E8FB2]/30">
          <span className="text-xs text-[#294B68] font-bold block">Next Payment Date</span>
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="w-4 h-4 text-[#294B68]" />
            <span className="text-base font-extrabold text-[#294B68]">
              {billing.nextPaymentDate}
            </span>
          </div>
          <span className="text-xs font-semibold text-[#64748B] mt-0.5 block">
            Amount: {billing.nextPaymentAmount}
          </span>
        </div>
      </div>

      {/* Auto-renew alert */}
      <div className="p-4 bg-[#F7FAFC] rounded-2xl border border-[#D9E4EC] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[#3F8F6B] shrink-0" />
          <p className="text-xs sm:text-sm text-[#243746]">
            Automatic renewal is <strong>enabled</strong> for September 1, 2026.
          </p>
        </div>
        <button
          onClick={() => alert("Opening payment method manager")}
          className="px-4 py-2 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs rounded-xl transition-colors shrink-0 cursor-pointer"
        >
          Manage Payment Method
        </button>
      </div>
    </div>
  );
}
