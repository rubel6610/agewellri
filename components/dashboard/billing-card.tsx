"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Loader2,
  FileText,
  Clock,
} from "lucide-react";
import { BillingOverviewData } from "@/redux/features/payment/paymentTypes";
import { useReactivateSubscriptionRenewalMutation } from "@/redux/features/payment/paymentApi";
import {
  confirmCriticalAction,
  showSuccessAlert,
  showErrorAlert,
  showToast,
} from "@/lib/alerts/sweetalert";
import { UpdatePaymentMethodModal } from "./update-payment-method-modal";
import { CancelRenewalModal } from "./cancel-renewal-modal";

interface BillingCardProps {
  billing: BillingOverviewData;
  onRefresh?: () => void;
}

export function BillingCard({ billing, onRefresh }: BillingCardProps) {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [reactivateRenewal, { isLoading: isReactivating }] =
    useReactivateSubscriptionRenewalMutation();

  const handleReactivate = async () => {
    const confirmed = await confirmCriticalAction({
      title: "Reactivate Automatic Renewal?",
      text: `Your membership will automatically renew on ${billing.nextPaymentDate} at your contracted rate of ${billing.nextPaymentAmount}.`,
      confirmButtonText: "Yes, Reactivate Membership",
      isDestructive: false,
    });

    if (!confirmed) return;

    try {
      await reactivateRenewal().unwrap();
      await showSuccessAlert(
        "Auto-Renewal Reactivated",
        `Your membership coverage will continue renewing uninterrupted on ${billing.nextPaymentDate}.`
      );
      if (onRefresh) onRefresh();
    } catch (err: any) {
      showErrorAlert("Reactivation Failed", err?.data?.message || "Failed to reactivate automatic renewal.");
    }
  };

  const isCancelled = billing.cancelAtPeriodEnd || billing.subscriptionStatus === "CANCELLATION_REQUESTED";

  return (
    <>
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-xs space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Subscription &amp; Membership
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-[#EAF3F8] text-[#294B68] border-[#5E8FB2]/30">
                Stripe Card Payment
              </span>
            </div>
            <h3 className="text-2xl font-extrabold text-[#243746] mt-1 flex items-center gap-2">
              <span>{billing.currentPlanName}</span>
              {billing.hasCleaningAddon && (
                <span className="text-xs font-bold text-[#3F8F6B] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  + Cleaning Add-On
                </span>
              )}
            </h3>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold self-start sm:self-auto border ${
              isCancelled
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : billing.isPendingFirstBilling
                ? "bg-sky-50 text-sky-800 border-sky-200"
                : billing.subscriptionStatus === "ACTIVE"
                ? "bg-[#EAF3F8] text-[#3F8F6B] border-[#3F8F6B]/20"
                : "bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            {isCancelled ? (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Ending Period</span>
              </>
            ) : billing.isPendingFirstBilling ? (
              <>
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span>Scheduled for 1st of Month</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active Account</span>
              </>
            )}
          </span>
        </div>

        {/* Informational Banner for New Signups (First Billing Scheduled on 1st of Next Month) */}
        {billing.isPendingFirstBilling && (
          <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 flex items-start gap-3 text-xs text-sky-900 leading-relaxed">
            <ShieldCheck className="w-5 h-5 text-[#294B68] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-[#243746]">Zero-Charge Enrollment Confirmed</p>
              <p className="mt-0.5 text-sky-950">
                You were not charged today. Your payment method is securely saved and your first charge of{" "}
                <strong>{billing.nextPaymentAmount}</strong> will occur on{" "}
                <strong>{billing.firstBillingDate || billing.nextPaymentDate}</strong>, which is also your official Service Commencement Date. After that, billing recurs automatically on the 1st of each month.
              </p>
            </div>
          </div>
        )}

        {/* 3-Column Key Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Current Period / Service Commencement */}
          <div className="p-4 bg-[#F7FAFC] rounded-2xl border border-[#D9E4EC]">
            <span className="text-xs text-[#64748B] font-semibold block">
              {billing.isPendingFirstBilling ? "Service Commencement" : "Current Period"}
            </span>
            <span className="text-base font-bold text-[#243746] mt-1 block">
              {billing.isPendingFirstBilling
                ? (billing.serviceCommencementDate || billing.nextPaymentDate)
                : (billing.currentPeriod || "Active Month")}
            </span>
            <span className="text-[11px] text-[#64748B]">Frequency: {billing.billingFrequency}</span>
          </div>

          {/* Payment Method */}
          <div className="p-4 bg-[#F7FAFC] rounded-2xl border border-[#D9E4EC] flex flex-col justify-between">
            <div>
              <span className="text-xs text-[#64748B] font-semibold block">Saved Payment Method</span>
              <div className="flex items-center gap-2 mt-1">
                <CreditCard className="w-4 h-4 text-[#294B68]" />
                <span className="text-base font-bold text-[#243746]">
                  {billing.paymentMethod.brand} •••• {billing.paymentMethod.last4}
                </span>
              </div>
              <span className="text-[11px] text-[#64748B]">
                Expires: {billing.paymentMethod.expiry}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsUpdateModalOpen(true)}
              className="mt-2 text-xs font-bold text-[#5E8FB2] hover:text-[#294B68] text-left cursor-pointer"
            >
              Update Card →
            </button>
          </div>

          {/* Next Renewal / First Billing */}
          <div className="p-4 bg-[#EAF3F8]/60 rounded-2xl border border-[#5E8FB2]/30">
            <span className="text-xs text-[#294B68] font-bold block">
              {isCancelled
                ? "Service End Date"
                : billing.isPendingFirstBilling
                ? "First Billing Date"
                : "Next Renewal Date"}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4 text-[#294B68]" />
              <span className="text-base font-extrabold text-[#294B68]">
                {billing.nextPaymentDate}
              </span>
            </div>
            <span className="text-xs font-semibold text-[#64748B] mt-0.5 block">
              {isCancelled ? "No renewal charge" : `Amount: ${billing.nextPaymentAmount}`}
            </span>
          </div>
        </div>

        {/* Status / Auto-Renewal Bar */}
        {isCancelled ? (
          <div className="p-4.5 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-amber-900">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Automatic Renewal Cancelled</p>
                <p className="text-amber-800 mt-0.5">
                  Your coverage remains active through {billing.nextPaymentDate}. You will not be charged again.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleReactivate}
              disabled={isReactivating}
              className="px-4 py-2 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs rounded-xl transition-colors shrink-0 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {isReactivating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Reactivating...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reactivate Auto-Renewal</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="p-4.5 bg-[#F7FAFC] rounded-2xl border border-[#D9E4EC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#3F8F6B] shrink-0" />
              <div className="text-xs sm:text-sm text-[#243746]">
                <p>
                  Automatic renewal is <strong>active</strong> for {billing.nextPaymentDate}.
                </p>
                {billing.cancellationCutoffDate && (
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Cancellation cutoff for upcoming renewal: <strong>{billing.cancellationCutoffDate}</strong> (10 days before month end).
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(true)}
                className="px-4 py-2 bg-white border border-[#D9E4EC] hover:bg-[#F0F5F9] text-[#243746] font-bold text-xs rounded-xl transition-colors shrink-0 cursor-pointer shadow-2xs"
              >
                Update Payment Method
              </button>
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(true)}
                className="px-3.5 py-2 text-xs font-bold text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-red-200"
              >
                Cancel Plan
              </button>
            </div>
          </div>
        )}
      </div>

      <UpdatePaymentMethodModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSuccess={() => {
          if (onRefresh) onRefresh();
        }}
      />

      <CancelRenewalModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        planName={billing.currentPlanName}
        endDate={billing.cancellationEffectiveAt || billing.nextPaymentDate}
        cancellationCutoffDate={billing.cancellationCutoffDate}
        onSuccess={() => {
          if (onRefresh) onRefresh();
        }}
      />
    </>
  );
}
