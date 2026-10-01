"use client";

import React from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Calendar as CalendarIcon,
  Trash2,
  Loader2,
} from "lucide-react";
import { AppointmentItem } from "@/redux/features/appointment/appointmentTypes";
import { useCancelAppointmentMutation } from "@/redux/features/appointment/appointmentApi";
import {
  confirmDelete,
  showSuccessAlert,
  showErrorAlert,
  showToast,
} from "@/lib/alerts/sweetalert";

interface VisitDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentItem | any | null;
  onReschedule?: (appointment: any) => void;
  onSuccess?: () => void;
}

export function VisitDetailsModal({
  isOpen,
  onClose,
  appointment,
  onReschedule,
  onSuccess,
}: VisitDetailsModalProps) {
  const [cancelAppointment, { isLoading: isCancelling }] = useCancelAppointmentMutation();

  if (!isOpen || !appointment) return null;

  const statusLower = (appointment.status || "").toLowerCase();
  const isCompleted = statusLower === "completed";
  const isCancelled = statusLower === "cancelled";
  const isRequested = statusLower === "requested" || (!appointment.technicianId && !isCompleted && !isCancelled);
  const isScheduled = !isCompleted && !isCancelled;

  // Format date readable e.g. "Nov 2, 2026"
  const formattedDate = (() => {
    try {
      const d = new Date(appointment.date);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
      return appointment.date;
    } catch {
      return appointment.date;
    }
  })();

  const handleCancel = async () => {
    const confirmed = await confirmDelete({
      title: "Cancel this scheduled visit?",
      text: `Are you sure you want to cancel your ${appointment.serviceType} visit on ${formattedDate}? Your visit quota will be restored immediately.`,
      confirmButtonText: "Yes, Cancel Visit",
      cancelButtonText: "Keep Appointment",
    });

    if (!confirmed) return;

    try {
      showToast("Cancelling scheduled visit...", "info");
      await cancelAppointment({
        id: appointment.id,
        reason: "Client cancelled from visit details",
      }).unwrap();

      onClose();
      await showSuccessAlert(
        "Visit Cancelled",
        "Your visit has been successfully cancelled and your visit entitlement quota has been restored."
      );
      if (onSuccess) onSuccess();
    } catch (err: any) {
      showErrorAlert(
        "Cancellation Failed",
        err?.data?.message || err?.message || "Could not cancel appointment."
      );
    }
  };

  const technicianName = appointment.technicianName || (isRequested ? "Specialist Assignment Pending" : "Assigned Specialist");
  const technicianTitle = appointment.technicianTitle || (isRequested ? "Our team is assigning a certified specialist to your visit" : "Senior Home Safety Specialist® certified by Age Safe® America.");
  const avatarColor = appointment.technicianColor || "#D97706";
  const initial = technicianName ? technicianName.trim().charAt(0).toUpperCase() : "S";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <div
        className="relative bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#D9E4EC] z-10 space-y-5 animate-in zoom-in-95 duration-200"
        style={{ maxWidth: "520px" }}
      >
        {/* Header matching screenshot */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center shrink-0 border ${
                isCompleted
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-[#EAF3F8] text-[#294B68] border-[#D9E4EC]"
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" />
              ) : (
                <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.8]" />
              )}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#243746] uppercase leading-snug">
                {appointment.serviceType || "Plan Safety Visit"}
              </h3>
              <div className="mt-1.5">
                {isCompleted ? (
                  <span className="inline-block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border border-emerald-300 text-emerald-700 bg-emerald-50">
                    COMPLETE
                  </span>
                ) : isRequested ? (
                  <span className="inline-block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border border-amber-300 text-amber-800 bg-amber-50">
                    REQUESTED
                  </span>
                ) : (
                  <span className="inline-block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border border-[#38BDF8] text-[#0284C7] bg-[#F0F9FF]">
                    SCHEDULED
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#D9E4EC] hover:border-[#94A3B8] text-[#64748B] hover:text-[#243746] flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visit Details Cards */}
        <div className="space-y-4">
          {/* Card 1: Scheduled Date & Time Window */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-5 bg-white rounded-2xl border border-[#D9E4EC]">
            <div>
              <span className="block text-xs uppercase tracking-wider text-[#64748B] font-bold">
                SCHEDULED DATE
              </span>
              <span className="text-sm sm:text-base font-bold text-[#243746] mt-1 block">
                {formattedDate}
              </span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wider text-[#64748B] font-bold">
                TIME WINDOW
              </span>
              <span className="text-sm sm:text-base font-bold text-[#243746] mt-1 block">
                {appointment.timeSlot || "10:00 AM – 12:00 PM"}
              </span>
            </div>
          </div>

          {/* Card 2: Assigned Safety Specialist */}
          <div className="p-4 sm:p-5 rounded-2xl border border-[#D9E4EC] bg-white space-y-2.5">
            <div className="text-xs uppercase tracking-wider text-[#5E8FB2] font-extrabold">
              ASSIGNED SAFETY SPECIALIST
            </div>
            <div className="flex items-center gap-3.5">
              <div
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-xs shrink-0"
                style={{ backgroundColor: avatarColor }}
              >
                {initial}
              </div>
              <div className="min-w-0">
                <div className="text-sm sm:text-base font-bold text-[#243746] truncate">
                  {technicianName}
                </div>
                <div className="text-xs text-[#5E8FB2] leading-tight font-medium">
                  {technicianTitle}
                </div>
              </div>
            </div>
          </div>

          {appointment.notes && (
            <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 text-amber-900 text-xs leading-relaxed">
              <strong>Member Notes:</strong> {appointment.notes}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2.5">
            {isScheduled && (
              <>
                {onReschedule && (
                  <button
                    type="button"
                    disabled={isCancelling}
                    onClick={() => {
                      onReschedule(appointment);
                    }}
                    className="text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl border border-[#C8DCED] bg-[#F0F6FA] text-[#294B68] hover:bg-[#E2EFF7] flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
                  >
                    <CalendarIcon className="w-4 h-4 text-[#294B68]" />
                    <span>Reschedule Visit</span>
                  </button>
                )}

                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={handleCancel}
                  className={`text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl border flex items-center gap-2 transition-all shadow-2xs ${
                    isCancelling
                      ? "bg-red-50 text-red-700 border-red-300 opacity-90 cursor-wait"
                      : "bg-white text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 cursor-pointer"
                  }`}
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 text-red-600" />
                      <span>Cancel Visit</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            disabled={isCancelling}
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#243746] hover:bg-[#1A2834] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 ml-auto"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
