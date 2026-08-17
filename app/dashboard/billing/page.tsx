"use client";

import React, { useEffect, useState } from "react";
import { getBillingDetails } from "@/lib/api/dashboard";
import { BillingInfo } from "@/lib/types/dashboard";
import { BillingCard } from "@/components/dashboard/billing-card";
import { InvoiceTable } from "@/components/dashboard/invoice-table";

export default function BillingPage() {
  const [billing, setBilling] = useState<BillingInfo | null>(null);

  useEffect(() => {
    getBillingDetails().then(setBilling);
  }, []);

  if (!billing) {
    return (
      <div className="p-12 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC]">
        Loading billing details...
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
      <InvoiceTable invoices={billing.invoices} />
    </div>
  );
}
