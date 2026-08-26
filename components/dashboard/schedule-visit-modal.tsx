"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, CheckCircle2, ShieldCheck, Sparkles, Loader2, UserCheck, AlertCircle } from "lucide-react";
import { ServicePlan, VisitType } from "@/lib/types/dashboard";
import { useGetVisitEntitlementsQuery } from "@/redux/features/payment/paymentApi";
import { useGetAllSpecialistsQuery } from "@/redux/features/specialist/specialistApi";
import { useScheduleAppointmentMutation } from "@/redux/features/appointment/appointmentApi";
import {
  confirmCriticalAction,
  showSuccessAlert,
  showErrorAlert,
} from "@/lib/alerts/sweetalert";

interface ScheduleVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: ServicePlan | null;
}

export function ScheduleVisitModal({ isOpen, onClose, plan }: ScheduleVisitModalProps) {
  const { data: entitlementsRes, isLoading: isEntitlementsLoading } = useGetVisitEntitlementsQuery(undefined, { skip: !isOpen });
  const { data: specialists = [] } = useGetAllSpecialistsQuery(undefined, { skip: !isOpen });
  const [scheduleAppointmentMutation, { isLoading: isSubmitting }] = useScheduleAppointmentMutation();

  const entitlements = entitlementsRes?.data?.entitlements || [];

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<string>("");
  const [selectedServiceName, setSelectedServiceName] = useState<string>("Safety Oversight");
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<string>("");
  const [selectedSpecialistName, setSelectedSpecialistName] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("10:00 AM – 12:00 PM");
  const [notes, setNotes] = useState("");

  // Generate the next 5 business days for realistic date selection
  const dates = React.useMemo(() => {
    const list: { label: string; value: string }[] = [];
    const now = new Date();
    let daysAdded = 0;
    let offset = 2; // start 2 days ahead

    while (daysAdded < 5) {
      const d = new Date(now);
      d.setDate(now.getDate() + offset);
      // Skip Sundays (0)
      if (d.getDay() !== 0) {
        list.push({
          label: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
          value: d.toISOString().split("T")[0],
        });
        daysAdded++;
      }
      offset++;
    }
    return list;
  }, []);

  useEffect(() => {
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0].value);
    }
  }, [dates, selectedDate]);

  useEffect(() => {
    if (entitlements.length > 0 && !selectedServiceTypeId) {
      // Find first service with remaining visits
      const available = entitlements.find((e) => e.remaining > 0) || entitlements[0];
      setSelectedServiceTypeId(available.serviceTypeId);
      setSelectedServiceName(available.serviceName);
    }
  }, [entitlements, selectedServiceTypeId]);

  useEffect(() => {
    if (specialists.length > 0 && !selectedSpecialistId) {
      setSelectedSpecialistId(specialists[0].id);
      setSelectedSpecialistName(specialists[0].name);
    }
  }, [specialists, selectedSpecialistId]);

  if (!isOpen) return null;

  const timeSlots = [
    "09:00 AM – 11:00 AM",
    "10:00 AM – 12:00 PM",
    "01:30 PM – 03:30 PM",
    "03:30 PM – 05:30 PM",
  ];

  const currentEntitlement = entitlements.find((e) => e.serviceTypeId === selectedServiceTypeId);
  const remainingCount = currentEntitlement ? currentEntitlement.remaining : (plan ? plan.remainingVisits : 6);

  const handleConfirm = async () => {
    if (currentEntitlement && currentEntitlement.remaining <= 0) {
      showErrorAlert(
        "No Remaining Visits",
        `You have 0 remaining visits available for ${selectedServiceName} in your current quarterly plan.`
      );
      return;
    }

    const confirmed = await confirmCriticalAction({
      title: `Confirm ${selectedServiceName} Visit?`,
      text: `Book appointment for ${selectedDate} at ${selectedTimeSlot}?`,
      confirmButtonText: "Yes, Schedule Appointment",
      isDestructive: false,
    });

    if (!confirmed) return;

    try {
      await scheduleAppointmentMutation({
        serviceTypeId: selectedServiceTypeId,
        serviceType: selectedServiceName,
        technicianId: selectedSpecialistId || undefined,
        technicianName: selectedSpecialistName || undefined,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        notes,
      }).unwrap();

      setStep(5);
      await showSuccessAlert(
        "Appointment Booked",
        `Your ${selectedServiceName} visit has been scheduled for ${selectedDate} (${selectedTimeSlot}).`
      );
    } catch (err: any) {
      const errMsg = err?.data?.message || err?.message || "Unable to schedule appointment right now. Please try again.";
      showErrorAlert("Scheduling Failed", errMsg);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setNotes("");
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
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#D9E4EC] shadow-2xl p-6 sm:p-8 z-10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden text-[#243746]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D9E4EC]">
          <div>
            <h3 className="text-xl font-extrabold text-[#243746] tracking-tight">
              {step === 5 ? "Visit Confirmed" : `Schedule a Visit — Step ${step} of 4`}
            </h3>
            <p className="text-xs text-[#64748B] font-medium">AgeWellRI Home Care Portal</p>
          </div>
          <button
            onClick={resetAndClose}
            aria-label="Close modal"
            className="p-2 text-[#64748B] hover:text-[#243746] rounded-xl border border-[#D9E4EC] cursor-pointer hover:bg-[#F8FAFC]"
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
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[#243746] text-base">Select Care Service</h4>
              <span className="text-xs font-semibold text-[#64748B]">Active Plan Quota</span>
            </div>

            {isEntitlementsLoading ? (
              <div className="p-6 text-center text-sm text-[#64748B] flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#294B68]" />
                <span>Loading available services...</span>
              </div>
            ) : entitlements.length > 0 ? (
              <div className="space-y-3">
                {entitlements.map((srv) => {
                  const isSelected = selectedServiceTypeId === srv.serviceTypeId;
                  const isExhausted = srv.remaining <= 0;

                  return (
                    <div
                      key={srv.id}
                      onClick={() => {
                        setSelectedServiceTypeId(srv.serviceTypeId);
                        setSelectedServiceName(srv.serviceName);
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#294B68] bg-[#EAF3F8]/60"
                          : "border-[#D9E4EC] hover:border-[#5E8FB2] bg-white"
                      } ${isExhausted ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#243746] text-base flex items-center gap-2">
                          {srv.category === "CLEANING" ? (
                            <Sparkles className="w-5 h-5 text-[#5E8FB2]" />
                          ) : (
                            <ShieldCheck className="w-5 h-5 text-[#294B68]" />
                          )}
                          {srv.serviceName}
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                            isExhausted
                              ? "bg-rose-50 border-rose-200 text-rose-700"
                              : "bg-white border-[#D9E4EC] text-[#294B68]"
                          }`}
                        >
                          {srv.remaining} remaining
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-1.5 font-medium">
                        {srv.durationMinutes} min session • {srv.allocated} total included in quarter
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  {
                    name: "Safety Oversight Visit",
                    desc: "Comprehensive home environment, grab-bar, and hazard inspection.",
                    rem: plan ? plan.safetyVisitsTotal - plan.safetyVisitsCompleted : 6,
                  },
                  {
                    name: "Cleaning Visit",
                    desc: "Dedicated deep cleaning of living areas, bathrooms, and walkways.",
                    rem: plan ? plan.cleaningVisitsTotal - plan.cleaningVisitsCompleted : 6,
                  },
                ].map((s) => (
                  <div
                    key={s.name}
                    onClick={() => setSelectedServiceName(s.name)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedServiceName === s.name
                        ? "border-[#294B68] bg-[#EAF3F8]/60"
                        : "border-[#D9E4EC] hover:border-[#5E8FB2] bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#243746] text-base flex items-center gap-2">
                        {s.name.includes("Safety") ? (
                          <ShieldCheck className="w-5 h-5 text-[#294B68]" />
                        ) : (
                          <Sparkles className="w-5 h-5 text-[#5E8FB2]" />
                        )}
                        {s.name}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-1 bg-white border border-[#D9E4EC] rounded-full text-[#294B68]">
                        {s.rem} available
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-1.5">{s.desc}</p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              className="w-full mt-4 py-3.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold rounded-xl cursor-pointer shadow-xs transition-all"
            >
              Continue to Select Date →
            </button>
          </div>
        )}

        {/* Step 2: Select Date & Specialist */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <h4 className="font-bold text-[#243746] text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#294B68]" /> Choose Date &amp; Specialist
            </h4>

            {/* Date Selection */}
            <div className="grid grid-cols-1 gap-2.5">
              {dates.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setSelectedDate(d.value)}
                  className={`p-3.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                    selectedDate === d.value
                      ? "border-[#294B68] bg-[#294B68] text-white shadow-xs"
                      : "border-[#D9E4EC] bg-white text-[#243746] hover:bg-[#EAF3F8]"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Preferred Specialist (Optional) */}
            {specialists.length > 0 && (
              <div className="pt-2 border-t border-[#D9E4EC]/60 space-y-1.5">
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  Assigned Care Specialist
                </label>
                <select
                  value={selectedSpecialistId}
                  onChange={(e) => {
                    const found = specialists.find((s) => s.id === e.target.value);
                    setSelectedSpecialistId(e.target.value);
                    setSelectedSpecialistName(found ? found.name : "");
                  }}
                  className="w-full p-3 text-sm bg-white border border-[#D9E4EC] rounded-xl font-medium focus:ring-2 focus:ring-[#294B68] focus:outline-none"
                >
                  {specialists.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.name} — {sp.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3 pt-3">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-3 border border-[#D9E4EC] text-[#243746] font-semibold rounded-xl cursor-pointer hover:bg-[#F8FAFC]"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="w-2/3 py-3 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold rounded-xl cursor-pointer shadow-xs"
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
                      ? "border-[#294B68] bg-[#294B68] text-white shadow-xs"
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
                className="w-1/3 py-3 border border-[#D9E4EC] text-[#243746] font-semibold rounded-xl cursor-pointer hover:bg-[#F8FAFC]"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="w-2/3 py-3 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold rounded-xl cursor-pointer shadow-xs"
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
            <div className="p-4 bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl space-y-2.5 text-sm">
              <div className="flex justify-between border-b border-[#D9E4EC]/60 pb-2">
                <span className="text-[#64748B]">Service:</span>
                <span className="font-bold text-[#243746]">{selectedServiceName}</span>
              </div>
              <div className="flex justify-between border-b border-[#D9E4EC]/60 pb-2">
                <span className="text-[#64748B]">Date:</span>
                <span className="font-bold text-[#243746]">{selectedDate}</span>
              </div>
              <div className="flex justify-between border-b border-[#D9E4EC]/60 pb-2">
                <span className="text-[#64748B]">Time Slot:</span>
                <span className="font-bold text-[#294B68]">{selectedTimeSlot}</span>
              </div>
              {selectedSpecialistName && (
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Specialist:</span>
                  <span className="font-bold text-[#243746]">{selectedSpecialistName}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#243746] mb-1">
                Special Care Notes / Access Instructions (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Side entrance code is #1234, please knock gently..."
                rows={2}
                className="w-full p-3 text-sm border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#294B68]"
              />
            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={() => setStep(3)}
                className="w-1/3 py-3 border border-[#D9E4EC] text-[#243746] font-semibold rounded-xl cursor-pointer hover:bg-[#F8FAFC]"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="w-2/3 py-3.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-70"
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
              <p className="text-sm text-[#64748B] mt-1 max-w-sm mx-auto font-medium">
                Your {selectedServiceName} visit has been scheduled for{" "}
                <strong className="text-[#243746]">{selectedDate}</strong> at{" "}
                <strong className="text-[#294B68]">{selectedTimeSlot}</strong>.
              </p>
            </div>

            <button
              onClick={resetAndClose}
              className="w-full py-3.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-base rounded-xl cursor-pointer shadow-xs"
            >
              Done &amp; Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
