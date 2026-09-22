import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Loader2,
  UserCheck,
  AlertCircle,
  Key,
  Hash,
  Bell,
  HelpCircle,
  Plus,
  Star,
  Lock,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { ServicePlan } from "@/lib/types/dashboard";
import { formatDuration } from "@/lib/utils";
import { parsePlanDurationHours } from "@/redux/features/plan/planTypes";
import { useGetVisitEntitlementsQuery } from "@/redux/features/payment/paymentApi";
import { useScheduleAppointmentMutation } from "@/redux/features/appointment/appointmentApi";
import {
  useGetClientAccessMethodsQuery,
  ClientAccessMethod,
} from "@/redux/features/client/clientApi";
import { AccessMethodModal } from "./access-method-modal";
import {
  confirmCriticalAction,
  showSuccessAlert,
  showErrorAlert,
} from "@/lib/alerts/sweetalert";

interface ScheduleVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: ServicePlan | null;
}

function formatMinutesToTimeString(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinute = String(minutes).padStart(2, "0");
  return `${String(displayHour).padStart(2, "0")}:${displayMinute} ${ampm}`;
}

function timeToMinutes(timeStr: string): number {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;
  let hour = parseInt(match[1], 10);
  const min = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && hour < 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  return hour * 60 + min;
}

function generateStandardTimeSlots(durationHours: number): string[] {
  if (durationHours === 1) {
    return [
      "08:00 AM – 09:00 AM",
      "09:00 AM – 10:00 AM",
      "10:00 AM – 11:00 AM",
      "11:00 AM – 12:00 PM",
      "12:00 PM – 01:00 PM",
      "01:00 PM – 02:00 PM",
      "02:00 PM – 03:00 PM",
      "03:00 PM – 04:00 PM",
      "04:00 PM – 05:00 PM",
      "05:00 PM – 06:00 PM",
    ];
  }
  if (durationHours === 2) {
    return [
      "08:00 AM – 10:00 AM",
      "10:00 AM – 12:00 PM",
      "01:00 PM – 03:00 PM",
      "03:00 PM – 05:00 PM",
      "04:00 PM – 06:00 PM",
    ];
  }
  const slots: string[] = [];
  const startMinute = 8 * 60;
  const endMinute = 18 * 60;
  const stepMinute = durationHours * 60;
  for (let m = startMinute; m + stepMinute <= endMinute; m += stepMinute) {
    slots.push(
      `${formatMinutesToTimeString(m)} – ${formatMinutesToTimeString(m + stepMinute)}`
    );
  }
  return slots.length > 0
    ? slots
    : ["08:00 AM – 10:00 AM", "10:00 AM – 12:00 PM", "01:00 PM – 03:00 PM", "04:00 PM – 06:00 PM"];
}

function getAvailableStartTimes(durationHours: number): string[] {
  const maxStartMin = (18 - durationHours) * 60;
  const startTimes: string[] = [];
  for (let m = 8 * 60; m <= maxStartMin; m += 30) {
    startTimes.push(formatMinutesToTimeString(m));
  }
  return startTimes;
}

function calculateEndTime(startStr: string, durationHours: number): string {
  const startMin = timeToMinutes(startStr);
  const endMin = Math.min(18 * 60, startMin + durationHours * 60);
  return formatMinutesToTimeString(endMin);
}

export function ScheduleVisitModal({ isOpen, onClose, plan }: ScheduleVisitModalProps) {
  const { data: entitlementsRes, isLoading: isEntitlementsLoading } = useGetVisitEntitlementsQuery(undefined, { skip: !isOpen });
  const { data: accessMethodsRes, isLoading: isAccessMethodsLoading, refetch: refetchAccessMethods } = useGetClientAccessMethodsQuery(undefined, { skip: !isOpen });
  const [scheduleAppointmentMutation, { isLoading: isSubmitting }] = useScheduleAppointmentMutation();

  const entitlements = useMemo(
    () => entitlementsRes?.data?.entitlements || [],
    [entitlementsRes?.data?.entitlements]
  );
  const accessMethods = useMemo(
    () => accessMethodsRes?.data || [],
    [accessMethodsRes?.data]
  );

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<string>("");
  const [selectedServiceName, setSelectedServiceName] = useState<string>("Safety Oversight");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("10:00 AM – 12:00 PM");
  const [timeMode, setTimeMode] = useState<"PRESET" | "CUSTOM">("PRESET");
  const [customStart, setCustomStart] = useState<string>("09:00 AM");
  const [customEnd, setCustomEnd] = useState<string>("11:00 AM");
  const [selectedAccessMethodId, setSelectedAccessMethodId] = useState<string>("");
  const [isNewAccessModalOpen, setIsNewAccessModalOpen] = useState(false);
  const [notes, setNotes] = useState("");

  const periodStartDateStr = entitlementsRes?.data?.billingPeriod?.startDate || "";
  const periodEndDateStr = entitlementsRes?.data?.billingPeriod?.endDate || "";

  const periodStartDate = useMemo(() => {
    return periodStartDateStr ? new Date(periodStartDateStr) : null;
  }, [periodStartDateStr]);

  const periodEndDate = useMemo(() => {
    return periodEndDateStr ? new Date(periodEndDateStr) : null;
  }, [periodEndDateStr]);

  const isAdvanceBooking = useMemo(() => {
    if (!periodStartDateStr) return false;
    const now = new Date();
    const todayMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const start = new Date(periodStartDateStr);
    const startMidnight = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate()
    );
    return todayMidnight.getTime() < startMidnight.getTime();
  }, [periodStartDateStr]);

  // Calendar month navigation state
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (periodStartDateStr) {
      const pDate = new Date(periodStartDateStr);
      return new Date(pDate.getFullYear(), pDate.getMonth(), 1);
    }
    return new Date();
  });

  // Sync viewDate when periodStartDate changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (isAdvanceBooking && periodStartDateStr) {
        const pDate = new Date(periodStartDateStr);
        setViewDate(new Date(pDate.getFullYear(), pDate.getMonth(), 1));
      } else {
        const now = new Date();
        setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
      }
    }
  }, [isOpen, isAdvanceBooking, periodStartDateStr]);

  // Find first available working day (not Sun=0, not Wed=3) on or after commencement
  useEffect(() => {
    if (isOpen && !selectedDate) {
      const now = new Date();
      let d: Date;
      if (isAdvanceBooking && periodStartDateStr) {
        const pDate = new Date(periodStartDateStr);
        d = new Date(pDate.getFullYear(), pDate.getMonth(), pDate.getDate());
      } else {
        d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      }

      // Loop until we find a working day (Mon, Tue, Thu, Fri, Sat)
      while (d.getDay() === 0 || d.getDay() === 3) {
        d.setDate(d.getDate() + 1);
      }

      const yearStr = d.getFullYear();
      const monthStr = String(d.getMonth() + 1).padStart(2, "0");
      const dayStr = String(d.getDate()).padStart(2, "0");
      setSelectedDate(`${yearStr}-${monthStr}-${dayStr}`);
    }
  }, [isOpen, isAdvanceBooking, periodStartDateStr, selectedDate]);

  useEffect(() => {
    if (entitlements.length > 0 && !selectedServiceTypeId) {
      const available = entitlements.find((e) => e.remaining > 0) || entitlements[0];
      if (available) {
        setSelectedServiceTypeId(available.serviceTypeId);
        setSelectedServiceName(available.serviceName);
      }
    }
  }, [entitlements, selectedServiceTypeId]);

  useEffect(() => {
    if (accessMethods.length > 0 && !selectedAccessMethodId) {
      const def = accessMethods.find((m) => m.isDefault) || accessMethods[0];
      if (def) setSelectedAccessMethodId(def.id);
    }
  }, [accessMethods, selectedAccessMethodId]);

  const currentEntitlement = useMemo(() => {
    return (
      entitlements.find((e) => e.serviceTypeId === selectedServiceTypeId) ||
      entitlements[0] ||
      null
    );
  }, [entitlements, selectedServiceTypeId]);

  const planDurationHours = useMemo(() => {
    if (currentEntitlement?.durationMinutes) {
      return Math.max(1, Math.round(currentEntitlement.durationMinutes / 60));
    }
    if (plan?.times) {
      return parsePlanDurationHours(plan.times);
    }
    const name = (selectedServiceName || plan?.name || "").toLowerCase();
    if (name.includes("1 hour") || name.includes("an hour") || name.includes("one hour")) return 1;
    if (name.includes("2 hour") || name.includes("two hour")) return 2;
    return 2;
  }, [currentEntitlement?.durationMinutes, plan?.times, selectedServiceName, plan?.name]);

  const standardTimeSlots = useMemo(() => {
    return generateStandardTimeSlots(planDurationHours);
  }, [planDurationHours]);

  const availableStartTimes = useMemo(() => {
    return getAvailableStartTimes(planDurationHours);
  }, [planDurationHours]);

  useEffect(() => {
    const slots = generateStandardTimeSlots(planDurationHours);
    if (timeMode === "PRESET") {
      if (!slots.includes(selectedTimeSlot)) {
        setSelectedTimeSlot(slots[0] || "10:00 AM – 12:00 PM");
      }
    } else {
      const starts = getAvailableStartTimes(planDurationHours);
      const start = starts.includes(customStart) ? customStart : (starts[2] || starts[0] || "09:00 AM");
      const end = calculateEndTime(start, planDurationHours);
      setCustomStart(start);
      setCustomEnd(end);
      setSelectedTimeSlot(`${start} – ${end}`);
    }
  }, [planDurationHours, timeMode]);

  if (!isOpen) return null;

  const remainingCount = currentEntitlement ? currentEntitlement.remaining : (plan ? plan.remainingVisits : 0);
  const isCurrentServiceExhausted = remainingCount <= 0;
  const areAllServicesExhausted = entitlements.length > 0
    ? entitlements.every((e) => e.remaining <= 0)
    : (plan ? plan.remainingVisits <= 0 : false);

  const selectedAccessMethod = accessMethods.find((m) => m.id === selectedAccessMethodId);

  const handleConfirm = async () => {
    if (isCurrentServiceExhausted) {
      showErrorAlert(
        "No Remaining Visits",
        `You have 0 remaining visits available for ${selectedServiceName} in your current monthly plan.`
      );
      return;
    }

    if (periodStartDate && selectedDate) {
      const selected = new Date(selectedDate + "T00:00:00");
      const start = new Date(
        periodStartDate.getFullYear(),
        periodStartDate.getMonth(),
        periodStartDate.getDate()
      );
      if (selected.getTime() < start.getTime()) {
        showErrorAlert(
          "Invalid Date Selected",
          `Visits must be scheduled on or after your service commencement date (${start.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}).`
        );
        return;
      }
    }

    const confirmed = await confirmCriticalAction({
      title: `Submit ${selectedServiceName} Visit Request?`,
      text: `Request safety visit for ${selectedDate} at ${selectedTimeSlot}? Access info: ${selectedAccessMethod ? selectedAccessMethod.title : "Standard access"}.`,
      confirmButtonText: "Yes, Submit Request",
      isDestructive: false,
    });

    if (!confirmed) return;

    try {
      await scheduleAppointmentMutation({
        serviceTypeId: selectedServiceTypeId,
        serviceType: selectedServiceName,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        notes: notes.trim() || undefined,
        accessMethodId: selectedAccessMethod?.id,
        accessMethodType: selectedAccessMethod?.type,
        accessMethodTitle: selectedAccessMethod?.title,
        accessMethodCode: selectedAccessMethod?.code || undefined,
        accessMethodInstructions: selectedAccessMethod?.instructions || undefined,
      }).unwrap();

      setStep(5);
      await showSuccessAlert(
        "Visit Request Submitted",
        `Your ${selectedServiceName} visit request has been received for ${selectedDate} (${selectedTimeSlot}). AgeWellRI administration will assign your specialist.`
      );
    } catch (err: any) {
      const errMsg = err?.data?.message || err?.message || "Unable to submit visit request. Please try again.";
      showErrorAlert("Submission Failed", errMsg);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setNotes("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={resetAndClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-[#D9E4EC] shadow-2xl p-6 sm:p-8 z-10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden text-[#243746]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D9E4EC]">
          <div>
            <h3 className="text-xl font-extrabold text-[#243746] tracking-tight">
              {step === 5 ? "Request Submitted" : `Request a Visit — Step ${step} of 4`}
            </h3>
            <p className="text-xs text-[#64748B] font-medium">AgeWellRI Safety Visit Scheduling</p>
          </div>
          <button
            onClick={resetAndClose}
            aria-label="Close modal"
            className="p-2 text-[#64748B] hover:text-[#243746] rounded-xl border border-[#D9E4EC] cursor-pointer hover:bg-[#F8FAFC]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Pills */}
        {step < 5 && (
          <div className="flex items-center gap-1.5 py-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  step >= i ? "bg-[#294B68]" : "bg-[#EAF3F8]"
                }`}
              />
            ))}
          </div>
        )}

        {/* Step 1: Select Service */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[#243746] text-base">Select Safety Service</h4>
              <span className="text-xs font-semibold text-[#64748B]">Active Plan Quota</span>
            </div>

            {/* Quota Exhaustion Warning Banners */}
            {areAllServicesExhausted ? (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-rose-950">Monthly Visit Quota Fully Utilized</strong>
                  <span>You have used all included visits for your current month. Your visit quota will automatically renew on your next billing cycle.</span>
                </div>
              </div>
            ) : isCurrentServiceExhausted ? (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-amber-950">0 Remaining Visits for {selectedServiceName}</strong>
                  <span>You have 0 remaining visits available for {selectedServiceName}. Please select another service with available quota to continue.</span>
                </div>
              </div>
            ) : null}

            {isEntitlementsLoading ? (
              <div className="p-6 text-center text-sm text-[#64748B] flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#294B68]" />
                <span>Loading available services...</span>
              </div>
            ) : entitlements.length > 0 ? (
              <div className="space-y-3">
                {entitlements.map((srv) => {
                  const isSelected = selectedServiceTypeId === srv.serviceTypeId;
                  const isExhausted = srv.remaining <= 0;

                  return (
                    <div
                      key={srv.id}
                      onClick={() => {
                        setSelectedServiceTypeId(srv.serviceTypeId);
                        setSelectedServiceName(srv.serviceName);
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? isExhausted
                            ? "border-rose-400 bg-rose-50/50"
                            : "border-[#294B68] bg-[#EAF3F8]/60"
                          : isExhausted
                          ? "border-[#D9E4EC] bg-slate-50/60 opacity-60 hover:opacity-100"
                          : "border-[#D9E4EC] hover:border-[#5E8FB2] bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#243746] text-base flex items-center gap-2">
                          {srv.category === "CLEANING" ? (
                            <Sparkles className="w-5 h-5 text-[#5E8FB2]" />
                          ) : (
                            <ShieldCheck className="w-5 h-5 text-[#294B68]" />
                          )}
                          {srv.serviceName}
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                            isExhausted
                              ? "bg-rose-100 border-rose-300 text-rose-800"
                              : "bg-white border-[#D9E4EC] text-[#294B68]"
                          }`}
                        >
                          {srv.remaining > 0 ? `${srv.remaining} remaining` : "0 remaining"}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-1.5 font-medium">
                        {formatDuration(srv.durationMinutes)} session • {srv.allocated} total included in monthly cycle
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  {
                    name: "Safety Oversight Visit",
                    desc: "Comprehensive home environment, grab-bar, and hazard inspection.",
                    rem: plan ? plan.safetyVisitsTotal - plan.safetyVisitsCompleted : 0,
                  },
                  {
                    name: "Cleaning Visit",
                    desc: "Dedicated deep cleaning of living areas, bathrooms, and walkways.",
                    rem: plan ? plan.cleaningVisitsTotal - plan.cleaningVisitsCompleted : 0,
                  },
                ].map((s) => {
                  const isExhausted = s.rem <= 0;
                  return (
                    <div
                      key={s.name}
                      onClick={() => setSelectedServiceName(s.name)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        selectedServiceName === s.name
                          ? isExhausted
                            ? "border-rose-400 bg-rose-50/50"
                            : "border-[#294B68] bg-[#EAF3F8]/60"
                          : isExhausted
                          ? "border-[#D9E4EC] bg-slate-50/60 opacity-60"
                          : "border-[#D9E4EC] hover:border-[#5E8FB2] bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#243746] text-base flex items-center gap-2">
                          {s.name.includes("Safety") ? (
                            <ShieldCheck className="w-5 h-5 text-[#294B68]" />
                          ) : (
                            <Sparkles className="w-5 h-5 text-[#5E8FB2]" />
                          )}
                          {s.name}
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                            isExhausted
                              ? "bg-rose-100 border-rose-300 text-rose-800"
                              : "bg-white border-[#D9E4EC] text-[#294B68]"
                          }`}
                        >
                          {s.rem > 0 ? `${s.rem} available` : "0 remaining"}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-1.5">{s.desc}</p>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              disabled={isCurrentServiceExhausted || areAllServicesExhausted}
              onClick={() => {
                if (isCurrentServiceExhausted || areAllServicesExhausted) {
                  showErrorAlert(
                    "No Remaining Visits",
                    `You have 0 remaining visits available for ${selectedServiceName}. Please select a service with available quota to schedule.`
                  );
                  return;
                }
                setStep(2);
              }}
              className={`w-full mt-4 py-3.5 font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 ${
                isCurrentServiceExhausted || areAllServicesExhausted
                  ? "bg-slate-100 text-[#94A3B8] border border-slate-200 cursor-not-allowed"
                  : "bg-[#294B68] hover:bg-[#1E374D] text-white cursor-pointer"
              }`}
            >
              {areAllServicesExhausted ? (
                <span>All Monthly Visits Utilized (0 Remaining)</span>
              ) : isCurrentServiceExhausted ? (
                <span>0 Remaining Visits for {selectedServiceName} — Cannot Schedule</span>
              ) : (
                <span>Continue to Select Date →</span>
              )}
            </button>
          </div>
        )}

        {/* Step 2: Select Date (Interactive Month Calendar) */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[#243746] text-base flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#294B68]" /> Choose Preferred Date
              </h4>
              <span className="text-xs font-semibold text-[#64748B]">Mon, Tue, Thu, Fri, Sat</span>
            </div>

            {isAdvanceBooking && periodStartDate && (
              <div className="p-3 bg-[#EAF3F8] rounded-2xl border border-[#5E8FB2]/30 flex items-start gap-2.5 text-xs text-[#243746]">
                <Sparkles className="w-4 h-4 text-[#294B68] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#294B68]">Advance Scheduling Active</p>
                  <p className="text-[#64748B] mt-0.5">
                    Your service coverage begins on{" "}
                    <strong>
                      {periodStartDate.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </strong>
                    . You can pre-schedule your included visits now for dates starting{" "}
                    {periodStartDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                    .
                  </p>
                </div>
              </div>
            )}

            {/* Interactive Month Calendar Card */}
            <div className="bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl p-4 shadow-xs">
              {/* Calendar Month Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#D9E4EC]/80">
                <button
                  type="button"
                  onClick={() => {
                    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
                  }}
                  className="p-1.5 rounded-lg border border-[#D9E4EC] bg-white text-[#243746] hover:bg-[#EAF3F8] transition-colors cursor-pointer"
                  aria-label="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="font-extrabold text-[#243746] text-sm sm:text-base">
                  {viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
                  }}
                  className="p-1.5 rounded-lg border border-[#D9E4EC] bg-white text-[#243746] hover:bg-[#EAF3F8] transition-colors cursor-pointer"
                  aria-label="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day-of-week header */}
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold py-2 border-b border-[#D9E4EC]/40">
                <span className="text-rose-500 font-extrabold" title="Weekend (Non-Service Day)">Sun</span>
                <span className="text-[#64748B]">Mon</span>
                <span className="text-[#64748B]">Tue</span>
                <span className="text-rose-500 font-extrabold" title="Weekend (Non-Service Day)">Wed</span>
                <span className="text-[#64748B]">Thu</span>
                <span className="text-[#64748B]">Fri</span>
                <span className="text-[#64748B]">Sat</span>
              </div>

              {/* Calendar Days Grid */}
              <div className="grid grid-cols-7 gap-1 pt-2">
                {(() => {
                  const year = viewDate.getFullYear();
                  const month = viewDate.getMonth();
                  const firstDayIndex = new Date(year, month, 1).getDay();
                  const totalDays = new Date(year, month + 1, 0).getDate();
                  const today = new Date();
                  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

                  const cells = [];

                  // Empty padding cells before 1st of month
                  for (let i = 0; i < firstDayIndex; i++) {
                    cells.push(<div key={`blank-${i}`} className="h-9 w-full" />);
                  }

                  // Day cells
                  for (let day = 1; day <= totalDays; day++) {
                    const dayDate = new Date(year, month, day);
                    const dayOfWeek = dayDate.getDay();
                    const dayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 3; // Sunday or Wednesday
                    const isPast = todayMidnight.getTime() > dayDate.getTime();
                    const isBeforeCommence = Boolean(
                      isAdvanceBooking &&
                      periodStartDate &&
                      new Date(periodStartDate.getFullYear(), periodStartDate.getMonth(), periodStartDate.getDate()).getTime() > dayDate.getTime()
                    );

                    const isDisabled = Boolean(isWeekend || isPast || isBeforeCommence);
                    const isSelected = selectedDate === dayStr;
                    const isToday = todayMidnight.getTime() === dayDate.getTime();

                    cells.push(
                      <button
                        key={`day-${day}`}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setSelectedDate(dayStr)}
                        title={
                          isWeekend
                            ? `${dayDate.toLocaleDateString("en-US", { weekday: "long" })} is a non-service weekend day.`
                            : isBeforeCommence
                            ? "Date is before your service commencement."
                            : isPast
                            ? "Past date cannot be scheduled."
                            : `${dayDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`
                        }
                        className={`h-9 w-full rounded-xl text-xs flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? "bg-[#294B68] text-white font-extrabold shadow-sm ring-2 ring-[#294B68]"
                            : isDisabled
                            ? isWeekend
                              ? "bg-rose-50/60 text-rose-300 line-through cursor-not-allowed border border-rose-100/50"
                              : "text-slate-300 bg-slate-100/40 cursor-not-allowed"
                            : isToday
                            ? "bg-[#EAF3F8] text-[#294B68] font-bold border border-[#5E8FB2] hover:bg-[#294B68] hover:text-white cursor-pointer"
                            : "bg-white text-[#243746] font-semibold border border-[#D9E4EC]/70 hover:bg-[#EAF3F8] hover:border-[#5E8FB2] cursor-pointer"
                        }`}
                      >
                        <span>{day}</span>
                      </button>
                    );
                  }

                  return cells;
                })()}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-3 border-t border-[#D9E4EC]/70 text-[11px] text-[#64748B]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#294B68]" />
                  <span>Available (Mon, Tue, Thu, Fri, Sat)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-200 border border-rose-400" />
                  <span className="text-rose-700 font-semibold">Weekends: Sun &amp; Wed</span>
                </div>
              </div>
            </div>

            {/* Selected Date Summary Banner */}
            {selectedDate && (
              <div className="p-3 bg-white border border-[#D9E4EC] rounded-xl flex items-center justify-between text-xs">
                <span className="text-[#64748B] font-medium">Selected Visit Date:</span>
                <span className="font-extrabold text-[#294B68] text-sm">
                  {(() => {
                    const parts = selectedDate.split("-");
                    if (parts.length === 3) {
                      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                      return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
                    }
                    return selectedDate;
                  })()}
                </span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 border border-[#D9E4EC] text-[#243746] font-semibold rounded-xl cursor-pointer hover:bg-[#F8FAFC]"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!selectedDate}
                onClick={() => {
                  if (!selectedDate) {
                    showErrorAlert("Please Select a Date", "Please click an available date on the calendar.");
                    return;
                  }

                  const parts = selectedDate.split("-");
                  if (parts.length === 3) {
                    const chosen = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                    const dayOfWeek = chosen.getDay();
                    if (dayOfWeek === 0 || dayOfWeek === 3) {
                      showErrorAlert(
                        "Weekend Non-Service Day",
                        "Visits cannot be scheduled on Sundays or Wednesdays. Please select Monday, Tuesday, Thursday, Friday, or Saturday."
                      );
                      return;
                    }

                    if (periodStartDate) {
                      const start = new Date(periodStartDate.getFullYear(), periodStartDate.getMonth(), periodStartDate.getDate());
                      if (chosen.getTime() < start.getTime()) {
                        showErrorAlert(
                          "Invalid Date Selected",
                          `Visits must be scheduled on or after your service commencement date (${start.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}).`
                        );
                        return;
                      }
                    }
                  }
                  setStep(3);
                }}
                className={`w-2/3 py-3 font-bold rounded-xl shadow-xs transition-all ${
                  !selectedDate
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-[#294B68] hover:bg-[#1E374D] text-white cursor-pointer"
                }`}
              >
                Select Time Window →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Select Time Window (Standard or Custom Time) */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[#243746] text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#5E8FB2]" /> Select Time Window
              </h4>
              <span className="text-xs font-semibold text-[#294B68] bg-[#EAF3F8] px-2.5 py-1 rounded-full border border-[#5E8FB2]/30">
                {planDurationHours} {planDurationHours === 1 ? "Hour" : "Hours"} Visit • 8 AM – 6 PM
              </span>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex p-1 bg-[#F1F5F9] rounded-xl border border-[#D9E4EC]">
              <button
                type="button"
                onClick={() => {
                  setTimeMode("PRESET");
                  const slots = generateStandardTimeSlots(planDurationHours);
                  setSelectedTimeSlot(slots[0]);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  timeMode === "PRESET"
                    ? "bg-white text-[#243746] shadow-2xs border border-[#D9E4EC]"
                    : "text-[#64748B] hover:text-[#243746]"
                }`}
              >
                Standard Windows ({planDurationHours} {planDurationHours === 1 ? "Hour" : "Hours"})
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimeMode("CUSTOM");
                  const starts = getAvailableStartTimes(planDurationHours);
                  const start = starts.includes(customStart) ? customStart : (starts[2] || starts[0] || "09:00 AM");
                  const end = calculateEndTime(start, planDurationHours);
                  setCustomStart(start);
                  setCustomEnd(end);
                  setSelectedTimeSlot(`${start} – ${end}`);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  timeMode === "CUSTOM"
                    ? "bg-white text-[#243746] shadow-2xs border border-[#D9E4EC]"
                    : "text-[#64748B] hover:text-[#243746]"
                }`}
              >
                Custom Time Window
              </button>
            </div>

            {timeMode === "PRESET" ? (
              <div className="space-y-2.5">
                <div className={`grid gap-2.5 ${planDurationHours === 1 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
                  {standardTimeSlots.map((ts) => (
                    <button
                      key={ts}
                      type="button"
                      onClick={() => setSelectedTimeSlot(ts)}
                      className={`p-3 rounded-xl border text-center font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                        selectedTimeSlot === ts
                          ? "border-[#294B68] bg-[#294B68] text-white shadow-xs"
                          : "border-[#D9E4EC] bg-white text-[#243746] hover:bg-[#EAF3F8]"
                      }`}
                    >
                      {ts}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#243746] block mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#294B68]" /> Start Time (8:00 AM – {formatMinutesToTimeString((18 - planDurationHours) * 60)})
                    </label>
                    <select
                      value={customStart}
                      onChange={(e) => {
                        const newStart = e.target.value;
                        setCustomStart(newStart);
                        const newEnd = calculateEndTime(newStart, planDurationHours);
                        setCustomEnd(newEnd);
                        setSelectedTimeSlot(`${newStart} – ${newEnd}`);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9E4EC] text-sm text-[#243746] font-semibold bg-white focus:outline-hidden focus:border-[#294B68]"
                    >
                      {availableStartTimes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#243746] block mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#5E8FB2]" /> End Time (Fixed +{planDurationHours} {planDurationHours === 1 ? "hr" : "hrs"})
                    </label>
                    <div className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9E4EC] text-sm text-[#294B68] font-bold bg-[#EAF3F8] flex items-center justify-between">
                      <span>{customEnd}</span>
                      <span className="text-[11px] font-semibold text-[#5E8FB2]">+{planDurationHours} {planDurationHours === 1 ? "hr" : "hrs"} visit</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#D9E4EC] flex items-center justify-between text-xs">
                  <span className="text-[#64748B] font-medium">Selected Custom Window:</span>
                  <span className="font-extrabold text-[#294B68] text-sm">
                    {customStart} – {customEnd} ({planDurationHours} {planDurationHours === 1 ? "hour" : "hours"})
                  </span>
                </div>
              </div>
            )}

            <div className="p-3 bg-[#EAF3F8] rounded-xl border border-[#5E8FB2]/30 flex items-start gap-2 text-xs text-[#243746]">
              <Info className="w-4 h-4 text-[#294B68] shrink-0 mt-0.5" />
              <span>
                Your plan includes <strong>{planDurationHours} {planDurationHours === 1 ? "hour" : "hours"}</strong> per scheduled visit. Visits can be scheduled between <strong>8:00 AM and 6:00 PM EST</strong> on working days (Monday, Tuesday, Thursday, Friday, and Saturday).
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 py-3 border border-[#D9E4EC] text-[#243746] font-semibold rounded-xl cursor-pointer hover:bg-[#F8FAFC]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="w-2/3 py-3 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold rounded-xl cursor-pointer shadow-xs"
              >
                Review Request →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Confirm */}
        {step === 4 && (
          <div className="space-y-4 py-2">
            <h4 className="font-bold text-[#243746] text-base">Review &amp; Access Details</h4>

            {/* Visit Summary Card */}
            <div className="p-4 bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between border-b border-[#D9E4EC]/60 pb-2">
                <span className="text-[#64748B]">Service:</span>
                <span className="font-bold text-[#243746]">{selectedServiceName}</span>
              </div>
              <div className="flex justify-between border-b border-[#D9E4EC]/60 pb-2">
                <span className="text-[#64748B]">Requested Date:</span>
                <span className="font-bold text-[#243746]">{selectedDate}</span>
              </div>
              <div className="flex justify-between border-b border-[#D9E4EC]/60 pb-2">
                <span className="text-[#64748B]">Arrival Window:</span>
                <span className="font-bold text-[#294B68]">{selectedTimeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Specialist Assignment:</span>
                <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs">
                  Assigned upon admin confirmation
                </span>
              </div>
            </div>

            {/* Home Access Method Selector for Specialist */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#243746] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#294B68]" />
                  <span>Choose Home Access Method</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsNewAccessModalOpen(true)}
                  className="text-xs font-bold text-[#294B68] hover:text-[#1E374D] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Method</span>
                </button>
              </div>

              {isAccessMethodsLoading ? (
                <div className="p-4 bg-[#F8FAFC] rounded-xl text-center text-xs text-[#64748B] flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#294B68]" />
                  <span>Loading your access methods...</span>
                </div>
              ) : accessMethods.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {accessMethods.map((m) => {
                    const isSelected = selectedAccessMethodId === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => setSelectedAccessMethodId(m.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                          isSelected
                            ? "border-[#294B68] bg-[#EAF3F8]/80 shadow-xs"
                            : "border-[#D9E4EC] bg-white hover:border-[#5E8FB2] hover:bg-[#F8FAFC]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="accessMethodSelect"
                          checked={isSelected}
                          onChange={() => setSelectedAccessMethodId(m.id)}
                          className="mt-1 text-[#294B68] focus:ring-[#294B68] cursor-pointer accent-[#294B68]"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-[#243746]">
                              {m.title}
                            </span>
                            {m.isDefault && (
                              <span className="text-[10px] font-black uppercase tracking-wider bg-[#294B68] text-white px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-white" />
                                Default
                              </span>
                            )}
                            {m.code && (
                              <span className="text-[11px] font-mono font-bold text-[#294B68] bg-white px-1.5 py-0.2 rounded border border-[#D9E4EC]">
                                Code: {m.code}
                              </span>
                            )}
                          </div>
                          {m.instructions && (
                            <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                              {m.instructions}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2">
                  <span>No saved access methods. Specialist will ring front door.</span>
                  <button
                    type="button"
                    onClick={() => setIsNewAccessModalOpen(true)}
                    className="px-2.5 py-1 bg-[#294B68] text-white font-bold rounded-lg shrink-0 cursor-pointer"
                  >
                    + Add Lockbox / Code
                  </button>
                </div>
              )}
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-xs font-bold text-[#243746] mb-1">
                Additional Specialist Instructions (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please ring doorbell twice, friendly dog is inside..."
                rows={2}
                className="w-full p-3 text-xs sm:text-sm border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#294B68]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(3)}
                className="w-1/3 py-3 border border-[#D9E4EC] text-[#243746] font-semibold rounded-xl cursor-pointer hover:bg-[#F8FAFC] text-sm"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="w-2/3 py-3 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-70 text-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Visit Request</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Confirmation Success */}
        {step === 5 && (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-2xl font-extrabold text-[#243746]">
                Visit Request Submitted!
              </h4>
              <p className="text-sm text-[#64748B] mt-2 max-w-sm mx-auto font-medium leading-relaxed">
                Your request for a <strong>{selectedServiceName}</strong> visit on{" "}
                <strong className="text-[#243746]">{selectedDate}</strong> ({selectedTimeSlot}) has been received.
                {selectedAccessMethod && (
                  <span className="block mt-1 text-xs text-[#294B68] font-bold">
                    Specialist Entry: {selectedAccessMethod.title}
                  </span>
                )}
              </p>
            </div>

            <button
              onClick={resetAndClose}
              className="w-full py-3.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-base rounded-xl cursor-pointer shadow-xs"
            >
              Done &amp; Return to Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Access Method Modal (for on-the-fly adding) */}
      <AccessMethodModal
        isOpen={isNewAccessModalOpen}
        onClose={() => setIsNewAccessModalOpen(false)}
        onSuccess={async () => {
          const res = await refetchAccessMethods();
          if (res?.data?.data && res.data.data.length > 0) {
            const newlyAdded = res.data.data[res.data.data.length - 1];
            setSelectedAccessMethodId(newlyAdded.id);
          }
        }}
      />
    </div>
  );
}
