"use client";

import React, { useState, useMemo } from "react";
import {
  CalendarClock,
  Calendar as CalendarIcon,
  CalendarCheck,
  CalendarX,
  Clock,
  Plus,
  Search,
  RefreshCw,
  Edit3,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Sliders,
  Flag,
  User,
  Layers,
  Filter,
  Info,
  MessageSquare,
} from "lucide-react";
import {
  useGetCalendarScheduleQuery,
  useGetScheduleOverridesQuery,
  useDeleteScheduleOverrideMutation,
} from "@/redux/features/schedule/scheduleApi";
import {
  DayAvailability,
  ScheduleOverrideItem,
} from "@/redux/features/schedule/scheduleTypes";
import { WeeklyScheduleModal } from "@/components/admin/schedule/weekly-schedule-modal";
import { ScheduleOverrideModal } from "@/components/admin/schedule/schedule-override-modal";
import { DateDetailsDrawer } from "@/components/admin/schedule/date-details-drawer";
import { AdminScheduleModal } from "@/components/admin/admin-schedule-modal";
import { confirmDelete, showToast, showErrorAlert } from "@/lib/alerts/sweetalert";
import { TablePagination } from "@/components/ui/table-pagination";
import { format24hTo12h } from "@/lib/utils/schedule-helpers";

export default function AdminCommandSchedulePage() {
  // Calendar Navigation State
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<"MONTH" | "WEEK" | "DAY" | "OVERRIDES">("MONTH");
  const [selectedDayDate, setSelectedDayDate] = useState<string>(
    () => new Date().toISOString().split("T")[0]
  );

  // Overrides Tab Search & Filters
  const [overrideSearch, setOverrideSearch] = useState("");
  const [overrideTypeFilter, setOverrideTypeFilter] = useState<"ALL" | "DATE" | "WEEK">("ALL");
  const [overrideStatusFilter, setOverrideStatusFilter] = useState<"ALL" | "CLOSED" | "CUSTOM_HOURS" | "OPEN">("ALL");
  const [overridePage, setOverridePage] = useState(1);
  const [overridePageSize, setOverridePageSize] = useState(10);

  // Modals State
  const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState(false);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [selectedOverrideItem, setSelectedOverrideItem] = useState<ScheduleOverrideItem | null>(null);
  const [overrideInitialDate, setOverrideInitialDate] = useState<string | null>(null);
  const [overrideInitialStatus, setOverrideInitialStatus] = useState<"CLOSED" | "CUSTOM_HOURS" | "OPEN">("CLOSED");

  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [selectedDrawerDay, setSelectedDrawerDay] = useState<DayAvailability | null>(null);

  const [isAdminScheduleModalOpen, setIsAdminScheduleModalOpen] = useState(false);
  const [dispatchInitialDate, setDispatchInitialDate] = useState<string | undefined>(undefined);

  // Calculate Date Range for current Month / Week
  const { startDateStr, endDateStr } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (viewMode === "MONTH") {
      // Pad to full 6 weeks grid boundaries to show adjacent month spillover cleanly
      const firstOfMonth = new Date(Date.UTC(year, month, 1));
      const firstDayOfWeek = firstOfMonth.getUTCDay(); // 0 = Sun
      const gridStart = new Date(firstOfMonth);
      gridStart.setUTCDate(gridStart.getUTCDate() - firstDayOfWeek);

      const lastOfMonth = new Date(Date.UTC(year, month + 1, 0));
      const lastDayOfWeek = lastOfMonth.getUTCDay();
      const gridEnd = new Date(lastOfMonth);
      gridEnd.setUTCDate(gridEnd.getUTCDate() + (6 - lastDayOfWeek));

      const sY = gridStart.getUTCFullYear();
      const sM = String(gridStart.getUTCMonth() + 1).padStart(2, "0");
      const sD = String(gridStart.getUTCDate()).padStart(2, "0");

      const eY = gridEnd.getUTCFullYear();
      const eM = String(gridEnd.getUTCMonth() + 1).padStart(2, "0");
      const eD = String(gridEnd.getUTCDate()).padStart(2, "0");

      return { startDateStr: `${sY}-${sM}-${sD}`, endDateStr: `${eY}-${eM}-${eD}` };
    } else if (viewMode === "WEEK") {
      const cur = new Date(currentDate);
      const dayOfWeek = cur.getDay();
      const weekStart = new Date(cur);
      weekStart.setDate(cur.getDate() - dayOfWeek);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const sY = weekStart.getFullYear();
      const sM = String(weekStart.getMonth() + 1).padStart(2, "0");
      const sD = String(weekStart.getDate()).padStart(2, "0");

      const eY = weekEnd.getFullYear();
      const eM = String(weekEnd.getMonth() + 1).padStart(2, "0");
      const eD = String(weekEnd.getDate()).padStart(2, "0");

      return { startDateStr: `${sY}-${sM}-${sD}`, endDateStr: `${eY}-${eM}-${eD}` };
    } else {
      // DAY view
      const cur = new Date(currentDate);
      const sY = cur.getFullYear();
      const sM = String(cur.getMonth() + 1).padStart(2, "0");
      const sD = String(cur.getDate()).padStart(2, "0");
      const dStr = `${sY}-${sM}-${sD}`;
      return { startDateStr: dStr, endDateStr: dStr };
    }
  }, [currentDate, viewMode]);

  // Queries
  const {
    data: calendarSchedule,
    isLoading: isCalendarLoading,
    isFetching: isCalendarFetching,
    refetch: refetchCalendar,
  } = useGetCalendarScheduleQuery(
    { startDate: startDateStr, endDate: endDateStr },
    { skip: viewMode === "OVERRIDES" }
  );

  const {
    data: overridesRes,
    isLoading: isOverridesLoading,
    refetch: refetchOverrides,
  } = useGetScheduleOverridesQuery(
    {
      search: overrideSearch || undefined,
      overrideType: overrideTypeFilter !== "ALL" ? overrideTypeFilter : undefined,
      status: overrideStatusFilter !== "ALL" ? overrideStatusFilter : undefined,
    },
    { skip: viewMode !== "OVERRIDES" }
  );

  const [deleteOverrideMutation, { isLoading: isDeleting }] =
    useDeleteScheduleOverrideMutation();

  // Navigation handlers
  const handlePrev = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (viewMode === "MONTH") {
        next.setMonth(next.getMonth() - 1);
      } else if (viewMode === "WEEK") {
        next.setDate(next.getDate() - 7);
      } else {
        next.setDate(next.getDate() - 1);
      }
      return next;
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (viewMode === "MONTH") {
        next.setMonth(next.getMonth() + 1);
      } else if (viewMode === "WEEK") {
        next.setDate(next.getDate() + 7);
      } else {
        next.setDate(next.getDate() + 1);
      }
      return next;
    });
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDayDate(today.toISOString().split("T")[0]);
  };

  const handleOpenDayDetails = (day: DayAvailability) => {
    setSelectedDrawerDay(day);
    setIsDetailsDrawerOpen(true);
  };

  const handleOpenCreateOverride = (
    date?: string,
    statusOverride?: "CLOSED" | "CUSTOM_HOURS" | "OPEN"
  ) => {
    setSelectedOverrideItem(null);
    setOverrideInitialDate(date || new Date().toISOString().split("T")[0]);
    setOverrideInitialStatus(statusOverride || "CLOSED");
    setIsOverrideModalOpen(true);
  };

  const handleOpenEditOverride = (item: ScheduleOverrideItem) => {
    setSelectedOverrideItem(item);
    setIsOverrideModalOpen(true);
  };

  const handleDeleteOverride = async (item: ScheduleOverrideItem) => {
    const confirmed = await confirmDelete({
      title: `Delete Override: ${item.title}?`,
      text: `Are you sure you want to remove this schedule override (${item.formattedDateRange})? The normal weekly schedule will apply again.`,
    });
    if (!confirmed) return;

    try {
      const res = await deleteOverrideMutation(item.id).unwrap();
      showToast(res.message || "Schedule override removed", "success");
      refetchOverrides();
      refetchCalendar();
    } catch (err: any) {
      showErrorAlert("Delete Failed", err?.data?.message || "Failed to remove override.");
    }
  };

  // Days mapping for calendar
  const calendarDays = useMemo(() => calendarSchedule?.days || [], [calendarSchedule?.days]);
  const calendarSummary = calendarSchedule?.summary || {
    totalDays: 0,
    openDaysCount: 0,
    closedDaysCount: 0,
    totalBookingsCount: 0,
    totalAvailableSlotsCount: 0,
  };

  // Day View specific day data
  const singleDayData = useMemo(() => {
    if (viewMode !== "DAY") return null;
    const targetKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
    return calendarDays.find((d) => d.date === targetKey) || null;
  }, [calendarDays, currentDate, viewMode]);

  const allOverrides = useMemo(() => overridesRes?.items || [], [overridesRes?.items]);
  const paginatedOverrides = useMemo(() => {
    const start = (overridePage - 1) * overridePageSize;
    return allOverrides.slice(start, start + overridePageSize);
  }, [allOverrides, overridePage, overridePageSize]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto min-h-screen">
      {/* Page Title & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#D9E4EC] shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#294B68] text-white flex items-center justify-center shadow-md shrink-0">
            <CalendarClock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#243746] tracking-tight">
                Command Schedule
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 bg-[#294B68]/10 text-[#294B68] rounded-full">
                Unified Availability
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Authoritative availability engine, weekly operating hours, date overrides & client bookings.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsWeeklyModalOpen(true)}
            className="px-3.5 py-2.5 bg-[#EAF3F8] hover:bg-[#D9E4EC] text-[#294B68] text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer border border-[#5E8FB2]/30"
          >
            <Sliders className="w-4 h-4" />
            <span>Default Weekly Hours</span>
          </button>

          <button
            onClick={() => handleOpenCreateOverride()}
            className="px-4 py-2.5 bg-[#294B68] hover:bg-[#203a52] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Schedule Override</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#D9E4EC] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Operational Days
            </p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
              {calendarSummary.openDaysCount}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              Available for visits
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#D9E4EC] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Closed / Off-Days
            </p>
            <p className="text-2xl sm:text-3xl font-black text-red-700 mt-1">
              {calendarSummary.closedDaysCount}
            </p>
            <p className="text-[11px] text-red-600 font-semibold mt-0.5">
              No visits scheduled
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <CalendarX className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#D9E4EC] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Booked Visits
            </p>
            <p className="text-2xl sm:text-3xl font-black text-[#294B68] mt-1">
              {calendarSummary.totalBookingsCount}
            </p>
            <p className="text-[11px] text-[#5E8FB2] font-semibold mt-0.5">
              Confirmed in period
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#EAF3F8] text-[#294B68] flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#D9E4EC] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Available Slots
            </p>
            <p className="text-2xl sm:text-3xl font-black text-purple-700 mt-1">
              {calendarSummary.totalAvailableSlotsCount}
            </p>
            <p className="text-[11px] text-purple-600 font-semibold mt-0.5">
              Bookable open slots
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Command Schedule Container */}
      <div className="bg-white rounded-2xl border border-[#D9E4EC] shadow-xs overflow-hidden">
        {/* Navigation & Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-[#D9E4EC] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#F8FAFC] to-white">
          {/* View Switchers */}
          <div className="flex items-center bg-[#EAF3F8]/70 p-1 rounded-xl border border-[#5E8FB2]/20 shrink-0">
            <button
              onClick={() => setViewMode("MONTH")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "MONTH"
                  ? "bg-[#294B68] text-white shadow-xs"
                  : "text-[#243746] hover:text-[#294B68]"
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode("WEEK")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "WEEK"
                  ? "bg-[#294B68] text-white shadow-xs"
                  : "text-[#243746] hover:text-[#294B68]"
              }`}
            >
              Week View
            </button>
            <button
              onClick={() => setViewMode("DAY")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "DAY"
                  ? "bg-[#294B68] text-white shadow-xs"
                  : "text-[#243746] hover:text-[#294B68]"
              }`}
            >
              Day Timeline
            </button>
            <button
              onClick={() => setViewMode("OVERRIDES")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "OVERRIDES"
                  ? "bg-[#294B68] text-white shadow-xs"
                  : "text-[#243746] hover:text-[#294B68]"
              }`}
            >
              Overrides List
            </button>
          </div>

          {/* Date Range Navigation */}
          {viewMode !== "OVERRIDES" && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleToday}
                className="px-3 py-1.5 bg-white border border-[#D9E4EC] text-[#243746] hover:bg-[#EAF3F8] text-xs font-bold rounded-xl transition-colors shadow-2xs"
              >
                Today
              </button>

              <div className="flex items-center gap-1 bg-white border border-[#D9E4EC] p-1 rounded-xl shadow-2xs">
                <button
                  onClick={handlePrev}
                  className="p-1.5 hover:bg-[#EAF3F8] text-[#243746] rounded-lg transition-colors"
                  title="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="px-3 text-xs sm:text-sm font-bold text-[#243746] min-w-[140px] text-center">
                  {viewMode === "MONTH" &&
                    currentDate.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  {viewMode === "WEEK" &&
                    `Week of ${new Date(startDateStr).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}`}
                  {viewMode === "DAY" &&
                    currentDate.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                </span>

                <button
                  onClick={handleNext}
                  className="p-1.5 hover:bg-[#EAF3F8] text-[#243746] rounded-lg transition-colors"
                  title="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => refetchCalendar()}
                disabled={isCalendarFetching}
                className="p-2 text-[#64748B] hover:text-[#294B68] hover:bg-[#EAF3F8] rounded-xl border border-[#D9E4EC] transition-colors"
                title="Refresh Availability"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isCalendarFetching ? "animate-spin text-[#294B68]" : ""}`}
                />
              </button>
            </div>
          )}
        </div>

        {/* Legend */}
        {viewMode !== "OVERRIDES" && (
          <div className="px-6 py-2.5 bg-[#F8FAFC] border-b border-[#D9E4EC] flex flex-wrap items-center gap-4 text-xs font-semibold text-[#64748B]">
            <span className="text-[#243746] font-bold">Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Available / Open</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#294B68]"></span>
              <span>Booked Visit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>Closed (Off-Day)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <span>Custom Hours</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>US Federal Holiday</span>
            </div>
          </div>
        )}

        {/* 1. MONTH VIEW */}
        {viewMode === "MONTH" && (
          <div className="p-4 sm:p-6">
            {isCalendarLoading ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#5E8FB2]" />
                <p className="text-sm font-semibold text-[#64748B]">
                  Computing authoritative schedule availability...
                </p>
              </div>
            ) : (
              <div>
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day) => {
                    const [y, m, d] = day.date.split("-").map(Number);
                    const isCurrentMonth = m - 1 === currentDate.getMonth();

                    return (
                      <div
                        key={day.date}
                        onClick={() => handleOpenDayDetails(day)}
                        className={`min-h-[105px] sm:min-h-[120px] p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group hover:shadow-md hover:border-[#5E8FB2] ${
                          day.isToday
                            ? "ring-2 ring-[#294B68] bg-white"
                            : !isCurrentMonth
                            ? "bg-slate-50/60 opacity-60 border-slate-200"
                            : day.overrideStatus === "CUSTOM_HOURS"
                            ? "bg-purple-50/50 border-purple-200 shadow-2xs"
                            : day.overrideStatus === "OPEN"
                            ? "bg-emerald-50/50 border-emerald-200 shadow-2xs"
                            : day.isClosed
                            ? "bg-red-50/40 border-red-200"
                            : "bg-white border-[#D9E4EC]"
                        }`}
                      >
                        {/* Day Number and Badges */}
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`text-xs sm:text-sm font-black w-6 h-6 flex items-center justify-center rounded-lg ${
                                day.isToday
                                  ? "bg-[#294B68] text-white"
                                  : "text-[#243746]"
                              }`}
                            >
                              {d}
                            </span>

                            {/* Status Pill */}
                            <span
                              className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md leading-none ${
                                day.overrideStatus === "CUSTOM_HOURS"
                                  ? "bg-purple-100 text-purple-800 border border-purple-300"
                                  : day.overrideStatus === "OPEN"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  : day.isClosed
                                  ? "bg-red-100 text-red-700 border border-red-200"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {day.overrideStatus === "CUSTOM_HOURS"
                                ? "Custom"
                                : day.overrideStatus === "OPEN"
                                ? "Open"
                                : day.isClosed
                                ? "Closed"
                                : "Open"}
                            </span>
                          </div>

                          {/* US Holiday Banner */}
                          {day.holiday && (
                            <div className="mt-1 px-1.5 py-0.5 bg-amber-100/90 text-amber-800 text-[10px] font-bold rounded truncate flex items-center gap-1" title={`${day.holiday.name} (US Federal Holiday)`}>
                              <Flag className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{day.holiday.name}</span>
                            </div>
                          )}

                          {/* Override Title if exists */}
                          {day.overrideTitle && (
                            <div
                              className={`mt-1 px-1.5 py-0.5 text-[10px] font-bold rounded truncate ${
                                day.overrideStatus === "CUSTOM_HOURS"
                                  ? "bg-purple-100/80 text-purple-900 border border-purple-200"
                                  : day.overrideStatus === "OPEN"
                                  ? "bg-emerald-100/80 text-emerald-900 border border-emerald-200"
                                  : "bg-red-100/80 text-red-900 border border-red-200"
                              }`}
                              title={day.overrideTitle}
                            >
                              {day.overrideTitle}
                            </div>
                          )}

                          {/* Override Note / Description if exists */}
                          {day.overrideDescription && (
                            <div
                              className="mt-1 px-1.5 py-0.5 bg-sky-50 border border-sky-200 text-sky-900 text-[9.5px] font-medium rounded truncate flex items-center gap-1"
                              title={`Note: ${day.overrideDescription}`}
                            >
                              <span className="font-extrabold text-[8px] uppercase px-1 py-0.2 bg-sky-200 text-sky-900 rounded shrink-0">
                                Note
                              </span>
                              <span className="truncate">{day.overrideDescription}</span>
                            </div>
                          )}
                        </div>

                        {/* Slots & Bookings Footer */}
                        <div className="mt-2 space-y-1">
                          {day.bookedSlots.length > 0 && (
                            <div className="px-1.5 py-0.5 bg-[#294B68] text-white text-[10px] font-bold rounded flex items-center justify-between shadow-2xs">
                              <span>{day.bookedSlots.length} Booked</span>
                              <span className="opacity-80 font-normal truncate max-w-[50px]">
                                {day.bookedSlots[0]?.clientName?.split(" ")[0]}
                              </span>
                            </div>
                          )}

                          {day.isOpen && (
                            <div className="flex items-center justify-between text-[10px] text-[#64748B] font-semibold px-1">
                              <span>Available:</span>
                              <span
                                className={`font-bold ${
                                  day.overrideStatus === "CUSTOM_HOURS"
                                    ? "text-purple-700"
                                    : "text-emerald-700"
                                }`}
                              >
                                {day.availableSlots.length} slots
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. WEEK VIEW */}
        {viewMode === "WEEK" && (
          <div className="p-4 sm:p-6 overflow-x-auto">
            {isCalendarLoading ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#5E8FB2]" />
                <p className="text-sm font-semibold text-[#64748B]">
                  Loading week schedule...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-3 min-w-[800px]">
                {calendarDays.map((day) => (
                  <div
                    key={day.date}
                    className={`p-3 rounded-2xl border flex flex-col justify-between ${
                      day.isToday
                        ? "ring-2 ring-[#294B68] bg-white border-[#294B68]"
                        : day.overrideStatus === "CUSTOM_HOURS"
                        ? "bg-purple-50/40 border-purple-200"
                        : day.overrideStatus === "OPEN"
                        ? "bg-emerald-50/40 border-emerald-200"
                        : day.isClosed
                        ? "bg-red-50/40 border-red-200"
                        : "bg-white border-[#D9E4EC]"
                    }`}
                  >
                    {/* Header */}
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-[#D9E4EC]">
                        <div>
                          <p className="text-xs font-bold text-[#64748B]">
                            {day.dayName.substring(0, 3)}
                          </p>
                          <p className="text-base font-black text-[#243746]">
                            {day.date.split("-")[2]}
                          </p>
                        </div>
                        <button
                          onClick={() => handleOpenCreateOverride(day.date)}
                          className="p-1.5 text-[#64748B] hover:text-[#294B68] hover:bg-[#EAF3F8] rounded-lg transition-colors"
                          title="Override this day"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Holiday / Status Badge */}
                      {day.holiday && (
                        <div className="mt-2 p-1 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold rounded-lg truncate" title={`${day.holiday.name} (US Federal Holiday)`}>
                          🇺🇸 {day.holiday.name}
                        </div>
                      )}

                      {/* Override Title & Note */}
                      {day.overrideTitle && (
                        <div
                          className={`mt-1.5 p-1 text-[10px] font-bold rounded-md truncate ${
                            day.overrideStatus === "CUSTOM_HOURS"
                              ? "bg-purple-100 border border-purple-300 text-purple-900"
                              : day.overrideStatus === "OPEN"
                              ? "bg-emerald-100 border border-emerald-300 text-emerald-900"
                              : "bg-red-100 border border-red-300 text-red-900"
                          }`}
                          title={day.overrideTitle}
                        >
                          {day.overrideTitle}
                        </div>
                      )}
                      {day.overrideDescription && (
                        <div className="mt-1 p-1.5 bg-sky-50 border border-sky-200 text-sky-950 text-[10px] font-medium rounded-md leading-tight" title={day.overrideDescription}>
                          <span className="font-extrabold block text-[8.5px] uppercase text-sky-700">Note:</span>
                          <span className="line-clamp-2">{day.overrideDescription}</span>
                        </div>
                      )}

                      <div className="mt-2 text-xs">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                            day.overrideStatus === "CUSTOM_HOURS"
                              ? "bg-purple-100 text-purple-800 border border-purple-300"
                              : day.overrideStatus === "OPEN"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : day.isClosed
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {day.overrideStatus === "CUSTOM_HOURS"
                            ? "Custom Hours"
                            : day.overrideStatus === "OPEN"
                            ? "Open"
                            : day.isClosed
                            ? "Closed"
                            : "Open"}
                        </span>
                      </div>

                      {/* Booked Appointments Timeline */}
                      <div className="mt-3 space-y-1.5">
                        <p className="text-[10px] font-bold text-[#64748B] uppercase">
                          Bookings ({day.bookedSlots.length})
                        </p>
                        {day.bookedSlots.map((b) => (
                          <div
                            key={b.id}
                            className="p-2 bg-[#294B68] text-white rounded-xl text-xs space-y-0.5 shadow-2xs"
                          >
                            <p className="font-bold text-[11px] truncate">
                              {b.clientName}
                            </p>
                            <p className="text-[10px] opacity-80">{b.timeSlot}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Available slots counter */}
                    <div className="mt-4 pt-2 border-t border-[#D9E4EC]">
                      <button
                        onClick={() => handleOpenDayDetails(day)}
                        className={`w-full py-1.5 text-[11px] font-bold rounded-lg transition-colors ${
                          day.overrideStatus === "CUSTOM_HOURS"
                            ? "bg-purple-100 hover:bg-purple-200 text-purple-800"
                            : day.isOpen
                            ? "bg-[#EAF3F8] hover:bg-[#D9E4EC] text-[#294B68]"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {day.isOpen ? `${day.availableSlots.length} Slots Open` : "Closed"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. DAY TIMELINE VIEW */}
        {viewMode === "DAY" && singleDayData && (
          <div className="p-4 sm:p-6 space-y-6">
            <div className="p-4 bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-[#243746]">
                  {singleDayData.formattedDate}
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Availability Source: {singleDayData.source.replace("_", " ")}
                  {singleDayData.overrideTitle ? ` (${singleDayData.overrideTitle})` : ""}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenCreateOverride(singleDayData.date, "CLOSED")}
                  className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors"
                >
                  Close Day
                </button>
                <button
                  onClick={() => handleOpenCreateOverride(singleDayData.date, "CUSTOM_HOURS")}
                  className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 rounded-xl text-xs font-bold transition-colors"
                >
                  Custom Hours
                </button>
                <button
                  onClick={() => {
                    setDispatchInitialDate(singleDayData.date);
                    setIsAdminScheduleModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-[#294B68] text-white hover:bg-[#203a52] rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Dispatch Visit</span>
                </button>
              </div>
            </div>

            {/* Special Note / Announcement if exists */}
            {singleDayData.overrideDescription && (
              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl flex items-start gap-3 text-sky-950">
                <div className="w-6 h-6 rounded-lg bg-sky-200 text-sky-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-sky-900 uppercase tracking-wider">
                    Schedule Note / Announcement
                  </p>
                  <p className="text-xs text-sky-900 mt-0.5 font-medium whitespace-pre-wrap">
                    {singleDayData.overrideDescription}
                  </p>
                </div>
              </div>
            )}

            {/* US Holiday Banner in Day View */}
            {singleDayData.holiday && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-950">
                <div className="w-6 h-6 rounded-lg bg-amber-200 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Flag className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                    🇺🇸 {singleDayData.holiday.name} (US Federal Holiday)
                  </p>
                  <p className="text-xs text-amber-800 mt-0.5 font-medium">
                    {singleDayData.holiday.description || "Official US Holiday"}
                  </p>
                </div>
              </div>
            )}

            {/* Time Slot Resolution Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#243746] uppercase tracking-wider">
                Full Day Timeline Breakdown
              </h4>

              {singleDayData.isClosed ? (
                <div className="p-12 text-center bg-red-50/50 border border-red-200 rounded-2xl">
                  <CalendarX className="w-10 h-10 text-red-500 mx-auto mb-2" />
                  <h4 className="text-base font-bold text-red-800">
                    This Date Is Fully Closed
                  </h4>
                  <p className="text-xs text-red-600 mt-1 max-w-md mx-auto">
                    {singleDayData.overrideTitle || "Designated non-working day or company closure."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Booked Visits */}
                  {singleDayData.bookedSlots.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 bg-[#294B68] text-white rounded-2xl shadow-sm space-y-2 border border-[#294B68]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-white/20 rounded-md">
                          Booked Visit
                        </span>
                        <span className="text-xs font-bold">{b.timeSlot}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold truncate">{b.clientName}</p>
                        <p className="text-xs opacity-80">{b.serviceName}</p>
                        <p className="text-[11px] opacity-75 mt-1">
                          Specialist: {b.technicianName}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Available Slots */}
                  {singleDayData.availableSlots.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-200/80 rounded-md text-emerald-900">
                          Available
                        </span>
                        <p className="text-sm font-bold text-[#243746] mt-1">{s.slot}</p>
                      </div>
                      <button
                        onClick={() => {
                          setDispatchInitialDate(singleDayData.date);
                          setIsAdminScheduleModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-2xs"
                      >
                        Book
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. OVERRIDES LIST TAB */}
        {viewMode === "OVERRIDES" && (
          <div className="p-4 sm:p-6 space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={overrideSearch}
                  onChange={(e) => setOverrideSearch(e.target.value)}
                  placeholder="Search overrides by title or reason..."
                  className="w-full pl-9 pr-3.5 py-2 bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl text-xs font-semibold text-[#243746] focus:ring-2 focus:ring-[#5E8FB2] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={overrideTypeFilter}
                  onChange={(e) => setOverrideTypeFilter(e.target.value as any)}
                  className="px-3 py-2 bg-white border border-[#D9E4EC] rounded-xl text-xs font-bold text-[#243746]"
                >
                  <option value="ALL">All Types (Date & Week)</option>
                  <option value="DATE">Date Overrides</option>
                  <option value="WEEK">Week Overrides</option>
                </select>

                <select
                  value={overrideStatusFilter}
                  onChange={(e) => setOverrideStatusFilter(e.target.value as any)}
                  className="px-3 py-2 bg-white border border-[#D9E4EC] rounded-xl text-xs font-bold text-[#243746]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="CLOSED">Closed Only</option>
                  <option value="CUSTOM_HOURS">Custom Hours</option>
                  <option value="OPEN">Open Only</option>
                </select>
              </div>
            </div>

            {/* Overrides Table */}
            {isOverridesLoading ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#5E8FB2]" />
                <p className="text-sm font-semibold text-[#64748B]">
                  Loading overrides and off-days...
                </p>
              </div>
            ) : allOverrides.length === 0 ? (
              <div className="p-12 text-center bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl space-y-2">
                <CalendarX className="w-8 h-8 text-[#64748B] mx-auto" />
                <h4 className="text-sm font-bold text-[#243746]">
                  No Schedule Overrides Configured
                </h4>
                <p className="text-xs text-[#64748B]">
                  The standard recurring weekly schedule applies to all dates.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#D9E4EC] rounded-xl shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#D9E4EC] text-[#64748B] font-bold uppercase tracking-wider">
                      <th className="p-3.5">Title & Reason</th>
                      <th className="p-3.5">Scope</th>
                      <th className="p-3.5">Effective Dates</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Time Windows</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9E4EC]">
                    {paginatedOverrides.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="p-3.5 font-bold text-[#243746]">
                          <p>{item.title}</p>
                          {item.description && (
                            <p className="text-[11px] text-[#64748B] font-normal">
                              {item.description}
                            </p>
                          )}
                        </td>
                        <td className="p-3.5 font-semibold text-[#64748B]">
                          {item.overrideType}
                        </td>
                        <td className="p-3.5 font-semibold text-[#243746]">
                          {item.formattedDateRange}
                          {item.isRecurring && (
                            <span className="ml-2 text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-bold">
                              Annual
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              item.status === "CLOSED"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : item.status === "CUSTOM_HOURS"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-[#64748B]">
                          {item.status === "CUSTOM_HOURS" && item.timeWindows?.length ? (
                            item.timeWindows.map((w, idx) => (
                              <span key={idx} className="mr-1 text-[11px] font-semibold">
                                {format24hTo12h(w.start)} – {format24hTo12h(w.end)}
                              </span>
                            ))
                          ) : item.status === "CLOSED" ? (
                            <span className="text-red-600 font-semibold italic">Closed</span>
                          ) : (
                            <span>Normal Hours</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right space-x-1">
                          <button
                            onClick={() => handleOpenEditOverride(item)}
                            className="p-1.5 text-[#294B68] hover:bg-[#EAF3F8] rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOverride(item)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {allOverrides.length > overridePageSize && (
              <div className="pt-2">
                <TablePagination
                  currentPage={overridePage}
                  totalItems={allOverrides.length}
                  pageSize={overridePageSize}
                  onPageChange={setOverridePage}
                  onPageSizeChange={setOverridePageSize}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals & Drawers */}
      <WeeklyScheduleModal
        isOpen={isWeeklyModalOpen}
        onClose={() => setIsWeeklyModalOpen(false)}
      />

      <ScheduleOverrideModal
        isOpen={isOverrideModalOpen}
        onClose={() => setIsOverrideModalOpen(false)}
        overrideItem={selectedOverrideItem}
        initialDate={overrideInitialDate}
        initialStatus={overrideInitialStatus}
      />

      <DateDetailsDrawer
        isOpen={isDetailsDrawerOpen}
        onClose={() => setIsDetailsDrawerOpen(false)}
        dayData={selectedDrawerDay}
        onOpenOverrideModal={(date, statusOverride) => {
          handleOpenCreateOverride(date, statusOverride);
        }}
        onOpenScheduleModal={(date) => {
          setDispatchInitialDate(date);
          setIsAdminScheduleModalOpen(true);
        }}
      />

      <AdminScheduleModal
        isOpen={isAdminScheduleModalOpen}
        onClose={() => setIsAdminScheduleModalOpen(false)}
        initialDate={dispatchInitialDate}
      />
    </div>
  );
}
