"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  Package,
  History,
  Users,
  DollarSign,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Edit,
  ShieldCheck,
  CreditCard,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Phone,
  Mail,
} from "lucide-react";
import { AdminPlan, PlanVersionDetail } from "@/redux/features/plan/planTypes";
import { useGetAdminPlanByIdQuery } from "@/redux/features/plan/planApi";

interface PlanVersionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: AdminPlan | null;
}

export function PlanVersionsModal({ isOpen, onClose, plan }: PlanVersionsModalProps) {
  const [activeTab, setActiveTab] = useState<"versions" | "subscribers" | "settings">("versions");

  const { data: detailedPlan, isLoading } = useGetAdminPlanByIdQuery(plan?.id || "", {
    skip: !plan?.id || !isOpen,
  });

  if (!isOpen || !plan) return null;

  const currentPlan = detailedPlan || plan;
  const versions: PlanVersionDetail[] = currentPlan.versions || [];
  const subscribers = (detailedPlan as any)?.subscriptions || [];
  const latestVersion = versions[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D9E4EC] z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
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
                      <CheckCircle2 className="w-3 h-3" /> Active Tier
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" /> Inactive
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-1 line-clamp-1">
                {currentPlan.shortDescription || currentPlan.fullDescription || "Comprehensive home safety oversight membership tier."}
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
            onClick={() => setActiveTab("versions")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === "versions"
                ? "bg-[#294B68] text-white shadow-xs"
                : "text-[#64748B] hover:bg-[#F7FAFC]"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Commercial Version History ({versions.length || 1})</span>
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
            <span>Subscribed Members ({subscribers.length || currentPlan.activeSubscribersCount || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === "settings"
                ? "bg-[#294B68] text-white shadow-xs"
                : "text-[#64748B] hover:bg-[#F7FAFC]"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Plan Specs &amp; Rules</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto flex-1 pt-4 pr-1 space-y-6">
          {/* TAB 1: COMMERCIAL VERSION HISTORY */}
          {activeTab === "versions" && (
            <div className="space-y-4">
              <div className="bg-[#F0F5F9]/60 p-4 rounded-2xl border border-[#5E8FB2]/20 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-[#243746]">
                  <span className="font-extrabold block text-sm text-[#294B68] mb-0.5">
                    Grandfathered Rate Protection
                  </span>
                  AgeWellRI employs strict commercial versioning. When price or visit quotas are updated, existing contracted subscribers stay locked at their signed agreement version rate while new clients onboard onto the latest version.
                </div>
              </div>

              <div className="space-y-4">
                {versions.map((ver, vidx) => {
                  const isCurrentLive = ver.status === "ACTIVE" || vidx === 0;
                  return (
                    <div
                      key={ver.id || vidx}
                      className={`p-5 rounded-2xl border transition-all ${
                        isCurrentLive
                          ? "bg-white border-[#5E8FB2] shadow-xs ring-1 ring-[#5E8FB2]/30"
                          : "bg-[#F7FAFC] border-[#D9E4EC]"
                      }`}
                    >
                      {/* Version Top Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#D9E4EC]">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-extrabold bg-[#294B68] text-white px-2.5 py-1 rounded-lg">
                            v{ver.versionNumber || (versions.length - vidx)}.0
                          </span>
                          <div>
                            <span className="font-extrabold text-sm text-[#243746]">
                              {ver.name || currentPlan.name}
                            </span>
                            <span className="text-xs text-[#64748B] block">
                              {ver.description || currentPlan.shortDescription || "Service Tier Specification"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isCurrentLive ? (
                            <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ● Current Live Version
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-200 text-slate-700">
                              Historical Version
                            </span>
                          )}
                          <span className="text-xs font-mono font-bold text-[#64748B]">
                            {ver.status}
                          </span>
                        </div>
                      </div>

                      {/* Version Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3.5">
                        {/* Price & Billing */}
                        <div className="p-3 bg-[#F0F5F9]/50 rounded-xl border border-[#D9E4EC]/60 space-y-1">
                          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Contracted Price
                          </span>
                          <div className="text-lg font-black text-[#243746]">
                            ${ver.price}{" "}
                            <span className="text-xs font-bold text-[#5E8FB2] uppercase">
                              {ver.currency || "USD"}
                            </span>
                          </div>
                          <p className="text-xs text-[#64748B] capitalize">
                            Billed {ver.billingInterval.toLowerCase()}
                          </p>
                        </div>

                        {/* Effective Window */}
                        <div className="p-3 bg-[#F0F5F9]/50 rounded-xl border border-[#D9E4EC]/60 space-y-1">
                          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#5E8FB2]" /> Effective Window
                          </span>
                          <div className="text-xs font-bold text-[#243746]">
                            From: {new Date(ver.effectiveFrom).toLocaleDateString()}
                          </div>
                          <div className="text-xs font-semibold text-[#64748B]">
                            To: {ver.effectiveTo ? new Date(ver.effectiveTo).toLocaleDateString() : "Current (Ongoing)"}
                          </div>
                        </div>

                        {/* Visit Allocation Quotas */}
                        <div className="p-3 bg-[#F0F5F9]/50 rounded-xl border border-[#D9E4EC]/60 space-y-1">
                          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-[#294B68]" /> Visit Quotas
                          </span>
                          <div className="text-xs font-bold text-[#243746] space-y-0.5">
                            {ver.planServices && ver.planServices.length > 0 ? (
                              ver.planServices.map((ps: any, pidx: number) => (
                                <div key={pidx} className="flex justify-between items-center">
                                  <span>{ps.serviceType?.name || ps.serviceName || "Service"}</span>
                                  <span className="font-black text-[#294B68]">{ps.allocatedVisits} visits</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-xs text-[#64748B]">
                                {currentPlan.totalVisits || 6} visits per cycle
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Marketing Features Snapshot for this Version */}
                      {ver.features && ver.features.length > 0 && (
                        <div className="mt-3.5 pt-3 border-t border-[#D9E4EC]/60 space-y-1.5">
                          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                            Version Features Snapshot:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {ver.features.map((feat, fidx) => (
                              <span
                                key={fidx}
                                className="px-2.5 py-1 bg-white text-[#243746] rounded-lg text-xs font-semibold border border-[#D9E4EC] flex items-center gap-1.5 shadow-2xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                {feat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SUBSCRIBED MEMBERS */}
          {activeTab === "subscribers" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  Active Subscribed Members ({subscribers.length})
                </span>
                <Link
                  href="/admin/clients"
                  onClick={onClose}
                  className="text-xs font-bold text-[#294B68] hover:underline flex items-center gap-1"
                >
                  <span>Open Client Directory</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {subscribers.length === 0 ? (
                <div className="p-8 text-center bg-[#F7FAFC] rounded-2xl border border-[#D9E4EC] space-y-2">
                  <Users className="w-10 h-10 text-[#5E8FB2] mx-auto opacity-50" />
                  <p className="font-bold text-sm text-[#243746]">No active subscribers on this plan yet.</p>
                  <p className="text-xs text-[#64748B]">New clients who choose this tier will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-[#D9E4EC]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F0F5F9] text-[#294B68] font-bold border-b border-[#D9E4EC]">
                        <th className="p-3">Client ID</th>
                        <th className="p-3">Member Name</th>
                        <th className="p-3">Contact</th>
                        <th className="p-3">Contracted Rate</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D9E4EC]">
                      {subscribers.map((sub: any) => (
                        <tr key={sub.id} className="hover:bg-[#F7FAFC] transition-colors">
                          <td className="p-3 font-mono font-bold text-[#294B68]">
                            {sub.client?.clientNumber || sub.client?.id?.slice(-6)?.toUpperCase() || "AW-MEM"}
                          </td>
                          <td className="p-3 font-bold text-[#243746]">
                            {sub.client?.firstName} {sub.client?.lastName}
                          </td>
                          <td className="p-3 text-slate-600 space-y-0.5">
                            {sub.client?.phone && (
                              <div className="flex items-center gap-1 text-[11px]">
                                <Phone className="w-3 h-3 text-[#5E8FB2]" /> {sub.client.phone}
                              </div>
                            )}
                            {sub.client?.email && (
                              <div className="flex items-center gap-1 text-[11px]">
                                <Mail className="w-3 h-3 text-[#5E8FB2]" /> {sub.client.email}
                              </div>
                            )}
                          </td>
                          <td className="p-3 font-black text-[#243746]">
                            ${sub.contractedPrice} / {sub.billingInterval?.toLowerCase()}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {sub.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <Link
                              href={`/admin/clients/${sub.client?.id}`}
                              onClick={onClose}
                              className="p-1 text-[#294B68] hover:underline font-bold text-[11px]"
                            >
                              View Profile →
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

          {/* TAB 3: PLAN SPECS & GATEWAYS */}
          {activeTab === "settings" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Billing Gateway Settings */}
                <div className="p-4 bg-[#F7FAFC] rounded-2xl border border-[#D9E4EC] space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#294B68] flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[#5E8FB2]" />
                    Billing &amp; Invoicing Channels
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#D9E4EC]">
                      <span className="font-semibold text-[#243746]">Stripe Automatic Credit Card</span>
                      <span className={`font-bold ${currentPlan.supportsAutomaticBilling !== false ? "text-emerald-600" : "text-slate-400"}`}>
                        {currentPlan.supportsAutomaticBilling !== false ? "Enabled" : "Disabled"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#D9E4EC]">
                      <span className="font-semibold text-[#243746]">Auto-Renewal by Default</span>
                      <span className={`font-bold ${currentPlan.autoRenewDefault !== false ? "text-emerald-600" : "text-slate-400"}`}>
                        {currentPlan.autoRenewDefault !== false ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* System Identifiers */}
                <div className="p-4 bg-[#F7FAFC] rounded-2xl border border-[#D9E4EC] space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#294B68] flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#5E8FB2]" />
                    System &amp; Stripe Identifiers
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-[#D9E4EC] space-y-1">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase">Database Plan ID</span>
                      <p className="font-mono text-xs font-semibold text-[#243746] break-all">{currentPlan.id}</p>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-[#D9E4EC] space-y-1">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase">Display Priority Order</span>
                      <p className="text-xs font-bold text-[#243746]">{currentPlan.displayOrder ?? 1} (Rank on pricing cards)</p>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-[#D9E4EC] space-y-1">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase">Stripe Product Reference</span>
                      <p className="font-mono text-xs text-[#5E8FB2] break-all">
                        {(currentPlan as any).stripeProductId || `agewellri_prod_${currentPlan.code.toLowerCase()}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 mt-2 border-t border-[#D9E4EC] flex items-center justify-between shrink-0">
          <span className="text-xs text-[#64748B]">
            Plan Code: <strong className="font-mono text-[#243746]">{currentPlan.code}</strong> • Total {versions.length} recorded versions
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
