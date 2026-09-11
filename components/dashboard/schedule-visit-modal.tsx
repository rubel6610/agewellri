import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Loader2,
  UserCheck,
  AlertCircle,
  Key,
  Hash,
  Bell,
  HelpCircle,
  Plus,
  Star,
  Lock,
} from "lucide-react";
import { ServicePlan } from "@/lib/types/dashboard";
import { formatDuration } from "@/lib/utils";
import { useGetVisitEntitlementsQuery } from "@/redux/features/payment/paymentApi";
import { useScheduleAppointmentMutation } from "@/redux/features/appointment/appointmentApi";
import {
  useGetClientAccessMethodsQuery,
  ClientAccessMethod,
} from "@/redux/features/client/clientApi";
import { AccessMethodModal } from "./access-method-modal";
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
  const { data: accessMethodsRes, isLoading: isAccessMethodsLoading, refetch: refetchAccessMethods } = useGetClientAccessMethodsQuery(undefined, { skip: !isOpen });
  const [scheduleAppointmentMutation, { isLoading: isSubmitting }] = useScheduleAppointmentMutation();

  const entitlements = entitlementsRes?.data?.entitlements || [];
  const accessMethods = accessMethodsRes?.data || [];

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<string>("" );
  const [selectedServiceName, setSelectedServiceName] = useState<string>("Safety Oversight");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("10:00 AM – 12:00 PM");
  const [selectedAccessMethodId, setSelectedAccessMethodId] = useState<string>("");
  const [isNewAccessModalOpen, setIsNewAccessModalOpen] = useState(false);
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
    if (accessMethods.length > 0 && !selectedAccessMethodId) {
      const def = accessMethods.find((m) => m.isDefault) || accessMethods[0];
      if (def) setSelectedAccessMethodId(def.id);
    }
  }, [accessMethods, selectedAccessMethodId]);

  if (!isOpen) return null;

  const timeSlots = [
    "09:00 AM – 11:00 AM",
    "10:00 AM – 12:00 PM",
    "01:30 PM – 03:30 PM",
    "03:30 PM – 05:30 PM",
  ];

  const currentEntitlement = entitlements.find((e) => e.serviceTypeId === selectedServiceTypeId);
  const remainingCount = currentEntitlement ? currentEntitlement.remaining : (plan ? plan.remainingVisits : 0);
  const isCurrentServiceExhausted = remainingCount <= 0;
  const areAllServicesExhausted = entitlements.length > 0
    ? entitlements.every((e) => e.remaining <= 0)
    : (plan ? plan.remainingVisits <= 0 : false);

  const selectedAccessMethod = accessMethods.find((m) => m.id === selectedAccessMethodId);

  const handleConfirm = async () => {
    if (isCurrentServiceExhausted) {
      showErrorAlert(
        "No Remaining Visits",
        `You have 0 remaining visits available for ${selectedServiceName} in your current monthly plan.`
      );
      return;
    }

    const confirmed = await confirmCriticalAction({
      title: `Submit ${selectedServiceName} Visit Request?`,
      text: `Request safety visit for ${selectedDate} at ${selectedTimeSlot}? Access info: ${selectedAccessMethod ? selectedAccessMethod.title : "Standard access"}.`,
      confirmButtonText: "Yes, Submit Request",
      isDestructive: false,
    });

    if (!confirmed) return;

    try {
      await scheduleAppointmentMutation({
        serviceTypeId: selectedServiceTypeId,
        serviceType: selectedServiceName,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        notes: notes.trim() || undefined,
        accessMethodId: selectedAccessMethod?.id,
        accessMethodType: selectedAccessMethod?.type,
        accessMethodTitle: selectedAccessMethod?.title,
        accessMethodCode: selectedAccessMethod?.code || undefined,
        accessMethodInstructions: selectedAccessMethod?.instructions || undefined,
      }).unwrap();

      setStep(5);
      await showSuccessAlert(
        "Visit Request Submitted",
        `Your ${selectedServiceName} visit request has been received for ${selectedDate} (${selectedTimeSlot}). AgeWellRI administration will assign your specialist.`
      );
    } catch (err: any) {
      const errMsg = err?.data?.message || err?.message || "Unable to submit visit request. Please try again.";
      showErrorAlert("Submission Failed", errMsg);
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
              {step === 5 ? "Request Submitted" : `Request a Visit — Step ${step} of 4`}
            </h3>
            <p className="text-xs text-[#64748B] font-medium">AgeWellRI Safety Visit Scheduling</p>
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
              <h4 className="font-bold text-[#243746] text-base">Select Safety Service</h4>
              <span className="text-xs font-semibold text-[#64748B]">Active Plan Quota</span>
            </div>

            {/* Quota Exhaustion Warning Banners */}
            {areAllServicesExhausted ? (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-rose-950">Monthly Visit Quota Fully Utilized</strong>
                  <span>You have used all included visits for your current month. Your visit quota will automatically renew on your next billing cycle.</span>
                </div>
              </div>
            ) : isCurrentServiceExhausted ? (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-amber-950">0 Remaining Visits for {selectedServiceName}</strong>
                  <span>You have 0 remaining visits available for {selectedServiceName}. Please select another service with available quota to continue.</span>
                </div>
              </div>
            ) : null}

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
                          ? isExhausted
                            ? "border-rose-400 bg-rose-50/50"
                            : "border-[#294B68] bg-[#EAF3F8]/60"
                          : isExhausted
                          ? "border-[#D9E4EC] bg-slate-50/60 opacity-60 hover:opacity-100"
                          : "border-[#D9E4EC] hover:border-[#5E8FB2] bg-white"
                      }`}
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
                              ? "bg-rose-100 border-rose-300 text-rose-800"
                              : "bg-white border-[#D9E4EC] text-[#294B68]"
                          }`}
                        >
                          {srv.remaining > 0 ? `${srv.remaining} remaining` : "0 remaining"}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-1.5 font-medium">
                        {formatDuration(srv.durationMinutes)} session • {srv.allocated} total included in monthly cycle
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
                    rem: plan ? plan.safetyVisitsTotal - plan.safetyVisitsCompleted : 0,
                  },
                  {
                    name: "Cleaning Visit",
                    desc: "Dedicated deep cleaning of living areas, bathrooms, and walkways.",
                    rem: plan ? plan.cleaningVisitsTotal - plan.cleaningVisitsCompleted : 0,
                  },
                ].map((s) => {
                  const isExhausted = s.rem <= 0;
                  return (
                    <div
                      key={s.name}
                      onClick={() => setSelectedServiceName(s.name)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        selectedServiceName === s.name
                          ? isExhausted
                            ? "border-rose-400 bg-rose-50/50"
                            : "border-[#294B68] bg-[#EAF3F8]/60"
                          : isExhausted
                          ? "border-[#D9E4EC] bg-slate-50/60 opacity-60"
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
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                            isExhausted
                              ? "bg-rose-100 border-rose-300 text-rose-800"
                              : "bg-white border-[#D9E4EC] text-[#294B68]"
                          }`}
                        >
                          {s.rem > 0 ? `${s.rem} available` : "0 remaining"}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-1.5">{s.desc}</p>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              disabled={isCurrentServiceExhausted || areAllServicesExhausted}
              onClick={() => {
                if (isCurrentServiceExhausted || areAllServicesExhausted) {
                  showErrorAlert(
                    "No Remaining Visits",
                    `You have 0 remaining visits available for ${selectedServiceName}. Please select a service with available quota to schedule.`
                  );
                  return;
                }
                setStep(2);
              }}
              className={`w-full mt-4 py-3.5 font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 ${
                isCurrentServiceExhausted || areAllServicesExhausted
                  ? "bg-slate-100 text-[#94A3B8] border border-slate-200 cursor-not-allowed"
                  : "bg-[#294B68] hover:bg-[#1E374D] text-white cursor-pointer"
              }`}
            >
              {areAllServicesExhausted ? (
                <span>All Monthly Visits Utilized (0 Remaining)</span>
              ) : isCurrentServiceExhausted ? (
                <span>0 Remaining Visits for {selectedServiceName} — Cannot Schedule</span>
              ) : (
                <span>Continue to Select Date →</span>
              )}
            </button>
          </div>
        )}

        {/* Step 2: Select Date */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <h4 className="font-bold text-[#243746] text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#294B68]" /> Choose Preferred Date
            </h4>
            <p className="text-xs text-[#64748B]">
              Select your preferred day for the visit. An administrator will assign an available specialist for this date.
            </p>

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
              <Clock className="w-5 h-5 text-[#5E8FB2]" /> Select Preferred Arrival Window
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
                Review Request →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Confirm */}
        {step === 4 && (
          <div className="space-y-4 py-2">
            <h4 className="font-bold text-[#243746] text-base">Review &amp; Access Details</h4>

            {/* Visit Summary Card */}
            <div className="p-4 bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between border-b border-[#D9E4EC]/60 pb-2">
                <span className="text-[#64748B]">Service:</span>
                <span className="font-bold text-[#243746]">{selectedServiceName}</span>
              </div>
              <div className="flex justify-between border-b border-[#D9E4EC]/60 pb-2">
                <span className="text-[#64748B]">Requested Date:</span>
                <span className="font-bold text-[#243746]">{selectedDate}</span>
              </div>
              <div className="flex justify-between border-b border-[#D9E4EC]/60 pb-2">
                <span className="text-[#64748B]">Arrival Window:</span>
                <span className="font-bold text-[#294B68]">{selectedTimeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Specialist Assignment:</span>
                <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs">
                  Assigned upon admin confirmation
                </span>
              </div>
            </div>

            {/* Home Access Method Selector for Specialist */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#243746] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#294B68]" />
                  <span>Choose Home Access Method</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsNewAccessModalOpen(true)}
                  className="text-xs font-bold text-[#294B68] hover:text-[#1E374D] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Method</span>
                </button>
              </div>

              {isAccessMethodsLoading ? (
                <div className="p-4 bg-[#F8FAFC] rounded-xl text-center text-xs text-[#64748B] flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#294B68]" />
                  <span>Loading your access methods...</span>
                </div>
              ) : accessMethods.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {accessMethods.map((m) => {
                    const isSelected = selectedAccessMethodId === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => setSelectedAccessMethodId(m.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                          isSelected
                            ? "border-[#294B68] bg-[#EAF3F8]/80 shadow-xs"
                            : "border-[#D9E4EC] bg-white hover:border-[#5E8FB2] hover:bg-[#F8FAFC]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="accessMethodSelect"
                          checked={isSelected}
                          onChange={() => setSelectedAccessMethodId(m.id)}
                          className="mt-1 text-[#294B68] focus:ring-[#294B68] cursor-pointer accent-[#294B68]"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-[#243746]">
                              {m.title}
                            </span>
                            {m.isDefault && (
                              <span className="text-[10px] font-black uppercase tracking-wider bg-[#294B68] text-white px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-white" />
                                Default
                              </span>
                            )}
                            {m.code && (
                              <span className="text-[11px] font-mono font-bold text-[#294B68] bg-white px-1.5 py-0.2 rounded border border-[#D9E4EC]">
                                Code: {m.code}
                              </span>
                            )}
                          </div>
                          {m.instructions && (
                            <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                              {m.instructions}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2">
                  <span>No saved access methods. Specialist will ring front door.</span>
                  <button
                    type="button"
                    onClick={() => setIsNewAccessModalOpen(true)}
                    className="px-2.5 py-1 bg-[#294B68] text-white font-bold rounded-lg shrink-0 cursor-pointer"
                  >
                    + Add Lockbox / Code
                  </button>
                </div>
              )}
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-xs font-bold text-[#243746] mb-1">
                Additional Specialist Instructions (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please ring doorbell twice, friendly dog is inside..."
                rows={2}
                className="w-full p-3 text-xs sm:text-sm border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#294B68]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(3)}
                className="w-1/3 py-3 border border-[#D9E4EC] text-[#243746] font-semibold rounded-xl cursor-pointer hover:bg-[#F8FAFC] text-sm"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="w-2/3 py-3 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-70 text-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Visit Request</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Confirmation Success */}
        {step === 5 && (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-2xl font-extrabold text-[#243746]">
                Visit Request Submitted!
              </h4>
              <p className="text-sm text-[#64748B] mt-2 max-w-sm mx-auto font-medium leading-relaxed">
                Your request for a <strong>{selectedServiceName}</strong> visit on{" "}
                <strong className="text-[#243746]">{selectedDate}</strong> ({selectedTimeSlot}) has been received.
                {selectedAccessMethod && (
                  <span className="block mt-1 text-xs text-[#294B68] font-bold">
                    Specialist Entry: {selectedAccessMethod.title}
                  </span>
                )}
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

      {/* Access Method Modal (for on-the-fly adding) */}
      <AccessMethodModal
        isOpen={isNewAccessModalOpen}
        onClose={() => setIsNewAccessModalOpen(false)}
        onSuccess={async () => {
          const res = await refetchAccessMethods();
          if (res?.data?.data && res.data.data.length > 0) {
            const newlyAdded = res.data.data[res.data.data.length - 1];
            setSelectedAccessMethodId(newlyAdded.id);
          }
        }}
      />
    </div>
  );
}
