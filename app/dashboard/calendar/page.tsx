"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  UserCheck,
  Plus,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  CalendarDays,
  ListFilter,
  Eye,
  X,
  MapPin,
  Check,
  AlertCircle,
  ArrowRight,
  Loader2,
  Trash2,
  Layers,
  HeartPulse,
  ClipboardCheck,
} from "lucide-react";
import {
  useGetMyAppointmentsQuery,
  useCancelAppointmentMutation,
} from "@/redux/features/appointment/appointmentApi";
import { useGetVisitEntitlementsQuery } from "@/redux/features/payment/paymentApi";
import { AppointmentItem } from "@/redux/features/appointment/appointmentTypes";
import { ScheduleVisitModal } from "@/components/dashboard/schedule-visit-modal";
import {
  confirmDelete,
  showSuccessAlert,
  showErrorAlert,
  showToast,
} from "@/lib/alerts/sweetalert";

const CATEGORY_STYLES: Record<
  string,
  {
    icon: React.ElementType;
    badgeBg: string;
    badgeText: string;
    cellBg: string;
    cellBorder: string;
    cellText: string;
    iconColor: string;
  }
> = {
  SAFETY_OVERSIGHT: {
    icon: ShieldCheck,
    badgeBg: "bg-[#EAF3F8]",
    badgeText: "text-[#294B68]",
    cellBg: "bg-[#EAF3F8]",
    cellBorder: "border-[#294B68]/20",
    cellText: "text-[#294B68]",
    iconColor: "text-[#294B68]",
  },
  CLEANING: {
    icon: Sparkles,
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-800",
    cellBg: "bg-emerald-50",
    cellBorder: "border-emerald-200",
    cellText: "text-emerald-800",
    iconColor: "text-emerald-600",
  },
  ASSESSMENT: {
    icon: ClipboardCheck,
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-800",
    cellBg: "bg-purple-50",
    cellBorder: "border-purple-200",
    cellText: "text-purple-800",
    iconColor: "text-purple-600",
  },
  WELLNESS: {
    icon: HeartPulse,
    badgeBg: "bg-teal-50",
    badgeText: "text-teal-800",
    cellBg: "bg-teal-50",
    cellBorder: "border-teal-200",
    cellText: "text-teal-800",
    iconColor: "text-teal-600",
  },
  OTHER: {
    icon: Layers,
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-800",
    cellBg: "bg-slate-100",
    cellBorder: "border-slate-200",
    cellText: "text-slate-800",
    iconColor: "text-slate-600",
  },
};

export default function ClientCalendarPage() {
  const {
    data: apptRes,
    isLoading: isApptLoading,
    refetch: refetchAppointments,
  } = useGetMyAppointmentsQuery();
  const { data: entitlementsRes, isLoading: isEntLoading } =
    useGetVisitEntitlementsQuery();
  const [cancelAppointment, { isLoading: isCancelling }] =
    useCancelAppointmentMutation();

  const appointments: AppointmentItem[] = apptRes?.data || [];
  const entitlementData = entitlementsRes?.data;

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "agenda">("month");
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentItem | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Next upcoming active appointment
  const nextAppointment = useMemo(() => {
    const active = appointments.filter(
      (a) =>
        a.status === "scheduled" ||
        a.status === "confirmed" ||
        a.status === "rescheduled"
    );
    if (active.length === 0) return null;

    return [...active].sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    )[0];
  }, [appointments]);

  // Calendar Date Calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Helper to format ISO date key "YYYY-MM-DD"
  const formatDateKey = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  };

  // Helper to extract "YYYY-MM-DD" from appointment startAt
  const getApptDateKey = (appt: AppointmentItem): string => {
    if (appt.startAt) {
      const d = new Date(appt.startAt);
      if (!isNaN(d.getTime())) {
        return formatDateKey(d.getFullYear(), d.getMonth(), d.getDate());
      }
    }
    return appt.date || "";
  };

  // Map appointments by dateKey
  const appointmentsByDate = useMemo(() => {
    const map: Record<string, AppointmentItem[]> = {};
    for (const appt of appointments) {
      const key = getApptDateKey(appt);
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(appt);
    }
    return map;
  }, [appointments]);

  // Generate 42 calendar grid cells (6 weeks)
  const calendarCells = useMemo(() => {
    const cells = [];

    // Previous month trailing days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDateKey = formatDateKey(
        month === 0 ? year - 1 : year,
        month === 0 ? 11 : month - 1,
        dayNum
      );
      cells.push({
        dayNumber: dayNum,
        isCurrentMonth: false,
        dateKey: prevDateKey,
        appointments: appointmentsByDate[prevDateKey] || [],
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = formatDateKey(year, month, d);
      cells.push({
        dayNumber: d,
        isCurrentMonth: true,
        dateKey,
        appointments: appointmentsByDate[dateKey] || [],
      });
    }

    // Next month leading days
    const totalCells = Math.ceil(cells.length / 7) * 7;
    const remaining = totalCells - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nextDateKey = formatDateKey(
        month === 11 ? year + 1 : year,
        month === 11 ? 0 : month + 1,
        d
      );
      cells.push({
        dayNumber: d,
        isCurrentMonth: false,
        dateKey: nextDateKey,
        appointments: appointmentsByDate[nextDateKey] || [],
      });
    }

    return cells;
  }, [year, month, firstDayOfMonth, daysInMonth, daysInPrevMonth, appointmentsByDate]);

  // Handle Cancel Appointment
  const handleCancelAppointment = async (appt: AppointmentItem) => {
    const confirmed = await confirmDelete({
      title: "Cancel this scheduled visit?",
      text: `Are you sure you want to cancel your ${appt.serviceType} visit on ${appt.date}? Your visit quota will be restored immediately.`,
      confirmButtonText: "Yes, Cancel Visit",
      cancelButtonText: "Keep Appointment",
    });

    if (!confirmed) return;

    try {
      await cancelAppointment({
        id: appt.id,
        reason: "Client cancelled from Calendar portal",
      }).unwrap();

      setSelectedAppointment(null);
      await showSuccessAlert(
        "Visit Cancelled",
        "Your visit has been successfully cancelled and your visit entitlement quota has been restored."
      );
      refetchAppointments();
    } catch (err: any) {
      showErrorAlert(
        "Cancellation Failed",
        err?.data?.message || err?.message || "Could not cancel appointment."
      );
    }
  };

  const planName = entitlementData?.planName || "Service Plan";
  const totalRemaining = entitlementData?.totalRemaining ?? 0;
  const totalAllocated = entitlementData?.totalAllocated ?? totalRemaining;
  const entitlementsList = entitlementData?.entitlements || [];

  return (
    <div className="space-y-6 text-[#243746]">
      {/* Top Header & Scheduling CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9E4EC]/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#243746]">
              Safety Oversight Calendar
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#EAF3F8] text-[#294B68] border border-[#D9E4EC]">
              {planName}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5E8FB2] font-medium mt-1">
            View upcoming and past safety check-ins and manage your scheduled visits
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Link
            href="/dashboard/appointments"
            className="px-4 py-2.5 bg-white hover:bg-[#F0F5F9] border border-[#D9E4EC] text-[#243746] font-bold text-xs rounded-xl flex items-center gap-2 transition-colors shadow-2xs"
          >
            <Eye className="w-4 h-4 text-[#5E8FB2]" />
            <span>List View</span>
          </Link>

          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="px-5 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Schedule Safety Visit</span>
          </button>
        </div>
      </div>

      {/* Plan Quota & Next Visit Status Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Next Scheduled Visit Card */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-linear-to-r from-[#294B68] to-[#1E374D] text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                Next Upcoming Visit
              </span>
              {nextAppointment && (
                <span className="text-xs text-slate-300 font-semibold">
                  {nextAppointment.date} · {nextAppointment.timeSlot}
                </span>
              )}
            </div>

            {nextAppointment ? (
              <div>
                <div className="text-lg font-black text-white flex items-center gap-2">
                  {nextAppointment.serviceCategory === "CLEANING" ? (
                    <Sparkles className="w-5 h-5 text-emerald-300" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-sky-300" />
                  )}
                  <span>{nextAppointment.serviceType}</span>
                </div>
                <p className="text-xs text-slate-200 mt-0.5">
                  Assigned Safety Specialist: <strong>{nextAppointment.technicianName}</strong> ({nextAppointment.technicianTitle})
                </p>
              </div>
            ) : (
              <div>
                <div className="text-base font-black text-white">No upcoming visits scheduled</div>
                <p className="text-xs text-slate-300">
                  You have {totalRemaining} safety visit{totalRemaining !== 1 ? "s" : ""} available to book for this cycle.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="px-4 py-2.5 bg-white text-[#294B68] hover:bg-[#F0F5F9] font-extrabold text-xs rounded-xl shadow-xs transition-all shrink-0 self-start sm:self-auto cursor-pointer"
          >
            Book Another Visit
          </button>
        </div>

        {/* Dynamic Monthly Quotas Breakdown */}
        <div className="p-5 rounded-2xl bg-white border border-[#D9E4EC] shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[#5E8FB2]">
              Monthly Visit Quotas
            </span>
            <span className="text-xs font-black text-[#294B68]">
              {totalRemaining} of {totalAllocated} Remaining
            </span>
          </div>

          <div className="space-y-2.5">
            {entitlementsList.length > 0 ? (
              entitlementsList.map((item) => {
                const isCleaning = item.category === "CLEANING";
                const isSafety = item.category === "SAFETY_OVERSIGHT";
                const used = item.completed + item.scheduled;
                const total = item.allocated || 1;
                const pct = Math.min(100, Math.round((used / total) * 100));

                return (
                  <div key={item.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5 text-[#243746] truncate max-w-[170px]">
                        {isCleaning ? (
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : isSafety ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-[#294B68] shrink-0" />
                        ) : (
                          <ClipboardCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        )}
                        <span className="truncate">{item.serviceName}:</span>
                      </span>
                      <span className="text-[#294B68] shrink-0">
                        {item.completed}/{item.allocated} done ({item.remaining} left)
                      </span>
                    </div>
                    <div className="w-full bg-[#EAF3F8] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isCleaning ? "bg-emerald-600" : "bg-[#294B68]"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-[#64748B] py-2">
                Plan visit quotas active for current cycle.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Calendar Card */}
      <div className="bg-white rounded-3xl border border-[#D9E4EC] p-5 sm:p-7 shadow-xs space-y-6">
        {/* Controls Bar: Month Selector, View Switcher & Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#D9E4EC]/70">
          {/* Month / Year Navigator */}
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#243746] tracking-tight min-w-[180px]">
              {monthName} {year}
            </h2>

            <div className="flex items-center gap-1 border border-[#D9E4EC] rounded-xl p-1 bg-[#F8FAFC]">
              <button
                onClick={prevMonth}
                aria-label="Previous Month"
                className="p-1.5 hover:bg-[#EAF3F8] hover:text-[#294B68] rounded-lg text-[#64748B] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToToday}
                className="px-2.5 py-1 text-xs font-black text-[#243746] hover:bg-[#EAF3F8] rounded-lg transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                aria-label="Next Month"
                className="p-1.5 hover:bg-[#EAF3F8] hover:text-[#294B68] rounded-lg text-[#64748B] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* View Modes */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-[#F8FAFC] p-1 rounded-xl border border-[#D9E4EC] text-xs font-bold">
              <button
                onClick={() => setViewMode("month")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "month"
                    ? "bg-[#294B68] text-white shadow-2xs"
                    : "text-[#64748B] hover:text-[#243746]"
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode("agenda")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "agenda"
                    ? "bg-[#294B68] text-white shadow-2xs"
                    : "text-[#64748B] hover:text-[#243746]"
                }`}
              >
                Agenda
              </button>
            </div>
          </div>
        </div>

        {/* VIEW 1: MONTHLY GRID */}
        {viewMode === "month" && (
          <div className="space-y-2">
            {/* Weekday Column Headers */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-xs font-black uppercase tracking-wider text-[#5E8FB2] pb-2 border-b border-[#D9E4EC]">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* 42 Calendar Cells */}
            {isApptLoading ? (
              <div className="py-20 text-center text-[#5E8FB2] flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-7 h-7 animate-spin text-[#294B68]" />
                <span className="font-bold text-xs">Loading appointments on calendar...</span>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
                {calendarCells.map((cell, idx) => {
                  const isToday =
                    cell.isCurrentMonth &&
                    new Date().toDateString() === new Date(year, month, cell.dayNumber).toDateString();

                  return (
                    <div
                      key={idx}
                      className={`min-h-[85px] sm:min-h-[105px] p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                        cell.isCurrentMonth
                          ? "bg-white border-[#D9E4EC] hover:border-[#5E8FB2] hover:shadow-xs"
                          : "bg-[#F8FAFC]/70 border-[#EAEFF4] text-[#94A3B8]"
                      } ${isToday ? "ring-2 ring-[#294B68] bg-[#F0F7FD]/50" : ""}`}
                    >
                      {/* Date Number */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-black rounded-lg w-6 h-6 flex items-center justify-center ${
                            isToday
                              ? "bg-[#294B68] text-white shadow-2xs"
                              : cell.isCurrentMonth
                              ? "text-[#243746]"
                              : "text-[#94A3B8]"
                          }`}
                        >
                          {cell.dayNumber}
                        </span>

                        {cell.appointments.length > 0 && (
                          <span className="w-2 h-2 rounded-full bg-[#294B68] sm:hidden" />
                        )}
                      </div>

                      {/* Appointments Stack inside cell */}
                      <div className="space-y-1 mt-1 overflow-hidden">
                        {cell.appointments.map((appt) => {
                          const cat = appt.serviceCategory || (appt.serviceType?.toLowerCase().includes("cleaning") ? "CLEANING" : "SAFETY_OVERSIGHT");
                          const style = CATEGORY_STYLES[cat] || CATEGORY_STYLES.OTHER;
                          const Icon = style.icon;

                          return (
                            <button
                              key={appt.id}
                              onClick={() => setSelectedAppointment(appt)}
                              className={`w-full text-left p-1 sm:p-1.5 rounded-lg text-[10px] font-extrabold truncate flex items-center gap-1 transition-transform hover:scale-[1.02] cursor-pointer shadow-2xs ${style.cellBg} ${style.cellText} border ${style.cellBorder}`}
                            >
                              <Icon className={`w-2.5 h-2.5 ${style.iconColor} shrink-0`} />
                              <span className="truncate">{appt.serviceType}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: AGENDA / CHRONOLOGICAL LIST */}
        {viewMode === "agenda" && (
          <div className="space-y-4">
            {isApptLoading ? (
              <div className="py-20 text-center text-[#5E8FB2] flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-7 h-7 animate-spin text-[#294B68]" />
                <span className="font-bold text-xs">Loading appointments...</span>
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-12 text-center bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] text-sm text-[#64748B]">
                No visits scheduled yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointments.map((appt) => {
                  const cat = appt.serviceCategory || (appt.serviceType?.toLowerCase().includes("cleaning") ? "CLEANING" : "SAFETY_OVERSIGHT");
                  const style = CATEGORY_STYLES[cat] || CATEGORY_STYLES.OTHER;
                  const Icon = style.icon;
                  const isScheduled =
                    appt.status === "scheduled" ||
                    appt.status === "confirmed" ||
                    appt.status === "rescheduled";

                  return (
                    <div
                      key={appt.id}
                      onClick={() => setSelectedAppointment(appt)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-md hover:-translate-y-0.5 ${
                        isScheduled
                          ? "border-[#D9E4EC] bg-white hover:border-[#5E8FB2]"
                          : "border-[#E2E8F0] bg-[#F8FAFC] opacity-90"
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${style.badgeBg} ${style.badgeText}`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {appt.serviceType}
                          </span>

                          <span
                            className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                              isScheduled
                                ? "bg-sky-50 text-sky-800 border border-sky-200"
                                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            {appt.status}
                          </span>
                        </div>

                        <div>
                          <div className="text-base font-black text-[#243746] flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-[#5E8FB2]" />
                            <span>{appt.date}</span>
                          </div>
                          <div className="text-xs font-bold text-[#64748B] flex items-center gap-1.5 mt-1">
                            <Clock className="w-3.5 h-3.5 text-[#5E8FB2]" />
                            <span>{appt.timeSlot}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#D9E4EC]/60 space-y-1">
                          <div className="text-xs text-[#243746] font-semibold flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-[#294B68]" />
                            <span>
                              Safety Specialist: <strong>{appt.technicianName}</strong>
                            </span>
                          </div>
                          <div className="text-[11px] text-[#5E8FB2]">
                            {appt.technicianTitle}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs font-bold text-[#294B68]">
                        <span>View Visit Details</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* VISIT DETAILS MODAL / DRAWER */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedAppointment(null)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl z-10 space-y-6 animate-in zoom-in-95 duration-200 border border-[#D9E4EC]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#D9E4EC]/70 pb-4">
              <div className="flex items-center gap-2.5">
                <span
                  className={`p-2.5 rounded-xl ${
                    selectedAppointment.serviceCategory === "CLEANING"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-[#EAF3F8] text-[#294B68]"
                  }`}
                >
                  {selectedAppointment.serviceCategory === "CLEANING" ? (
                    <Sparkles className="w-6 h-6" />
                  ) : (
                    <ShieldCheck className="w-6 h-6" />
                  )}
                </span>
                <div>
                  <h3 className="text-lg font-black text-[#243746]">
                    {selectedAppointment.serviceType}
                  </h3>
                  <p className="text-xs text-[#5E8FB2] font-semibold">
                    Appointment ID: #{selectedAppointment.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAppointment(null)}
                aria-label="Close"
                className="p-1.5 rounded-xl border border-[#D9E4EC] text-[#64748B] hover:text-[#243746] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visit Details Grid */}
            <div className="space-y-4 text-xs font-semibold text-[#243746]">
              <div className="grid grid-cols-2 gap-3 p-4 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC]">
                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-[#64748B] font-bold">
                    Scheduled Date
                  </span>
                  <span className="text-sm font-black text-[#243746] mt-0.5 block">
                    {selectedAppointment.date}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-[#64748B] font-bold">
                    Time Window
                  </span>
                  <span className="text-sm font-black text-[#243746] mt-0.5 block">
                    {selectedAppointment.timeSlot}
                  </span>
                </div>
              </div>

              {/* Safety Specialist Profile */}
              <div className="p-4 rounded-2xl border border-[#D9E4EC] bg-white space-y-2">
                <div className="text-[11px] uppercase tracking-wider text-[#5E8FB2] font-extrabold">
                  Assigned Safety Specialist
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full text-white flex items-center justify-center font-black text-sm shadow-xs"
                    style={{
                      backgroundColor: selectedAppointment.technicianColor || "#294B68",
                    }}
                  >
                    {selectedAppointment.technicianName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-black text-[#243746]">
                      {selectedAppointment.technicianName}
                    </div>
                    <div className="text-xs text-[#5E8FB2]">
                      {selectedAppointment.technicianTitle}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#D9E4EC] flex items-center gap-2 text-xs text-[#243746]">
                <MapPin className="w-4 h-4 text-[#5E8FB2] shrink-0" />
                <span>{selectedAppointment.location || selectedAppointment.clientAddress}</span>
              </div>

              {selectedAppointment.notes && (
                <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-amber-900 text-xs">
                  <strong>Member Notes:</strong> {selectedAppointment.notes}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#D9E4EC]/70">
              <div>
                {selectedAppointment.status !== "cancelled" &&
                  selectedAppointment.status !== "completed" && (
                    <button
                      type="button"
                      disabled={isCancelling}
                      onClick={() => handleCancelAppointment(selectedAppointment)}
                      className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel Visit</span>
                    </button>
                  )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Visit Modal Integration */}
      <ScheduleVisitModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
      />
    </div>
  );
}
