"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Calendar, Loader2, CheckCircle2, UserCheck, Search, ChevronDown, Check } from "lucide-react";
import { adminBookAppointment } from "@/lib/api/admin-api";
import { MOCK_ADMIN_CLIENTS } from "@/lib/api/admin-mock-data";
import { useGetAllSpecialistsQuery } from "@/redux/features/specialist/specialistApi";
import { useGetAdminClientsQuery } from "@/redux/features/client/clientApi";
import {
  confirmCriticalAction,
  showSuccessAlert,
  showErrorAlert,
} from "@/lib/alerts/sweetalert";

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
  const { data: specialists = [] } = useGetAllSpecialistsQuery();
  const { data: clientsRes } = useGetAdminClientsQuery(undefined, { skip: !isOpen });
  const clientsList = clientsRes?.data || [];

  const [selectedClientId, setSelectedClientId] = useState(defaultClientId || "");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [serviceType, setServiceType] = useState<"Safety Oversight" | "Cleaning">("Safety Oversight");
  const [date, setDate] = useState(() => {
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return nextWeek.toISOString().split("T")[0];
  });
  const [timeSlot, setTimeSlot] = useState("10:00 AM – 12:00 PM");
  const [technicianName, setTechnicianName] = useState(specialists[0]?.name || "Mark Johnson");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (defaultClientId) {
      setSelectedClientId(defaultClientId);
    } else if (clientsList.length > 0 && !selectedClientId) {
      setSelectedClientId(clientsList[0].id);
    }
  }, [defaultClientId, clientsList, isOpen, selectedClientId]);

  useEffect(() => {
    if (specialists.length > 0 && !technicianName) {
      setTechnicianName(specialists[0].name);
    }
  }, [specialists, technicianName]);

  // Click outside listener for the client search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const isLockedClient = Boolean(hideClientSelect || defaultClientId);

  const matchedClient =
    clientsList.find(
      (c) =>
        c.id === (defaultClientId || selectedClientId) ||
        c.clientNumber === (defaultClientId || selectedClientId) ||
        c.userId === (defaultClientId || selectedClientId) ||
        c.internalId === (defaultClientId || selectedClientId)
    ) ||
    MOCK_ADMIN_CLIENTS.find(
      (c) =>
        c.id === (defaultClientId || selectedClientId) ||
        (c as any).clientNumber === (defaultClientId || selectedClientId)
    );

  const resolvedDisplayName =
    clientName && clientName !== defaultClientId
      ? clientName
      : matchedClient
      ? `${matchedClient.firstName} ${matchedClient.lastName}`
      : "Client Account";

  const resolvedDisplayId =
    matchedClient?.clientNumber ||
    matchedClient?.id ||
    defaultClientId ||
    selectedClientId ||
    "AW-CLIENT";

  const selectedClient = matchedClient || clientsList[0];

  const filteredClients = clientsList.filter((c) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetClientId = isLockedClient ? (defaultClientId || selectedClientId) : selectedClientId;
    const targetDisplayName = clientName || (selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : targetClientId) || "Client";

    const confirmed = await confirmCriticalAction({
      title: "Dispatch Specialist Visit?",
      text: `Schedule a ${serviceType} visit for ${targetDisplayName} on ${date} (${timeSlot}) assigned to ${technicianName}?`,
      confirmButtonText: "Yes, Schedule Visit",
      isDestructive: false,
    });

    if (!confirmed) return;

    setIsSubmitting(true);
    try {
      await adminBookAppointment({
        clientId: targetClientId,
        serviceType,
        date,
        timeSlot,
        technicianName,
        notes,
      });
      setSuccess(true);
      await showSuccessAlert(
        "Visit Dispatched Successfully",
        `${serviceType} visit has been scheduled for ${date} with ${technicianName}.`
      );
    } catch {
      showErrorAlert("Scheduling Failed", "Failed to schedule appointment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccess(false);
    setIsDropdownOpen(false);
    setSearchQuery("");
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
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="w-full min-h-[46px] px-3.5 py-2 text-left bg-white border border-[#D9E4EC] hover:border-[#5E8FB2] rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                >
                  {selectedClient ? (
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#EAF3F8] text-[#294B68] font-bold text-xs flex items-center justify-center shrink-0">
                        {selectedClient.firstName?.[0] || "C"}
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-sm text-[#243746]">
                          {selectedClient.firstName} {selectedClient.lastName}
                        </span>
                        <span className="text-xs text-[#5E8FB2] font-semibold ml-2">
                          ({selectedClient.clientNumber || selectedClient.id}) — {selectedClient.planName || "Active Plan"}
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
                      {filteredClients.length === 0 ? (
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#243746] mb-1">Service Type *</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as any)}
                  className="w-full h-11 px-3 text-sm border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                >
                  <option value="Safety Oversight">Safety Oversight</option>
                  <option value="Cleaning">Cleaning</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#243746] mb-1">Assigned Specialist *</label>
                <select
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  className="w-full h-11 px-3 text-sm border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                >
                  {specialists.length > 0 ? (
                    specialists.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.title})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Mark Johnson">Mark Johnson (Safety Lead)</option>
                      <option value="Sarah Miller">Sarah Miller (Cleaning Specialist)</option>
                    </>
                  )}
                </select>
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
                  <option value="09:00 AM – 11:00 AM">09:00 AM – 11:00 AM</option>
                  <option value="10:00 AM – 12:00 PM">10:00 AM – 12:00 PM</option>
                  <option value="01:00 PM – 03:00 PM">01:00 PM – 03:00 PM</option>
                  <option value="03:00 PM – 05:00 PM">03:00 PM – 05:00 PM</option>
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
                disabled={isSubmitting}
                className="w-full py-3 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dispatching Specialist...</span>
                  </>
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
