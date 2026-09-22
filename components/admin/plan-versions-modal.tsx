"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  Package,
  Users,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Edit,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
  Phone,
  Mail,
} from "lucide-react";
import { AdminPlan, formatPlanDuration } from "@/redux/features/plan/planTypes";
import { useGetAdminPlanByIdQuery } from "@/redux/features/plan/planApi";

interface PlanVersionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: AdminPlan | null;
}

export function PlanVersionsModal({
  isOpen,
  onClose,
  plan,
}: PlanVersionsModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "subscribers">("overview");

  const { data: detailedPlan, isLoading } = useGetAdminPlanByIdQuery(
    plan?.id || "",
    {
      skip: !plan?.id || !isOpen,
    },
  );

  if (!isOpen || !plan) return null;

  const currentPlan = detailedPlan || plan;
  const subscribers = (currentPlan as any).subscriptions || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D9E4EC] z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#D9E4EC] shrink-0">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#294B68] text-white flex items-center justify-center font-black text-xl shrink-0 shadow-xs">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#243746]">
                  {currentPlan.name}
                </h2>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#EAF3F8] text-[#294B68]">
                  {currentPlan.code}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    currentPlan.isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {currentPlan.isActive ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> Active Plan
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" /> Inactive
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-1 line-clamp-1">
                {currentPlan.shortDescription ||
                  currentPlan.fullDescription ||
                  "Comprehensive senior home safety oversight service plan."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <Link
              href={`/admin/plans/${currentPlan.id}/edit`}
              onClick={onClose}
              className="px-3.5 py-2 bg-[#EAF3F8] hover:bg-[#D9E4EC] text-[#294B68] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Plan</span>
            </Link>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#243746] hover:bg-[#F7FAFC] border border-[#D9E4EC] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-4 pb-2 border-b border-[#D9E4EC] shrink-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === "overview"
                ? "bg-[#294B68] text-white shadow-xs"
                : "text-[#64748B] hover:bg-[#F7FAFC]"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Plan Details &amp; Features</span>
          </button>

          <button
            onClick={() => setActiveTab("subscribers")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === "subscribers"
                ? "bg-[#294B68] text-white shadow-xs"
                : "text-[#64748B] hover:bg-[#F7FAFC]"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>
              Subscribed Members (
              {subscribers.length || currentPlan.activeSubscribersCount || 0})
            </span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto flex-1 pt-4 pr-1 space-y-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Quick Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-[#F0F5F9]/60 rounded-2xl border border-[#D9E4EC] space-y-1">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Plan Price
                  </span>
                  <div className="text-2xl font-black text-[#243746]">
                    ${currentPlan.price}{" "}
                    <span className="text-xs font-bold text-[#5E8FB2] uppercase">
                      {currentPlan.currency || "USD"}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] capitalize">
                    Billed {currentPlan.billingInterval?.toLowerCase() || "monthly"}
                  </p>
                </div>

                <div className="p-4 bg-[#F0F5F9]/60 rounded-2xl border border-[#D9E4EC] space-y-1">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-[#294B68]" /> Included Visits
                  </span>
                  <div className="text-2xl font-black text-[#294B68]">
                    {currentPlan.totalVisits || 1}{" "}
                    <span className="text-xs font-bold text-[#5E8FB2]">
                      visits / month
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    Included in monthly cycle
                  </p>
                </div>

                <div className="p-4 bg-[#F0F5F9]/60 rounded-2xl border border-[#D9E4EC] space-y-1">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#294B68]" /> Time (Hourly Duration)
                  </span>
                  <div className="text-lg font-black text-[#294B68] truncate">
                    {formatPlanDuration(currentPlan.times)}
                  </div>
                  <p className="text-xs text-[#64748B]">
                    Hourly time per visit
                  </p>
                </div>

                <div className="p-4 bg-[#F0F5F9]/60 rounded-2xl border border-[#D9E4EC] space-y-1">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-600" /> Active Members
                  </span>
                  <div className="text-2xl font-black text-[#243746]">
                    {subscribers.length || currentPlan.activeSubscribersCount || 0}
                  </div>
                  <p className="text-xs text-[#64748B]">
                    Currently active subscribers
                  </p>
                </div>
              </div>

              {/* Plan Description */}
              {(currentPlan.shortDescription || currentPlan.description) && (
                <div className="p-4 bg-white rounded-2xl border border-[#D9E4EC] space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#5E8FB2]">
                    Plan Description
                  </h4>
                  <p className="text-sm font-semibold text-[#243746]">
                    {currentPlan.shortDescription || currentPlan.description}
                  </p>
                </div>
              )}

              {/* Feature Bullet Points */}
              <div className="p-5 bg-[#F0F5F9]/40 rounded-2xl border border-[#D9E4EC] space-y-3">
                <h4 className="text-sm font-extrabold text-[#294B68] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#5E8FB2]" />
                  Service &amp; Plan Features ({currentPlan.features?.length || 0})
                </h4>
                {currentPlan.features && currentPlan.features.length > 0 ? (
                  <ul className="space-y-2">
                    {currentPlan.features.map((feat, fidx) => (
                      <li key={fidx} className="flex items-start gap-2.5 text-sm text-[#243746]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[#64748B] italic">
                    No bullet points configured for this plan.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "subscribers" && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="py-12 text-center text-sm font-bold text-[#5E8FB2]">
                  Loading subscribers...
                </div>
              ) : subscribers.length === 0 ? (
                <div className="py-12 text-center text-[#5E8FB2] bg-[#F0F5F9]/30 rounded-2xl border border-[#D9E4EC]">
                  <Users className="w-10 h-10 text-[#D9E4EC] mx-auto mb-2" />
                  <div className="text-base font-bold text-[#243746]">
                    No active subscribers yet
                  </div>
                  <p className="text-xs mt-1">
                    When clients select this plan during signup, they will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#D9E4EC] border border-[#D9E4EC] rounded-2xl overflow-hidden bg-white">
                  {subscribers.map((sub: any) => {
                    const client = sub.client || {};
                    const user = client.user || {};
                    const clientName =
                      `${user.firstName || client.firstName || "Member"} ${user.lastName || client.lastName || ""}`.trim();
                    const email = user.email || client.email || client.primaryContactEmail || "";
                    const phone = user.phone || client.phone || client.primaryContactPhone || "";

                    return (
                      <div
                        key={sub.id}
                        className="p-4 hover:bg-[#F0F5F9]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#294B68] text-white flex items-center justify-center font-black text-xs shrink-0">
                            {client.clientNumber?.slice(-3) || "CL"}
                          </div>
                          <div>
                            <div className="font-extrabold text-[#243746] text-sm flex items-center gap-2">
                              <span>{clientName}</span>
                              <span className="font-mono text-xs font-bold text-[#5E8FB2]">
                                {client.clientNumber}
                              </span>
                            </div>
                            <div className="text-xs text-[#64748B] flex items-center gap-3 mt-0.5">
                              {email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-[#5E8FB2]" /> {email}
                                </span>
                              )}
                              {phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-[#5E8FB2]" /> {phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {sub.status || "ACTIVE"}
                          </span>
                          <Link
                            href={`/admin/clients/${client.id}`}
                            className="p-1.5 text-[#294B68] hover:bg-[#EAF3F8] rounded-lg transition-colors"
                            title="View Client Details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
