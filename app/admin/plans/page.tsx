"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Archive,
  Edit,
  Layers,
  Users,
  DollarSign,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import {
  useGetAdminPlansQuery,
  useChangePlanStatusMutation,
} from "@/redux/features/plan/planApi";

export default function AdminPlansPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data: plans = [], isLoading, refetch, isFetching } = useGetAdminPlansQuery();
  const [changePlanStatus, { isLoading: isStatusChanging }] = useChangePlanStatusMutation();

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plan.shortDescription && plan.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && plan.isActive && !plan.isArchived) ||
      (statusFilter === "INACTIVE" && !plan.isActive && !plan.isArchived) ||
      (statusFilter === "ARCHIVED" && plan.isArchived);

    return matchesSearch && matchesStatus;
  });

  const totalSubscribers = plans.reduce((sum, p) => sum + (p.activeSubscribersCount || 0), 0);
  const activePlansCount = plans.filter((p) => p.isActive && !p.isArchived).length;

  const handleToggleStatus = async (plan: any) => {
    try {
      const nextStatus = plan.isActive ? "INACTIVE" : "ACTIVE";
      await changePlanStatus({
        id: plan.id,
        body: { status: nextStatus },
      }).unwrap();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleArchive = async (planId: string) => {
    if (!confirm("Are you sure you want to archive this plan? Historical subscribers will retain their pricing terms, but new clients will not be able to choose it.")) {
      return;
    }
    try {
      await changePlanStatus({
        id: planId,
        body: { status: "ARCHIVED" },
      }).unwrap();
    } catch (err) {
      console.error("Failed to archive plan:", err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D9E4EC] pb-5">
        <div>
          <h1 className="text-2xl font-black text-[#243746] tracking-tight flex items-center gap-2.5">
            <Package className="w-7 h-7 text-[#294B68]" />
            Dynamic Service Plans
          </h1>
          <p className="text-sm text-[#5E8FB2] mt-1 font-medium">
            Configure service tiers, interval pricing, visit quotas, and versioning rules.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 bg-white border border-[#D9E4EC] text-[#243746] hover:bg-[#F0F5F9] rounded-xl text-sm font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            title="Refresh plans catalog"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-[#294B68]" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            href="/admin/plans/new"
            className="px-4 py-2.5 bg-[#294B68] hover:bg-[#1E364B] text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all hover:shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Plan</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#D9E4EC] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#EAF3F8] text-[#294B68] flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#5E8FB2] uppercase tracking-wider">Active Plans</div>
            <div className="text-2xl font-black text-[#243746]">{activePlansCount} / {plans.length}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D9E4EC] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#5E8FB2] uppercase tracking-wider">Active Subscribers</div>
            <div className="text-2xl font-black text-[#243746]">{totalSubscribers}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D9E4EC] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#5E8FB2] uppercase tracking-wider">Pricing Protection</div>
            <div className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Versioned & Protected
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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {["ALL", "ACTIVE", "INACTIVE", "ARCHIVED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
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
        {isLoading ? (
          <div className="py-16 text-center text-[#5E8FB2] font-semibold flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#294B68]" />
            Loading dynamic service plans...
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="py-16 text-center text-[#5E8FB2] flex flex-col items-center gap-2">
            <Package className="w-10 h-10 text-[#D9E4EC]" />
            <div className="text-base font-bold text-[#243746]">No service plans found</div>
            <p className="text-xs">Adjust your search or click &quot;Create New Plan&quot; to define a new tier.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F0F5F9] border-b border-[#D9E4EC] text-xs font-black text-[#294B68] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Plan Name & Code</th>
                  <th className="py-3.5 px-4">Price & Frequency</th>
                  <th className="py-3.5 px-4">Included Visits</th>
                  <th className="py-3.5 px-4">Subscribers</th>
                  <th className="py-3.5 px-4">Version</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E4EC] text-sm">
                {filteredPlans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-[#F0F5F9]/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-extrabold text-[#243746]">{plan.name}</div>
                      <div className="text-xs font-mono font-bold text-[#5E8FB2]">{plan.code}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-black text-[#243746]">${plan.currentPrice}</div>
                      <div className="text-xs text-[#5E8FB2] font-semibold capitalize">
                        {plan.billingInterval.toLowerCase()}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-[#243746]">
                        {plan.totalVisits} visits
                      </div>
                      <div className="text-xs text-[#5E8FB2]">
                        {(plan.services || []).map((s) => `${s.allocatedVisits} ${s.serviceName}`).join(" + ") || "Safety oversight"}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAF3F8] text-[#294B68]">
                        <Users className="w-3.5 h-3.5" />
                        {plan.activeSubscribersCount} active
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded-md text-xs font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
                        v{plan.latestVersionNumber}.0
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {plan.isArchived ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-slate-100 text-slate-600">
                          <Archive className="w-3 h-3" /> Archived
                        </span>
                      ) : plan.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/plans/${plan.id}/edit`}
                          className="p-1.5 text-[#294B68] hover:bg-[#EAF3F8] rounded-lg transition-colors"
                          title="Edit Plan & Prices"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        {!plan.isArchived && (
                          <button
                            onClick={() => handleToggleStatus(plan)}
                            disabled={isStatusChanging}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg border border-[#D9E4EC] hover:bg-[#F0F5F9] text-[#243746] transition-colors cursor-pointer"
                          >
                            {plan.isActive ? "Deactivate" : "Activate"}
                          </button>
                        )}
                        {!plan.isArchived && plan.activeSubscribersCount === 0 && (
                          <button
                            onClick={() => handleArchive(plan.id)}
                            className="p-1.5 text-[#C95C5C] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Archive Plan"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
