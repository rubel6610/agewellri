"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { X, Calendar, Loader2, CheckCircle2, UserCheck, Search, ChevronDown, Check, AlertCircle, Edit3 } from "lucide-react";
import { useGetAllSpecialistsQuery } from "@/redux/features/specialist/specialistApi";
import { useGetAdminClientsQuery } from "@/redux/features/client/clientApi";
import { useAdminScheduleAppointmentMutation, useGetAdminAppointmentsQuery } from "@/redux/features/appointment/appointmentApi";
import { useGetActivePlansQuery } from "@/redux/features/plan/planApi";
import { useGetActiveOffDaysQuery } from "@/redux/features/off-day/offDayApi";
import { findMatchingOffDay } from "@/redux/features/off-day/offDayTypes";
import { parsePlanDurationHours } from "@/redux/features/plan/planTypes";
import {
  confirmCriticalAction,
  showSuccessAlert,
  showErrorAlert,
} from "@/lib/alerts/sweetalert";

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

function getClientPlanDurationHours(client: any, activePlans: any[] = []): number {
  if (!client) return 2;

  // 1. Match client's planCode or planName against activePlans database records
  const matchedPlan = activePlans.find(
    (p) =>
      p.code === client.planCode ||
      p.name === client.planName ||
      p.id === client.planCode ||
      p.code === client.subscriptions?.[0]?.plan?.code ||
      p.name === client.subscriptions?.[0]?.plan?.name
  );
  if (matchedPlan?.times) {
    return parsePlanDurationHours(matchedPlan.times);
  }

  // 2. Visit entitlements if available
  if (Array.isArray(client.visitEntitlements) && client.visitEntitlements.length > 0) {
    const durMin = client.visitEntitlements[0]?.durationMinutes;
    if (durMin && durMin > 0) {
      return Math.max(1, Math.round(durMin / 60));
    }
  }

  // 3. Direct duration properties
  if (client.durationMinutes) {
    return Math.max(1, Math.round(client.durationMinutes / 60));
  }
  if (client.durationHours) {
    return Number(client.durationHours);
  }

  // 4. Plan times field from client or subscription plan
  const planTimes = client.planTimes || client.times || client.subscriptions?.[0]?.plan?.times;
  if (planTimes) {
    return parsePlanDurationHours(planTimes);
  }

  // 5. Check planName or planCode string match
  const text = (
    client.planName ||
    client.planCode ||
    client.subscriptions?.[0]?.plan?.name ||
    client.subscriptions?.[0]?.plan?.code ||
    ""
  ).toLowerCase();

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

interface AdminScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClientId?: string;
  clientName?: string;
  hideClientSelect?: boolean;
}

export function AdminScheduleModal({
  isOpen,
  onClose,
  defaultClientId,
  clientName,
  hideClientSelect = false,
}: AdminScheduleModalProps) {
  const { data: specialists = [], isLoading: isSpecialistsLoading } = useGetAllSpecialistsQuery(undefined, { skip: !isOpen });
  const { data: clientsRes, isLoading: isClientsLoading } = useGetAdminClientsQuery({ limit: 100 }, { skip: !isOpen });
  const { data: activePlans = [] } = useGetActivePlansQuery(undefined, { skip: !isOpen });
  const { data: adminApptsRes } = useGetAdminAppointmentsQuery(undefined, { skip: !isOpen });
  const { data: offDays = [] } = useGetActiveOffDaysQuery(undefined, { skip: !isOpen });
  const clientsList = clientsRes?.data || [];
  const activeOffDays = useMemo(() => offDays || [], [offDays]);

  const adminAppointments = useMemo(() => {
    const raw = Array.isArray(adminApptsRes?.data)
      ? adminApptsRes.data
      : Array.isArray(adminApptsRes)
      ? adminApptsRes
      : [];
    return raw.filter((a: any) => {
      const st = (a.status || "").toLowerCase();
      return st !== "cancelled" && st !== "no_show" && st !== "declined";
    });
  }, [adminApptsRes]);

  const [selectedClientId, setSelectedClientId] = useState(defaultClientId || "");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Specialist Selection State
  const [technicianName, setTechnicianName] = useState(specialists[0]?.name);
  const [isSpecialistDropdownOpen, setIsSpecialistDropdownOpen] = useState(false);
  const [specialistSearchQuery, setSpecialistSearchQuery] = useState("");
  const specialistDropdownRef = useRef<HTMLDivElement>(null);

  const [date, setDate] = useState(() => {
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return nextWeek.toISOString().split("T")[0];
  });
  const [timeSlot, setTimeSlot] = useState("10:00 AM – 12:00 PM");
  const [isCustomTime, setIsCustomTime] = useState<boolean>(false);
  const [customStart, setCustomStart] = useState("09:00 AM");
  const [customEnd, setCustomEnd] = useState("11:00 AM");
  const [notes, setNotes] = useState("");
  const [adminScheduleAppointmentMutation, { isLoading: isSubmitting }] = useAdminScheduleAppointmentMutation();
  const [success, setSuccess] = useState(false);

  // Filter out unassigned clients (clients without an assigned active plan)
  const assignedClients = useMemo(() => {
    return clientsList.filter((c) => {
      const plan = (c.planName || c.planCode || c.subscriptions?.[0]?.plan?.name || "").toLowerCase().trim();
      return plan !== "" && plan !== "unassigned" && !plan.includes("unassigned");
    });
  }, [clientsList]);

  useEffect(() => {
    if (defaultClientId) {
      setSelectedClientId(defaultClientId);
    } else if (assignedClients.length > 0 && (!selectedClientId || !assignedClients.some((c) => c.id === selectedClientId))) {
      setSelectedClientId(assignedClients[0].id);
    }
  }, [defaultClientId, assignedClients, isOpen, selectedClientId]);

  useEffect(() => {
    if (specialists.length > 0 && !technicianName) {
      setTechnicianName(specialists[0].name);
    }
  }, [specialists, technicianName]);

  // Click outside listener for search dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
      if (specialistDropdownRef.current && !specialistDropdownRef.current.contains(target)) {
        setIsSpecialistDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Derive matched and selected client
  const isLockedClient = Boolean(hideClientSelect || defaultClientId);

  const matchedClient = (assignedClients.length > 0 ? assignedClients : clientsList).find(
    (c) =>
      c.id === (defaultClientId || selectedClientId) ||
      c.clientNumber === (defaultClientId || selectedClientId) ||
      c.userId === (defaultClientId || selectedClientId) ||
      c.internalId === (defaultClientId || selectedClientId)
  );

  const selectedClient = matchedClient || assignedClients[0] || clientsList[0];

  const selectedSpecialistObj =
    specialists.find((s) => s.name === technicianName) ||
    specialists.find((s) => s.id === technicianName) ||
    specialists[0];

  const checkSlotBooked = (ts: string): { isBooked: boolean; appt?: any } => {
    const slotRange = parseTimeSlotToMinutes(ts);
    if (!slotRange || !date) return { isBooked: false };

    const targetClientId = selectedClient?.id || selectedClientId;
    const targetInternalId = selectedClient?.internalId || selectedClient?.userId;

    for (const appt of adminAppointments) {
      const isClientAppt =
        appt.clientId === targetClientId ||
        appt.clientId === targetInternalId ||
        appt.clientNumber === targetClientId ||
        (selectedClient?.clientNumber && appt.clientNumber === selectedClient.clientNumber);

      if (!isClientAppt) continue;

      const apptDate = getApptDateFormatted(appt);
      // Only conflict if it is the EXACT same date
      if (apptDate !== date) continue;

      const apptRange = parseApptTimeSlotToMinutes(appt);
      if (apptRange && isTimeOverlapping(slotRange, apptRange)) {
        return { isBooked: true, appt };
      }
    }

    return { isBooked: false };
  };

  const currentSlotStatus = useMemo(() => {
    return checkSlotBooked(timeSlot);
  }, [timeSlot, date, selectedClient, adminAppointments]);

  // Derive default serviceType from client plan
  const serviceType = selectedClient?.planName || "Home Safety & Oversight Visit";

  // Derive plan duration hours, standard time slots, and available start times based on selected client's plan
  const planDurationHours = useMemo(
    () => getClientPlanDurationHours(selectedClient, activePlans),
    [selectedClient, activePlans]
  );
  const standardTimeSlots = useMemo(() => generateStandardTimeSlots(planDurationHours), [planDurationHours]);
  const availableStartTimes = useMemo(() => getAvailableStartTimes(planDurationHours), [planDurationHours]);

  // Sync selected time slot with available plan slots when client or mode changes
  useEffect(() => {
    if (isCustomTime) {
      const starts = getAvailableStartTimes(planDurationHours);
      const start = starts.includes(customStart) ? customStart : (starts[2] || starts[0] || "09:00 AM");
      const end = calculateEndTime(start, planDurationHours);
      setCustomStart(start);
      setCustomEnd(end);
      setTimeSlot(`${start} – ${end}`);
    } else {
      if (!standardTimeSlots.includes(timeSlot) || checkSlotBooked(timeSlot).isBooked) {
        const firstAvailable = standardTimeSlots.find((s) => !checkSlotBooked(s).isBooked);
        setTimeSlot(firstAvailable || standardTimeSlots[0] || (planDurationHours === 1 ? "08:00 AM – 09:00 AM" : "10:00 AM – 12:00 PM"));
      }
    }
  }, [selectedClientId, planDurationHours, isCustomTime, standardTimeSlots, date, selectedSpecialistObj]);

  const getRemainingVisitsForClient = (client: any) => {
    if (!client) return 1;
    if (typeof client.remainingVisitsCount === "number") {
      return client.remainingVisitsCount;
    }
    if (Array.isArray(client.visitEntitlements) && client.visitEntitlements.length > 0) {
      return client.visitEntitlements.reduce((sum: number, item: any) => sum + (item.remaining || 0), 0);
    }
    const planStr = (client.planName || client.planCode || "").toLowerCase();
    if (planStr && planStr !== "unassigned") {
      return planStr.includes("plan 2") || planStr.includes("independence") ? 2 : 1;
    }
    return 1;
  };

  const clientApptOnSelectedDate = useMemo(() => {
    if (!date) return null;
    const targetClientId = selectedClient?.id || selectedClientId;
    const targetInternalId = selectedClient?.internalId || selectedClient?.userId;

    return adminAppointments.find((appt) => {
      const isClientAppt =
        appt.clientId === targetClientId ||
        appt.clientId === targetInternalId ||
        appt.clientNumber === targetClientId ||
        (selectedClient?.clientNumber && appt.clientNumber === selectedClient.clientNumber);

      if (!isClientAppt) return false;
      return getApptDateFormatted(appt) === date;
    });
  }, [date, selectedClient, selectedClientId, adminAppointments]);

  const matchingOffDay = useMemo(() => findMatchingOffDay(date, activeOffDays), [date, activeOffDays]);
  const isSelectedDateOffDay = Boolean(matchingOffDay);

  const hasDateConflict = Boolean(clientApptOnSelectedDate);

  const isTargetClientAgreementPaid = Boolean(selectedClient);
  const clientRemainingVisits = getRemainingVisitsForClient(selectedClient);
  const hasRemainingVisits = clientRemainingVisits > 0;
  const isTimeSlotValid = !currentSlotStatus.isBooked && !hasDateConflict;
  const isTargetClientEligible = isTargetClientAgreementPaid && hasRemainingVisits && !hasDateConflict && isTimeSlotValid && !isSelectedDateOffDay;

  if (!isOpen) return null;

  const resolvedDisplayName =
    clientName && clientName !== defaultClientId
      ? clientName
      : matchedClient
      ? `${matchedClient.firstName} ${matchedClient.lastName}`
      : "Client Account";

  const resolvedDisplayId =
    (matchedClient as any)?.clientNumber ||
    matchedClient?.id ||
    defaultClientId ||
    selectedClientId ||
    "AW-CLIENT";

  const isPaymentPending = selectedClient
    ? selectedClient.paymentStatus === "PENDING" ||
      selectedClient.subscriptionStatus === "PENDING" ||
      (selectedClient.status as string) === "pending_payment"
    : false;

  // Filtered Clients (Search within assigned clients)
  const filteredClients = assignedClients.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const fullName = `${c.firstName || ""} ${c.lastName || ""}`.toLowerCase();
    const clientNum = (c.clientNumber || "").toLowerCase();
    const clientId = (c.id || "").toLowerCase();
    const email = (c.email || "").toLowerCase();
    const plan = (c.planName || "").toLowerCase();
    return (
      fullName.includes(q) ||
      clientNum.includes(q) ||
      clientId.includes(q) ||
      email.includes(q) ||
      plan.includes(q)
    );
  });

  // Filtered Specialists
  const filteredSpecialists = specialists.filter((s) => {
    if (!specialistSearchQuery.trim()) return true;
    const q = specialistSearchQuery.toLowerCase().trim();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.title && s.title.toLowerCase().includes(q)) ||
      (s.phone && s.phone.toLowerCase().includes(q)) ||
      (s.specialties && s.specialties.some((sp: string) => sp.toLowerCase().includes(q)))
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSelectedDateOffDay) {
      showErrorAlert(
        "Company Off-Day / Closure",
        `The selected date (${date}) is designated as an active company off-day (${matchingOffDay?.title}). Visits cannot be scheduled during office closures.`
      );
      return;
    }

    if (hasDateConflict) {
      showErrorAlert(
        "Date Conflict",
        `A visit is already scheduled for this client on ${date} (${clientApptOnSelectedDate?.timeSlot || "Scheduled"}). The same client cannot have multiple visits scheduled on the same date. Please select another date.`
      );
      return;
    }

    if (!isTargetClientEligible) {
      if (!isTargetClientAgreementPaid) {
        showErrorAlert(
          "Ineligible Client",
          "This client must execute their Service Agreement and complete subscription payment before scheduling visits."
        );
      } else if (!hasRemainingVisits) {
        showErrorAlert(
          "No Remaining Visits",
          "This client has 0 remaining visits in their current monthly cycle. Cannot schedule visit."
        );
      }
      return;
    }

    const targetClientId = isLockedClient ? (defaultClientId || selectedClientId) : selectedClientId;
    const targetDisplayName = clientName || (selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : targetClientId) || "Client";

    const dateParts = date.split("-");
    if (dateParts.length === 3) {
      const chosenDate = new Date(parseInt(dateParts[0], 10), parseInt(dateParts[1], 10) - 1, parseInt(dateParts[2], 10));
      const dow = chosenDate.getDay();
      if (dow === 0 || dow === 3) {
        const dayName = dow === 0 ? "Sunday" : "Wednesday";
        showErrorAlert(
          "Weekend Non-Service Day",
          `Visits cannot be scheduled on ${dayName}s as they are non-service days. Working days are Monday, Tuesday, Thursday, Friday, and Saturday.`
        );
        return;
      }
    }

    const confirmed = await confirmCriticalAction({
      title: "Dispatch Specialist Visit?",
      text: `Schedule a visit for ${targetDisplayName} on ${date} (${timeSlot}) assigned to ${technicianName}?`,
      confirmButtonText: "Yes, Schedule Visit",
      isDestructive: false,
    });

    if (!confirmed) return;

    try {
      const selectedSpecialist = specialists.find((s) => s.name === technicianName);
      await adminScheduleAppointmentMutation({
        clientId: targetClientId,
        serviceType,
        date,
        timeSlot,
        technicianId: selectedSpecialist?.id,
        technicianName,
        notes,
      }).unwrap();

      setSuccess(true);
      await showSuccessAlert(
        "Visit Dispatched Successfully",
        `Visit has been scheduled for ${date} (${timeSlot}) with ${technicianName}.`
      );
    } catch (err: any) {
      const errMsg = err?.data?.message || err?.message || "Failed to schedule appointment.";
      showErrorAlert("Scheduling Failed", errMsg);
    }
  };

  const handleReset = () => {
    setSuccess(false);
    setIsDropdownOpen(false);
    setIsSpecialistDropdownOpen(false);
    setSearchQuery("");
    setSpecialistSearchQuery("");
    setIsCustomTime(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={handleReset} />

      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#D9E4EC] shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#D9E4EC]">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#294B68]" />
            <h3 className="text-xl font-bold text-[#243746]">Admin Visit Dispatcher</h3>
          </div>
          <button onClick={handleReset} className="p-2 text-[#64748B] hover:text-[#243746] rounded-xl border border-[#D9E4EC] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-[#3F8F6B] text-white rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-[#243746]">Visit Scheduled!</h4>
              <p className="text-sm text-[#64748B] mt-1">
                Visit scheduled for <strong>{date}</strong> ({timeSlot}).
              </p>
            </div>
            <button
              onClick={handleReset}
              className="w-full py-3 bg-[#294B68] text-white font-bold rounded-xl cursor-pointer"
            >
              Done &amp; Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {/* Warning / Informational Banners */}
            {isPaymentPending ? (
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-blue-950">Advance Scheduling Active</strong>
                  <span>This visit is being scheduled &amp; assigned in advance. Active payment subscription will be required before marking the visit as completed.</span>
                </div>
              </div>
            ) : !hasRemainingVisits ? (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-rose-950">No Remaining Visits for Client (0 Remaining)</strong>
                  <span>This client has utilized all {selectedClient?.totalVisitsAllowed || 0} visits allocated for their active subscription period. Additional visits cannot be scheduled until next monthly renewal.</span>
                </div>
              </div>
            ) : null}

            {/* Target Client Display or Searchable Selection */}
            {isLockedClient ? (
              <div>
                <label className="block text-xs font-bold text-[#243746] mb-1.5">Target Client</label>
                <div className="p-3 bg-[#EAF3F8] border border-[#5E8FB2]/30 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#294B68] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-[#243746] block">
                        {resolvedDisplayName}
                      </span>
                      <span className="text-xs font-mono font-semibold text-[#5E8FB2]">
                        ID: {resolvedDisplayId}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-extrabold text-[#294B68] bg-white px-2.5 py-1 rounded-md border border-[#D9E4EC] shadow-2xs">
                    Client Selected
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-bold text-[#243746] mb-1">
                  Select Client <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen((prev) => !prev);
                    setIsSpecialistDropdownOpen(false);
                  }}
                  className="w-full min-h-[46px] px-3.5 py-2 text-left bg-white border border-[#D9E4EC] hover:border-[#5E8FB2] rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                >
                  {isClientsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-[#64748B] py-0.5">
                      <Loader2 className="w-4 h-4 animate-spin text-[#294B68]" />
                      <span className="font-medium">Loading client directory...</span>
                    </div>
                  ) : selectedClient ? (
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#EAF3F8] text-[#294B68] font-bold text-xs flex items-center justify-center shrink-0">
                        {selectedClient.firstName?.[0] || "C"}
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-sm text-[#243746]">
                          {selectedClient.firstName} {selectedClient.lastName}
                        </span>
                        <span className="text-xs text-[#5E8FB2] font-semibold ml-2">
                          ({(selectedClient as any)?.clientNumber || selectedClient.id}) — {(selectedClient as any)?.planName || "Active Plan"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-[#64748B]">Choose a client...</span>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 text-[#64748B] shrink-0 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180 text-[#294B68]" : ""
                    }`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#D9E4EC] rounded-2xl shadow-xl z-50 p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, ID (e.g. AW-1024), email, or plan..."
                        className="w-full pl-9 pr-8 py-2 text-xs font-medium bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl text-[#243746] focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] focus:bg-white"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#243746] p-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Filtered Clients List */}
                    <div className="max-h-56 overflow-y-auto space-y-1 pr-1 divide-y divide-[#F1F5F9]">
                      {isClientsLoading ? (
                        <div className="p-6 text-center text-xs text-[#64748B] flex flex-col items-center justify-center space-y-2">
                          <Loader2 className="w-5 h-5 animate-spin text-[#294B68]" />
                          <p className="font-bold text-sm text-[#243746]">Loading client directory...</p>
                          <p className="text-[11px] text-[#64748B]">Fetching client records...</p>
                        </div>
                      ) : filteredClients.length === 0 ? (
                        <div className="p-4 text-center text-xs text-[#64748B]">
                          No clients found matching &ldquo;{searchQuery}&rdquo;
                        </div>
                      ) : (
                        filteredClients.map((c) => {
                          const isSelected =
                            c.id === selectedClientId || c.clientNumber === selectedClientId;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setSelectedClientId(c.id);
                                setIsDropdownOpen(false);
                                setSearchQuery("");
                              }}
                              className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-[#EAF3F8] text-[#294B68]"
                                  : "hover:bg-[#F8FAFC] text-[#243746]"
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs truncate">
                                    {c.firstName} {c.lastName}
                                  </span>
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white text-[#294B68] border border-[#D9E4EC]">
                                    {c.clientNumber || c.id}
                                  </span>
                                </div>
                                <div className="text-[11px] text-[#64748B] truncate mt-0.5">
                                  {c.planName || "Active Plan"} · {c.email}
                                </div>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-[#294B68] shrink-0" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Searchable Assigned Specialist Dropdown */}
            <div className="relative" ref={specialistDropdownRef}>
              <label className="block text-xs font-bold text-[#243746] mb-1">
                Assigned Specialist <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsSpecialistDropdownOpen((prev) => !prev);
                  setIsDropdownOpen(false);
                }}
                className="w-full min-h-[46px] px-3.5 py-2 text-left bg-white border border-[#D9E4EC] hover:border-[#5E8FB2] rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
              >
                {isSpecialistsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-[#64748B] py-0.5">
                    <Loader2 className="w-4 h-4 animate-spin text-[#294B68]" />
                    <span className="font-medium">Loading specialists...</span>
                  </div>
                ) : selectedSpecialistObj ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-6 h-6 rounded-full text-white text-[11px] font-black flex items-center justify-center shrink-0"
                      style={{ backgroundColor: selectedSpecialistObj.color || "#294B68" }}
                    >
                      {selectedSpecialistObj.name?.[0] || "S"}
                    </div>
                    <div className="truncate">
                      <span className="font-bold text-sm text-[#243746]">
                        {selectedSpecialistObj.name}
                      </span>
                      <span className="text-xs text-[#5E8FB2] font-semibold ml-1.5 truncate">
                        ({selectedSpecialistObj.title})
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-[#64748B]">Select specialist...</span>
                )}
                <ChevronDown
                  className={`w-4 h-4 text-[#64748B] shrink-0 transition-transform duration-200 ${
                    isSpecialistDropdownOpen ? "rotate-180 text-[#294B68]" : ""
                  }`}
                />
              </button>

              {isSpecialistDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#D9E4EC] rounded-2xl shadow-xl z-50 p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                  {/* Specialist Search Input */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      autoFocus
                      value={specialistSearchQuery}
                      onChange={(e) => setSpecialistSearchQuery(e.target.value)}
                      placeholder="Search by specialist name, title, specialty..."
                      className="w-full pl-9 pr-8 py-2 text-xs font-medium bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl text-[#243746] focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] focus:bg-white"
                    />
                    {specialistSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setSpecialistSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#243746] p-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filtered Specialists List */}
                  <div className="max-h-52 overflow-y-auto space-y-1 pr-1 divide-y divide-[#F1F5F9]">
                    {isSpecialistsLoading ? (
                      <div className="p-5 text-center text-xs text-[#64748B] flex flex-col items-center justify-center space-y-2">
                        <Loader2 className="w-5 h-5 animate-spin text-[#294B68]" />
                        <p className="font-bold text-sm text-[#243746]">Loading specialists...</p>
                      </div>
                    ) : filteredSpecialists.length === 0 ? (
                      <div className="p-4 text-center text-xs text-[#64748B]">
                        No specialists found matching &ldquo;{specialistSearchQuery}&rdquo;
                      </div>
                    ) : (
                      filteredSpecialists.map((s) => {
                        const isSelected = s.name === technicianName;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setTechnicianName(s.name);
                              setIsSpecialistDropdownOpen(false);
                              setSpecialistSearchQuery("");
                            }}
                            className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-[#EAF3F8] text-[#294B68]"
                                : "hover:bg-[#F8FAFC] text-[#243746]"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              <div
                                className="w-7 h-7 rounded-full text-white text-xs font-black flex items-center justify-center shrink-0"
                                style={{ backgroundColor: s.color || "#294B68" }}
                              >
                                {s.name?.[0] || "S"}
                              </div>
                              <div className="truncate">
                                <div className="font-bold text-xs text-[#243746] truncate">
                                  {s.name}
                                </div>
                                <div className="text-[11px] text-[#5E8FB2] truncate">
                                  {s.title}
                                </div>
                              </div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-[#294B68] shrink-0" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#243746] mb-1">Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full h-11 px-3 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                    hasDateConflict
                      ? "border-rose-400 bg-rose-50/40 text-rose-900 focus:ring-rose-500"
                      : "border-[#D9E4EC] focus:ring-[#5E8FB2]"
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#243746]">
                    Time Slot <span className="text-red-500">*</span>
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
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-[#64748B] block mb-1">Start Time</label>
                        <select
                          value={customStart}
                          onChange={(e) => {
                            const newStart = e.target.value;
                            setCustomStart(newStart);
                            const newEnd = calculateEndTime(newStart, planDurationHours);
                            setCustomEnd(newEnd);
                            setTimeSlot(`${newStart} – ${newEnd}`);
                          }}
                          className="w-full h-10 px-3 bg-white border border-[#D9E4EC] rounded-xl text-xs font-bold text-[#243746] focus:ring-2 focus:ring-[#5E8FB2]"
                        >
                          {availableStartTimes.map((st) => {
                            const customSlotStr = `${st} – ${calculateEndTime(st, planDurationHours)}`;
                            const { isBooked, appt } = checkSlotBooked(customSlotStr);
                            let label = st;
                            if (isBooked) {
                              label += ` (Client already booked: ${appt?.timeSlot || customSlotStr})`;
                            }
                            return (
                              <option
                                key={st}
                                value={st}
                                disabled={isBooked}
                                className={isBooked ? "text-rose-600 bg-rose-50 font-bold" : ""}
                              >
                                {label}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-[#64748B] block mb-1">
                          End Time 
                        </label>
                        <div className="w-full h-10 px-3 rounded-xl border border-[#D9E4EC] text-xs text-[#294B68] font-bold bg-[#EAF3F8] flex items-center justify-between">
                          <span>{customEnd}</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-1">
                      <input
                        type="text"
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        placeholder="Or type custom time string..."
                        className="w-full h-9 px-3 bg-white border border-[#D9E4EC] rounded-xl text-xs font-medium text-[#243746] focus:ring-2 focus:ring-[#5E8FB2]"
                      />
                    </div>
                  </div>
                ) : (
                  <select
                    value={timeSlot}
                    onChange={(e) => {
                      if (e.target.value === "__CUSTOM__") {
                        setIsCustomTime(true);
                      } else {
                        setTimeSlot(e.target.value);
                      }
                    }}
                    className="w-full h-11 px-3.5 bg-white border border-[#D9E4EC] rounded-xl text-sm font-bold text-[#243746] focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] cursor-pointer"
                  >
                    {standardTimeSlots.map((ts) => {
                      const { isBooked, appt } = checkSlotBooked(ts);
                      let label = ts;
                      if (isBooked) {
                        label += ` — [Already Booked: ${appt?.timeSlot || ts}]`;
                      }
                      return (
                        <option
                          key={ts}
                          value={ts}
                          disabled={isBooked}
                          className={isBooked ? "text-rose-600 bg-rose-50 font-bold" : ""}
                        >
                          {label}
                        </option>
                      );
                    })}
                    <option value="__CUSTOM__">✎ Enter Custom Time...</option>
                  </select>
                )}
              </div>
            </div>

            {/* Full-width Company Off-day Closure Alert Banner */}
            {isSelectedDateOffDay && (
              <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-amber-950 text-xs flex items-start gap-2.5 animate-in fade-in duration-200 shadow-2xs w-full">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-amber-950">
                    Company Off-Day / Office Closure ({matchingOffDay?.title})
                  </strong>
                  <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                    <strong>{date}</strong> is designated as an official company closure (
                    {matchingOffDay?.title}
                    {matchingOffDay?.description ? `: ${matchingOffDay.description}` : ""}
                    ). Visits cannot be scheduled on official off-days. Please choose an open operational date.
                  </p>
                </div>
              </div>
            )}

            {/* Full-width Date conflict alert banner */}
            {hasDateConflict && (
              <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl text-rose-900 text-xs flex items-start gap-2.5 animate-in fade-in duration-200 shadow-2xs w-full">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-rose-950">
                    Visit Already Scheduled on this Date ({date})
                  </strong>
                  <p className="text-rose-800 text-[11px] mt-0.5 leading-relaxed">
                    This client already has an active visit booked on{" "}
                    <strong>{date}</strong> at{" "}
                    <strong>{clientApptOnSelectedDate?.timeSlot || "Scheduled"}</strong>. Multiple visits cannot be scheduled on the same date for the same client. Please choose another date.
                  </p>
                </div>
              </div>
            )}

            {/* Full-width Time slot conflict alert banner */}
            {!hasDateConflict && currentSlotStatus.isBooked && (
              <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl text-rose-900 text-xs flex items-start gap-2.5 animate-in fade-in duration-200 shadow-2xs w-full">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-rose-950">
                    Client Time Slot Conflict ({date})
                  </strong>
                  <p className="text-rose-800 text-[11px] mt-0.5 leading-relaxed">
                    This client already has an active visit scheduled at{" "}
                    <strong>{currentSlotStatus.appt?.timeSlot || timeSlot}</strong> on{" "}
                    <strong>{date}</strong>. The same client cannot be scheduled for two visits at the same time on the same date. Please select another time slot or date.
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#243746] mb-1">Visit Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Gate codes, pet warnings, specific rooms to inspect..."
                className="w-full p-3 text-sm border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !isTargetClientEligible || hasDateConflict || isSelectedDateOffDay}
                className={`w-full py-3 font-bold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 ${
                  !isTargetClientEligible || hasDateConflict || isSelectedDateOffDay
                    ? "bg-slate-100 text-[#94A3B8] border border-slate-200 cursor-not-allowed"
                    : "bg-[#294B68] hover:bg-[#1E374D] text-white cursor-pointer"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dispatching Specialist...</span>
                  </>
                ) : isSelectedDateOffDay ? (
                  <span>Company Off-Day — Office Closed on this Date</span>
                ) : hasDateConflict ? (
                  <span>Date Conflict — Client already has a visit on this date</span>
                ) : !isTimeSlotValid ? (
                  <span>Time Slot Conflict — Choose Another Time</span>
                ) : !isTargetClientAgreementPaid ? (
                  <span>Agreement &amp; Payment Required to Schedule</span>
                ) : !hasRemainingVisits ? (
                  <span>0 Remaining Visits — Cannot Dispatch Visit</span>
                ) : (
                  <span>Confirm &amp; Schedule Visit</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
