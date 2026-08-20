"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  FileCheck,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  HeartHandshake,
  ShieldCheck,
  Clock,
  Plus,
} from "lucide-react";
import { getClientDetailById, getClientAuditLogs } from "@/lib/api/admin-api";
import { MasterClientRecord, AuditActivityLog } from "@/lib/types/admin";
import { ClientStatusBadge } from "@/components/admin/client-status-badge";
import { AdminScheduleModal } from "@/components/admin/admin-schedule-modal";

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [client, setClient] = useState<MasterClientRecord | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "appointments" | "reports" | "agreement" | "billing" | "activity">("overview");
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  useEffect(() => {
    getClientDetailById(resolvedParams.id).then((clientData) => {
      if (clientData) {
        setClient(clientData);
        getClientAuditLogs(clientData.id).then(setAuditLogs);
      }
      setLoading(false);
    });
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC]">
        Loading client details...
      </div>
    );
  }

  if (!client) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#5E8FB2] hover:text-[#294B68] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Client Directory</span>
        </Link>
      </div>

      {/* Main Client Card Header */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D9E4EC]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#294B68] text-white flex items-center justify-center font-extrabold text-xl shrink-0">
              {client.firstName[0]}
              {client.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
                  {client.firstName} {client.lastName}
                </h1>
                <span className="font-mono text-xs font-bold text-[#294B68] bg-[#EAF3F8] px-2.5 py-1 rounded-md">
                  {client.id}
                </span>
              </div>
              <p className="text-xs text-[#64748B] flex items-center gap-2 mt-1">
                <span>Plan: <strong>{client.planName}</strong></span>
                <span>•</span>
                <span>Created: {client.createdAt}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ClientStatusBadge status={client.status} />
            <button
              onClick={() => setScheduleModalOpen(true)}
              className="px-4 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Visit</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#D9E4EC] overflow-x-auto pb-1 text-sm font-bold">
          {(["overview", "appointments", "reports", "agreement", "billing", "activity"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 rounded-xl capitalize transition-colors cursor-pointer shrink-0 ${
                activeTab === tab
                  ? "bg-[#294B68] text-white"
                  : "text-[#64748B] hover:bg-[#EAF3F8] hover:text-[#243746]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div className="p-5 bg-[#F7FAFC] rounded-2xl border border-[#D9E4EC] space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#294B68]" /> Contact Information
                </h3>
                <div className="space-y-2 text-sm text-[#243746]">
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#5E8FB2]" /> <strong>{client.email}</strong>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#5E8FB2]" /> <strong>{client.phone}</strong>
                  </p>
                  <p className="flex items-start gap-2 pt-1 border-t border-[#D9E4EC]">
                    <MapPin className="w-4 h-4 text-[#5E8FB2] shrink-0 mt-0.5" />
                    <span>{client.address.street}, {client.address.city}, {client.address.state} {client.address.zip}</span>
                  </p>
                </div>
              </div>

              {/* Plan & Usage */}
              <div className="p-5 bg-[#EAF3F8]/60 rounded-2xl border border-[#5E8FB2]/30 space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#294B68] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Plan &amp; Visit Allowance
                </h3>
                <div className="space-y-2 text-sm text-[#243746]">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Plan Name:</span>
                    <strong className="text-[#294B68]">{client.planName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Quarterly Allowance:</span>
                    <strong>{client.totalVisitsAllowed} visits</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Completed Visits:</span>
                    <strong className="text-[#3F8F6B]">{client.completedVisitsCount} completed</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Remaining Visits:</span>
                    <strong className="text-[#294B68]">{client.remainingVisitsCount} remaining</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Lifecycle Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-xl border border-[#D9E4EC] space-y-1">
                <span className="text-xs text-[#64748B] font-semibold block">Service Agreement</span>
                <span className="text-sm font-bold text-[#243746] capitalize block">
                  {client.agreementStatus.replace("_", " ")}
                </span>
                {client.agreementSignedDate && (
                  <span className="text-[11px] text-[#64748B] block">Signed: {client.agreementSignedDate}</span>
                )}
              </div>

              <div className="p-4 bg-white rounded-xl border border-[#D9E4EC] space-y-1">
                <span className="text-xs text-[#64748B] font-semibold block">Billing &amp; Payment</span>
                <span className="text-sm font-bold text-[#243746] capitalize block">
                  {client.paymentStatus}
                </span>
                <span className="text-[11px] text-[#64748B] block">Next Charge: {client.renewalDate}</span>
              </div>

              <div className="p-4 bg-white rounded-xl border border-[#D9E4EC] space-y-1">
                <span className="text-xs text-[#64748B] font-semibold block">Next Scheduled Visit</span>
                <span className="text-sm font-bold text-[#294B68] block">
                  {client.nextVisitDate || "Not Scheduled"}
                </span>
                <span className="text-[11px] text-[#64748B] block">Renewal: {client.renewalDate}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Activity Audit Log */}
        {activeTab === "activity" && (
          <div className="space-y-4 pt-2">
            <h3 className="text-base font-bold text-[#243746]">Client Operations Audit Trail</h3>
            <div className="space-y-3 divide-y divide-[#D9E4EC]/60">
              {auditLogs.map((log) => (
                <div key={log.id} className="pt-3 flex items-start justify-between text-sm">
                  <div>
                    <span className="font-bold text-[#243746]">{log.action}</span>
                    <p className="text-xs text-[#64748B] mt-0.5">{log.details}</p>
                  </div>
                  <div className="text-right text-xs shrink-0">
                    <span className="font-semibold text-[#294B68] block">{log.performedBy}</span>
                    <span className="text-[#64748B]">{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AdminScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        defaultClientId={client.id}
      />
    </div>
  );
}
