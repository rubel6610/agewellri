"use client";

import React from "react";
import { useGetBillingOverviewQuery } from "@/redux/features/payment/paymentApi";
import { BillingCard } from "@/components/dashboard/billing-card";
import { InvoiceTable } from "@/components/dashboard/invoice-table";
import { TrustBadges } from "@/components/support/trust-badges";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

export default function BillingPage() {
  const { data: liveData, isLoading, error, refetch, isFetching } = useGetBillingOverviewQuery();

  const billing = liveData?.data;

  if (isLoading && !billing) {
    return (
      <div className="p-16 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC] space-y-3 shadow-xs">
        <Loader2 className="w-8 h-8 animate-spin text-[#294B68] mx-auto" />
        <p className="text-sm font-bold text-[#243746]">Loading your billing overview...</p>
        <p className="text-xs text-[#64748B]">Connecting to secure account records</p>
      </div>
    );
  }

  if (error || !billing) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-[#D9E4EC] space-y-4 shadow-xs">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-[#243746]">Billing Overview Unavailable</h3>
          <p className="text-xs text-[#64748B] max-w-md mx-auto">
            Unable to load your subscription and billing details. Please ensure your agreement has been completed.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-4 py-2 bg-[#294B68] hover:bg-[#1E374D] text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9E4EC]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
            Billing &amp; Subscription
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Manage your membership care plan, payment methods, and billing statements.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#D9E4EC] bg-white hover:bg-[#F8FAFC] text-xs font-bold text-[#64748B] hover:text-[#243746] transition-colors self-start sm:self-auto cursor-pointer shadow-2xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-[#294B68]" : ""}`} />
          <span>{isFetching ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {/* Main Billing Card with contracted rate preservation */}
      <BillingCard billing={billing} onRefresh={refetch} />

      {/* Invoices & Statements Table */}
      <InvoiceTable invoices={billing.invoices || []} />

      {/* Trust Badges */}
      <TrustBadges />
    </div>
  );
}
