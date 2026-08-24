"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Loader2, CheckCircle2, UserCheck } from "lucide-react";
import { adminBookAppointment } from "@/lib/api/admin-api";
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
  }, [defaultClientId, clientsList, isOpen]);

  useEffect(() => {
    if (specialists.length > 0 && !technicianName) {
      setTechnicianName(specialists[0].name);
    }
  }, [specialists]);

  if (!isOpen) return null;

  const isLockedClient = Boolean(hideClientSelect || defaultClientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetClientId = isLockedClient ? (defaultClientId || selectedClientId) : selectedClientId;
    const targetDisplayName = clientName || targetClientId || "Client";

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
            {/* Target Client Display or Selection */}
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
                        {clientName || defaultClientId}
                      </span>
                      <span className="text-xs font-mono font-semibold text-[#5E8FB2]">
                        ID: {defaultClientId}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-extrabold text-[#294B68] bg-white px-2.5 py-1 rounded-md border border-[#D9E4EC] shadow-2xs">
                    Client Selected
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-[#243746] mb-1">Select Client *</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                >
                  {clientsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} ({c.id}) — {c.planName || "Active Plan"}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#243746] mb-1">Service Type *</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as any)}
                  className="w-full h-11 px-3 text-sm border border-[#D9E4EC] rounded-xl"
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
                  className="w-full h-11 px-3 text-sm border border-[#D9E4EC] rounded-xl"
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
                  className="w-full h-11 px-3 text-sm border border-[#D9E4EC] rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#243746] mb-1">Time Slot *</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full h-11 px-3 text-sm border border-[#D9E4EC] rounded-xl"
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
