"use client";

import React, { useState, useEffect } from "react";
import { useCancelSubscriptionRenewalMutation } from "@/redux/features/payment/paymentApi";
import {
  AlertTriangle,
  X,
  Loader2,
  Calendar,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

interface CancelRenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName?: string;
  endDate?: string | Date | null;
  nextRenewalDate?: string;
  cancellationCutoffDate?: string;
  onSuccess?: () => void;
}

function formatServiceEndDate(rawDate?: string | Date | null): string {
  if (!rawDate) return "the end of your current billing period";
  try {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
    return String(rawDate);
  } catch {
    return String(rawDate);
  }
}

export function CancelRenewalModal({
  isOpen,
  onClose,
  planName,
  endDate,
  nextRenewalDate,
  onSuccess,
}: CancelRenewalModalProps) {
  const [reason, setReason] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [resolvedEndDate, setResolvedEndDate] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [cancelRenewal, { isLoading }] = useCancelSubscriptionRenewalMutation();

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setErrorMsg(null);
      setReason("");
      setResolvedEndDate(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const displayPlanName = planName || "AgeWellRI";
  const effectiveDateValue = resolvedEndDate || endDate || nextRenewalDate;
  const displayEndDate = formatServiceEndDate(effectiveDateValue);

  const handleClose = () => {
    if (isLoading) return;
    setIsSuccess(false);
    setErrorMsg(null);
    onClose();
  };

  const handleConfirm = async () => {
    setErrorMsg(null);
    try {
      const res = await cancelRenewal({
        reason: reason.trim() || undefined,
      }).unwrap();

      if (res.success) {
        const effective =
          res.data?.cancellationEffectiveAt ||
          (res as any).cancellationEffectiveAt;
        if (effective) {
          setResolvedEndDate(effective);
        }
        setIsSuccess(true);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        const msg =
          res.message ||
          "Unable to process cancellation request. Please contact support.";
        setErrorMsg(msg);
      }
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.message ||
        "An unexpected error occurred while processing your cancellation. Please try again or reach out to support.";
      setErrorMsg(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#D9E4EC] p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#D9E4EC] pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                isSuccess
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#243746] tracking-tight">
                {isSuccess
                  ? "Your cancellation has been received."
                  : "Cancel Your AgeWellRI Plan"}
              </h2>
              <p className="text-xs text-[#64748B]">
                {isSuccess
                  ? "Membership renewal update confirmed"
                  : "Subscription cancellation review"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-full bg-[#F8FAFC] hover:bg-[#F0F5F9] text-[#64748B] flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert if any */}
        {errorMsg && (
          <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-800 font-semibold flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        {/* SUCCESS VIEW */}
        {isSuccess ? (
          <div className="space-y-5">
            <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-2">
              <p className="text-sm font-extrabold text-emerald-900">
                Your service will end on {displayEndDate}. You won&apos;t be
                charged again.
              </p>
              <p className="text-xs text-emerald-800 font-medium">
                A confirmation has been emailed to you.
              </p>
            </div>

            <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] text-xs text-[#475569] leading-relaxed">
              <p className="font-semibold text-[#243746]">
                We&apos;re sorry to see you go — you&apos;re always welcome
                back. Just sign in again anytime.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 bg-[#294B68] hover:bg-[#1E374D] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* CONFIRMATION VIEW */
          <div className="space-y-5">
            <p className="text-sm font-semibold text-[#243746] leading-relaxed">
              You&apos;re about to cancel your{" "}
              <strong className="font-bold text-[#294B68]">
                {displayPlanName}
              </strong>{" "}
              subscription.
            </p>

            <div className="space-y-3 bg-[#F8FAFC] p-4.5 rounded-2xl border border-[#D9E4EC]">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#243746]">
                Here&apos;s what happens:
              </h4>
              <ul className="space-y-2.5 text-xs text-[#475569] leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-[#294B68] font-black text-sm leading-none mt-0.5">
                    •
                  </span>
                  <span>
                    Your visits continue through the end of your current paid
                    month (<strong>{displayEndDate}</strong>).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#294B68] font-black text-sm leading-none mt-0.5">
                    •
                  </span>
                  <span>
                    Auto-renewal is turned off — you won&apos;t be charged
                    again.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#294B68] font-black text-sm leading-none mt-0.5">
                    •
                  </span>
                  <span>
                    To stop next month&apos;s charge, cancellation must be
                    submitted at least 10 days before the 1st of next month (by the 20th of the current month).
                  </span>
                </li>
              </ul>
            </div>

            {new Date().getDate() > 20 && (
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-extrabold flex items-center gap-1.5 text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>10-Day Cutoff Deadline Passed</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Auto-renewal cancellation must be requested at least 10 days prior to the 1st of the next month (on or before the 20th of the current month). Because today is past the 20th, cancellation for the upcoming renewal cannot be processed.
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="cancellation-reason"
                className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5"
              >
                Reason for cancellation (optional)
              </label>
              <textarea
                id="cancellation-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Let us know how we can improve our services..."
                rows={2}
                disabled={isLoading || new Date().getDate() > 20}
                className="w-full p-3 text-xs font-medium text-[#243746] bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] transition-colors disabled:opacity-50"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#D9E4EC]">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#D9E4EC] text-xs font-bold text-[#64748B] hover:text-[#243746] hover:bg-[#F8FAFC] transition-colors cursor-pointer order-2 sm:order-1 disabled:opacity-50"
              >
                Keep My Plan
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading || new Date().getDate() > 20}
                title={
                  new Date().getDate() > 20
                    ? "Cancellation cutoff has passed (must cancel by the 20th of the month)"
                    : "Confirm Cancellation"
                }
                className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing cancellation...</span>
                  </>
                ) : (
                  <span>Confirm Cancellation</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
