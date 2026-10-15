"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  Plus,
  Trash2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Save,
  CheckCircle2,
  CalendarX,
  Sparkles,
} from "lucide-react";
import {
  useCreateScheduleOverrideMutation,
  useUpdateScheduleOverrideMutation,
  usePreviewScheduleConflictsMutation,
} from "@/redux/features/schedule/scheduleApi";
import {
  ScheduleOverrideItem,
  TimeWindow,
  ConflictingAppointmentItem,
} from "@/redux/features/schedule/scheduleTypes";
import { showSuccessAlert, showErrorAlert, showToast } from "@/lib/alerts/sweetalert";
import {
  format24hTo12h,
  isDefaultShift,
  getCustomOpenLabel,
  isAutoTitle,
} from "@/lib/utils/schedule-helpers";

interface ScheduleOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  overrideItem?: ScheduleOverrideItem | null;
  initialDate?: string | null;
  initialStatus?: "CLOSED" | "CUSTOM_HOURS";
}

const STANDARD_TIMES_24H = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00",
];



export function ScheduleOverrideModal({
  isOpen,
  onClose,
  overrideItem,
  initialDate,
  initialStatus = "CLOSED",
}: ScheduleOverrideModalProps) {
  const [createOverride, { isLoading: isCreating }] = useCreateScheduleOverrideMutation();
  const [updateOverride, { isLoading: isUpdating }] = useUpdateScheduleOverrideMutation();
  const [previewConflicts, { isLoading: isCheckingConflicts }] =
    usePreviewScheduleConflictsMutation();

  const isEditing = Boolean(overrideItem);

  const [overrideType, setOverrideType] = useState<"DATE" | "WEEK">("DATE");
  const [dateMode, setDateMode] = useState<"SINGLE" | "RANGE">("SINGLE");
  const [status, setStatus] = useState<"CLOSED" | "CUSTOM_HOURS">("CLOSED");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [timeWindows, setTimeWindows] = useState<TimeWindow[]>([
    { start: "08:00", end: "18:00" },
  ]);
  const [conflicts, setConflicts] = useState<ConflictingAppointmentItem[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (overrideItem) {
      const cleanStart = overrideItem.startDate
        ? String(overrideItem.startDate).split("T")[0]
        : "";
      const cleanEnd = overrideItem.endDate
        ? String(overrideItem.endDate).split("T")[0]
        : cleanStart;
      const isSingle = overrideItem.isSingleDay ?? (cleanStart === cleanEnd);

      setOverrideType(overrideItem.overrideType || "DATE");
      setDateMode(isSingle ? "SINGLE" : "RANGE");
      setStatus(overrideItem.status === "CLOSED" ? "CLOSED" : "CUSTOM_HOURS");
      const existingTitle = overrideItem.title || "";
      setTitle(isAutoTitle(existingTitle) ? "" : existingTitle);
      setDescription(overrideItem.description || "");
      setStartDate(cleanStart);
      setEndDate(cleanEnd);
      setIsRecurring(Boolean(overrideItem.isRecurring));
      setIsActive(overrideItem.isActive !== false);
      setTimeWindows(
        Array.isArray(overrideItem.timeWindows) && overrideItem.timeWindows.length > 0
          ? overrideItem.timeWindows.map((w) => ({ start: w.start, end: w.end }))
          : [{ start: "08:00", end: "18:00" }]
      );
      setFormErrors({});
    } else {
      const targetDate = initialDate
        ? String(initialDate).split("T")[0]
        : new Date().toISOString().split("T")[0];
      const targetStatus = initialStatus === "CUSTOM_HOURS" ? "CUSTOM_HOURS" : "CLOSED";
      const initialWindows = [{ start: "08:00", end: "18:00" }];
      setOverrideType("DATE");
      setDateMode("SINGLE");
      setStatus(targetStatus);
      setTitle("");
      setDescription("");
      setStartDate(targetDate);
      setEndDate(targetDate);
      setIsRecurring(false);
      setIsActive(true);
      setTimeWindows(initialWindows);
      setConflicts([]);
      setFormErrors({});
    }
  }, [overrideItem, initialDate, initialStatus, isOpen]);

  // Check conflicts whenever start/end dates change
  useEffect(() => {
    if (!isOpen || !startDate) return;
    const finalEnd = dateMode === "SINGLE" || overrideType === "DATE" && !endDate ? startDate : endDate;
    if (finalEnd < startDate) return;

    const timer = setTimeout(async () => {
      try {
        const res = await previewConflicts({
          startDate,
          endDate: finalEnd,
        }).unwrap();
        setConflicts(res.conflicts || []);
      } catch {
        setConflicts([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [startDate, endDate, dateMode, overrideType, isOpen, previewConflicts]);

  if (!isOpen) return null;

  const handleAddTimeWindow = () => {
    setTimeWindows((prev) => [...prev, { start: "14:00", end: "18:00" }]);
  };

  const handleRemoveTimeWindow = (idx: number) => {
    setTimeWindows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleTimeChange = (
    idx: number,
    field: "start" | "end",
    value: string
  ) => {
    setTimeWindows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!startDate) {
      errors.startDate = "Start date is required.";
    }
    const finalEnd =
      dateMode === "SINGLE" && overrideType === "DATE" ? startDate : endDate || startDate;
    if (finalEnd < startDate) {
      errors.endDate = "End date cannot be before start date.";
    }

    if (status === "CUSTOM_HOURS") {
      if (!timeWindows.length) {
        errors.timeWindows = "At least one time window is required for Custom Open.";
      }
      for (const win of timeWindows) {
        const [sH, sM] = win.start.split(":").map(Number);
        const [eH, eM] = win.end.split(":").map(Number);
        if (eH * 60 + eM <= sH * 60 + sM) {
          errors.timeWindows = `Invalid window (${format24hTo12h(win.start)} – ${format24hTo12h(win.end)}). End time must be after start time.`;
          break;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        overrideType,
        status,
        startDate,
        endDate: finalEnd,
        isRecurring,
        isActive,
        timeWindows: status === "CUSTOM_HOURS" ? timeWindows : [],
      };

      if (isEditing && overrideItem) {
        await updateOverride({
          id: overrideItem.id,
          data: payload,
        }).unwrap();
        showToast("Schedule override updated successfully.", "success");
      } else {
        await createOverride(payload).unwrap();
        showToast("Schedule override created successfully.", "success");
      }

      onClose();
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to save schedule override.";
      showErrorAlert("Operation Failed", msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#D9E4EC] w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#D9E4EC] flex items-center justify-between bg-gradient-to-r from-[#F4F8FA] to-white">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs text-white ${
                status === "CLOSED" ? "bg-red-600" : "bg-purple-600"
              }`}
            >
              {status === "CLOSED" ? (
                <CalendarX className="w-5 h-5" />
              ) : (
                <Clock className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#243746]">
                {isEditing ? "Edit Schedule Override" : "Create Schedule Override"}
              </h2>
              <p className="text-xs text-[#64748B]">
                Override normal weekly availability for a specific date or week.
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

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[65vh] overflow-y-auto space-y-5">
            {/* Override Action / Status Mode */}
            <div>
              <label className="block text-xs font-bold text-[#243746] mb-2 uppercase tracking-wider">
                Availability Status on Overridden Dates *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus("CLOSED")}
                  className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold cursor-pointer ${
                    status === "CLOSED"
                      ? "bg-red-50 border-red-300 text-red-700 shadow-xs ring-2 ring-red-400/20"
                      : "bg-white border-[#D9E4EC] text-[#64748B] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-red-500"></span>
                  <span className="text-sm">Office Closed</span>
                  <span className="text-[11px] font-normal text-red-600/80">
                    No bookings allowed
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus("CUSTOM_HOURS")}
                  className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold cursor-pointer ${
                    status === "CUSTOM_HOURS"
                      ? "bg-purple-50 border-purple-300 text-purple-700 shadow-xs ring-2 ring-purple-400/20"
                      : "bg-white border-[#D9E4EC] text-[#64748B] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-purple-500"></span>
                  <span className="text-sm">Custom Open</span>
                  <span className="text-[11px] font-normal text-purple-600/80">
                    {isDefaultShift(timeWindows)
                      ? "Default shift (8 AM – 6 PM)"
                      : "Custom operational windows"}
                  </span>
                </button>
              </div>
            </div>

            {/* Scope: Date Override vs Week Override */}
            <div>
              <label className="block text-xs font-bold text-[#243746] mb-1.5 uppercase tracking-wider">
                Scope of Override
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOverrideType("DATE");
                    setDateMode("SINGLE");
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    overrideType === "DATE"
                      ? "bg-[#294B68] text-white border-[#294B68]"
                      : "bg-white text-[#243746] border-[#D9E4EC] hover:bg-[#F8FAFC]"
                  }`}
                >
                  Individual Date(s) Override
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOverrideType("WEEK");
                    setDateMode("RANGE");
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    overrideType === "WEEK"
                      ? "bg-[#294B68] text-white border-[#294B68]"
                      : "bg-white text-[#243746] border-[#D9E4EC] hover:bg-[#F8FAFC]"
                  }`}
                >
                  Entire Week Override
                </button>
              </div>
            </div>

            {/* Date Range Selector */}
            <div className="rounded-xl space-y-3">
              {/* {overrideType === "DATE" && (
                <div className="flex items-center gap-4 text-xs font-semibold text-[#243746]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="dateMode"
                      checked={dateMode === "SINGLE"}
                      onChange={() => {
                        setDateMode("SINGLE");
                        setEndDate(startDate);
                      }}
                      className="text-[#294B68] focus:ring-[#5E8FB2]"
                    />
                    <span>Single Date</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="dateMode"
                      checked={dateMode === "RANGE"}
                      onChange={() => setDateMode("RANGE")}
                      className="text-[#294B68] focus:ring-[#5E8FB2]"
                    />
                    <span>Date Range (Multi-day)</span>
                  </label>
                </div>
              )} */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#243746] mb-1">
                    {dateMode === "SINGLE" && overrideType === "DATE"
                      ? "Selected Date *"
                      : "Start Date *"}
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      setStartDate(newStart);
                      if (dateMode === "SINGLE" && overrideType === "DATE") {
                        setEndDate(newStart);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-[#D9E4EC] rounded-xl text-xs font-semibold text-[#243746] focus:ring-2 focus:ring-[#5E8FB2] focus:outline-none"
                  />
                  {formErrors.startDate && (
                    <p className="text-[11px] text-red-600 font-semibold mt-1">
                      {formErrors.startDate}
                    </p>
                  )}
                </div>

                {(dateMode === "RANGE" || overrideType === "WEEK") && (
                  <div>
                    <label className="block text-xs font-bold text-[#243746] mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#D9E4EC] rounded-xl text-xs font-semibold text-[#243746] focus:ring-2 focus:ring-[#5E8FB2] focus:outline-none"
                    />
                    {formErrors.endDate && (
                      <p className="text-[11px] text-red-600 font-semibold mt-1">
                        {formErrors.endDate}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Title & Reason */}
            <div>
              <label className="block text-xs font-bold text-[#243746] mb-1">
                 Reason <span className="text-[11px] font-normal text-[#64748B]">(optional)</span>
              </label>
              <input
                type="text"
                value={title}
              
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Independence Day Office Closure, Staff Workshop, Weekend Hours"
                className="w-full px-3.5 py-2.5 bg-white border border-[#D9E4EC] rounded-xl text-xs font-semibold text-[#243746] focus:ring-2 focus:ring-[#5E8FB2] focus:outline-none"
              />
              {formErrors.title && (
                <p className="text-[11px] text-red-600 font-semibold mt-1">
                  {formErrors.title}
                </p>
              )}
            </div>

            {/* Description / Notes */}
            <div>
              <label className="block text-xs font-bold text-[#243746] mb-1">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Details shown in internal logs and calendar tooltips."
                className="w-full px-3.5 py-2.5 bg-white border border-[#D9E4EC] rounded-xl text-xs font-semibold text-[#243746] focus:ring-2 focus:ring-[#5E8FB2] focus:outline-none resize-none"
              />
            </div>

            {/* Custom Open Builder (when status === "CUSTOM_HOURS") */}
            {status === "CUSTOM_HOURS" && (
              <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                    <Clock className="w-4 h-4 text-purple-700" />
                    <span>
                      {isDefaultShift(timeWindows)
                        ? "Standard Shift Windows (8 AM – 6 PM)"
                        : "Custom Operational Windows"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTimeWindow}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold text-purple-700 bg-white border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Window</span>
                  </button>
                </div>

                {formErrors.timeWindows && (
                  <p className="text-[11px] text-red-600 font-semibold">
                    {formErrors.timeWindows}
                  </p>
                )}

                <div className="space-y-2">
                  {timeWindows.map((win, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-purple-200 text-xs"
                    >
                      <span className="font-bold text-[#64748B] w-16">
                        Window {idx + 1}:
                      </span>
                      <select
                        value={win.start}
                        onChange={(e) => handleTimeChange(idx, "start", e.target.value)}
                        className="px-2.5 py-1.5 bg-[#F8FAFC] border border-[#D9E4EC] rounded-lg text-xs font-semibold text-[#243746]"
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
                        onChange={(e) => handleTimeChange(idx, "end", e.target.value)}
                        className="px-2.5 py-1.5 bg-[#F8FAFC] border border-[#D9E4EC] rounded-lg text-xs font-semibold text-[#243746]"
                      >
                        {STANDARD_TIMES_24H.map((t) => (
                          <option key={t} value={t}>
                            {format24hTo12h(t)}
                          </option>
                        ))}
                      </select>
                      {timeWindows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTimeWindow(idx)}
                          className="p-1.5 text-red-500 hover:text-red-700 rounded-lg ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recurring & Active Toggles */}
            <div className="flex flex-wrap items-center gap-6 pt-1 text-xs">
              <label className="flex items-center gap-2 font-semibold text-[#243746] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 text-[#294B68] rounded border-gray-300 focus:ring-[#5E8FB2]"
                />
                <span>Repeat Annually (Every year on this date)</span>
              </label>

              <label className="flex items-center gap-2 font-semibold text-[#243746] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#294B68] rounded border-gray-300 focus:ring-[#5E8FB2]"
                />
                <span>Active Override</span>
              </label>
            </div>

            {/* Conflict Warning Banner */}
            {conflicts.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-800 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    ⚠️ {conflicts.length} Scheduled Visit(s) Fall On This Overridden Period
                  </span>
                </div>
                <p className="text-amber-700 text-[11px] leading-relaxed">
                  Closing this date or changing hours prevents new bookings. Existing scheduled
                  appointments will <strong>remain preserved</strong> in the system. You may
                  contact affected clients or reschedule visits as needed.
                </p>
                <div className="mt-2 space-y-1 max-h-28 overflow-y-auto bg-white/70 p-2 rounded-lg border border-amber-200">
                  {conflicts.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between text-[11px] text-[#243746]"
                    >
                      <span className="font-semibold">{c.clientName}</span>
                      <span className="text-[#64748B]">
                        {c.formattedDate} ({c.timeSlot})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              disabled={isCreating || isUpdating}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#294B68] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#203a52] disabled:opacity-50 transition-all cursor-pointer"
            >
              {isCreating || isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Override...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? "Update Override" : "Save Override"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
