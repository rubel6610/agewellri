"use client";

import React from "react";
import { useGetBillingOverviewQuery } from "@/redux/features/payment/paymentApi";
import { BillingCard } from "@/components/dashboard/billing-card";
import { InvoiceTable } from "@/components/dashboard/invoice-table";
import { TrustBadges } from "@/components/support/trust-badges";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function BillingPage() {
  const { data: liveData, isLoading, error, refetch, isFetching } = useGetBillingOverviewQuery();

  const billing = liveData?.data;

  return (
    <div className="space-y-8 pb-12 text-[#243746]">
      {/* Header - ALWAYS VISIBLE IMMEDIATELY */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9E4EC]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
            Billing &amp; Subscription
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Manage your membership safety plan, payment methods, and billing statements.
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

      {isLoading && !billing ? (
        <div className="space-y-8 animate-pulse">
          {/* Main Billing Card Skeleton */}
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-[#D9E4EC] space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D9E4EC]/60">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 bg-[#E2E8F0] rounded-md w-44"></div>
                  <div className="h-5 bg-[#E2E8F0] rounded-full w-20"></div>
                </div>
                <div className="h-3 bg-[#F1F5F9] rounded-md w-64"></div>
              </div>
              <div className="h-10 bg-[#E2E8F0] rounded-2xl w-32"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC]/60 space-y-2">
                  <div className="h-3 bg-[#F1F5F9] rounded-md w-24"></div>
                  <div className="h-5 bg-[#E2E8F0] rounded-md w-32"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoices Table Skeleton */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 shadow-xs space-y-4">
            <div className="space-y-1.5 pb-2 border-b border-[#D9E4EC]/60">
              <div className="h-5 bg-[#E2E8F0] rounded-md w-48"></div>
              <div className="h-3 bg-[#F1F5F9] rounded-md w-64"></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D9E4EC] text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    <th className="py-3.5 px-4">Invoice #</th>
                    <th className="py-3.5 px-4">Billing Date</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Payment Method</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Statement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E4EC]/60">
                  {[...Array(4)].map((_, i) => (
                    <tr key={i}>
                      <td className="py-4 px-4">
                        <div className="h-4 bg-[#E2E8F0] rounded-md w-24"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 bg-[#E2E8F0] rounded-md w-28"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 bg-[#E2E8F0] rounded-md w-16"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 bg-[#E2E8F0] rounded-md w-24"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-5 bg-[#E2E8F0] rounded-full w-16"></div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="h-8 bg-[#E2E8F0] rounded-xl w-20 ml-auto"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : error || !billing ? (
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
      ) : (
        <>
          {/* Main Billing Card with contracted rate preservation */}
          <BillingCard billing={billing} onRefresh={refetch} />

          {/* Invoices & Statements Table */}
          <InvoiceTable invoices={billing.invoices || []} />

          {/* Trust Badges */}
          <TrustBadges />
        </>
      )}
    </div>
  );
}
