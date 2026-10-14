"use client";

import React from "react";
import {
  X,
  Calendar,
  Clock,
  User,
  UserCheck,
  ShieldAlert,
  CheckCircle2,
  CalendarX,
  Edit3,
  Trash2,
  Plus,
  Sparkles,
  AlertCircle,
  Flag,
} from "lucide-react";
import { DayAvailability } from "@/redux/features/schedule/scheduleTypes";
import {
  format24hTo12h,
  isDefaultShift,
  getCustomOpenLabel,
  formatOverrideTitle,
} from "@/lib/utils/schedule-helpers";

interface DateDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  dayData: DayAvailability | null;
  onOpenOverrideModal: (date: string, status?: "CLOSED" | "CUSTOM_HOURS") => void;
  onOpenScheduleModal?: (date: string) => void;
}

export function DateDetailsDrawer({
  isOpen,
  onClose,
  dayData,
  onOpenOverrideModal,
  onOpenScheduleModal,
}: DateDetailsDrawerProps) {
  if (!isOpen || !dayData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#D9E4EC] w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#D9E4EC] flex items-center justify-between bg-gradient-to-r from-[#F4F8FA] to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#294B68] text-white flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#243746]">
                {dayData.formattedDate}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    dayData.overrideStatus === "CUSTOM_HOURS"
                      ? isDefaultShift(dayData.timeWindows)
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-purple-50 text-purple-700 border border-purple-200"
                      : dayData.isClosed
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {dayData.overrideStatus === "CUSTOM_HOURS"
                    ? getCustomOpenLabel(dayData.timeWindows)
                    : dayData.isClosed
                    ? "Closed / Off-Day"
                    : "Operational (8 AM - 6 PM)"}
                </span>

                <span className="text-[11px] text-[#64748B]">
                  via {dayData.source.replace("_", " ")}
                </span>
              </div>
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
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
          {/* US Holiday Banner */}
          {dayData.holiday && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <Flag className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-900">
                  {dayData.holiday.name} (US Federal Holiday)
                </p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  {dayData.holiday.description || "Official US Holiday"}
                </p>
              </div>
            </div>
          )}

          {/* Override Notice if set */}
          {dayData.overrideTitle && (
            <div
              className={`p-3.5 rounded-xl border ${
                dayData.overrideStatus === "CUSTOM_HOURS"
                  ? isDefaultShift(dayData.timeWindows)
                    ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                    : "bg-purple-50/80 border-purple-200 text-purple-950"
                  : "bg-red-50/80 border-red-200 text-red-950"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                    dayData.overrideStatus === "CUSTOM_HOURS"
                      ? isDefaultShift(dayData.timeWindows)
                        ? "bg-emerald-200 text-emerald-900"
                        : "bg-purple-200 text-purple-900"
                      : "bg-red-200 text-red-900"
                  }`}
                >
                  {dayData.overrideStatus === "CUSTOM_HOURS"
                    ? getCustomOpenLabel(dayData.timeWindows)
                    : "Closed Override"}
                </span>
                <p className="text-xs font-bold">
                  {formatOverrideTitle(dayData.overrideTitle, dayData.timeWindows)}
                </p>
              </div>
              {dayData.overrideDescription && (
                <p className="text-[11px] mt-1 opacity-90 font-medium">
                  {dayData.overrideDescription}
                </p>
              )}
            </div>
          )}

          {/* Operating Windows */}
          <div className="p-4 bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl">
            <h4 className="text-xs font-bold text-[#243746] uppercase tracking-wider mb-2">
              Operational Time Windows
            </h4>
            {dayData.isOpen && dayData.timeWindows.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {dayData.timeWindows.map((win, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-white border border-[#D9E4EC] text-[#294B68] rounded-lg text-xs font-bold"
                  >
                    {format24hTo12h(win.start)} – {format24hTo12h(win.end)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-red-600 font-semibold italic">
                Office closed all day. No standard visits are allowed on this date.
              </p>
            )}
          </div>

          {/* Booked Appointments */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-[#243746] uppercase tracking-wider">
                Booked Visits ({dayData.bookedSlots.length})
              </h4>
              {onOpenScheduleModal && dayData.isOpen && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenScheduleModal(dayData.date);
                  }}
                  className="text-xs font-bold text-[#294B68] hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Dispatch Visit</span>
                </button>
              )}
            </div>

            {dayData.bookedSlots.length > 0 ? (
              <div className="space-y-2">
                {dayData.bookedSlots.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-3 bg-white border border-[#D9E4EC] rounded-xl flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#EAF3F8] text-[#294B68] flex items-center justify-center font-bold text-xs">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#243746]">
                          {appt.clientName}
                        </p>
                        <p className="text-[11px] text-[#64748B]">
                          {appt.serviceName} • {appt.technicianName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#294B68] bg-[#EAF3F8] px-2 py-0.5 rounded-md">
                        {appt.timeSlot}
                      </span>
                      <p className="text-[10px] text-[#64748B] mt-0.5 uppercase font-semibold">
                        {appt.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl text-xs text-[#64748B]">
                No appointments booked on this date yet.
              </div>
            )}
          </div>
        </div>

        {/* Quick Override Actions Footer */}
        <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#D9E4EC] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenOverrideModal(dayData.date, "CLOSED");
              }}
              className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors"
            >
              Close Date
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenOverrideModal(dayData.date, "CUSTOM_HOURS");
              }}
              className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 rounded-lg text-xs font-bold transition-colors"
            >
              Custom Open
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-[#64748B] hover:text-[#243746]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
