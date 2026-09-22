"use client";

import React, { useState } from "react";
import {
  X,
  Ban,
  Calendar,
  Clock,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { AdminSubscriptionItem } from "@/redux/features/payment/paymentTypes";
import { useAdminCancelSubscriptionMutation } from "@/redux/features/payment/paymentApi";
import { showSuccessAlert, showErrorAlert } from "@/lib/alerts/sweetalert";

interface AdminCancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: AdminSubscriptionItem | null;
  onSuccess?: () => void;
}

export function AdminCancelSubscriptionModal({
  isOpen,
  onClose,
  subscription,
  onSuccess,
}: AdminCancelSubscriptionModalProps) {
  const [reason, setReason] = useState<string>("");
  const [cancelSubscription, { isLoading }] = useAdminCancelSubscriptionMutation();

  if (!isOpen || !subscription) return null;

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await cancelSubscription({
        id: subscription.id,
        immediate: false,
        reason: reason.trim() || undefined,
      }).unwrap();

      await showSuccessAlert(
        "Cancellation Scheduled",
        res.message || "Subscription updated successfully. Auto-renewal has been cancelled at period end."
      );
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      showErrorAlert(
        "Cancellation Failed",
        err?.data?.message || err?.message || "Failed to cancel subscription."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#D9E4EC] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#D9E4EC] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 font-bold shrink-0">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#243746]">Cancel Client Subscription</h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                {subscription.clientName} ({subscription.clientNumber})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#64748B] hover:text-[#243746] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleConfirmCancel} className="p-6 space-y-5 overflow-y-auto">
          {/* Subscription Summary Box */}
          <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] space-y-2 text-xs">
            <div className="flex justify-between items-center text-[#64748B]">
              <span>Active Plan Tier:</span>
              <strong className="text-[#243746]">{subscription.planName}</strong>
            </div>
            <div className="flex justify-between items-center text-[#64748B]">
              <span>Monthly Rate:</span>
              <strong className="text-[#243746]">{subscription.planPrice}</strong>
            </div>
            <div className="flex justify-between items-center text-[#64748B]">
              <span>Current Period:</span>
              <strong className="text-[#243746]">{subscription.currentPeriod}</strong>
            </div>
            <div className="flex justify-between items-center text-[#64748B]">
              <span>Next Renewal Date:</span>
              <strong className="text-[#243746]">{subscription.nextRenewalDate}</strong>
            </div>
          </div>

          {/* Cancellation Notice Box */}
          <div className="p-4 bg-[#EAF3F8]/60 rounded-2xl border border-[#294B68]/20 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#243746]">
              <Clock className="w-4 h-4 text-[#294B68]" />
              <span>Cancel at End of Current Period</span>
            </div>
            <p className="text-xs text-[#475569] leading-relaxed">
              The client will continue receiving service visits through the end of their current billing cycle (<strong>{subscription.nextRenewalDate || subscription.currentPeriod}</strong>). Auto-renewal will be turned off and no further charges will occur.
            </p>
          </div>

          {/* Reason Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#243746]">
              Reason / Admin Internal Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Client requested via telephone, relocating out of state, administrative closure..."
              className="w-full p-3 bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl text-xs font-medium text-[#243746] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#294B68]"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-[#D9E4EC] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white border border-[#D9E4EC] text-[#64748B] hover:text-[#243746] hover:bg-[#F8FAFC] font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Keep Active
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 font-bold text-xs rounded-xl text-white shadow-sm flex items-center gap-2 transition-all cursor-pointer bg-[#294B68] hover:bg-[#1E364B] shadow-[#294B68]/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4" />
                  <span>Confirm Cancellation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
