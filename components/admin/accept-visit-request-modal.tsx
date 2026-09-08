"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  UserCheck,
  Calendar,
  Clock,
  MapPin,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Edit3,
  RotateCcw,
} from "lucide-react";
import { AppointmentItem } from "@/redux/features/appointment/appointmentTypes";
import { useGetAllSpecialistsQuery } from "@/redux/features/specialist/specialistApi";
import { useAcceptVisitRequestMutation } from "@/redux/features/appointment/appointmentApi";
import { showSuccessAlert, showErrorAlert } from "@/lib/alerts/sweetalert";

interface AcceptVisitRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentItem | null;
  onSuccess?: () => void;
}

const STANDARD_TIME_SLOTS = [
  "9:00 AM – 11:00 AM",
  "10:00 AM – 12:00 PM",
  "1:30 PM – 3:30 PM",
  "3:30 PM – 5:30 PM",
  "8:00 AM – 10:00 AM",
  "11:00 AM – 1:00 PM",
  "2:00 PM – 4:00 PM",
  "4:00 PM – 6:00 PM",
];

// Helper to normalize time strings for comparison (e.g. "03:30 PM" vs "3:30 PM" or en-dash vs hyphen)
function normalizeTimeString(str: string): string {
  return str
    .replace(/[–—]/g, "-")
    .replace(/\s*-\s*/g, " - ")
    .replace(/\b0(\d:\d{2})/g, "$1")
    .trim()
    .toLowerCase();
}

export function AcceptVisitRequestModal({
  isOpen,
  onClose,
  appointment,
  onSuccess,
}: AcceptVisitRequestModalProps) {
  const { data: specialists = [], isLoading: isLoadingSpecialists } = useGetAllSpecialistsQuery(
    undefined,
    { skip: !isOpen }
  );
  const [acceptVisitRequestMutation, { isLoading: isSubmitting }] = useAcceptVisitRequestMutation();

  const [selectedSpecialistId, setSelectedSpecialistId] = useState<string>("");
  const [adjustedDate, setAdjustedDate] = useState<string>("");
  const [adjustedTimeSlot, setAdjustedTimeSlot] = useState<string>("");
  const [isCustomTime, setIsCustomTime] = useState<boolean>(false);
  const [adminNotes, setAdminNotes] = useState<string>("");

  useEffect(() => {
    if (appointment) {
      // By default, time slot MUST BE the client requested time
      const clientRequestedTime = appointment.timeSlot || "10:00 AM – 12:00 PM";
      setAdjustedTimeSlot(clientRequestedTime);
      setIsCustomTime(false);

      // Pre-fill date (convert from display string or ISO)
      if (appointment.startAt) {
        const isoDate = new Date(appointment.startAt).toISOString().split("T")[0];
        setAdjustedDate(isoDate);
      }
      setAdminNotes("");

      // Auto-suggest specialist matching category
      if (specialists.length > 0) {
        const isCleaning = appointment.serviceCategory === "CLEANING";
        const matched = specialists.find((s) => {
          if (isCleaning) {
            return s.specialties?.some((sp: string) =>
              sp.toLowerCase().includes("cleaning") || sp.toLowerCase().includes("support")
            );
          }
          return s.specialties?.some((sp: string) =>
            sp.toLowerCase().includes("safety") || sp.toLowerCase().includes("fall")
          );
        });

        setSelectedSpecialistId(matched?.id || specialists[0].id);
      }
    }
  }, [appointment, specialists]);

  // Construct dynamic options list with client's requested time cleanly prioritized
  const availableTimeSlots = useMemo(() => {
    if (!appointment) return STANDARD_TIME_SLOTS.map((t) => ({ value: t, label: t }));

    const requested = appointment.timeSlot || "";
    const normRequested = normalizeTimeString(requested);

    const slots: { value: string; label: string; isRequested?: boolean }[] = [];

    // Check if requested time matches any standard slot
    let matchedStandard = false;

    STANDARD_TIME_SLOTS.forEach((slot) => {
      const isReq = normalizeTimeString(slot) === normRequested;
      if (isReq) matchedStandard = true;
      slots.push({
        value: isReq ? requested : slot,
        label: isReq ? `${requested} (Client Requested)` : slot,
        isRequested: isReq,
      });
    });

    // If client requested a non-standard slot, add it at the top!
    if (!matchedStandard && requested) {
      slots.unshift({
        value: requested,
        label: `${requested} (Client Requested)`,
        isRequested: true,
      });
    }

    return slots;
  }, [appointment]);

  if (!isOpen || !appointment) return null;

  const selectedSpecialist = specialists.find((s) => s.id === selectedSpecialistId);
  const clientRequestedTime = appointment.timeSlot || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpecialistId) {
      showErrorAlert("Specialist Required", "Please select a certified specialist to assign to this visit.");
      return;
    }

    const finalTimeSlot = (adjustedTimeSlot || clientRequestedTime).trim();
    if (!finalTimeSlot) {
      showErrorAlert("Time Slot Required", "Please specify a confirmed time slot for the visit.");
      return;
    }

    try {
      await acceptVisitRequestMutation({
        id: appointment.id,
        body: {
          technicianId: selectedSpecialistId,
          technicianName: selectedSpecialist?.name,
          date: adjustedDate || undefined,
          timeSlot: finalTimeSlot,
          notes: adminNotes.trim() || undefined,
        },
      }).unwrap();

      await showSuccessAlert(
        "Visit Request Accepted",
        `Visit confirmed for ${appointment.clientName} on ${adjustedDate || appointment.date} (${finalTimeSlot}). Specialist ${selectedSpecialist?.name} has been dispatched.`
      );

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      showErrorAlert("Acceptance Failed", err?.data?.message || "Failed to accept visit request.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-[#D9E4EC] shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D9E4EC]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
                  Visit Request
                </span>
                <span className="text-xs font-mono font-bold text-[#64748B]">
                  {appointment.clientNumber}
                </span>
              </div>
              <h2 className="text-xl font-black text-[#243746]">
                Accept Visit &amp; Assign Specialist
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#64748B] hover:text-[#243746] rounded-xl hover:bg-[#F0F5F9] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Request Summary Overview Card */}
        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#D9E4EC] space-y-3 text-xs text-[#64748B]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase text-[#94A3B8] block">Member</span>
              <strong className="text-sm font-extrabold text-[#243746]">{appointment.clientName}</strong>
              <span className="block text-[#64748B]">{appointment.clientPhone || appointment.clientEmail}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-[#94A3B8] block">Requested Service</span>
              <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-extrabold bg-[#EAF3F8] text-[#294B68] border border-[#D9E4EC]">
                {appointment.serviceType}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#D9E4EC]/60">
            <div className="flex items-center gap-1.5 font-medium text-[#243746]">
              <Calendar className="w-3.5 h-3.5 text-[#5E8FB2]" />
              <span>{appointment.date}</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-[#243746]">
              <Clock className="w-3.5 h-3.5 text-[#5E8FB2]" />
              <span className="font-bold text-[#294B68]">{appointment.timeSlot}</span>
            </div>
          </div>

          <div className="flex items-start gap-1.5 pt-1 text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-[#5E8FB2] shrink-0 mt-0.5" />
            <span className="line-clamp-2">{appointment.clientAddress}</span>
          </div>

          {appointment.notes && (
            <div className="p-2.5 bg-white rounded-xl border border-[#D9E4EC] text-xs text-[#243746]">
              <strong className="text-[10px] uppercase font-bold text-[#64748B] block mb-0.5">
                Client Instructions:
              </strong>
              &quot;{appointment.notes}&quot;
            </div>
          )}
        </div>

        {/* Acceptance Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Specialist Selection */}
          <div>
            <label className="block text-xs font-bold uppercase text-[#243746] mb-1.5">
              Assign Certified Specialist <span className="text-red-500">*</span>
            </label>

            {isLoadingSpecialists ? (
              <div className="p-3 bg-[#F0F5F9] rounded-xl flex items-center gap-2 text-xs text-[#64748B]">
                <Loader2 className="w-4 h-4 animate-spin text-[#294B68]" />
                <span>Loading available specialists...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <select
                  value={selectedSpecialistId}
                  onChange={(e) => setSelectedSpecialistId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#F0F5F9]/60 border border-[#D9E4EC] rounded-xl text-sm font-bold text-[#243746] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] cursor-pointer"
                >
                  <option value="" disabled>
                    -- Select Specialist to Assign --
                  </option>
                  {specialists.map((spec) => (
                    <option key={spec.id} value={spec.id}>
                      {spec.name} • {spec.title}
                    </option>
                  ))}
                </select>

                {/* Selected Specialist Preview Card */}
                {selectedSpecialist && (
                  <div className="p-3 bg-[#EAF3F8]/50 rounded-xl border border-[#5E8FB2]/20 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-extrabold text-[#294B68]">{selectedSpecialist.name}</div>
                      <div className="text-[#64748B] text-[11px]">{selectedSpecialist.title}</div>
                      {selectedSpecialist.specialties && selectedSpecialist.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedSpecialist.specialties.map((sp: string) => (
                            <span
                              key={sp}
                              className="px-1.5 py-0.5 rounded bg-white text-[10px] font-semibold text-[#294B68] border border-[#D9E4EC]"
                            >
                              {sp}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                      Available
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Date & Time Slot Adjustment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Confirmed Date */}
            <div>
              <label className="block text-xs font-bold uppercase text-[#243746] mb-1">
                Confirmed Date
              </label>
              <input
                type="date"
                value={adjustedDate}
                onChange={(e) => setAdjustedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-medium text-[#243746] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
              />
            </div>

            {/* Confirmed Time Slot */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase text-[#243746]">
                  Confirmed Time Slot
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomTime(!isCustomTime)}
                  className="text-[11px] font-bold text-[#294B68] hover:text-[#1E374D] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3 text-[#5E8FB2]" />
                  <span>{isCustomTime ? "Choose Preset" : "Custom Time"}</span>
                </button>
              </div>

              {isCustomTime ? (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={adjustedTimeSlot}
                    onChange={(e) => setAdjustedTimeSlot(e.target.value)}
                    placeholder="e.g. 2:00 PM – 4:00 PM, 11:15 AM"
                    required
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-[#294B68] rounded-xl text-sm font-bold text-[#243746] focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                  />
                  <span className="text-[10px] text-[#64748B] block">
                    Type any custom time or time window for this visit.
                  </span>
                </div>
              ) : (
                <select
                  value={adjustedTimeSlot}
                  onChange={(e) => {
                    if (e.target.value === "__CUSTOM__") {
                      setIsCustomTime(true);
                    } else {
                      setAdjustedTimeSlot(e.target.value);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-bold text-[#243746] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] cursor-pointer"
                >
                  {availableTimeSlots.map((ts) => (
                    <option key={ts.value} value={ts.value}>
                      {ts.label}
                    </option>
                  ))}
                  <option value="__CUSTOM__">✎ Enter Custom Time...</option>
                </select>
              )}

              {/* Reset to Client Requested indicator */}
              {clientRequestedTime &&
                normalizeTimeString(adjustedTimeSlot) !== normalizeTimeString(clientRequestedTime) && (
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustedTimeSlot(clientRequestedTime);
                      setIsCustomTime(false);
                    }}
                    className="text-[11px] text-amber-700 hover:text-amber-900 font-bold hover:underline mt-1.5 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3 text-amber-600" />
                    <span>Reset to requested: {clientRequestedTime}</span>
                  </button>
                )}
            </div>
          </div>

          {/* Admin Dispatch Notes */}
          <div>
            <label className="block text-xs font-bold uppercase text-[#243746] mb-1">
              Internal Dispatch Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Assigned to specialist. Client requested arrival at front entrance."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-medium text-[#243746] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D9E4EC]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs font-bold text-[#64748B] hover:text-[#243746] bg-[#F0F5F9] hover:bg-[#E2E8F0] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !selectedSpecialistId}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md hover:shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Assigning Specialist...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept &amp; Dispatch Specialist</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
