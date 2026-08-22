"use client";

import React, { useState } from "react";
import { useCancelSubscriptionRenewalMutation } from "@/redux/features/payment/paymentApi";
import { AlertTriangle, X, Loader2, Calendar } from "lucide-react";
import {
  confirmCriticalAction,
  showSuccessAlert,
  showErrorAlert,
} from "@/lib/alerts/sweetalert";

interface CancelRenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextRenewalDate: string;
  onSuccess: () => void;
}

export function CancelRenewalModal({
  isOpen,
  onClose,
  nextRenewalDate,
  onSuccess,
}: CancelRenewalModalProps) {
  const [reason, setReason] = useState("");
  const [cancelRenewal, { isLoading }] = useCancelSubscriptionRenewalMutation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setErrorMsg(null);

    const confirmed = await confirmCriticalAction({
      title: "Confirm Cancellation of Renewal?",
      text: `Your coverage and scheduled safety visits will remain active through ${nextRenewalDate}. You will not be charged again.`,
      confirmButtonText: "Yes, Cancel Renewal",
      isDestructive: true,
    });

    if (!confirmed) return;

    try {
      const res = await cancelRenewal({ reason: reason.trim() || undefined }).unwrap();
      if (res.success) {
        onSuccess();
        onClose();
        await showSuccessAlert(
          "Auto-Renewal Cancelled",
          `Your active membership coverage continues until ${nextRenewalDate}.`
        );
      } else {
        const msg = res.message || "Failed to cancel renewal.";
        setErrorMsg(msg);
        showErrorAlert("Cancellation Error", msg);
      }
    } catch (err: any) {
      const msg = err.data?.message || err.message || "Error cancelling renewal.";
      setErrorMsg(msg);
      showErrorAlert("Cancellation Failed", msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#D9E4EC] p-6 sm:p-8 space-y-6 relative">
        <div className="flex items-center justify-between border-b border-[#D9E4EC] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#C28A3A] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#243746]">Cancel Automatic Renewal</h3>
              <p className="text-xs text-[#64748B]">Manage your subscription status</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F8FAFC] hover:bg-[#F0F5F9] text-[#64748B] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 text-xs text-red-700 font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] space-y-2 text-xs text-[#475569] leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-[#243746]">
            <Calendar className="w-4 h-4 text-[#294B68]" />
            <span>Coverage continues until {nextRenewalDate}</span>
          </div>
          <p>
            Your current quarterly safety oversight and scheduled visits will remain active through the end of your billing cycle. You will not be charged for the upcoming quarter.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
            Reason for cancellation (optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Let us know how we can improve our services..."
            rows={3}
            className="w-full p-3 text-xs font-medium text-[#243746] bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D9E4EC]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl border border-[#D9E4EC] text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC] cursor-pointer"
          >
            Keep Subscription
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Cancelling...</span>
              </>
            ) : (
              <span>Confirm Cancellation</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
