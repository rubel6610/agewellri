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
} from "lucide-react";
import {
  useGetWeeklyScheduleQuery,
  useUpdateWeeklyScheduleMutation,
} from "@/redux/features/schedule/scheduleApi";
import { DaySchedule, TimeWindow } from "@/redux/features/schedule/scheduleTypes";
import { showSuccessAlert, showErrorAlert, showToast } from "@/lib/alerts/sweetalert";

interface WeeklyScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export function WeeklyScheduleModal({ isOpen, onClose }: WeeklyScheduleModalProps) {
  const { data: weeklySchedule, isLoading } = useGetWeeklyScheduleQuery(undefined, {
    skip: !isOpen,
  });
  const [updateWeeklySchedule, { isLoading: isUpdating }] = useUpdateWeeklyScheduleMutation();

  const [days, setDays] = useState<DaySchedule[]>([]);
  const [slotDuration, setSlotDuration] = useState<number>(60);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (weeklySchedule?.days) {
      // Deep clone to avoid direct state mutation
      setDays(JSON.parse(JSON.stringify(weeklySchedule.days)));
      setSlotDuration(weeklySchedule.slotDuration || 60);
      setFormError(null);
    }
  }, [weeklySchedule, isOpen]);

  if (!isOpen) return null;

  const handleToggleDay = (dayIndex: number) => {
    setDays((prev) =>
      prev.map((day, idx) => {
        if (idx !== dayIndex) return day;
        const nextIsOpen = !day.isOpen;
        return {
          ...day,
          isOpen: nextIsOpen,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate time windows
    for (const day of days) {
      if (day.isOpen) {
        if (!day.timeWindows || day.timeWindows.length === 0) {
          setFormError(`${day.dayName} is marked as Open but has no time windows configured.`);
          return;
        }
        for (const win of day.timeWindows) {
          const [sH, sM] = win.start.split(":").map(Number);
          const [eH, eM] = win.end.split(":").map(Number);
          if (eH * 60 + eM <= sH * 60 + sM) {
            setFormError(
              `Invalid time window for ${day.dayName} (${format24hTo12h(win.start)} – ${format24hTo12h(win.end)}). End time must be after start time.`
            );
            return;
          }
        }
      }
    }

    try {
      const res = await updateWeeklySchedule({
        days,
        slotDuration,
      }).unwrap();

      showSuccessAlert(
        "Weekly Schedule Updated",
        "The standard recurring weekly schedule has been successfully saved. All future dates will reflect these hours automatically."
      );
      onClose();
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to update weekly schedule.";
      setFormError(msg);
      showErrorAlert("Update Failed", msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#D9E4EC] w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#D9E4EC] flex items-center justify-between bg-gradient-to-r from-[#F4F8FA] to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#294B68] text-white flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#243746]">
                Default Weekly Availability
              </h2>
              <p className="text-xs text-[#64748B]">
                Configure standard recurring operational hours for each day of the week.
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
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#5E8FB2]" />
            <p className="text-sm font-semibold text-[#64748B]">
              Loading weekly schedule...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
              {formError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Days List */}
              <div className="space-y-3">
                {days.map((day, dayIdx) => (
                  <div
                    key={day.dayOfWeek}
                    className={`p-4 rounded-xl border transition-all ${
                      day.isOpen
                        ? "bg-white border-[#D9E4EC] shadow-xs"
                        : "bg-[#F8FAFC] border-slate-200 opacity-80"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#D9E4EC]/50">
                      <div className="flex items-center gap-3">
                        {/* Interactive Toggle Switch Button */}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={day.isOpen}
                          onClick={() => handleToggleDay(dayIdx)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#294B68] focus:ring-offset-2 ${
                            day.isOpen ? "bg-[#294B68]" : "bg-slate-300"
                          }`}
                        >
                          <span className="sr-only">Toggle {day.dayName} operational status</span>
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              day.isOpen ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <div
                          onClick={() => handleToggleDay(dayIdx)}
                          className="cursor-pointer select-none flex items-center"
                        >
                          <span className="font-bold text-sm text-[#243746]">
                            {day.dayName}
                          </span>
                          <span
                            className={`ml-2 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              day.isOpen
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-500 border border-slate-200"
                            }`}
                          >
                            {day.isOpen ? "Operational" : "Closed"}
                          </span>
                        </div>
                      </div>

                      {day.isOpen && (
                        <button
                          type="button"
                          onClick={() => handleAddTimeWindow(dayIdx)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-[#294B68] bg-[#EAF3F8] hover:bg-[#D9E4EC] rounded-lg transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Hours Window</span>
                        </button>
                      )}
                    </div>

                    {/* Time Windows */}
                    {day.isOpen ? (
                      <div className="pt-3 space-y-2.5">
                        {day.timeWindows.map((win, winIdx) => (
                          <div
                            key={winIdx}
                            className="flex flex-wrap items-center gap-2 text-xs"
                          >
                            <span className="text-[#64748B] font-semibold w-16">
                              Window {winIdx + 1}:
                            </span>
                            <div className="flex items-center gap-2">
                              <select
                                value={win.start}
                                onChange={(e) =>
                                  handleTimeChange(dayIdx, winIdx, "start", e.target.value)
                                }
                                className="px-2.5 py-1.5 bg-[#F8FAFC] border border-[#D9E4EC] rounded-lg text-xs font-semibold text-[#243746] focus:ring-1 focus:ring-[#5E8FB2]"
                              >
                                {STANDARD_TIMES_24H.map((t) => (
                                  <option key={t} value={t}>
                                    {format24hTo12h(t)}
                                  </option>
                                ))}
                              </select>
                              <span className="text-[#64748B] font-bold">to</span>
                              <select
                                value={win.end}
                                onChange={(e) =>
                                  handleTimeChange(dayIdx, winIdx, "end", e.target.value)
                                }
                                className="px-2.5 py-1.5 bg-[#F8FAFC] border border-[#D9E4EC] rounded-lg text-xs font-semibold text-[#243746] focus:ring-1 focus:ring-[#5E8FB2]"
                              >
                                {STANDARD_TIMES_24H.map((t) => (
                                  <option key={t} value={t}>
                                    {format24hTo12h(t)}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {day.timeWindows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveTimeWindow(dayIdx, winIdx)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ml-auto"
                                title="Remove this time window"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="pt-2 text-xs text-[#64748B] italic">
                        Closed all day. No client visits will be scheduled.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#D9E4EC] flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#243746] hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#294B68] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#203a52] disabled:opacity-50 transition-all cursor-pointer"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Schedule...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Weekly Schedule</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
