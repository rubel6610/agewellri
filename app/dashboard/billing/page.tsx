"use client";

import React, { useEffect, useState } from "react";
import { getBillingDetails } from "@/lib/api/dashboard";
import { BillingInfo } from "@/lib/types/dashboard";
import { BillingCard } from "@/components/dashboard/billing-card";
import { InvoiceTable } from "@/components/dashboard/invoice-table";
import { useGetBillingOverviewQuery } from "@/redux/features/payment/paymentApi";
import { Loader2 } from "lucide-react";

export default function BillingPage() {
  const { data: liveData, isLoading: isLoadingLive, error } = useGetBillingOverviewQuery();
  const [fallbackBilling, setFallbackBilling] = useState<BillingInfo | null>(null);

  useEffect(() => {
    if (error) {
      getBillingDetails().then(setFallbackBilling);
    }
  }, [error]);

  const billing: BillingInfo | null =
    (liveData?.data as unknown as BillingInfo) || fallbackBilling;

  if (isLoadingLive && !billing) {
    return (
      <div className="p-16 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#294B68] mx-auto" />
        <p className="text-sm font-bold text-[#243746]">Loading billing details...</p>
      </div>
    );
  }

  if (!billing) {
    return (
      <div className="p-12 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC]">
        No active billing information found.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-[#D9E4EC]/60">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
          Billing &amp; Subscription
        </h1>
        <p className="text-sm sm:text-base text-[#64748B] mt-1">
          Manage your quarterly membership billing, payment methods, and payment history.
        </p>
      </div>

      <BillingCard billing={billing} />
      <InvoiceTable invoices={billing.invoices || []} />
    </div>
  );
}
