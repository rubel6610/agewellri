"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Calendar, Loader2, CheckCircle2, UserCheck, Search, ChevronDown, Check, AlertCircle } from "lucide-react";
import { useGetAllSpecialistsQuery } from "@/redux/features/specialist/specialistApi";
import { useGetAdminClientsQuery } from "@/redux/features/client/clientApi";
import { useAdminScheduleAppointmentMutation } from "@/redux/features/appointment/appointmentApi";
import {
  confirmCriticalAction,
  showSuccessAlert,
  showErrorAlert,
} from "@/lib/alerts/sweetalert";

const STANDARD_VISIT_TYPES = [
  "Home Safety & Oversight Visit",
  "Comprehensive Safety Assessment",
  "Specialist Follow-up Visit",
];

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
  const clientsList = clientsRes?.data || [];

  // Client Selection State & Eligibility Filtering
  const isClientEligible = (c: any) => {
    if (!c) return false;
    const isExecuted =
      c.agreementStatus === "EXECUTED" || c.agreementStatus === "SIGNED";
    const isEnrolled =
      c.paymentStatus === "PAID" ||
      c.status === "active" ||
      c.status === "pending_payment" ||
      c.subscriptionStatus === "PENDING";
    const hasQuota =
      c.remainingVisitsCount === undefined || c.remainingVisitsCount > 0;
    return isExecuted && isEnrolled && hasQuota;
  };

  const eligibleClients = clientsList.filter(isClientEligible);

  const [selectedClientId, setSelectedClientId] = useState(defaultClientId || "");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Service Type Selection State
  const [serviceType, setServiceType] = useState<string>("Home Safety & Oversight Visit");
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);

  // Specialist Selection State
  const [technicianName, setTechnicianName] = useState(specialists[0]?.name || "Mark Johnson");
  const [isSpecialistDropdownOpen, setIsSpecialistDropdownOpen] = useState(false);
  const [specialistSearchQuery, setSpecialistSearchQuery] = useState("");
  const specialistDropdownRef = useRef<HTMLDivElement>(null);

  const [date, setDate] = useState(() => {
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return nextWeek.toISOString().split("T")[0];
  });
  const [timeSlot, setTimeSlot] = useState("10:00 AM – 12:00 PM");
  const [notes, setNotes] = useState("");
  const [adminScheduleAppointmentMutation, { isLoading: isSubmitting }] = useAdminScheduleAppointmentMutation();
  const [success, setSuccess] = useState(false);



  useEffect(() => {
    if (defaultClientId) {
      setSelectedClientId(defaultClientId);
    } else if (eligibleClients.length > 0 && !selectedClientId) {
      setSelectedClientId(eligibleClients[0].id);
    }
  }, [defaultClientId, eligibleClients, isOpen, selectedClientId]);

  useEffect(() => {
    if (specialists.length > 0 && !technicianName) {
      setTechnicianName(specialists[0].name);
    }
  }, [specialists, technicianName]);

  // Click outside listener for all search dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(target)) {
        setIsServiceDropdownOpen(false);
      }
      if (specialistDropdownRef.current && !specialistDropdownRef.current.contains(target)) {
        setIsSpecialistDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const isLockedClient = Boolean(hideClientSelect || defaultClientId);

  const matchedClient = clientsList.find(
    (c) =>
      c.id === (defaultClientId || selectedClientId) ||
      c.clientNumber === (defaultClientId || selectedClientId) ||
      c.userId === (defaultClientId || selectedClientId) ||
      c.internalId === (defaultClientId || selectedClientId)
  );

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

  const selectedClient = matchedClient || eligibleClients[0] || clientsList[0];
  const isTargetClientAgreementPaid = selectedClient
    ? (selectedClient.agreementStatus === "EXECUTED" || selectedClient.agreementStatus === "SIGNED") &&
      selectedClient.paymentStatus === "PAID"
    : false;
  const hasRemainingVisits = selectedClient
    ? selectedClient.remainingVisitsCount === undefined || selectedClient.remainingVisitsCount > 0
    : true;
  const isTargetClientEligible = isTargetClientAgreementPaid && hasRemainingVisits;

  // Filtered Clients (Only eligible active enrolled clients)
  const filteredClients = eligibleClients.filter((c) => {
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

  const selectedVisitType = serviceType || (selectedClient as any)?.planName || STANDARD_VISIT_TYPES[0];

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

  const selectedSpecialistObj =
    specialists.find((s) => s.name === technicianName) ||
    specialists.find((s) => s.id === technicianName) ||
    specialists[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      text: `Schedule a ${serviceType} visit for ${targetDisplayName} on ${date} (${timeSlot}) assigned to ${technicianName}?`,
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
        `${serviceType} visit has been scheduled for ${date} with ${technicianName}.`
      );
    } catch (err: any) {
      const errMsg = err?.data?.message || err?.message || "Failed to schedule appointment.";
      showErrorAlert("Scheduling Failed", errMsg);
    }
  };

  const handleReset = () => {
    setSuccess(false);
    setIsDropdownOpen(false);
    setIsServiceDropdownOpen(false);
    setIsSpecialistDropdownOpen(false);
    setSearchQuery("");
    setSpecialistSearchQuery("");
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
                {serviceType} visit scheduled for <strong>{date}</strong> ({timeSlot}).
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
            {/* Warning Banners */}
            {!isTargetClientAgreementPaid ? (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-amber-950">Visit Scheduling Unavailable</strong>
                  <span>This client has not executed their Service Agreement or completed their subscription payment. Both an executed agreement and active payment are required before scheduling visits.</span>
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
                    setIsServiceDropdownOpen(false);
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Visit Type Dropdown */}
              <div className="relative" ref={serviceDropdownRef}>
                <label className="block text-xs font-bold text-[#243746] mb-1">
                  Visit Type <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsServiceDropdownOpen((prev) => !prev);
                    setIsDropdownOpen(false);
                    setIsSpecialistDropdownOpen(false);
                  }}
                  className="w-full min-h-[46px] px-3.5 py-2 text-left bg-white border border-[#D9E4EC] hover:border-[#5E8FB2] rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                >
                  <div className="truncate">
                    <span className="font-bold text-sm text-[#243746]">
                      {selectedVisitType}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#64748B] shrink-0 transition-transform duration-200 ${
                      isServiceDropdownOpen ? "rotate-180 text-[#294B68]" : ""
                    }`}
                  />
                </button>

                {isServiceDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#D9E4EC] rounded-2xl shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    {STANDARD_VISIT_TYPES.map((vt) => {
                      const isSelected = vt === serviceType;
                      return (
                        <button
                          key={vt}
                          type="button"
                          onClick={() => {
                            setServiceType(vt);
                            setIsServiceDropdownOpen(false);
                          }}
                          className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-[#EAF3F8] text-[#294B68]"
                              : "hover:bg-[#F8FAFC] text-[#243746]"
                          }`}
                        >
                          <span className="font-bold text-xs truncate">{vt}</span>
                          {isSelected && <Check className="w-4 h-4 text-[#294B68] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Searchable Assigned Specialist Dropdown with Loading Option */}
              <div className="relative" ref={specialistDropdownRef}>
                <label className="block text-xs font-bold text-[#243746] mb-1">
                  Assigned Specialist <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsSpecialistDropdownOpen((prev) => !prev);
                    setIsDropdownOpen(false);
                    setIsServiceDropdownOpen(false);
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
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#243746] mb-1">Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-11 px-3 text-sm border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#243746] mb-1">Time Slot *</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full h-11 px-3 text-sm border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                >
                  <option value="08:00 AM – 10:00 AM">08:00 AM – 10:00 AM</option>
                  <option value="10:00 AM – 12:00 PM">10:00 AM – 12:00 PM</option>
                  <option value="01:00 PM – 03:00 PM">01:00 PM – 03:00 PM</option>
                  <option value="03:00 PM – 05:00 PM">03:00 PM – 05:00 PM</option>
                  <option value="04:00 PM – 06:00 PM">04:00 PM – 06:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#243746] mb-1">Dispatch Notes (Optional)</label>
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
                disabled={isSubmitting || !isTargetClientEligible}
                className={`w-full py-3 font-bold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 ${
                  !isTargetClientEligible
                    ? "bg-slate-100 text-[#94A3B8] border border-slate-200 cursor-not-allowed"
                    : "bg-[#294B68] hover:bg-[#1E374D] text-white cursor-pointer"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dispatching Specialist...</span>
                  </>
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
