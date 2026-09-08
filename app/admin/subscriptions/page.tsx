"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  RefreshCw,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Ban,
  Search,
  Users,
  RotateCcw,
  Clock,
  ArrowUpRight,
  Filter,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Layers,
} from "lucide-react";
import {
  useGetAdminSubscriptionsQuery,
  useAdminReactivateSubscriptionMutation,
  useAdminTriggerRemindersMutation,
} from "@/redux/features/payment/paymentApi";
import { AdminSubscriptionItem } from "@/redux/features/payment/paymentTypes";
import { AdminScheduleModal } from "@/components/admin/admin-schedule-modal";
import { AdminCancelSubscriptionModal } from "@/components/admin/admin-cancel-subscription-modal";
import { TablePagination } from "@/components/ui/table-pagination";
import {
  confirmCriticalAction,
  showSuccessAlert,
  showErrorAlert,
  showToast,
} from "@/lib/alerts/sweetalert";

export default function SubscriptionsAdminPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedSubForCancel, setSelectedSubForCancel] = useState<AdminSubscriptionItem | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);
  const [selectedClientName, setSelectedClientName] = useState<string | undefined>(undefined);

  const {
    data: subResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetAdminSubscriptionsQuery({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    search: searchTerm.trim() || undefined,
    page: currentPage,
    limit: pageSize,
  });

  const [reactivateSubscription, { isLoading: isReactivating }] =
    useAdminReactivateSubscriptionMutation();
  const [triggerReminders, { isLoading: isTriggeringReminders }] =
    useAdminTriggerRemindersMutation();

  const subscriptions = subResponse?.data?.subscriptions || [];
  const pagination = subResponse?.data?.pagination || {
    total: subscriptions.length,
    page: 1,
    limit: pageSize,
    totalPages: Math.max(1, Math.ceil(subscriptions.length / pageSize)),
  };

  const handleOpenScheduleModal = (clientId: string, clientName?: string) => {
    setSelectedClientId(clientId);
    setSelectedClientName(clientName);
    setScheduleModalOpen(true);
  };

  const handleOpenCancelModal = (sub: AdminSubscriptionItem) => {
    setSelectedSubForCancel(sub);
    setCancelModalOpen(true);
  };

  const handleReactivate = async (sub: AdminSubscriptionItem) => {
    const confirmed = await confirmCriticalAction({
      title: `Reactivate Subscription for ${sub.clientName}?`,
      text: `This will resume automatic quarterly renewal and restore active membership coverage for "${sub.planName}".`,
      confirmButtonText: "Yes, Reactivate Subscription",
      isDestructive: false,
    });

    if (!confirmed) return;

    try {
      const res = await reactivateSubscription(sub.id).unwrap();
      refetch();
      showSuccessAlert(
        "Subscription Reactivated",
        res.message || `Subscription for ${sub.clientName} is now active with auto-renewal.`
      );
    } catch (err: any) {
      showErrorAlert(
        "Reactivation Failed",
        err?.data?.message || err?.message || "Failed to reactivate subscription."
      );
    }
  };

  const handleTriggerRenewalReminders = async () => {
    try {
      const res = await triggerReminders().unwrap();
      showToast(res.message || "Upcoming renewal reminder check completed.", "success");
      refetch();
    } catch (err: any) {
      showErrorAlert("Check Failed", err?.data?.message || "Failed to execute renewal check.");
    }
  };

  // Status Filter options
  const filterTabs = [
    { label: "All Subscriptions", value: "ALL" },
    { label: "Active", value: "ACTIVE" },
    { label: "Ending Soon", value: "CANCELLATION_REQUESTED" },
    { label: "Cancelled", value: "CANCELLED" },
    { label: "Payment Failed", value: "PAYMENT_FAILED" },
    { label: "Pending", value: "PENDING" },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D9E4EC] pb-5">
        <div>
          <h1 className="text-2xl font-black text-[#243746] tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-[#294B68]" />
            Client Subscriptions &amp; Renewal Lifecycle
          </h1>
          <p className="text-sm text-[#5E8FB2] mt-1 font-medium">
            Manage client subscriptions, oversee quarterly renewal billing, process cancellations, and schedule next-quarter visits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 bg-white border border-[#D9E4EC] text-[#243746] hover:bg-[#F0F5F9] rounded-xl text-sm font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            title="Refresh subscriptions"
          >
            <RefreshCw className={`w-4 h-4 text-[#5E8FB2] ${isFetching ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleTriggerRenewalReminders}
            disabled={isTriggeringReminders}
            className="px-4 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Clock className="w-4 h-4" />
            <span>Check Renewals Now</span>
          </button>
        </div>
      </div>

      {/* Staff Notice Banner */}
      <div className="p-4 bg-[#EAF3F8] border border-[#5E8FB2]/30 rounded-2xl flex items-center justify-between gap-4 text-xs sm:text-sm text-[#243746]">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[#294B68] shrink-0" />
          <span>
            <strong>Quarterly Billing Separation:</strong> Subscription billing renews automatically every 90 days. Safety visit scheduling for incoming quarters must be coordinated separately per client.
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#D9E4EC] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#5E8FB2]" />
          <input
            type="text"
            placeholder="Search by client, ID, plan..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === tab.value
                  ? "bg-[#294B68] text-white"
                  : "bg-[#F0F5F9] text-[#243746] hover:bg-[#EAF3F8]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-2xl border border-[#D9E4EC] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F0F5F9] border-b border-[#D9E4EC] text-xs font-black text-[#294B68] uppercase tracking-wider">
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Plan &amp; Rate</th>
                <th className="py-3.5 px-4">Current Cycle</th>
                <th className="py-3.5 px-4">Next Renewal</th>
                <th className="py-3.5 px-4">Auto-Renew Policy</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Subscription Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E4EC] text-sm">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4 space-y-1.5">
                      <div className="h-4 bg-[#E2E8F0] rounded-md w-32"></div>
                      <div className="h-3 bg-[#F1F5F9] rounded-md w-20"></div>
                    </td>
                    <td className="py-4 px-4 space-y-1.5">
                      <div className="h-4 bg-[#E2E8F0] rounded-md w-24"></div>
                      <div className="h-3 bg-[#F1F5F9] rounded-md w-16"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-[#E2E8F0] rounded-md w-28"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-[#E2E8F0] rounded-md w-24"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 bg-[#E2E8F0] rounded-full w-20"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 bg-[#E2E8F0] rounded-full w-16"></div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-8 bg-[#E2E8F0] rounded-xl w-28 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#5E8FB2]">
                    <div className="flex flex-col items-center gap-2">
                      <CreditCard className="w-10 h-10 text-[#D9E4EC]" />
                      <div className="text-base font-bold text-[#243746]">No subscriptions found</div>
                      <p className="text-xs">Adjust your search terms or status filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => {
                  const isCancelled = sub.status === "CANCELLED";
                  const isPendingCancel = sub.cancelAtPeriodEnd || sub.status === "CANCELLATION_REQUESTED";
                  const isActive = sub.status === "ACTIVE" && !isPendingCancel;
                  const isPaymentFailed = sub.status === "PAYMENT_FAILED";

                  return (
                    <tr key={sub.id} className="hover:bg-[#F0F5F9]/40 transition-colors">
                      {/* Client */}
                      <td className="py-4 px-4">
                        <Link
                          href={`/admin/clients/${sub.clientId}`}
                          className="font-extrabold text-[#243746] hover:text-[#294B68] hover:underline flex items-center gap-1.5"
                        >
                          <span>{sub.clientName}</span>
                          <ExternalLink className="w-3 h-3 text-[#5E8FB2] opacity-70" />
                        </Link>
                        <div className="text-xs font-mono font-bold text-[#5E8FB2]">{sub.clientNumber}</div>
                      </td>

                      {/* Plan & Rate */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-[#243746]">{sub.planName}</div>
                        <div className="text-xs font-semibold text-[#5E8FB2]">
                          {sub.planPrice} • {sub.billingMethod === "AUTOMATIC" ? "Card Auto" : "Invoice"}
                        </div>
                      </td>

                      {/* Current Cycle */}
                      <td className="py-4 px-4 text-xs font-semibold text-[#64748B]">
                        {sub.currentPeriod}
                      </td>

                      {/* Next Renewal */}
                      <td className="py-4 px-4">
                        {isCancelled ? (
                          <span className="text-xs font-medium text-slate-400">Terminated</span>
                        ) : (
                          <div className="text-xs font-bold text-[#243746]">
                            {sub.nextRenewalDate}
                          </div>
                        )}
                      </td>

                      {/* Auto-Renew Policy */}
                      <td className="py-4 px-4">
                        {isCancelled ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Cancelled
                          </span>
                        ) : isPendingCancel ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Cancels at Period End
                          </span>
                        ) : sub.autoRenew ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Auto-Renew ON
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                            Auto-Renew OFF
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ACTIVE
                          </span>
                        ) : isPendingCancel ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-black bg-amber-50 text-amber-700 border border-amber-200">
                            PENDING CANCEL
                          </span>
                        ) : isCancelled ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">
                            CANCELLED
                          </span>
                        ) : isPaymentFailed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-black bg-red-50 text-red-700 border border-red-200">
                            PAYMENT FAILED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-black bg-slate-100 text-slate-700">
                            {sub.status}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Schedule Visits */}
                          <button
                            onClick={() => handleOpenScheduleModal(sub.clientId, sub.clientName)}
                            className="px-3 py-1.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                            title="Schedule visits for active period"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Schedule</span>
                          </button>

                          {/* Cancellation Actions */}
                          {isCancelled || isPendingCancel ? (
                            <button
                              onClick={() => handleReactivate(sub)}
                              disabled={isReactivating}
                              className="px-3 py-1.5 bg-white border border-[#D9E4EC] hover:bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                              title="Reactivate auto-renewal"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Reactivate</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenCancelModal(sub)}
                              className="px-3 py-1.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 font-bold text-xs rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                              title="Cancel subscription (immediate or end of period)"
                            >
                              <Ban className="w-3.5 h-3.5 text-rose-600" />
                              <span>Cancel</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && pagination.total > 0 && (
          <TablePagination
            currentPage={pagination.page}
            totalItems={pagination.total}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="subscriptions"
          />
        )}
      </div>

      {/* Schedule Next Quarter Visits Modal */}
      <AdminScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        defaultClientId={selectedClientId}
        clientName={selectedClientName}
      />

      {/* Cancel Subscription Policy Modal */}
      <AdminCancelSubscriptionModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setSelectedSubForCancel(null);
        }}
        subscription={selectedSubForCancel}
        onSuccess={refetch}
      />
    </div>
  );
}
