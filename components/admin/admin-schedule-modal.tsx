"use client";

import React, { useState } from "react";
import { X, Calendar, Clock, Loader2, CheckCircle2, UserCheck } from "lucide-react";
import { adminBookAppointment } from "@/lib/api/admin-api";
import { MOCK_ADMIN_CLIENTS } from "@/lib/api/admin-mock-data";

interface AdminScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClientId?: string;
}

export function AdminScheduleModal({
  isOpen,
  onClose,
  defaultClientId,
}: AdminScheduleModalProps) {
  const [selectedClientId, setSelectedClientId] = useState(defaultClientId || MOCK_ADMIN_CLIENTS[0].id);
  const [serviceType, setServiceType] = useState<"Safety Oversight" | "Cleaning">("Safety Oversight");
  const [date, setDate] = useState("2026-09-25");
  const [timeSlot, setTimeSlot] = useState("10:00 AM – 12:00 PM");
  const [technicianName, setTechnicianName] = useState("Marcus Vance");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await adminBookAppointment({
        clientId: selectedClientId,
        serviceType,
        date,
        timeSlot,
        technicianName,
        notes,
      });
      setSuccess(true);
    } catch {
      alert("Failed to schedule appointment.");
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
          <button onClick={handleReset} className="p-2 text-[#64748B] hover:text-[#243746] rounded-xl border border-[#D9E4EC]">
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
              Done &amp; Return to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
              <label className="block text-xs font-bold text-[#243746] mb-1">Select Client *</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full h-11 px-3.5 text-sm border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
              >
                {MOCK_ADMIN_CLIENTS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.id}) — {c.planName}
                  </option>
                ))}
              </select>
            </div>

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
                  <option value="Marcus Vance">Marcus Vance (Safety Lead)</option>
                  <option value="Elena Rostova">Elena Rostova (Senior Support)</option>
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
                  <option value="01:30 PM – 03:30 PM">01:30 PM – 03:30 PM</option>
                  <option value="03:30 PM – 05:30 PM">03:30 PM – 05:30 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#243746] mb-1">Dispatcher Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal technician instructions..."
                className="w-full p-3 text-sm border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-base rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Booking Visit...</span>
                  </>
                ) : (
                  <span>Book Visit for Client</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
