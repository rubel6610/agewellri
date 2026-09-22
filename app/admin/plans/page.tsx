"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit,
  Users,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  Eye,
  Sparkles,
} from "lucide-react";
import {
  useGetAdminPlansQuery,
  useChangePlanStatusMutation,
  useDeletePlanMutation,
} from "@/redux/features/plan/planApi";
import { AdminPlan, formatPlanDuration } from "@/redux/features/plan/planTypes";
import { PlanVersionsModal } from "@/components/admin/plan-versions-modal";
import { TablePagination } from "@/components/ui/table-pagination";
import {
  confirmDelete,
  confirmCriticalAction,
  showSuccessAlert,
  showErrorAlert,
  showToast,
} from "@/lib/alerts/sweetalert";

export default function AdminPlansPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedPlanForDetails, setSelectedPlanForDetails] =
    useState<AdminPlan | null>(null);

  const {
    data: plans = [],
    isLoading,
    refetch,
    isFetching,
  } = useGetAdminPlansQuery();
  const [changePlanStatus, { isLoading: isStatusChanging }] =
    useChangePlanStatusMutation();
  const [deletePlan, { isLoading: isDeleting }] = useDeletePlanMutation();

  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (dateA && dateB && dateA !== dateB) return dateB - dateA;
      return (b.displayOrder ?? 0) - (a.displayOrder ?? 0);
    });
  }, [plans]);

  const filteredPlans = sortedPlans.filter((plan) => {
    const matchesSearch =
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plan.shortDescription &&
        plan.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && plan.isActive) ||
      (statusFilter === "INACTIVE" && !plan.isActive);

    return matchesSearch && matchesStatus;
  });

  const totalItems = filteredPlans.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedPlans = filteredPlans.slice(startIndex, endIndex);

  const totalSubscribers = plans.reduce(
    (sum, p) => sum + (p.activeSubscribersCount || 0),
    0,
  );
  const activePlansCount = plans.filter((p) => p.isActive).length;

  const handleToggleStatus = async (plan: AdminPlan) => {
    const nextStatus = plan.isActive ? "INACTIVE" : "ACTIVE";
    const actionLabel = plan.isActive ? "Deactivate" : "Activate";

    const confirmed = await confirmCriticalAction({
      title: `${actionLabel} Service Plan?`,
      text: plan.isActive
        ? `Deactivating "${plan.name}" will hide it from new customer registrations. Existing subscribers will retain their plan.`
        : `Activating "${plan.name}" will make it immediately available for new client sign-ups and upgrades.`,
      confirmButtonText: `Yes, ${actionLabel} Plan`,
      isDestructive: plan.isActive,
    });

    if (!confirmed) return;

    try {
      await changePlanStatus({
        id: plan.id,
        body: { status: nextStatus },
      }).unwrap();
      refetch();
      showToast(
        `Plan successfully ${plan.isActive ? "deactivated" : "activated"}.`,
        "success",
      );
    } catch (err: any) {
      showErrorAlert(
        "Status Update Failed",
        err?.data?.message || "Failed to update plan status.",
      );
    }
  };

  const handleDeletePlan = async (plan: AdminPlan) => {
    const confirmed = await confirmDelete({
      title: `Delete "${plan.name}"?`,
      text: `Are you sure you want to permanently delete the "${plan.name}" service plan? This action cannot be undone.`,
      confirmButtonText: "Yes, Delete Plan",
    });

    if (!confirmed) return;

    try {
      const res = await deletePlan(plan.id).unwrap();
      refetch();
      showSuccessAlert(
        "Plan Deleted",
        res.message || `"${plan.name}" has been permanently deleted.`,
      );
    } catch (err: any) {
      showErrorAlert(
        "Delete Failed",
        err?.data?.message || "Failed to delete plan.",
      );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D9E4EC] pb-5">
        <div>
          <h1 className="text-2xl font-black text-[#243746] tracking-tight flex items-center gap-2.5">
            <Package className="w-7 h-7 text-[#294B68]" />
            Service Plans
          </h1>
          <p className="text-sm text-[#5E8FB2] mt-1 font-medium">
            Manage membership tiers, monthly pricing, visit allocations, and
            service feature bullet points
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 bg-white border border-[#D9E4EC] text-[#243746] hover:bg-[#F0F5F9] rounded-xl text-sm font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            title="Refresh plans"
          >
            <RefreshCw
              className={`w-4 h-4 text-[#5E8FB2] ${isFetching ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            href="/admin/plans/new"
            className="px-4 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Plan</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#D9E4EC] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#294B68] flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#5E8FB2] uppercase tracking-wider">
              Active Plans
            </div>
            <div className="text-2xl font-black text-[#243746]">
              {activePlansCount}{" "}
              <span className="text-sm font-semibold text-[#64748B]">
                / {plans.length} Total
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D9E4EC] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#5E8FB2] uppercase tracking-wider">
              Active Subscribers
            </div>
            <div className="text-2xl font-black text-[#243746]">
              {totalSubscribers}{" "}
              <span className="text-sm font-semibold text-[#64748B]">
                {totalSubscribers === 1 ? "Subscriber" : "Subscribers"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D9E4EC] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#5E8FB2] uppercase tracking-wider">
              Subscription Quotas
            </div>
            <div className="text-2xl font-black text-emerald-700 flex items-center gap-1.5">
              <span>Automatic</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Managed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#D9E4EC] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#5E8FB2]" />
          <input
            type="text"
            placeholder="Search plans by name, code..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {["ALL", "ACTIVE", "INACTIVE"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatusFilter(tab);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === tab
                  ? "bg-[#294B68] text-white"
                  : "bg-[#F0F5F9] text-[#243746] hover:bg-[#EAF3F8]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Plans Table */}
      <div className="bg-white rounded-2xl border border-[#D9E4EC] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F0F5F9] border-b border-[#D9E4EC] text-xs font-black text-[#294B68] uppercase tracking-wider">
                <th className="py-3.5 px-4">Plan Name &amp; Code</th>
                <th className="py-3.5 px-4">Price &amp; Interval</th>
                <th className="py-3.5 px-4">Visits &amp; Time</th>

                <th className="py-3.5 px-4">Subscribers</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E4EC] text-sm">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4 space-y-1.5">
                      <div className="h-4 bg-[#E2E8F0] rounded-md w-36"></div>
                      <div className="h-3 bg-[#F1F5F9] rounded-md w-20"></div>
                    </td>
                    <td className="py-4 px-4 space-y-1.5">
                      <div className="h-4 bg-[#E2E8F0] rounded-md w-24"></div>
                      <div className="h-3 bg-[#F1F5F9] rounded-md w-16"></div>
                    </td>
                    <td className="py-4 px-4 space-y-1.5">
                      <div className="h-4 bg-[#E2E8F0] rounded-md w-20"></div>
                    </td>
                    <td className="py-4 px-4 space-y-1.5">
                      <div className="h-4 bg-[#E2E8F0] rounded-md w-44"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-6 bg-[#E2E8F0] rounded-full w-20"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 bg-[#E2E8F0] rounded-full w-16"></div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-8 bg-[#E2E8F0] rounded-xl w-24 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#5E8FB2]">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="w-10 h-10 text-[#D9E4EC]" />
                      <div className="text-base font-bold text-[#243746]">
                        No service plans found
                      </div>
                      <p className="text-xs">
                        Adjust your search or click &quot;Create New Plan&quot;
                        to define a new tier.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedPlans.map((plan) => (
                  <tr
                    key={plan.id}
                    className="hover:bg-[#F0F5F9]/40 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => setSelectedPlanForDetails(plan)}
                        className="font-extrabold text-[#243746] hover:text-[#294B68] hover:underline text-left cursor-pointer flex items-center gap-1.5"
                      >
                        <span>{plan.name}</span>
                        <Eye className="w-3.5 h-3.5 text-[#5E8FB2] opacity-70" />
                      </button>
                      {(plan.shortDescription || plan.description) && (
                        <div className="text-xs text-[#64748B] font-medium truncate max-w-[220px]">
                          {plan.shortDescription || plan.description}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-black text-[#243746]">
                        ${plan.price}
                      </div>
                      <div className="text-xs text-[#5E8FB2] font-semibold capitalize">
                        {plan.billingInterval?.toLowerCase() || "monthly"}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-extrabold bg-[#EAF3F8] text-[#294B68] w-fit">
                          {plan.totalVisits || 1}{" "}
                          {plan.totalVisits === 1 ? "visit" : "visits"} / mo
                        </span>
                        <span className="text-[11px] font-semibold text-[#5E8FB2]">
                          {formatPlanDuration(plan.times)}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => setSelectedPlanForDetails(plan)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAF3F8] text-[#294B68] hover:bg-[#D9E4EC] cursor-pointer transition-colors"
                        title="View subscribed members"
                      >
                        <Users className="w-3.5 h-3.5" />
                        {plan.activeSubscribersCount || 0} active
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      {plan.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedPlanForDetails(plan)}
                          className="p-1.5 text-[#294B68] hover:bg-[#EAF3F8] rounded-lg transition-colors cursor-pointer"
                          title="View Plan Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/admin/plans/${plan.id}/edit`}
                          className="p-1.5 text-[#294B68] hover:bg-[#EAF3F8] rounded-lg transition-colors"
                          title="Edit Plan"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(plan)}
                          disabled={isStatusChanging}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg border border-[#D9E4EC] hover:bg-[#F0F5F9] text-[#243746] transition-colors cursor-pointer"
                        >
                          {plan.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePlan(plan)}
                          disabled={isDeleting}
                          className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Plan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && filteredPlans.length > 0 && (
          <TablePagination
            currentPage={validCurrentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="plans"
          />
        )}
      </div>

      {/* Plan Details Modal */}
      {selectedPlanForDetails && (
        <PlanVersionsModal
          plan={selectedPlanForDetails}
          isOpen={Boolean(selectedPlanForDetails)}
          onClose={() => setSelectedPlanForDetails(null)}
        />
      )}
    </div>
  );
}
