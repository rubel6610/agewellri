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
  DollarSign,
  ArrowUpRight,
  Users,
} from "lucide-react";
import {
  confirmCriticalAction,
  showSuccessAlert,
  showErrorAlert,
} from "@/lib/alerts/sweetalert";
import { TablePagination } from "@/components/ui/table-pagination";
import { generateInvoicePdf } from "@/lib/pdf/invoice-pdf-generator";

export default function BillingAdminPage() {
  const [activeTab, setActiveTab] = useState<"invoices" | "subscriptions" | "renewals">("invoices");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [billingMethodFilter, setBillingMethodFilter] = useState("ALL");
  const [intervalFilter, setIntervalFilter] = useState("ALL");

  // PDF downloading indicator state
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);

  // Pagination states for all 3 tabs
  const [invoicePage, setInvoicePage] = useState(1);
  const [invoicePageSize, setInvoicePageSize] = useState(10);

  const [renewalsPage, setRenewalsPage] = useState(1);
  const [renewalsPageSize, setRenewalsPageSize] = useState(10);

  const [subscriptionsPage, setSubscriptionsPage] = useState(1);
  const [subscriptionsPageSize, setSubscriptionsPageSize] = useState(10);

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
      showErrorAlert("Reminder Failed", err.data?.message || "Failed to dispatch reminders.");
    }
  };

  const handleDownloadInvoicePdf = (inv: any) => {
    setDownloadingInvoiceId(inv.id);
    try {
      generateInvoicePdf({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        clientName: inv.clientName,
        clientNumber: inv.clientNumber,
        clientId: inv.clientId,
        planName: inv.planName,
        amount: inv.amount,
        billingFrequency: inv.billingFrequency,
        paymentMethod: inv.paymentMethod,
        status: inv.status,
        dueDate: inv.dueDate,
        paidAt: inv.paidAt,
        pdfUrl: inv.pdfUrl,
      });
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  const overview = overviewData?.data || {
    activeSubscriptions: 0,
    paidThisMonth: "$0.00",
    pendingCharges: "$0.00",
    failedCharges: "$0.00",
    failedPaymentsCount: 0,
    upcomingRenewalsNext30Days: 0,
    recentTransactions: [],
  };

  const invoices = invoicesData?.data?.invoices || [];
  const subscriptions = subscriptionsData?.data?.subscriptions || [];
  const renewals = renewalsData?.data?.renewals || [];

  // Invoices pagination
  const totalInvoices = invoices.length;
  const startInvoiceIdx = (invoicePage - 1) * invoicePageSize;
  const endInvoiceIdx = Math.min(startInvoiceIdx + invoicePageSize, totalInvoices);
  const paginatedInvoices = invoices.slice(startInvoiceIdx, endInvoiceIdx);

  // Renewals pagination
  const totalRenewals = renewals.length;
  const startRenewalsIdx = (renewalsPage - 1) * renewalsPageSize;
  const endRenewalsIdx = Math.min(startRenewalsIdx + renewalsPageSize, totalRenewals);
  const paginatedRenewals = renewals.slice(startRenewalsIdx, endRenewalsIdx);

  // Subscriptions pagination
  const totalSubscriptions = subscriptions.length;
  const startSubscriptionsIdx = (subscriptionsPage - 1) * subscriptionsPageSize;
  const endSubscriptionsIdx = Math.min(startSubscriptionsIdx + subscriptionsPageSize, totalSubscriptions);
  const paginatedSubscriptions = subscriptions.slice(startSubscriptionsIdx, endSubscriptionsIdx);

  return (
    <div className="space-y-8 text-[#243746]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9E4EC]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746] tracking-tight">
            Financial &amp; Subscription Operations
          </h1>
          <p className="text-sm text-[#64748B] mt-1 font-medium">
            Live revenue tracking, Stripe billing management, and scheduled renewal monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualTriggerReminders}
            disabled={isTriggeringReminders}
            className="px-4 py-2.5 bg-[#EAF3F8] hover:bg-[#D9E4EC] text-[#294B68] font-bold text-xs rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Scan upcoming renewals and send email notices"
          >
            {isTriggeringReminders ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Bell className="w-4 h-4 text-[#5E8FB2]" />
            )}
            <span>Scan &amp; Send Renewal Notices</span>
          </button>

          <button
            onClick={() => {
              refetchOverview();
              refetchInvoices();
              refetchSubscriptions();
              refetchRenewals();
            }}
            className="p-2.5 text-[#294B68] hover:bg-[#EAF3F8] rounded-xl border border-[#D9E4EC] cursor-pointer transition-colors"
            title="Refresh Financial Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingOverview || isFetchingInvoices || isFetchingRenewals ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Paid Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-[#D9E4EC] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-bold uppercase tracking-wider">Paid Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-[#EBF8F2] text-[#166534] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#3F8F6B]">
            {isLoadingOverview ? "..." : overview.paidThisMonth}
          </div>
          <span className="text-xs text-[#64748B] font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-[#3F8F6B]" /> Settled this month
          </span>
        </div>

        {/* Pending Charges */}
        <div className="bg-white rounded-2xl p-5 border border-[#D9E4EC] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Charges</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#243746]">
            {isLoadingOverview ? "..." : overview.pendingCharges}
          </div>
          <span className="text-xs text-[#64748B] font-semibold">Awaiting settlement</span>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white rounded-2xl p-5 border border-[#D9E4EC] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-bold uppercase tracking-wider">Active Subscriptions</span>
            <div className="w-8 h-8 rounded-lg bg-[#EAF3F8] text-[#294B68] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#243746]">
            {isLoadingOverview ? "..." : overview.activeSubscriptions}
          </div>
          <span className="text-xs text-[#3F8F6B] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled in care plans
          </span>
        </div>

        {/* Failed Charges */}
        <div className="bg-white rounded-2xl p-5 border border-[#D9E4EC] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-bold uppercase tracking-wider">Failed Auto-Charges</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-red-700">
            {isLoadingOverview ? "..." : overview.failedCharges}
          </div>
          <span className="text-xs text-red-600 font-semibold">
            {overview.failedPaymentsCount} declined charges
          </span>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9E4EC]">
          <div className="flex items-center gap-2 overflow-x-auto pb-px">
            <button
              onClick={() => {
                setActiveTab("invoices");
                setInvoicePage(1);
              }}
              className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === "invoices"
                  ? "border-[#294B68] text-[#294B68]"
                  : "border-transparent text-[#64748B] hover:text-[#243746]"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Invoices &amp; Charges</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#EAF3F8] text-[#294B68]">
                {invoices.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("renewals");
                setRenewalsPage(1);
              }}
              className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === "renewals"
                  ? "border-[#294B68] text-[#294B68]"
                  : "border-transparent text-[#64748B] hover:text-[#243746]"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Upcoming Renewals</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-800">
                {renewals.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("subscriptions");
                setSubscriptionsPage(1);
              }}
              className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === "subscriptions"
                  ? "border-[#294B68] text-[#294B68]"
                  : "border-transparent text-[#64748B] hover:text-[#243746]"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>All Client Subscriptions</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#EAF3F8] text-[#294B68]">
                {subscriptions.length}
              </span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pb-2 sm:pb-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search member, ID, invoice..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setInvoicePage(1);
                  setSubscriptionsPage(1);
                }}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#294B68] w-48 sm:w-60"
              />
            </div>

            {activeTab === "invoices" && (
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setInvoicePage(1);
                }}
                className="px-2.5 py-1.5 text-xs font-semibold bg-white border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#294B68]"
              >
                <option value="ALL">All Invoices</option>
                <option value="PAID">Paid</option>
                <option value="FAILED">Failed</option>
                <option value="OPEN">Open</option>
              </select>
            )}

            {activeTab === "renewals" && (
              <select
                value={intervalFilter}
                onChange={(e) => {
                  setIntervalFilter(e.target.value);
                  setRenewalsPage(1);
                }}
                className="px-2.5 py-1.5 text-xs font-semibold bg-white border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#294B68]"
              >
                <option value="ALL">All Intervals</option>
                <option value="MONTHLY">Monthly (7-day alert)</option>
                <option value="QUARTERLY">Quarterly (14-day alert)</option>
                <option value="ANNUAL">Annual (30-day alert)</option>
              </select>
            )}
          </div>
        </div>

        {/* TAB 1: INVOICES & PAYMENTS */}
        {activeTab === "invoices" && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 shadow-xs overflow-hidden space-y-4">
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
              <>
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
                      {paginatedInvoices.map((inv) => (
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
                            <div className="flex items-center justify-end gap-2">
                              {inv.status === "failed" || inv.status === "overdue" ? (
                                <button
                                  type="button"
                                  onClick={() => handleRetry(inv.id, inv.clientName)}
                                  disabled={isRetryingCharge}
                                  className="px-2.5 py-1.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1 shadow-xs disabled:opacity-50"
                                  title="Retry Stripe Charge"
                                >
                                  <RefreshCw className="w-3 h-3" /> Retry
                                </button>
                              ) : null}

                              <button
                                type="button"
                                onClick={() => handleDownloadInvoicePdf(inv)}
                                disabled={downloadingInvoiceId === inv.id}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#D9E4EC] bg-white hover:bg-[#EAF3F8] text-[#294B68] font-bold text-xs transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                                title="Download Official Invoice PDF"
                              >
                                {downloadingInvoiceId === inv.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Download className="w-3.5 h-3.5" />
                                )}
                                <span className="hidden sm:inline">PDF</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <TablePagination
                  currentPage={invoicePage}
                  totalItems={totalInvoices}
                  pageSize={invoicePageSize}
                  onPageChange={setInvoicePage}
                  onPageSizeChange={setInvoicePageSize}
                  itemLabel="invoices"
                />
              </>
            )}
          </div>
        )}

        {/* TAB 2: UPCOMING RENEWALS */}
        {activeTab === "renewals" && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 shadow-xs overflow-hidden space-y-4">
            {isLoadingRenewals ? (
              <div className="py-16 text-center space-y-2">
                <Loader2 className="w-7 h-7 animate-spin text-[#294B68] mx-auto" />
                <p className="text-xs font-bold text-[#64748B]">Loading renewals...</p>
              </div>
            ) : renewals.length === 0 ? (
              <div className="py-12 text-center text-xs font-bold text-[#64748B]">
                No upcoming renewals scheduled.
              </div>
            ) : (
              <>
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
                      {paginatedRenewals.map((r: AdminUpcomingRenewalItem) => (
                        <tr key={r.subscriptionId} className="hover:bg-[#F7FAFC] transition-colors">
                          <td className="py-4 px-4 font-bold">
                            <Link href={`/admin/clients/${r.clientId}`} className="hover:underline text-[#243746]">
                              {r.clientName}
                            </Link>
                            <div className="text-[11px] text-[#64748B] font-mono">{r.clientNumber} • {r.clientEmail}</div>
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
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EAF3F8] text-[#294B68] border border-[#5E8FB2]/30">
                              <Clock className="w-3 h-3" />
                              {r.daysRemaining} days
                            </span>
                          </td>
                          <td className="py-4 px-4 text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-[#243746]">
                              <CreditCard className="w-3.5 h-3.5 text-[#294B68]" />
                              <span>Stripe Card</span>
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

                <TablePagination
                  currentPage={renewalsPage}
                  totalItems={totalRenewals}
                  pageSize={renewalsPageSize}
                  onPageChange={setRenewalsPage}
                  onPageSizeChange={setRenewalsPageSize}
                  itemLabel="renewals"
                />
              </>
            )}
          </div>
        )}

        {/* TAB 3: ALL SUBSCRIPTIONS */}
        {activeTab === "subscriptions" && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 shadow-xs overflow-hidden space-y-4">
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
              <>
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
                      {paginatedSubscriptions.map((sub: any) => (
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
                              className="p-2 text-[#294B68] hover:bg-[#EAF3F8] rounded-xl transition-colors font-bold text-xs inline-block"
                            >
                              View Client →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <TablePagination
                  currentPage={subscriptionsPage}
                  totalItems={totalSubscriptions}
                  pageSize={subscriptionsPageSize}
                  onPageChange={setSubscriptionsPage}
                  onPageSizeChange={setSubscriptionsPageSize}
                  itemLabel="subscriptions"
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
