"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  useGetAdminBillingOverviewQuery,
  useGetAdminInvoicesQuery,
  useGetAdminSubscriptionsQuery,
  useGetAdminUpcomingRenewalsQuery,
  useAdminTriggerRemindersMutation,
  useAdminRetryChargeMutation,
} from "@/redux/features/payment/paymentApi";
import { AdminUpcomingRenewalItem } from "@/redux/features/payment/paymentTypes";

import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  Search,
  Filter,
  Loader2,
  Calendar,
  Layers,
  FileText,
  Clock,
  Bell,
  Mail,
  Send,
  Sparkles,
} from "lucide-react";
import {
  confirmCriticalAction,
  showSuccessAlert,
  showErrorAlert,
  showToast,
} from "@/lib/alerts/sweetalert";

export default function BillingAdminPage() {
  const [activeTab, setActiveTab] = useState<"invoices" | "subscriptions" | "renewals">("invoices");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [billingMethodFilter, setBillingMethodFilter] = useState("ALL");
  const [intervalFilter, setIntervalFilter] = useState("ALL");

  // Live queries
  const {
    data: overviewData,
    isLoading: isLoadingOverview,
    refetch: refetchOverview,
  } = useGetAdminBillingOverviewQuery();

  const {
    data: invoicesData,
    isLoading: isLoadingInvoices,
    refetch: refetchInvoices,
    isFetching: isFetchingInvoices,
  } = useGetAdminInvoicesQuery({
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    billingMethod: billingMethodFilter !== "ALL" ? billingMethodFilter : undefined,
    search: searchQuery.trim() || undefined,
  });

  const {
    data: subscriptionsData,
    isLoading: isLoadingSubscriptions,
    refetch: refetchSubscriptions,
  } = useGetAdminSubscriptionsQuery({
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    search: searchQuery.trim() || undefined,
  });

  const {
    data: renewalsData,
    isLoading: isLoadingRenewals,
    refetch: refetchRenewals,
    isFetching: isFetchingRenewals,
  } = useGetAdminUpcomingRenewalsQuery({
    interval: intervalFilter !== "ALL" ? intervalFilter : undefined,
    billingMethod: billingMethodFilter !== "ALL" ? billingMethodFilter : undefined,
  });

  const [adminRetryCharge, { isLoading: isRetryingCharge }] = useAdminRetryChargeMutation();
  const [adminTriggerReminders, { isLoading: isTriggeringReminders }] = useAdminTriggerRemindersMutation();

  const handleRetry = async (invoiceId: string, clientName: string) => {
    try {
      const res = await adminRetryCharge({ invoiceId }).unwrap();
      if (res.success) {
        showSuccessAlert("Charge Succeeded", `Successfully processed charge for ${clientName}.`);
        refetchOverview();
        refetchInvoices();
      } else {
        showErrorAlert("Charge Failed", res.message || "Failed to retry charge.");
      }
    } catch (err: any) {
      showErrorAlert("Charge Failed", err.data?.message || "Failed to retry charge.");
    }
  };

  const handleManualTriggerReminders = async () => {
    const confirmed = await confirmCriticalAction({
      title: "Evaluate Renewal Reminders?",
      text: "This will run an immediate scan for all active subscriptions approaching renewal (7-day monthly, 14-day quarterly, 30-day annual) and dispatch Nodemailer notices.",
      confirmButtonText: "Run Reminder Scan",
      isDestructive: false,
    });

    if (!confirmed) return;

    try {
      const res = await adminTriggerReminders().unwrap();
      if (res.success) {
        showSuccessAlert(
          "Renewal Check Completed",
          `Dispatched ${res.data?.remindersSent || 0} reminder emails. Skipped ${res.data?.duplicateSkipped || 0} duplicate notices.`
        );
        refetchRenewals();
      }
    } catch (err: any) {
      showErrorAlert("Trigger Failed", err.data?.message || "Error running reminder checks.");
    }
  };

  const overview = overviewData?.data;
  const invoices = invoicesData?.data?.invoices || [];
  const subscriptions = subscriptionsData?.data?.subscriptions || [];
  const renewals = renewalsData?.data?.renewals || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9E4EC]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
            Billing &amp; Revenue Overview
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Monitor membership revenue, auto-renewal charges, upcoming reminder cycles, and invoice collections.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleManualTriggerReminders}
            disabled={isTriggeringReminders}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EAF3F8] hover:bg-[#D9E4EC] text-xs font-bold text-[#294B68] transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            title="Scan upcoming renewals and send email notices"
          >
            <Send className={`w-3.5 h-3.5 ${isTriggeringReminders ? "animate-spin" : ""}`} />
            <span>{isTriggeringReminders ? "Scanning..." : "Run Reminder Scan"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              refetchOverview();
              refetchInvoices();
              refetchSubscriptions();
              refetchRenewals();
            }}
            disabled={isFetchingInvoices || isFetchingRenewals}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#D9E4EC] bg-white hover:bg-[#F8FAFC] text-xs font-bold text-[#64748B] hover:text-[#243746] transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetchingInvoices || isFetchingRenewals ? "animate-spin text-[#294B68]" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Revenue Summary KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Paid Revenue */}
        <div className="p-5 bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] space-y-1 shadow-2xs">
          <span className="text-xs text-[#64748B] font-bold uppercase tracking-wider">
            Paid Revenue
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#3F8F6B] block">
            {isLoadingOverview ? "..." : overview?.paidThisMonth || "$0.00"}
          </span>
          <span className="text-xs text-[#64748B]">
            {overview?.activeSubscriptions || 0} active subscriptions
          </span>
        </div>

        {/* Pending Invoices */}
        <div className="p-5 bg-amber-50/60 rounded-2xl sm:rounded-3xl border border-amber-200 space-y-1 shadow-2xs">
          <span className="text-xs text-[#C28A3A] font-bold uppercase tracking-wider">
            Pending Invoices
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#243746] block">
            {isLoadingOverview ? "..." : overview?.pendingCharges || "$0.00"}
          </span>
          <span className="text-xs text-[#64748B]">Awaiting payment verification</span>
        </div>

        {/* Failed Auto-Charges */}
        <div className="p-5 bg-red-50/60 rounded-2xl sm:rounded-3xl border border-red-200 space-y-1 shadow-2xs">
          <span className="text-xs text-red-700 font-bold uppercase tracking-wider">
            Failed Auto-Charges
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-red-700 block">
            {isLoadingOverview ? "..." : overview?.failedCharges || "$0.00"}
          </span>
          <span className="text-xs text-red-600 font-semibold">
            {overview?.failedPaymentsCount || 0} declined charges
          </span>
        </div>

        {/* Upcoming Renewals */}
        <div className="p-5 bg-[#EAF3F8]/60 rounded-2xl sm:rounded-3xl border border-[#5E8FB2]/30 space-y-1 shadow-2xs">
          <span className="text-xs text-[#294B68] font-bold uppercase tracking-wider">
            Renewals (Next 30 Days)
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#294B68] block">
            {isLoadingOverview ? "..." : overview?.upcomingRenewalsNext30Days || 0}
          </span>
          <span className="text-xs text-[#64748B]">Automated recurring billing</span>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-[#D9E4EC] shadow-2xs self-start overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("invoices")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "invoices"
                  ? "bg-[#294B68] text-white shadow-xs"
                  : "text-[#64748B] hover:text-[#243746]"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Invoices &amp; Payments</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("renewals")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "renewals"
                  ? "bg-[#294B68] text-white shadow-xs"
                  : "text-[#64748B] hover:text-[#243746]"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Upcoming Renewals ({renewals.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("subscriptions")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "subscriptions"
                  ? "bg-[#294B68] text-white shadow-xs"
                  : "text-[#64748B] hover:text-[#243746]"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>All Subscriptions</span>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search client, invoice #..."
                className="w-full h-10 pl-9 pr-3.5 text-xs font-medium text-[#243746] bg-white border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] shadow-2xs"
              />
            </div>

            {activeTab === "invoices" && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 text-xs font-bold text-[#243746] bg-white border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] shadow-2xs cursor-pointer"
              >
                <option value="ALL">All Invoice Statuses</option>
                <option value="PAID">Paid</option>
                <option value="OPEN">Open / Pending</option>
                <option value="OVERDUE">Overdue / Failed</option>
              </select>
            )}

            {activeTab === "subscriptions" && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 text-xs font-bold text-[#243746] bg-white border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] shadow-2xs cursor-pointer"
              >
                <option value="ALL">All Subscription Statuses</option>
                <option value="ACTIVE">Active Coverage</option>
                <option value="PENDING">Pending Setup</option>
                <option value="CANCELLATION_REQUESTED">Ending Period</option>
                <option value="PAYMENT_FAILED">Payment Failed</option>
              </select>
            )}


            {activeTab === "renewals" && (
              <select
                value={intervalFilter}
                onChange={(e) => setIntervalFilter(e.target.value)}
                className="h-10 px-3 text-xs font-bold text-[#243746] bg-white border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] shadow-2xs cursor-pointer"
              >
                <option value="ALL">All Intervals</option>
                <option value="MONTHLY">Monthly (7-Day Notice)</option>
                <option value="QUARTERLY">Quarterly (14-Day Notice)</option>
                <option value="ANNUAL">Annual (30-Day Notice)</option>
              </select>
            )}

            <select
              value={billingMethodFilter}
              onChange={(e) => setBillingMethodFilter(e.target.value)}
              className="h-10 px-3 text-xs font-bold text-[#243746] bg-white border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Payment Methods</option>
              <option value="AUTOMATIC">Stripe Card Payment</option>
            </select>
          </div>
        </div>

        {/* TAB 1: INVOICES & PAYMENTS */}
        {activeTab === "invoices" && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 shadow-xs overflow-hidden">
            {isLoadingInvoices ? (
              <div className="py-16 text-center space-y-2">
                <Loader2 className="w-7 h-7 animate-spin text-[#294B68] mx-auto" />
                <p className="text-xs font-bold text-[#64748B]">Loading invoices...</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="py-12 text-center text-xs font-bold text-[#64748B]">
                No matching invoices or transactions found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#D9E4EC] text-xs font-bold text-[#64748B] uppercase tracking-wider">
                      <th className="py-3.5 px-4">Invoice #</th>
                      <th className="py-3.5 px-4">Client</th>
                      <th className="py-3.5 px-4">Plan</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Billing Method</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9E4EC]/60 text-sm font-medium text-[#243746]">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-[#F7FAFC] transition-colors">
                        <td className="py-4 px-4 font-mono text-xs font-bold text-[#294B68]">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-4 px-4 font-bold">
                          <Link
                            href={`/admin/clients/${inv.clientId}`}
                            className="hover:underline text-[#243746]"
                          >
                            {inv.clientName}
                          </Link>
                          <span className="block text-[11px] text-[#64748B] font-mono">
                            {inv.clientNumber}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs font-semibold">
                          {inv.planName}
                        </td>
                        <td className="py-4 px-4 font-extrabold text-[#243746]">
                          {inv.amount}
                        </td>
                        <td className="py-4 px-4 text-xs text-[#64748B]">
                          {inv.paymentMethod}
                        </td>
                        <td className="py-4 px-4">
                          {inv.status === "paid" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAF3F8] text-[#3F8F6B]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                            </span>
                          ) : inv.status === "overdue" || inv.status === "failed" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700">
                              <AlertTriangle className="w-3.5 h-3.5" /> Failed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                              <Clock className="w-3.5 h-3.5" /> Open
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {inv.status === "failed" || inv.status === "overdue" ? (
                            <button
                              type="button"
                              onClick={() => handleRetry(inv.id, inv.clientName)}
                              disabled={isRetryingCharge}
                              className="px-3 py-1.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1 shadow-xs disabled:opacity-50"
                            >
                              <RefreshCw className="w-3 h-3" /> Retry Charge
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (inv.pdfUrl && inv.pdfUrl !== "#") window.open(inv.pdfUrl, "_blank");
                              }}
                              className="p-2 text-[#294B68] hover:bg-[#EAF3F8] rounded-xl transition-colors cursor-pointer"
                              title="Download PDF"
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
            )}
          </div>
        )}

        {/* TAB 2: UPCOMING RENEWALS & REMINDER STATUS */}
        {activeTab === "renewals" && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 shadow-xs overflow-hidden space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D9E4EC]">
              <div>
                <h3 className="text-base font-extrabold text-[#243746]">Upcoming Subscription Renewals</h3>
                <p className="text-xs text-[#64748B]">Automated reminder notices sent 7 days (Monthly), 14 days (Quarterly), and 30 days (Annual) before charge date.</p>
              </div>
            </div>

            {isLoadingRenewals ? (
              <div className="py-16 text-center space-y-2">
                <Loader2 className="w-7 h-7 animate-spin text-[#294B68] mx-auto" />
                <p className="text-xs font-bold text-[#64748B]">Loading upcoming renewals...</p>
              </div>
            ) : renewals.length === 0 ? (
              <div className="py-12 text-center text-xs font-bold text-[#64748B]">
                No upcoming renewals scheduled in the current window.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#D9E4EC] text-xs font-bold text-[#64748B] uppercase tracking-wider">
                      <th className="py-3.5 px-4">Client Member</th>
                      <th className="py-3.5 px-4">Plan &amp; Rate</th>
                      <th className="py-3.5 px-4">Interval</th>
                      <th className="py-3.5 px-4">Renewal Date</th>
                      <th className="py-3.5 px-4">Countdown</th>
                      <th className="py-3.5 px-4">Payment Channel</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9E4EC]/60 text-sm font-medium text-[#243746]">
                    {renewals.map((r: AdminUpcomingRenewalItem) => (
                      <tr key={r.subscriptionId} className="hover:bg-[#F7FAFC] transition-colors">

                        <td className="py-4 px-4 font-bold">
                          <Link href={`/admin/clients/${r.clientId}`} className="hover:underline text-[#243746]">
                            {r.clientName}
                          </Link>
                          <div className="text-[11px] text-[#64748B] font-mono">{r.clientNumber} • {r.clientEmail}</div>
                          {r.representativeEmail && (
                            <div className="text-[10px] text-[#294B68] font-medium flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-[#5E8FB2]" /> Rep: {r.representativeEmail}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-extrabold text-[#243746]">{r.planName}</div>
                          <div className="text-xs font-black text-emerald-700">${r.contractedPrice.toFixed(2)}</div>
                        </td>
                        <td className="py-4 px-4 text-xs font-bold text-[#64748B] capitalize">
                          {r.billingInterval.toLowerCase()}
                        </td>
                        <td className="py-4 px-4 font-bold text-xs text-[#243746]">
                          {new Date(r.scheduledRenewalDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              r.daysRemaining <= 3
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : r.daysRemaining <= 7
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-[#EAF3F8] text-[#294B68] border border-[#5E8FB2]/30"
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            {r.daysRemaining === 0 ? "Today" : `In ${r.daysRemaining} days`}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-[#243746]">
                            <CreditCard className="w-3.5 h-3.5 text-[#294B68]" />
                            <span>{r.cardLast4 ? `${r.cardBrand || "Card"} •••• ${r.cardLast4}` : "Stripe Card"}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Link
                            href={`/admin/clients/${r.clientId}`}
                            className="px-3 py-1.5 bg-[#EAF3F8] hover:bg-[#D9E4EC] text-[#294B68] font-bold text-xs rounded-xl transition-colors inline-block"
                          >
                            View Client →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ALL SUBSCRIPTIONS */}
        {activeTab === "subscriptions" && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 shadow-xs overflow-hidden">
            {isLoadingSubscriptions ? (
              <div className="py-16 text-center space-y-2">
                <Loader2 className="w-7 h-7 animate-spin text-[#294B68] mx-auto" />
                <p className="text-xs font-bold text-[#64748B]">Loading subscriptions...</p>
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="py-12 text-center text-xs font-bold text-[#64748B]">
                No subscriptions matching filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#D9E4EC] text-xs font-bold text-[#64748B] uppercase tracking-wider">
                      <th className="py-3.5 px-4">Client</th>
                      <th className="py-3.5 px-4">Plan &amp; Contracted Price</th>
                      <th className="py-3.5 px-4">Current Cycle</th>
                      <th className="py-3.5 px-4">Next Renewal</th>
                      <th className="py-3.5 px-4">Auto-Renew</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9E4EC]/60 text-sm font-medium text-[#243746]">
                    {subscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-[#F7FAFC] transition-colors">
                        <td className="py-4 px-4 font-bold">
                          <Link
                            href={`/admin/clients/${sub.clientId}`}
                            className="hover:underline text-[#243746]"
                          >
                            {sub.clientName}
                          </Link>
                          <span className="block text-[11px] text-[#64748B] font-mono">
                            {sub.clientNumber}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-extrabold text-[#243746]">
                          {sub.planName}
                          <span className="block text-xs font-bold text-emerald-700">
                            {sub.planPrice}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs text-[#64748B]">
                          {sub.currentPeriod}
                        </td>
                        <td className="py-4 px-4 font-bold text-xs text-[#243746]">
                          {sub.nextRenewalDate}
                        </td>
                        <td className="py-4 px-4 text-xs font-semibold">
                          {sub.autoRenew ? (
                            <span className="text-emerald-700 font-bold">● Enabled</span>
                          ) : (
                            <span className="text-amber-700 font-bold">● Cancelled at Period End</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                              sub.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : sub.status === "CANCELLATION_REQUESTED"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Link
                            href={`/admin/clients/${sub.clientId}`}
                            className="p-2 text-[#294B68] hover:bg-[#EAF3F8] rounded-xl transition-colors font-bold text-xs"
                          >
                            View Client →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
