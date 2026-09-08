"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  CalendarCheck,
  FileCheck2,
  CreditCard,
  RefreshCw,
  Clock,
  ArrowRight,
  ShieldCheck,
  Activity,
  MapPin,
  Sparkles,
  DollarSign,
  TrendingUp,
  FileText,
  Calendar,
  Layers,
} from "lucide-react";
import { useGetAdminDashboardStatsQuery } from "@/redux/features/client/clientApi";
import { useAppSelector } from "@/redux/hooks";
import { StatKpiCard } from "@/components/admin/stat-kpi-card";
import { AttentionPanel, AttentionItem } from "@/components/admin/attention-panel";
import { ClientStatusBadge } from "@/components/admin/client-status-badge";
import { AddClientModal } from "@/components/admin/add-client-modal";
import { AdminScheduleModal } from "@/components/admin/admin-schedule-modal";

export default function AdminOverviewPage() {
  const authUser = useAppSelector((state) => state.auth.user);
  const { data: statsResponse, isLoading, refetch } = useGetAdminDashboardStatsQuery();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const stats = statsResponse?.data;
  const kpis = stats?.kpis;

  // Format today's date
  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const greetingName = authUser?.firstName || "Sarah";

  if (isLoading || !stats) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Top Welcome Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#D9E4EC]/60">
          <div className="space-y-2">
            <div className="h-8 bg-[#E2E8F0] rounded-xl w-64"></div>
            <div className="h-4 bg-[#F1F5F9] rounded-lg w-80"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 bg-[#E2E8F0] rounded-xl w-32"></div>
            <div className="h-9 bg-[#E2E8F0] rounded-xl w-36"></div>
          </div>
        </div>

        {/* Primary KPI Cards Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-[#D9E4EC] bg-white flex flex-col justify-between space-y-3 shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div className="h-3 bg-[#E2E8F0] rounded-md w-20"></div>
                <div className="w-9 h-9 bg-[#EAF3F8] rounded-xl shrink-0"></div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="h-7 bg-[#E2E8F0] rounded-md w-14"></div>
                <div className="h-3 bg-[#F1F5F9] rounded-md w-24"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Attention Required Skeleton */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-[#E2E8F0] rounded-md"></div>
              <div className="h-5 bg-[#E2E8F0] rounded-md w-40"></div>
            </div>
            <div className="h-6 bg-[#E2E8F0] rounded-full w-28"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {[...Array(2)].map((_, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-[#D9E4EC] bg-[#F7FAFC] flex items-start gap-3"
              >
                <div className="w-10 h-10 bg-[#EAF3F8] rounded-xl shrink-0"></div>
                <div className="space-y-2 flex-1 pt-1">
                  <div className="h-4 bg-[#E2E8F0] rounded-md w-3/4"></div>
                  <div className="h-3 bg-[#F1F5F9] rounded-md w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Grid: Upcoming Schedule & Regional Jurisdiction Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Field Operations Schedule Table Skeleton */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-[#D9E4EC] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D9E4EC]/60">
              <div className="space-y-1.5">
                <div className="h-5 bg-[#E2E8F0] rounded-md w-60"></div>
                <div className="h-3 bg-[#F1F5F9] rounded-md w-48"></div>
              </div>
              <div className="h-4 bg-[#E2E8F0] rounded-md w-24"></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D9E4EC] text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    <th className="py-3 px-3.5">Date &amp; Time</th>
                    <th className="py-3 px-3.5">Client &amp; Address</th>
                    <th className="py-3 px-3.5">Service</th>
                    <th className="py-3 px-3.5">Specialist</th>
                    <th className="py-3 px-3.5">Status</th>
                    <th className="py-3 px-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E4EC]/60">
                  {[...Array(4)].map((_, i) => (
                    <tr key={i}>
                      <td className="py-4 px-3.5 space-y-1.5">
                        <div className="h-4 bg-[#E2E8F0] rounded-md w-24"></div>
                        <div className="h-3 bg-[#F1F5F9] rounded-md w-16"></div>
                      </td>
                      <td className="py-4 px-3.5 space-y-1.5">
                        <div className="h-4 bg-[#E2E8F0] rounded-md w-32"></div>
                        <div className="h-3 bg-[#F1F5F9] rounded-md w-24"></div>
                      </td>
                      <td className="py-4 px-3.5">
                        <div className="h-5 bg-[#E2E8F0] rounded-full w-20"></div>
                      </td>
                      <td className="py-4 px-3.5">
                        <div className="h-4 bg-[#E2E8F0] rounded-md w-24"></div>
                      </td>
                      <td className="py-4 px-3.5">
                        <div className="h-5 bg-[#E2E8F0] rounded-full w-20"></div>
                      </td>
                      <td className="py-4 px-3.5 text-right">
                        <div className="h-7 bg-[#E2E8F0] rounded-lg w-16 ml-auto"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Regional Jurisdiction Skeleton */}
          <div className="bg-white rounded-3xl border border-[#D9E4EC] p-6 shadow-xs space-y-5">
            <div className="pb-3 border-b border-[#D9E4EC]/60 space-y-1.5">
              <div className="h-5 bg-[#E2E8F0] rounded-md w-44"></div>
              <div className="h-3 bg-[#F1F5F9] rounded-md w-36"></div>
            </div>
            <div className="space-y-3 pt-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <div className="h-3 bg-[#E2E8F0] rounded-md w-24"></div>
                    <div className="h-3 bg-[#F1F5F9] rounded-md w-16"></div>
                  </div>
                  <div className="h-2 bg-[#E2E8F0] rounded-full w-full"></div>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
              <div className="h-3 bg-emerald-200 rounded-md w-32"></div>
              <div className="h-6 bg-emerald-300 rounded-md w-28"></div>
            </div>
          </div>
        </div>

        {/* Bottom Grid: Recent Clients & Live Operational Audit Stream Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-[#D9E4EC] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D9E4EC]/60">
              <div className="space-y-1.5">
                <div className="h-5 bg-[#E2E8F0] rounded-md w-48"></div>
                <div className="h-3 bg-[#F1F5F9] rounded-md w-40"></div>
              </div>
              <div className="h-4 bg-[#E2E8F0] rounded-md w-24"></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D9E4EC] text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    <th className="py-3 px-3.5">Client ID</th>
                    <th className="py-3 px-3.5">Client Name</th>
                    <th className="py-3 px-3.5">State</th>
                    <th className="py-3 px-3.5">Plan</th>
                    <th className="py-3 px-3.5">Status</th>
                    <th className="py-3 px-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E4EC]/60">
                  {[...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="py-3.5 px-3.5">
                        <div className="h-4 bg-[#E2E8F0] rounded-md w-16"></div>
                      </td>
                      <td className="py-3.5 px-3.5 space-y-1.5">
                        <div className="h-4 bg-[#E2E8F0] rounded-md w-28"></div>
                        <div className="h-3 bg-[#F1F5F9] rounded-md w-20"></div>
                      </td>
                      <td className="py-3.5 px-3.5">
                        <div className="h-4 bg-[#E2E8F0] rounded-md w-10"></div>
                      </td>
                      <td className="py-3.5 px-3.5">
                        <div className="h-4 bg-[#E2E8F0] rounded-md w-20"></div>
                      </td>
                      <td className="py-3.5 px-3.5">
                        <div className="h-5 bg-[#E2E8F0] rounded-full w-16"></div>
                      </td>
                      <td className="py-3.5 px-3.5 text-right">
                        <div className="h-7 bg-[#E2E8F0] rounded-lg w-16 ml-auto"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Stream Skeleton */}
          <div className="bg-white rounded-3xl border border-[#D9E4EC] p-6 shadow-xs space-y-4">
            <div className="pb-2 border-b border-[#D9E4EC]/60 space-y-1.5">
              <div className="h-5 bg-[#E2E8F0] rounded-md w-36"></div>
              <div className="h-3 bg-[#F1F5F9] rounded-md w-32"></div>
            </div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-3 rounded-xl border border-[#D9E4EC]/70 bg-[#F7FAFC] space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3 bg-[#E2E8F0] rounded-md w-24"></div>
                    <div className="h-3 bg-[#F1F5F9] rounded-md w-12"></div>
                  </div>
                  <div className="h-3 bg-[#E2E8F0] rounded-md w-3/4"></div>
                  <div className="h-2.5 bg-[#F1F5F9] rounded-md w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Convert attention items to AttentionItem type
  const formattedAttentionItems: AttentionItem[] = (stats.attentionItems || []).map((item) => ({
    id: item.id,
    title: item.title,
    count: 1,
    description: item.description,
    href: item.actionHref || (item.type === "REPORT" ? "/admin/appointments?tab=COMPLETED" : "/admin"),
    type:
      item.type === "AGREEMENT"
        ? "agreement"
        : item.type === "REPORT"
        ? "report"
        : item.type === "BILLING"
        ? "payment"
        : "onboarding",
    urgency: item.urgency,
  }));

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#D9E4EC]/60">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#243746] tracking-tight flex items-center gap-2">
            <span>Good day, {greetingName}</span>
            <Sparkles className="w-6 h-6 text-[#5E8FB2]" />
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Real-time operations &amp; care coordination overview for <strong>{todayFormatted}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Client</span>
          </button>

          <button
            type="button"
            onClick={() => setScheduleModalOpen(true)}
            className="px-4 py-2 bg-white border border-[#D9E4EC] hover:bg-[#F8FAFC] text-[#243746] font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#5E8FB2]" />
            <span>Schedule Visit</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatKpiCard
          title="Active Clients"
          value={kpis?.activeClientsCount ?? 0}
          subtitle={`+${kpis?.newClientsThisMonth ?? 0} this month`}
          icon={<Users className="w-5 h-5 text-[#294B68]" />}
          href="/admin/clients"
        />

        <StatKpiCard
          title="Pending Intakes"
          value={kpis?.pendingOnboardingCount ?? 0}
          subtitle="Awaiting onboarding"
          icon={<UserPlus className="w-5 h-5 text-[#C28A3A]" />}
          href="/admin/clients"
          urgent={(kpis?.pendingOnboardingCount ?? 0) > 0}
        />

        <StatKpiCard
          title="Upcoming Visits"
          value={kpis?.upcomingVisitsCount ?? 0}
          subtitle="Next 7 days"
          icon={<CalendarCheck className="w-5 h-5 text-[#294B68]" />}
          href="/admin/appointments"
        />

        <StatKpiCard
          title="Pending Reports"
          value={kpis?.reportsPendingCount ?? 0}
          subtitle="Completed visits"
          icon={<FileCheck2 className="w-5 h-5 text-[#C95C5C]" />}
          href="/admin/appointments?tab=COMPLETED"
          urgent={(kpis?.reportsPendingCount ?? 0) > 0}
        />

        <StatKpiCard
          title="Agreements Executed"
          value={kpis?.executedAgreementsCount ?? 0}
          subtitle={`${kpis?.pendingAgreementsCount ?? 0} pending sign`}
          icon={<ShieldCheck className="w-5 h-5 text-[#3F8F6B]" />}
          href="/admin/agreements"
        />

        <StatKpiCard
          title="Renewals in 30d"
          value={kpis?.renewalsUpcomingCount ?? 0}
          subtitle="Quarterly cycles"
          icon={<RefreshCw className="w-5 h-5 text-[#5E8FB2]" />}
          href="/admin/subscriptions"
        />
      </div>

      {/* Dynamic Attention Required Panel */}
      <AttentionPanel items={formattedAttentionItems} />

      {/* Middle Grid: Upcoming Schedule & Regional Jurisdiction */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Field Operations Schedule (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#D9E4EC] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#D9E4EC]/60">
            <div>
              <h3 className="text-lg font-bold text-[#243746] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#294B68]" />
                <span>Upcoming Field Visits (Next 7 Days)</span>
              </h3>
              <p className="text-xs text-[#64748B]">Scheduled home care and safety oversight visits</p>
            </div>
            <Link
              href="/admin/appointments"
              className="text-xs font-bold text-[#5E8FB2] hover:text-[#294B68] flex items-center gap-1 hover:underline"
            >
              <span>View All ({kpis?.upcomingVisitsCount ?? 0})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats.upcomingSchedule.length === 0 ? (
            <div className="p-8 text-center text-[#64748B] bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] space-y-2">
              <CalendarCheck className="w-8 h-8 text-[#94A3B8] mx-auto" />
              <p className="font-bold text-xs text-[#243746]">No Upcoming Visits in the Next 7 Days</p>
              <p className="text-[11px] text-[#64748B]">Click &ldquo;Schedule Visit&rdquo; to assign a specialist to a member.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#D9E4EC] bg-[#F7FAFC]">
                    <th className="py-3 px-3.5 font-bold text-[#64748B]">Date &amp; Time</th>
                    <th className="py-3 px-3.5 font-bold text-[#64748B]">Client &amp; Address</th>
                    <th className="py-3 px-3.5 font-bold text-[#64748B]">Service</th>
                    <th className="py-3 px-3.5 font-bold text-[#64748B]">Specialist</th>
                    <th className="py-3 px-3.5 font-bold text-[#64748B]">Status</th>
                    <th className="py-3 px-3.5 font-bold text-[#64748B] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E4EC]/60">
                  {stats.upcomingSchedule.map((appt) => (
                    <tr key={appt.id} className="hover:bg-[#F7FAFC] transition-colors">
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-bold text-[#243746] block">{appt.dateFormatted}</span>
                        <span className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-[#5E8FB2]" />
                          {appt.timeSlot}
                        </span>
                      </td>

                      <td className="py-3 px-3.5">
                        <span className="font-bold text-[#243746] block">{appt.clientName}</span>
                        <span className="text-[11px] text-[#64748B] flex items-center gap-1 truncate max-w-[180px]">
                          <MapPin className="w-3 h-3 text-[#94A3B8] shrink-0" />
                          {appt.address}
                        </span>
                      </td>

                      <td className="py-3 px-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF3F8] text-[#294B68]">
                          {appt.serviceType}
                        </span>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: appt.specialistColor || "#294B68" }}
                          />
                          <span className="font-semibold text-[#243746]">
                            {appt.specialistName}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {appt.status || "CONFIRMED"}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/clients/${appt.clientId}`}
                          className="px-2.5 py-1 rounded-lg bg-[#EAF3F8] hover:bg-[#294B68] text-[#294B68] hover:text-white font-bold text-[11px] transition-colors inline-block cursor-pointer"
                        >
                          Manage →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Regional State & Plan Intelligence (1 Col) */}
        <div className="bg-white rounded-3xl border border-[#D9E4EC] p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-[#D9E4EC]/60">
              <h3 className="text-base font-bold text-[#243746] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#294B68]" />
                <span>Service Regional Distribution</span>
              </h3>
              <p className="text-xs text-[#64748B]">Active state jurisdictions &amp; service plans</p>
            </div>

            {/* Service Jurisdiction */}
            <div className="space-y-2.5 pt-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Service Jurisdiction
              </span>
              <div className="space-y-2">
                {[
                  {
                    state: "Rhode Island",
                    code: "RI",
                    count: stats.stateDistribution?.RI || kpis?.totalClientsCount || 0,
                    color: "bg-[#294B68]",
                  },
                ].map((item) => {
                  const total = Math.max(1, item.count);
                  const pct = 100;
                  return (
                    <div key={item.code} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-[#243746] font-bold">
                          {item.state} ({item.code})
                        </span>
                        <span className="text-[#294B68] font-bold">
                          {item.count} Members ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-[#EAF3F8] h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.color}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Plan Distribution */}
            <div className="space-y-2.5 pt-5 border-t border-[#D9E4EC]/60">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Active Plan Tiers
              </span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.planDistribution || {}).map(([planName, count]) => (
                  <div
                    key={planName}
                    className="px-3 py-1.5 rounded-xl bg-[#F7FAFC] border border-[#D9E4EC] text-xs font-bold text-[#243746] flex items-center gap-2"
                  >
                    <span>{planName}:</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#294B68] text-white text-[10px]">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue Highlight Subcard */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-emerald-800">Total Revenue Collected</div>
                <div className="text-base font-extrabold text-emerald-900">{kpis?.totalRevenueCollected || "$0.00"}</div>
              </div>
            </div>
            <Link
              href="/admin/billing"
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline"
            >
              Billing &amp; Invoices →
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Clients & Live Operational Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Clients Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#D9E4EC] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#D9E4EC]/60">
            <div>
              <h3 className="text-lg font-bold text-[#243746] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#294B68]" />
                <span>Recent Clients Directory</span>
              </h3>
              <p className="text-xs text-[#64748B]">Newly registered and enrolled AgeWellRI members</p>
            </div>
            <Link
              href="/admin/clients"
              className="text-xs font-bold text-[#5E8FB2] hover:text-[#294B68] flex items-center gap-1 hover:underline"
            >
              <span>View All Directory ({kpis?.totalClientsCount ?? 0})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#D9E4EC] bg-[#F7FAFC]">
                  <th className="py-3 px-3.5 font-bold text-[#64748B]">Client ID</th>
                  <th className="py-3 px-3.5 font-bold text-[#64748B]">Client Name</th>
                  <th className="py-3 px-3.5 font-bold text-[#64748B]">State</th>
                  <th className="py-3 px-3.5 font-bold text-[#64748B]">Plan</th>
                  <th className="py-3 px-3.5 font-bold text-[#64748B]">Status</th>
                  <th className="py-3 px-3.5 font-bold text-[#64748B] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E4EC]/60">
                {stats.recentClients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#64748B]">
                      No client records found.
                    </td>
                  </tr>
                ) : (
                  stats.recentClients.map((client) => (
                    <tr key={client.id} className="hover:bg-[#F7FAFC] transition-colors">
                      <td className="py-3 px-3.5 font-mono font-bold text-[#294B68]">{client.id}</td>
                      <td className="py-3 px-3.5">
                        <span className="font-bold text-[#243746] block">{client.name}</span>
                        <span className="text-[11px] text-[#64748B]">{client.email}</span>
                      </td>
                      <td className="py-3 px-3.5 font-semibold text-[#243746]">{client.state}</td>
                      <td className="py-3 px-3.5 font-medium text-[#64748B]">{client.planName}</td>
                      <td className="py-3 px-3.5">
                        <ClientStatusBadge status={client.status} />
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <Link
                          href={`/admin/clients/${client.id}`}
                          className="px-2.5 py-1 rounded-lg bg-[#EAF3F8] hover:bg-[#294B68] text-[#294B68] hover:text-white font-bold text-[11px] transition-colors inline-block"
                        >
                          Manage →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Operational Audit Stream (1 Col) */}
        <div className="bg-white rounded-3xl border border-[#D9E4EC] p-6 shadow-xs space-y-4">
          <div className="pb-2 border-b border-[#D9E4EC]/60">
            <h3 className="text-base font-bold text-[#243746] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#294B68]" />
              <span>Live Activity Stream</span>
            </h3>
            <p className="text-xs text-[#64748B]">Real-time operational audit log</p>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {stats.recentActivity.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#64748B]">
                No recent activity recorded.
              </div>
            ) : (
              stats.recentActivity.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl border border-[#D9E4EC]/70 bg-[#F7FAFC] space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                    <span className="font-bold text-[#294B68] capitalize">{act.action}</span>
                    <span>{act.time}</span>
                  </div>
                  <p className="text-[#243746] font-medium text-[11px] leading-relaxed">
                    {act.details}
                  </p>
                  <div className="text-[10px] text-[#64748B] pt-0.5">
                    Actor: <strong className="text-[#243746]">{act.performedBy}</strong>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddClientModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
      <AdminScheduleModal isOpen={scheduleModalOpen} onClose={() => setScheduleModalOpen(false)} />
    </div>
  );
}
