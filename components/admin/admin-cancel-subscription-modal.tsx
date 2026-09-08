"use client";

import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  Ban,
  Calendar,
  Clock,
  ShieldAlert,
  Loader2,
  Info,
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
  const [immediate, setImmediate] = useState<boolean>(false);
  const [reason, setReason] = useState<string>("");
  const [cancelSubscription, { isLoading }] = useAdminCancelSubscriptionMutation();

  if (!isOpen || !subscription) return null;

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await cancelSubscription({
        id: subscription.id,
        immediate,
        reason: reason.trim() || undefined,
      }).unwrap();

      await showSuccessAlert(
        immediate ? "Subscription Cancelled Immediately" : "Cancellation Scheduled",
        res.message || "Subscription updated successfully."
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
              <span>Quarterly Rate:</span>
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

          {/* Cancellation Type Options */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#243746] uppercase tracking-wider block">
              Select Cancellation Policy:
            </label>

            {/* Option 1: End of Period */}
            <label
              className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                !immediate
                  ? "bg-[#EAF3F8]/50 border-[#294B68] ring-1 ring-[#294B68]"
                  : "bg-white border-[#D9E4EC] hover:bg-[#F8FAFC]"
              }`}
            >
              <input
                type="radio"
                name="cancellationType"
                checked={!immediate}
                onChange={() => setImmediate(false)}
                className="mt-1 text-[#294B68] focus:ring-[#294B68]"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#243746]">
                    Cancel at End of Current Period (Recommended)
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Standard
                  </span>
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  The client continues receiving care visits until the end of their current cycle (<strong>{subscription.nextRenewalDate}</strong>). Auto-renewal is disabled and no further charges will occur.
                </p>
              </div>
            </label>

            {/* Option 2: Immediate */}
            <label
              className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                immediate
                  ? "bg-rose-50/50 border-rose-500 ring-1 ring-rose-500"
                  : "bg-white border-[#D9E4EC] hover:bg-[#F8FAFC]"
              }`}
            >
              <input
                type="radio"
                name="cancellationType"
                checked={immediate}
                onChange={() => setImmediate(true)}
                className="mt-1 text-rose-600 focus:ring-rose-600"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-rose-900">
                    Cancel Immediately (Revoke Access Right Now)
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200">
                    Immediate
                  </span>
                </div>
                <p className="text-xs text-rose-800/80 leading-relaxed">
                  Terminates subscription coverage today. Cancels any remaining scheduled appointments and disables active client portal services.
                </p>
              </div>
            </label>
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
              className={`px-5 py-2.5 font-bold text-xs rounded-xl text-white shadow-sm flex items-center gap-2 transition-all cursor-pointer ${
                immediate
                  ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                  : "bg-[#294B68] hover:bg-[#1E364B] shadow-[#294B68]/20"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4" />
                  <span>{immediate ? "Cancel Immediately" : "Confirm Schedule Cancellation"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
