"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Clock,
  Plus,
  Trash2,
  Calendar,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Copy,
  RotateCcw,
  Check,
  Info,
} from "lucide-react";
import { useUpdateSpecialistMutation } from "@/redux/features/specialist/specialistApi";
import {
  SpecialistItem,
  SpecialistDaySchedule,
  SpecialistTimeWindow,
} from "@/redux/features/specialist/specialistTypes";
import { showSuccessAlert, showErrorAlert, showToast } from "@/lib/alerts/sweetalert";

interface SpecialistAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  specialist: SpecialistItem | null;
}

const DAYS_OF_WEEK = [
  { dayOfWeek: 0, dayName: "Sunday", defaultOpen: false },
  { dayOfWeek: 1, dayName: "Monday", defaultOpen: true },
  { dayOfWeek: 2, dayName: "Tuesday", defaultOpen: true },
  { dayOfWeek: 3, dayName: "Wednesday", defaultOpen: false },
  { dayOfWeek: 4, dayName: "Thursday", defaultOpen: true },
  { dayOfWeek: 5, dayName: "Friday", defaultOpen: true },
  { dayOfWeek: 6, dayName: "Saturday", defaultOpen: true },
];

const STANDARD_TIMES_24H = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00",
];

function format24hTo12h(time24: string): string {
  if (!time24) return "";
  const parts = time24.split(":");
  if (parts.length < 2) return time24;
  let h = parseInt(parts[0], 10);
  const m = parts[1];
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${String(displayH).padStart(2, "0")}:${m} ${ampm}`;
}

function getDefaultSchedule(): SpecialistDaySchedule[] {
  return DAYS_OF_WEEK.map((d) => ({
    dayOfWeek: d.dayOfWeek,
    dayName: d.dayName,
    isOpen: d.defaultOpen,
    isAvailable: d.defaultOpen,
    timeWindows: d.defaultOpen ? [{ start: "08:00", end: "18:00" }] : [],
  }));
}

export function SpecialistAvailabilityModal({
  isOpen,
  onClose,
  specialist,
}: SpecialistAvailabilityModalProps) {
  const [updateSpecialist, { isLoading: isUpdating }] = useUpdateSpecialistMutation();

  const [days, setDays] = useState<SpecialistDaySchedule[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isCopiedDay, setIsCopiedDay] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen || !specialist) return;

    if (
      Array.isArray(specialist.weeklySchedule) &&
      specialist.weeklySchedule.length === 7
    ) {
      setDays(JSON.parse(JSON.stringify(specialist.weeklySchedule)));
    } else {
      setDays(getDefaultSchedule());
    }
    setFormError(null);
  }, [specialist, isOpen]);

  if (!isOpen || !specialist) return null;

  const hasCustomSchedule =
    Array.isArray(specialist.weeklySchedule) &&
    specialist.weeklySchedule.length > 0;

  const handleToggleDay = (dayIndex: number) => {
    setDays((prev) =>
      prev.map((day, idx) => {
        if (idx !== dayIndex) return day;
        const nextIsOpen = !day.isOpen;
        return {
          ...day,
          isOpen: nextIsOpen,
          isAvailable: nextIsOpen,
          timeWindows:
            nextIsOpen && (!day.timeWindows || day.timeWindows.length === 0)
              ? [{ start: "08:00", end: "18:00" }]
              : day.timeWindows || [],
        };
      })
    );
  };

  const handleAddTimeWindow = (dayIndex: number) => {
    setDays((prev) =>
      prev.map((day, idx) => {
        if (idx !== dayIndex) return day;
        const windows = [...(day.timeWindows || [])];
        const lastEnd = windows[windows.length - 1]?.end || "12:00";
        const newStart = lastEnd < "17:00" ? "14:00" : "18:00";
        const newEnd = "20:00";
        return {
          ...day,
          timeWindows: [...windows, { start: newStart, end: newEnd }],
        };
      })
    );
  };

  const handleRemoveTimeWindow = (dayIndex: number, windowIndex: number) => {
    setDays((prev) =>
      prev.map((day, idx) => {
        if (idx !== dayIndex) return day;
        const nextWindows = day.timeWindows.filter((_, idx2) => idx2 !== windowIndex);
        return {
          ...day,
          isOpen: nextWindows.length > 0 ? day.isOpen : false,
          isAvailable: nextWindows.length > 0 ? day.isOpen : false,
          timeWindows: nextWindows,
        };
      })
    );
  };

  const handleTimeChange = (
    dayIndex: number,
    windowIndex: number,
    field: "start" | "end",
    value: string
  ) => {
    setDays((prev) =>
      prev.map((day, idx) => {
        if (idx !== dayIndex) return day;
        const nextWindows = day.timeWindows.map((win, idx2) =>
          idx2 === windowIndex ? { ...win, [field]: value } : win
        );
        return { ...day, timeWindows: nextWindows };
      })
    );
  };

  const handleCopyHoursToAllOpen = (sourceDayIndex: number) => {
    const source = days[sourceDayIndex];
    if (!source || !source.timeWindows || source.timeWindows.length === 0) return;

    setDays((prev) =>
      prev.map((day, idx) => {
        if (idx === sourceDayIndex) return day;
        if (!day.isOpen) return day;
        return {
          ...day,
          timeWindows: JSON.parse(JSON.stringify(source.timeWindows)),
        };
      })
    );

    setIsCopiedDay(sourceDayIndex);
    setTimeout(() => setIsCopiedDay(null), 1800);
    showToast("Hours copied to all currently active working days");
  };

  const applyPreset = (preset: "standard" | "weekdays" | "weekends") => {
    if (preset === "standard") {
      setDays(getDefaultSchedule());
    } else if (preset === "weekdays") {
      setDays(
        DAYS_OF_WEEK.map((d) => ({
          dayOfWeek: d.dayOfWeek,
          dayName: d.dayName,
          isOpen: d.dayOfWeek >= 1 && d.dayOfWeek <= 5,
          isAvailable: d.dayOfWeek >= 1 && d.dayOfWeek <= 5,
          timeWindows:
            d.dayOfWeek >= 1 && d.dayOfWeek <= 5
              ? [{ start: "08:30", end: "16:30" }]
              : [],
        }))
      );
    } else if (preset === "weekends") {
      setDays(
        DAYS_OF_WEEK.map((d) => ({
          dayOfWeek: d.dayOfWeek,
          dayName: d.dayName,
          isOpen: d.dayOfWeek === 0 || d.dayOfWeek === 6,
          isAvailable: d.dayOfWeek === 0 || d.dayOfWeek === 6,
          timeWindows:
            d.dayOfWeek === 0 || d.dayOfWeek === 6
              ? [{ start: "09:00", end: "17:00" }]
              : [],
        }))
      );
    }
  };

  const handleResetToDefault = () => {
    setDays(getDefaultSchedule());
    showToast("Reset to AgeWellRI default operating schedule");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate time windows
    for (const day of days) {
      if (day.isOpen) {
        if (!day.timeWindows || day.timeWindows.length === 0) {
          setFormError(`${day.dayName} is marked On-Duty but has no time intervals configured.`);
          return;
        }
        for (const win of day.timeWindows) {
          const [sH, sM] = win.start.split(":").map(Number);
          const [eH, eM] = win.end.split(":").map(Number);
          if (eH * 60 + eM <= sH * 60 + sM) {
            setFormError(
              `Invalid shift for ${day.dayName} (${format24hTo12h(win.start)} – ${format24hTo12h(win.end)}). End time must be later than start time.`
            );
            return;
          }
        }
      }
    }

    try {
      await updateSpecialist({
        id: specialist.id,
        data: {
          weeklySchedule: days,
        },
      }).unwrap();

      showSuccessAlert(
        "Availability Saved",
        `Custom availability for ${specialist.name} has been updated. Automated visit assignments and slot capacity will now strictly follow this schedule.`
      );
      onClose();
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to update specialist availability.";
      setFormError(msg);
      showErrorAlert("Update Failed", msg);
    }
  };

  const activeDaysCount = days.filter((d) => d.isOpen).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#D9E4EC] w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#D9E4EC] flex items-center justify-between bg-gradient-to-r from-[#F4F8FA] to-white">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0"
              style={{ backgroundColor: specialist.color || "#294B68" }}
            >
              {specialist.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#243746]">
                  {specialist.name} — Working Availability
                </h2>
                {hasCustomSchedule ? (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Custom Schedule
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    Default Hours
                  </span>
                )}
              </div>
              <p className="text-xs text-[#64748B]">
                Set individual working days and shifts. Automatic assignment and manual booking will only dispatch this specialist during scheduled hours.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#64748B] hover:text-[#243746] rounded-xl hover:bg-[#EAF3F8] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {formError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Quick Presets Bar */}
          <div className="p-3 bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-[#243746] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#5E8FB2]" />
              <span>Quick Shift Presets:</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => applyPreset("standard")}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-[#D9E4EC] text-[#294B68] hover:bg-[#EAF3F8] transition-colors"
              >
                Standard (5 Days, 8–6)
              </button>
              <button
                type="button"
                onClick={() => applyPreset("weekdays")}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-[#D9E4EC] text-[#294B68] hover:bg-[#EAF3F8] transition-colors"
              >
                Mon–Fri (8:30–4:30)
              </button>
              <button
                type="button"
                onClick={() => applyPreset("weekends")}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-[#D9E4EC] text-[#294B68] hover:bg-[#EAF3F8] transition-colors"
              >
                Weekends Only
              </button>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-[#D9E4EC] text-[#64748B] hover:bg-slate-100 transition-colors flex items-center gap-1"
                title="Reset to AgeWellRI standard default operational hours"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Days List */}
          <div className="space-y-3">
            {days.map((day, dayIndex) => {
              const isOpen = Boolean(day.isOpen);
              return (
                <div
                  key={day.dayOfWeek}
                  className={`p-4 rounded-xl border transition-all ${
                    isOpen
                      ? "bg-white border-[#D9E4EC] shadow-2xs"
                      : "bg-[#F8FAFC] border-slate-200/80 opacity-75"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    {/* Day Toggle */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleDay(dayIndex)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isOpen ? "bg-[#294B68]" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            isOpen ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                      <div>
                        <span
                          className={`font-black text-sm block ${
                            isOpen ? "text-[#243746]" : "text-[#64748B]"
                          }`}
                        >
                          {day.dayName}
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          {isOpen ? "Scheduled On-Duty" : "Off-Duty / Unavailable"}
                        </span>
                      </div>
                    </div>

                    {/* Day Actions */}
                    {isOpen && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyHoursToAllOpen(dayIndex)}
                          className="px-2 py-1 text-[11px] font-bold text-[#5E8FB2] hover:bg-[#EAF3F8] rounded-lg transition-colors flex items-center gap-1"
                          title="Copy this day's shift hours to all other active days"
                        >
                          {isCopiedDay === dayIndex ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy hours to all open days</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddTimeWindow(dayIndex)}
                          className="px-2 py-1 text-[11px] font-bold text-[#294B68] bg-[#EAF3F8] hover:bg-[#D4E6F1] rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Shift Window</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Time Windows */}
                  {isOpen ? (
                    <div className="space-y-2 pt-2 border-t border-[#D9E4EC]/60">
                      {day.timeWindows && day.timeWindows.length > 0 ? (
                        day.timeWindows.map((win, winIndex) => (
                          <div
                            key={winIndex}
                            className="flex items-center gap-3 bg-[#F8FAFC] p-2 rounded-lg border border-[#D9E4EC]/60"
                          >
                            <Clock className="w-4 h-4 text-[#5E8FB2] shrink-0" />
                            <div className="flex items-center gap-2 flex-1">
                              <div className="flex-1">
                                <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-0.5">
                                  Shift Start
                                </label>
                                <select
                                  value={win.start}
                                  onChange={(e) =>
                                    handleTimeChange(dayIndex, winIndex, "start", e.target.value)
                                  }
                                  className="w-full px-2.5 py-1.5 text-xs font-bold text-[#243746] bg-white border border-[#D9E4EC] rounded-md focus:outline-none focus:ring-1 focus:ring-[#5E8FB2]"
                                >
                                  {STANDARD_TIMES_24H.map((t) => (
                                    <option key={t} value={t}>
                                      {format24hTo12h(t)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <span className="text-xs text-[#64748B] font-bold mt-3">to</span>
                              <div className="flex-1">
                                <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-0.5">
                                  Shift End
                                </label>
                                <select
                                  value={win.end}
                                  onChange={(e) =>
                                    handleTimeChange(dayIndex, winIndex, "end", e.target.value)
                                  }
                                  className="w-full px-2.5 py-1.5 text-xs font-bold text-[#243746] bg-white border border-[#D9E4EC] rounded-md focus:outline-none focus:ring-1 focus:ring-[#5E8FB2]"
                                >
                                  {STANDARD_TIMES_24H.map((t) => (
                                    <option key={t} value={t}>
                                      {format24hTo12h(t)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            {day.timeWindows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveTimeWindow(dayIndex, winIndex)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors mt-3"
                                title="Remove shift window"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg flex items-center justify-between">
                          <span>No time windows configured for this active day.</span>
                          <button
                            type="button"
                            onClick={() => handleAddTimeWindow(dayIndex)}
                            className="text-xs font-bold underline"
                          >
                            Add Shift
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-[#64748B] italic pt-1">
                      Specialist will not be auto-assigned and cannot be booked on this day.
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Schedule Summary Information */}
          <div className="p-3 bg-blue-50/60 border border-blue-200/60 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">
                Weekly Summary: {activeDaysCount} {activeDaysCount === 1 ? "day" : "days"} on-duty
              </span>
              <p className="text-[11px] text-blue-700 mt-0.5 leading-relaxed">
                When clients request visits, only specialists working during that specific date and hour interval will count toward available slot capacity. If reassigned manually, the admin portal will check compliance with these hours.
              </p>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#D9E4EC]">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#64748B] hover:bg-slate-100 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white text-xs font-black rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Availability...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Specialist Availability</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
