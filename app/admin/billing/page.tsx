"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminBilling } from "@/lib/api/admin-api";
import { AdminInvoice } from "@/lib/types/admin";
import { CreditCard, CheckCircle2, AlertTriangle, RefreshCw, Download } from "lucide-react";

export default function BillingAdminPage() {
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminBilling().then((data) => {
      setInvoices(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC]">
        Loading billing &amp; invoices...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#D9E4EC]/60">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
          Billing &amp; Revenue Overview
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          Monitor quarterly subscription payments, failed auto-charges, and invoice receipts.
        </p>
      </div>

      {/* Revenue Summary KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-[#D9E4EC] space-y-1">
          <span className="text-xs text-[#64748B] font-bold uppercase">Paid This Month</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#3F8F6B] block">$63,360.00</span>
          <span className="text-xs text-[#64748B]">128 active quarterly subscriptions</span>
        </div>

        <div className="p-5 bg-amber-50/50 rounded-2xl border border-[#C28A3A]/40 space-y-1">
          <span className="text-xs text-[#C28A3A] font-bold uppercase">Pending Charge Processing</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#243746] block">$3,465.00</span>
          <span className="text-xs text-[#64748B]">7 new client onboarding accounts</span>
        </div>

        <div className="p-5 bg-red-50/50 rounded-2xl border border-[#C95C5C]/40 space-y-1">
          <span className="text-xs text-[#C95C5C] font-bold uppercase">Failed Auto-Charges</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#C95C5C] block">$1,980.00</span>
          <span className="text-xs text-[#C95C5C] font-semibold">4 declined credit cards</span>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#D9E4EC] text-xs font-bold text-[#64748B] uppercase tracking-wider">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Plan / Description</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E4EC]/60 text-sm font-medium text-[#243746]">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#F7FAFC]">
                  <td className="py-4 px-4 font-mono text-xs font-bold text-[#294B68]">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-4 px-4 font-bold">
                    <Link href={`/admin/clients/${inv.clientId}`} className="hover:underline">
                      {inv.clientName}
                    </Link>
                  </td>
                  <td className="py-4 px-4 text-xs">{inv.planName} ({inv.billingFrequency})</td>
                  <td className="py-4 px-4 font-extrabold text-[#243746]">{inv.amount}</td>
                  <td className="py-4 px-4 text-xs text-[#64748B]">{inv.paymentMethod}</td>
                  <td className="py-4 px-4">
                    {inv.status === "paid" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAF3F8] text-[#3F8F6B]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-[#C95C5C]">
                        <AlertTriangle className="w-3.5 h-3.5" /> Failed
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    {inv.status === "failed" ? (
                      <button
                        onClick={() => alert(`Retrying charge for ${inv.clientName}`)}
                        className="px-3 py-1.5 bg-[#C95C5C] hover:bg-[#A84848] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Retry Charge
                      </button>
                    ) : (
                      <button
                        onClick={() => alert(`Downloading PDF for ${inv.invoiceNumber}`)}
                        className="p-2 text-[#294B68] hover:bg-[#EAF3F8] rounded-lg transition-colors cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
