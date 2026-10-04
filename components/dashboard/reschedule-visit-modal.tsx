"use client";

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
  ChevronLeft,
  ChevronRight,
  Edit3,
  RotateCcw,
} from "lucide-react";
import { AppointmentItem } from "@/redux/features/appointment/appointmentTypes";
import {
  useRescheduleAppointmentMutation,
  useGetMyAppointmentsQuery,
} from "@/redux/features/appointment/appointmentApi";
import { useGetVisitEntitlementsQuery } from "@/redux/features/payment/paymentApi";
import {
  confirmCriticalAction,
  showSuccessAlert,
  showErrorAlert,
} from "@/lib/alerts/sweetalert";

interface RescheduleVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentItem | any | null;
  onSuccess?: () => void;
}

function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;
  let hour = parseInt(match[1], 10);
  const min = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && hour < 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  return hour * 60 + min;
}

function parseTimeSlotToMinutes(timeSlot: string): { startMin: number; endMin: number } | null {
  if (!timeSlot) return null;
  const parts = timeSlot.split(/\s*(?:–|—|-|to)\s*/i);
  if (parts.length < 2) return null;
  const startMin = timeToMinutes(parts[0]);
  const endMin = timeToMinutes(parts[1]);
  if (endMin <= startMin) return null;
  return { startMin, endMin };
}

function parseApptTimeSlotToMinutes(appt: any): { startMin: number; endMin: number } | null {
  if (appt?.timeSlot) {
    const range = parseTimeSlotToMinutes(appt.timeSlot);
    if (range) return range;
  }
  if (appt?.startAt && appt?.endAt) {
    const dStart = new Date(appt.startAt);
    const dEnd = new Date(appt.endAt);
    if (!isNaN(dStart.getTime()) && !isNaN(dEnd.getTime())) {
      const startMin = dStart.getHours() * 60 + dStart.getMinutes();
      const endMin = dEnd.getHours() * 60 + dEnd.getMinutes();
      if (endMin > startMin) return { startMin, endMin };
    }
  }
  return null;
}

function isTimeOverlapping(
  slot1: { startMin: number; endMin: number },
  slot2: { startMin: number; endMin: number }
): boolean {
  return Math.max(slot1.startMin, slot2.startMin) < Math.min(slot1.endMin, slot2.endMin);
}

function getApptDateFormatted(appt: any): string {
  if (!appt) return "";
  if (appt.startAt && typeof appt.startAt === "string" && /^\d{4}-\d{2}-\d{2}/.test(appt.startAt)) {
    return appt.startAt.split("T")[0];
  }
  if (appt.date && typeof appt.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(appt.date.trim())) {
    return appt.date.trim();
  }
  if (appt.date && typeof appt.date === "string") {
    const d = new Date(appt.date);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
  }
  return "";
}

function formatMinutesToTimeString(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinute = String(minutes).padStart(2, "0");
  return `${String(displayHour).padStart(2, "0")}:${displayMinute} ${ampm}`;
}

function parsePlanDurationHours(timesStr?: string): number {
  if (!timesStr) return 2;
  const text = timesStr.toLowerCase();
  if (
    text.includes("1 hour") ||
    text.includes("1-hour") ||
    text.includes("60 min") ||
    text.includes("one hour") ||
    text.includes("1hr")
  ) {
    return 1;
  }
  if (
    text.includes("2 hour") ||
    text.includes("2-hour") ||
    text.includes("120 min") ||
    text.includes("two hour") ||
    text.includes("2hr")
  ) {
    return 2;
  }
  return 2;
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
      "12:00 PM – 02:00 PM",
      "02:00 PM – 04:00 PM",
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
    : [
        "08:00 AM – 10:00 AM",
        "10:00 AM – 12:00 PM",
        "12:00 PM – 02:00 PM",
        "02:00 PM – 04:00 PM",
        "04:00 PM – 06:00 PM",
      ];
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

export function RescheduleVisitModal({
  isOpen,
  onClose,
  appointment,
  onSuccess,
}: RescheduleVisitModalProps) {
  const { data: entitlementsRes } = useGetVisitEntitlementsQuery(undefined, { skip: !isOpen });
  const { data: apptsRes } = useGetMyAppointmentsQuery(undefined, { skip: !isOpen });
  const [rescheduleAppointmentMutation, { isLoading: isSubmitting }] = useRescheduleAppointmentMutation();

  const otherActiveAppointments = useMemo(() => {
    const raw = apptsRes?.data || [];
    return raw.filter((a) => {
      const isSelf = appointment && (a.id === appointment.id || (a as any).appointmentId === appointment.id);
      const st = (a.status || "").toLowerCase();
      return !isSelf && st !== "cancelled" && st !== "no_show" && st !== "declined";
    });
  }, [apptsRes, appointment]);

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("10:00 AM – 12:00 PM");
  const [timeMode, setTimeMode] = useState<"PRESET" | "CUSTOM">("PRESET");
  const [customStart, setCustomStart] = useState<string>("09:00 AM");
  const [customEnd, setCustomEnd] = useState<string>("11:00 AM");
  const [reason, setReason] = useState<string>("");

  const planDurationHours = useMemo(() => {
    if (entitlementsRes?.data?.entitlements && Array.isArray(entitlementsRes.data.entitlements)) {
      const match = entitlementsRes.data.entitlements.find(
        (e: any) =>
          e.serviceTypeId === appointment?.serviceTypeId ||
          (e.serviceName &&
            appointment?.serviceType &&
            e.serviceName.toLowerCase() === appointment.serviceType.toLowerCase())
      );
      if (match?.durationMinutes) {
        return Math.max(1, Math.round(match.durationMinutes / 60));
      }
    }
    if (appointment?.durationMinutes) {
      return Math.max(1, Math.round(appointment.durationMinutes / 60));
    }
    const planTimes = (entitlementsRes?.data as any)?.plan?.times;
    if (planTimes) {
      return parsePlanDurationHours(planTimes);
    }
    const name = (appointment?.serviceType || appointment?.serviceName || "").toLowerCase();
    if (
      name.includes("1 hour") ||
      name.includes("an hour") ||
      name.includes("one hour") ||
      name.includes("60 min") ||
      name.includes("1hr")
    ) {
      return 1;
    }
    if (
      name.includes("2 hour") ||
      name.includes("two hour") ||
      name.includes("120 min") ||
      name.includes("2hr")
    ) {
      return 2;
    }
    return 2;
  }, [entitlementsRes, appointment]);

  const standardTimeSlots = useMemo(() => {
    return generateStandardTimeSlots(planDurationHours);
  }, [planDurationHours]);

  const availableStartTimes = useMemo(() => {
    return getAvailableStartTimes(planDurationHours);
  }, [planDurationHours]);

  // Calendar month view date
  const [viewDate, setViewDate] = useState<Date>(new Date());

  useEffect(() => {
    if (appointment && isOpen) {
      const apptDateStr = getApptDateFormatted(appointment);
      setSelectedDate(apptDateStr || "");
      setSelectedTimeSlot(appointment.timeSlot || standardTimeSlots[0] || "10:00 AM – 12:00 PM");
      setTimeMode("PRESET");
      setReason("");

      if (apptDateStr) {
        const [y, m, d] = apptDateStr.split("-").map(Number);
        setViewDate(new Date(y, m - 1, 1));
      } else {
        setViewDate(new Date());
      }
    }
  }, [appointment, isOpen, standardTimeSlots]);

  const checkTimeSlotBooked = (ts: string): { isBooked: boolean; appt?: any } => {
    const slotRange = parseTimeSlotToMinutes(ts);
    if (!slotRange || !selectedDate) return { isBooked: false };

    for (const appt of otherActiveAppointments) {
      const apptDate = getApptDateFormatted(appt);
      if (apptDate !== selectedDate) continue;

      const apptRange = parseApptTimeSlotToMinutes(appt);
      if (apptRange && isTimeOverlapping(slotRange, apptRange)) {
        return { isBooked: true, appt };
      }
    }
    return { isBooked: false };
  };

  const currentSlotStatus = useMemo(() => {
    return checkTimeSlotBooked(selectedTimeSlot);
  }, [selectedTimeSlot, selectedDate, otherActiveAppointments]);

  const isDateConflicted = useMemo(() => {
    if (!selectedDate) return false;
    return otherActiveAppointments.some((a) => getApptDateFormatted(a) === selectedDate);
  }, [selectedDate, otherActiveAppointments]);

  useEffect(() => {
    if (timeMode === "PRESET") {
      const isBooked = checkTimeSlotBooked(selectedTimeSlot).isBooked;
      if (!standardTimeSlots.includes(selectedTimeSlot) || isBooked) {
        const available = standardTimeSlots.find((s) => !checkTimeSlotBooked(s).isBooked);
        setSelectedTimeSlot(
          available || standardTimeSlots[0] || (planDurationHours === 1 ? "08:00 AM – 09:00 AM" : "10:00 AM – 12:00 PM")
        );
      }
    } else {
      const starts = getAvailableStartTimes(planDurationHours);
      const start = starts.includes(customStart) ? customStart : (starts[2] || starts[0] || "09:00 AM");
      const end = calculateEndTime(start, planDurationHours);
      setCustomStart(start);
      setCustomEnd(end);
      setSelectedTimeSlot(`${start} – ${end}`);
    }
  }, [planDurationHours, timeMode, selectedDate]);

  if (!isOpen || !appointment) return null;

  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate) {
      showErrorAlert("Date Required", "Please select a preferred date for your rescheduled visit.");
      return;
    }

    if (isDateConflicted) {
      showErrorAlert(
        "Date Already Scheduled",
        "You already have another visit scheduled on this date. Please choose an open date."
      );
      return;
    }

    if (currentSlotStatus.isBooked) {
      showErrorAlert(
        "Time Slot Conflict",
        `A visit is already scheduled at ${currentSlotStatus.appt?.timeSlot || selectedTimeSlot} on ${currentSlotStatus.appt?.date || "another date"}. Please choose another time slot.`
      );
      return;
    }

    const parts = selectedDate.split("-");
    if (parts.length === 3) {
      const chosen = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const dow = chosen.getDay();
      if (dow === 0 || dow === 3) {
        const dayName = dow === 0 ? "Sunday" : "Wednesday";
        showErrorAlert(
          "Weekend Non-Service Day",
          `Visits cannot be rescheduled to ${dayName}s as they are non-service days. Working days are Monday, Tuesday, Thursday, Friday, and Saturday.`
        );
        return;
      }
    }

    const confirmed = await confirmCriticalAction({
      title: "Reschedule Safety Visit?",
      text: `Change your ${appointment.serviceType} visit to ${selectedDate} (${selectedTimeSlot})?`,
      confirmButtonText: "Yes, Reschedule Visit",
      isDestructive: false,
    });

    if (!confirmed) return;

    try {
      await rescheduleAppointmentMutation({
        id: appointment.id,
        body: {
          date: selectedDate,
          timeSlot: selectedTimeSlot,
          reason: reason.trim() || undefined,
        },
      }).unwrap();

      await showSuccessAlert(
        "Visit Rescheduled",
        `Your visit has been successfully updated to ${selectedDate} (${selectedTimeSlot}).`
      );

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      showErrorAlert("Reschedule Failed", err?.data?.message || err?.message || "Unable to reschedule appointment.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#D9E4EC] shadow-2xl p-6 sm:p-7 z-10 max-h-[92vh] overflow-y-auto space-y-5 text-[#243746]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#D9E4EC]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF3F8] text-[#294B68] flex items-center justify-center font-bold">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-[#243746]">Reschedule Visit</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#64748B] hover:text-[#243746] rounded-xl border border-[#D9E4EC] cursor-pointer hover:bg-[#F8FAFC]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Visit Overview */}
        <div className="p-3.5 bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-[#64748B] block">Current Visit</span>
            <strong className="text-sm font-extrabold text-[#243746] block">{appointment.serviceType}</strong>
            <span className="text-[#64748B]">{appointment.technicianName || "Specialist Assigned"}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase text-[#64748B] block">Current Time</span>
            <span className="font-extrabold text-[#294B68] block">{appointment.date}</span>
            <span className="text-[#64748B]">{appointment.timeSlot}</span>
          </div>
        </div>

        <form onSubmit={handleConfirmReschedule} className="space-y-4">
          {/* Interactive Calendar Date Picker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#243746] flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-[#294B68]" /> Choose New Date *
              </label>
              <span className="text-[11px] font-semibold text-[#64748B]">Mon, Tue, Thu, Fri, Sat</span>
            </div>

            <div className="bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl p-3.5 shadow-2xs">
              {/* Calendar Month Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#D9E4EC]/80">
                <button
                  type="button"
                  onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                  className="p-1.5 rounded-lg border border-[#D9E4EC] bg-white text-[#243746] hover:bg-[#EAF3F8] cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-extrabold text-[#243746] text-xs sm:text-sm">
                  {viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
                <button
                  type="button"
                  onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                  className="p-1.5 rounded-lg border border-[#D9E4EC] bg-white text-[#243746] hover:bg-[#EAF3F8] cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day-of-week header */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold py-1.5 border-b border-[#D9E4EC]/40">
                <span className="text-rose-500 font-extrabold">Sun</span>
                <span className="text-[#64748B]">Mon</span>
                <span className="text-[#64748B]">Tue</span>
                <span className="text-rose-500 font-extrabold">Wed</span>
                <span className="text-[#64748B]">Thu</span>
                <span className="text-[#64748B]">Fri</span>
                <span className="text-[#64748B]">Sat</span>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 pt-2">
                {(() => {
                  const year = viewDate.getFullYear();
                  const month = viewDate.getMonth();
                  const firstDayIndex = new Date(year, month, 1).getDay();
                  const totalDays = new Date(year, month + 1, 0).getDate();
                  const today = new Date();
                  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

                  const cells = [];
                  for (let i = 0; i < firstDayIndex; i++) {
                    cells.push(<div key={`blank-${i}`} className="h-8 w-full" />);
                  }

                  for (let day = 1; day <= totalDays; day++) {
                    const dayDate = new Date(year, month, day);
                    const dayOfWeek = dayDate.getDay();
                    const dayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 3;
                    const isPast = todayMidnight.getTime() > dayDate.getTime();
                    const hasOtherAppt = otherActiveAppointments.some((a) => getApptDateFormatted(a) === dayStr);
                    const isDisabled = isWeekend || isPast || hasOtherAppt;
                    const isSelected = selectedDate === dayStr;

                    cells.push(
                      <button
                        key={`day-${day}`}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setSelectedDate(dayStr)}
                        className={`h-9 w-full rounded-xl text-xs flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? "bg-[#294B68] text-white font-extrabold shadow-sm ring-2 ring-[#294B68]"
                            : hasOtherAppt
                            ? "bg-rose-100 text-rose-950 font-bold border border-rose-300 cursor-not-allowed"
                            : isDisabled
                            ? isWeekend
                              ? "bg-rose-50/50 text-rose-300 line-through cursor-not-allowed"
                              : "text-slate-300 bg-slate-100/40 cursor-not-allowed"
                            : "bg-white text-[#243746] font-semibold border border-[#D9E4EC]/70 hover:bg-[#EAF3F8] cursor-pointer"
                        }`}
                      >
                        <span>{day}</span>
                        {hasOtherAppt && (
                          <span className="text-[7px] font-black uppercase text-rose-700 leading-none">
                            Booked
                          </span>
                        )}
                      </button>
                    );
                  }
                  return cells;
                })()}
              </div>
            </div>
          </div>

          {/* Time Slot Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#243746] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#5E8FB2]" /> Choose New Time Window *
              </label>
              <button
                type="button"
                onClick={() => setTimeMode(timeMode === "PRESET" ? "CUSTOM" : "PRESET")}
                className="text-[11px] font-bold text-[#294B68] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3 text-[#5E8FB2]" />
                <span>{timeMode === "PRESET" ? "Custom Time" : "Standard Preset"}</span>
              </button>
            </div>

            {timeMode === "PRESET" ? (
              <div className={`grid gap-2 ${planDurationHours === 1 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
                {standardTimeSlots.map((ts) => {
                  const { isBooked } = checkTimeSlotBooked(ts);
                  const isSelected = selectedTimeSlot === ts;

                  return (
                    <button
                      key={ts}
                      type="button"
                      disabled={isBooked}
                      onClick={() => setSelectedTimeSlot(ts)}
                      className={`p-3 rounded-xl border text-center font-bold text-xs sm:text-sm transition-all flex flex-col items-center justify-center gap-1 ${
                        isBooked
                          ? "bg-rose-100 border-rose-300 text-rose-900 cursor-not-allowed"
                          : isSelected
                          ? "border-[#294B68] bg-[#294B68] text-white shadow-xs cursor-pointer"
                          : "border-[#D9E4EC] bg-white text-[#243746] hover:bg-[#EAF3F8] cursor-pointer"
                      }`}
                    >
                      <span>{ts}</span>
                      {isBooked ? (
                        <span className="text-[9px] font-extrabold uppercase bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded mt-0.5 border border-rose-300">
                          Already Scheduled
                        </span>
                      ) : isSelected ? (
                        <span className="text-[9px] font-extrabold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-md mt-0.5">
                          Selected Slot
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-3.5 bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#64748B] block mb-1">Start Time</label>
                    <select
                      value={customStart}
                      onChange={(e) => {
                        const newStart = e.target.value;
                        setCustomStart(newStart);
                        const newEnd = calculateEndTime(newStart, planDurationHours);
                        setCustomEnd(newEnd);
                        setSelectedTimeSlot(`${newStart} – ${newEnd}`);
                      }}
                      className="w-full h-10 px-3 bg-white border border-[#D9E4EC] rounded-xl text-xs font-bold text-[#243746] focus:ring-2 focus:ring-[#5E8FB2]"
                    >
                      {availableStartTimes.map((st) => {
                        const customSlotStr = `${st} – ${calculateEndTime(st, planDurationHours)}`;
                        const { isBooked } = checkTimeSlotBooked(customSlotStr);
                        return (
                          <option key={st} value={st} disabled={isBooked} className={isBooked ? "text-rose-600 bg-rose-50" : ""}>
                            {st} {isBooked ? "(Booked)" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#64748B] block mb-1">End Time</label>
                    <div className="w-full h-10 px-3 rounded-xl border border-[#D9E4EC] text-xs text-[#294B68] font-bold bg-[#EAF3F8] flex items-center justify-between">
                      <span>{customEnd}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Informational Plan Hours Notice */}
            <div className="p-3 bg-[#EAF3F8] rounded-2xl border border-[#5E8FB2]/30 flex items-start gap-2.5 text-xs text-[#243746]">
              <AlertCircle className="w-4 h-4 text-[#294B68] shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-[#243746]">
                Your plan includes up to <strong>{planDurationHours} {planDurationHours === 1 ? "hour" : "hours"}</strong> per scheduled visit. Visits can be scheduled between <strong>8:00 AM and 6:00 PM ET</strong> on available days (Monday, Tuesday, Thursday, Friday, and Saturday).
              </p>
            </div>

            {/* Full-width Conflict Alert */}
            {currentSlotStatus.isBooked && (
              <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl text-rose-900 text-xs flex items-start gap-2.5 animate-in fade-in duration-200 shadow-2xs w-full">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-rose-950">
                    Time Slot Conflict ({selectedDate})
                  </strong>
                  <p className="text-rose-800 text-[11px] mt-0.5">
                    Another visit is already scheduled at <strong>{currentSlotStatus.appt?.timeSlot || selectedTimeSlot}</strong> on <strong>{selectedDate}</strong>. The same client cannot be scheduled for two visits at the same time on the same date. Please select another time window or date.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Reason for Reschedule */}
          <div>
            <label className="block text-xs font-bold text-[#243746] mb-1">
              Reason for Rescheduling (Optional)
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Schedule conflict, morning preference, doctor visit..."
              className="w-full p-3 text-xs border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 border border-[#D9E4EC] text-[#243746] font-bold text-xs rounded-xl hover:bg-[#F8FAFC] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedDate || isDateConflicted || currentSlotStatus.isBooked}
              className={`w-2/3 py-3 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 ${
                !selectedDate || isDateConflicted || currentSlotStatus.isBooked
                  ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                  : "bg-[#294B68] hover:bg-[#1E374D] text-white cursor-pointer"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Schedule...</span>
                </>
              ) : isDateConflicted ? (
                <span>Date Already Booked</span>
              ) : currentSlotStatus.isBooked ? (
                <span>Time Slot Conflict</span>
              ) : (
                <span>Confirm &amp; Update Visit</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
