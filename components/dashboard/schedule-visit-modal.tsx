"use client";

import React, { useState } from "react";
import { X, Calendar, Clock, CheckCircle2, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import { ServicePlan, VisitType } from "@/lib/types/dashboard";
import { scheduleAppointment } from "@/lib/api/dashboard";

interface ScheduleVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: ServicePlan;
}

export function ScheduleVisitModal({ isOpen, onClose, plan }: ScheduleVisitModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedService, setSelectedService] = useState<VisitType>("Safety Oversight");
  const [selectedDate, setSelectedDate] = useState<string>("2026-09-20");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("10:00 AM – 12:00 PM");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const availableServices: { type: VisitType; description: string; remaining: number }[] = [
    {
      type: "Safety Oversight",
      description: "Comprehensive home environment, grab-bar, and hazard inspection.",
      remaining: plan.safetyVisitsTotal - plan.safetyVisitsCompleted,
    },
    {
      type: "Cleaning",
      description: "Dedicated deep cleaning of living areas, bathrooms, and walkways.",
      remaining: plan.cleaningVisitsTotal - plan.cleaningVisitsCompleted,
    },
  ];

  const timeSlots = [
    "09:00 AM – 11:00 AM",
    "10:00 AM – 12:00 PM",
    "01:30 PM – 03:30 PM",
    "03:30 PM – 05:30 PM",
  ];

  const dates = [
    { label: "Tue, Sep 15", value: "2026-09-15" },
    { label: "Fri, Sep 18", value: "2026-09-18" },
    { label: "Mon, Sep 21", value: "2026-09-21" },
    { label: "Thu, Sep 24", value: "2026-09-24" },
    { label: "Mon, Sep 28", value: "2026-09-28" },
  ];

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await scheduleAppointment({
        serviceType: selectedService,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        notes,
      });
      setStep(5); // Confirmation step
    } catch {
      alert("Unable to schedule appointment right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={resetAndClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#D9E4EC] shadow-2xl p-6 sm:p-8 z-10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D9E4EC]">
          <div>
            <h3 className="text-xl font-bold text-[#243746]">
              {step === 5 ? "Visit Confirmed" : `Schedule a Visit — Step ${step} of 4`}
            </h3>
            <p className="text-xs text-[#64748B]">AgeWellRI Home Care Portal</p>
          </div>
          <button
            onClick={resetAndClose}
            aria-label="Close modal"
            className="p-2 text-[#64748B] hover:text-[#243746] rounded-xl border border-[#D9E4EC]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Pills */}
        {step < 5 && (
          <div className="flex items-center gap-1.5 py-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  step >= i ? "bg-[#294B68]" : "bg-[#EAF3F8]"
                }`}
              />
            ))}
          </div>
        )}

        {/* Step 1: Select Service */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <h4 className="font-bold text-[#243746] text-base">Select Visit Type</h4>
            <div className="space-y-3">
              {availableServices.map((srv) => (
                <div
                  key={srv.type}
                  onClick={() => setSelectedService(srv.type)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedService === srv.type
                      ? "border-[#294B68] bg-[#EAF3F8]/50"
                      : "border-[#D9E4EC] hover:border-[#5E8FB2] bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#243746] text-base flex items-center gap-2">
                      {srv.type === "Safety Oversight" ? (
                        <ShieldCheck className="w-5 h-5 text-[#294B68]" />
                      ) : (
                        <Sparkles className="w-5 h-5 text-[#5E8FB2]" />
                      )}
                      {srv.type}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 bg-white border border-[#D9E4EC] rounded-full text-[#294B68]">
                      {srv.remaining} available
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-1.5">{srv.description}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full mt-4 py-3 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold rounded-xl cursor-pointer"
            >
              Continue to Select Date →
            </button>
          </div>
        )}

        {/* Step 2: Select Date */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <h4 className="font-bold text-[#243746] text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#294B68]" /> Choose a Date
            </h4>
            <div className="grid grid-cols-1 gap-2.5">
              {dates.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setSelectedDate(d.value)}
                  className={`p-3.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                    selectedDate === d.value
                      ? "border-[#294B68] bg-[#294B68] text-white"
                      : "border-[#D9E4EC] bg-white text-[#243746] hover:bg-[#EAF3F8]"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-3 border border-[#D9E4EC] text-[#243746] font-semibold rounded-xl cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="w-2/3 py-3 bg-[#294B68] text-white font-bold rounded-xl cursor-pointer"
              >
                Select Time Slot →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Select Time Slot */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <h4 className="font-bold text-[#243746] text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#5E8FB2]" /> Available Time Slots
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {timeSlots.map((ts) => (
                <button
                  key={ts}
                  type="button"
                  onClick={() => setSelectedTimeSlot(ts)}
                  className={`p-3.5 rounded-xl border text-center font-bold text-sm transition-all cursor-pointer ${
                    selectedTimeSlot === ts
                      ? "border-[#294B68] bg-[#294B68] text-white"
                      : "border-[#D9E4EC] bg-white text-[#243746] hover:bg-[#EAF3F8]"
                  }`}
                >
                  {ts}
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={() => setStep(2)}
                className="w-1/3 py-3 border border-[#D9E4EC] text-[#243746] font-semibold rounded-xl cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="w-2/3 py-3 bg-[#294B68] text-white font-bold rounded-xl cursor-pointer"
              >
                Review Appointment →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Confirm */}
        {step === 4 && (
          <div className="space-y-4 py-2">
            <h4 className="font-bold text-[#243746] text-base">Review Appointment Details</h4>
            <div className="p-4 bg-[#F7FAFC] border border-[#D9E4EC] rounded-2xl space-y-3">
              <div className="flex justify-between border-b border-[#D9E4EC] pb-2 text-sm">
                <span className="text-[#64748B]">Service:</span>
                <span className="font-bold text-[#243746]">{selectedService}</span>
              </div>
              <div className="flex justify-between border-b border-[#D9E4EC] pb-2 text-sm">
                <span className="text-[#64748B]">Date:</span>
                <span className="font-bold text-[#243746]">{selectedDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">Time Slot:</span>
                <span className="font-bold text-[#294B68]">{selectedTimeSlot}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#243746] mb-1">
                Special Care Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please use the side entrance..."
                rows={2}
                className="w-full p-3 text-sm border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
              />
            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={() => setStep(3)}
                className="w-1/3 py-3 border border-[#D9E4EC] text-[#243746] font-semibold rounded-xl cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="w-2/3 py-3 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Scheduling...</span>
                  </>
                ) : (
                  <span>Confirm Appointment</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Confirmation Success */}
        {step === 5 && (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 bg-[#3F8F6B] text-white rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-2xl font-extrabold text-[#243746]">
                Appointment Confirmed!
              </h4>
              <p className="text-sm text-[#64748B] mt-1 max-w-sm mx-auto">
                Your {selectedService} visit has been scheduled for{" "}
                <strong className="text-[#243746]">{selectedDate}</strong> at{" "}
                <strong className="text-[#294B68]">{selectedTimeSlot}</strong>.
              </p>
            </div>

            <button
              onClick={resetAndClose}
              className="w-full py-3.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-base rounded-xl cursor-pointer"
            >
              Done &amp; Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
