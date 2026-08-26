"use client";

import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { getAdminStats, getAdminClients, getAdminAppointments } from "@/lib/api/admin-api";
import { AdminStats, MasterClientRecord, AdminAppointment } from "@/lib/types/admin";
import { StatKpiCard } from "@/components/admin/stat-kpi-card";
import { AttentionPanel } from "@/components/admin/attention-panel";
import { ClientStatusBadge } from "@/components/admin/client-status-badge";
import { AddClientModal } from "@/components/admin/add-client-modal";
import { AdminScheduleModal } from "@/components/admin/admin-schedule-modal";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [clients, setClients] = useState<MasterClientRecord[]>([]);
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  useEffect(() => {
    Promise.all([getAdminStats(), getAdminClients(), getAdminAppointments()]).then(
      ([statsData, clientData, apptData]) => {
        setStats(statsData);
        setClients(clientData);
        setAppointments(apptData);
        setLoading(false);
      }
    );
  }, []);

  if (loading || !stats) {
    return (
      <div className="p-12 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC]">
        Loading AgeWellRI Admin Dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#D9E4EC]/60">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#243746] tracking-tight">
            Good morning, Sarah
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] mt-1">
            Here&apos;s what&apos;s happening across AgeWellRI operations today.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#294B68] bg-[#EAF3F8] px-3.5 py-2 rounded-xl border border-[#5E8FB2]/30 shrink-0">
          <Clock className="w-4 h-4 text-[#5E8FB2]" />
          <span>Operational Status: <strong>All Systems Normal</strong></span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatKpiCard
          title="Active Clients"
          value={stats.activeClientsCount}
          subtitle={stats.activeClientsDelta}
          icon={<Users className="w-5 h-5" />}
          href="/admin/clients"
        />
        <StatKpiCard
          title="Pending Onboarding"
          value={stats.pendingOnboardingCount}
          subtitle="Needs attention"
          icon={<UserPlus className="w-5 h-5 text-[#C28A3A]" />}
          href="/admin/clients?status=onboarding"
          urgent
        />
        <StatKpiCard
          title="Upcoming Visits"
          value={stats.upcomingVisitsCount}
          subtitle="Next 7 days"
          icon={<CalendarCheck className="w-5 h-5" />}
          href="/admin/appointments"
        />
        <StatKpiCard
          title="Reports Pending"
          value={stats.reportsPendingCount}
          subtitle="Need upload"
          icon={<FileCheck2 className="w-5 h-5 text-[#5E8FB2]" />}
          href="/admin/reports"
          urgent
        />
        <StatKpiCard
          title="Payments Due"
          value={stats.paymentsDueCount}
          subtitle="Need attention"
          icon={<CreditCard className="w-5 h-5 text-[#C95C5C]" />}
          href="/admin/billing"
          urgent
        />
        <StatKpiCard
          title="Renewals Soon"
          value={stats.renewalsUpcomingCount}
          subtitle="Next 30 days"
          icon={<RefreshCw className="w-5 h-5" />}
          href="/admin/subscriptions"
        />
      </div>

      {/* Attention Required Panel */}
      <AttentionPanel />

      {/* Today's Operations Section */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-[#243746]">Today&apos;s Field Operations</h3>
            <p className="text-xs text-[#64748B]">Scheduled home care and safety visits for today</p>
          </div>
          <Link
            href="/admin/calendar"
            className="text-xs font-bold text-[#5E8FB2] hover:text-[#294B68] flex items-center gap-1 hover:underline"
          >
            <span>View Calendar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {appointments.slice(0, 3).map((appt) => (
            <div
              key={appt.id}
              className="p-4 rounded-xl border border-[#D9E4EC] bg-[#F7FAFC] space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#294B68]">{appt.timeSlot}</span>
                <span className="px-2 py-0.5 rounded-full bg-[#EAF3F8] text-[#294B68]">
                  {appt.serviceType}
                </span>
              </div>

              <div>
                <Link
                  href={`/admin/clients/${appt.clientId}`}
                  className="font-bold text-[#243746] text-sm hover:underline"
                >
                  {appt.clientName}
                </Link>
                <p className="text-xs text-[#64748B]">{appt.clientAddress}</p>
              </div>

              <div className="pt-2 border-t border-[#D9E4EC]/60 flex items-center justify-between text-xs">
                <span className="text-[#64748B]">Specialist: <strong>{appt.technicianName}</strong></span>
                <span className="font-bold text-[#3F8F6B]">Scheduled</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Clients Section */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-[#243746]">Recent Clients</h3>
            <p className="text-xs text-[#64748B]">Latest client profiles and onboarding states</p>
          </div>
          <Link
            href="/admin/clients"
            className="text-xs font-bold text-[#5E8FB2] hover:text-[#294B68] flex items-center gap-1 hover:underline"
          >
            <span>View All Clients ({clients.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#D9E4EC] text-xs font-bold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-3">Client ID</th>
                <th className="py-3 px-3">Name</th>
                <th className="py-3 px-3">Plan</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Agreement</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E4EC]/60 text-xs font-medium text-[#243746]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#64748B]">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#294B68]" />
                      <span>Loading client records...</span>
                    </div>
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#64748B]">
                    No client records available.
                  </td>
                </tr>
              ) : (
                clients.slice(0, 5).map((c) => (
                  <tr key={c.id} className="hover:bg-[#F7FAFC]">
                    <td className="py-3.5 px-3 font-mono font-bold text-[#294B68]">{c.id}</td>
                    <td className="py-3.5 px-3 font-bold">{c.firstName} {c.lastName}</td>
                    <td className="py-3.5 px-3">{c.planName}</td>
                    <td className="py-3.5 px-3">
                      <ClientStatusBadge status={c.status} />
                    </td>
                    <td className="py-3.5 px-3 capitalize">{c.agreementStatus.replace("_", " ")}</td>
                    <td className="py-3.5 px-3 capitalize">{c.paymentStatus}</td>
                    <td className="py-3.5 px-3 text-right">
                      <Link
                        href={`/admin/clients/${c.id}`}
                        className="font-bold text-[#5E8FB2] hover:underline"
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

      {/* Modals */}
      <AddClientModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
      <AdminScheduleModal isOpen={scheduleModalOpen} onClose={() => setScheduleModalOpen(false)} />
    </div>
  );
}
