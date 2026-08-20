"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminSubscriptions } from "@/lib/api/admin-api";
import { AdminSubscription } from "@/lib/types/admin";
import { RefreshCw, Calendar, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { AdminScheduleModal } from "@/components/admin/admin-schedule-modal";

export default function SubscriptionsAdminPage() {
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);

  useEffect(() => {
    getAdminSubscriptions().then((data) => {
      setSubscriptions(data);
      setLoading(false);
    });
  }, []);

  const handleOpenScheduleModal = (clientId: string) => {
    setSelectedClientId(clientId);
    setScheduleModalOpen(true);
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC]">
        Loading subscriptions &amp; renewal tracking...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#D9E4EC]/60">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
          Subscriptions &amp; Quarterly Renewals
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          Track upcoming quarterly renewals, auto-renew billing states, and separate next-quarter visit scheduling.
        </p>
      </div>

      {/* Alert Notice */}
      <div className="p-5 bg-[#EAF3F8] border border-[#5E8FB2]/30 rounded-2xl flex items-center justify-between gap-4 text-xs sm:text-sm text-[#243746]">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[#294B68] shrink-0" />
          <span>
            <strong>Note for Admin Staff:</strong> Subscription renewal billing occurs automatically. Visit scheduling for the next quarter must be allocated separately for each client.
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#D9E4EC] text-xs font-bold text-[#64748B] uppercase tracking-wider">
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Plan</th>
                <th className="py-3.5 px-4">Current Period</th>
                <th className="py-3.5 px-4">Renewal Date</th>
                <th className="py-3.5 px-4">Billing Status</th>
                <th className="py-3.5 px-4">Next Quarter Visits</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E4EC]/60 text-sm font-medium text-[#243746]">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-[#F7FAFC]">
                  <td className="py-4 px-4 font-bold">
                    <Link href={`/admin/clients/${sub.clientId}`} className="hover:underline">
                      {sub.clientName}
                    </Link>
                  </td>
                  <td className="py-4 px-4 text-xs font-semibold text-[#294B68]">{sub.planName}</td>
                  <td className="py-4 px-4 text-xs text-[#64748B]">{sub.currentPeriod}</td>
                  <td className="py-4 px-4 font-bold text-[#243746]">{sub.renewalDate}</td>
                  <td className="py-4 px-4">
                    {sub.billingStatus === "failed" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-[#C95C5C]">
                        <AlertTriangle className="w-3.5 h-3.5" /> Payment Failed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAF3F8] text-[#3F8F6B]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Renewal
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {sub.visitSchedulingStatus === "scheduled" ? (
                      <span className="text-xs font-bold text-[#3F8F6B]">All 12 Visits Scheduled</span>
                    ) : (
                      <span className="text-xs font-bold text-[#C28A3A]">Visits Need Scheduling</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleOpenScheduleModal(sub.clientId)}
                      className="px-3 py-1.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Schedule Visits
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AdminScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        defaultClientId={selectedClientId}
      />
    </div>
  );
}
