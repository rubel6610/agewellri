"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  Clock,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  FileText,
  ArrowLeft,
  Phone,
} from "lucide-react";
import { getAppointmentById } from "@/lib/api/dashboard";
import { Appointment } from "@/lib/types/dashboard";
import {
  confirmCriticalAction,
  showSuccessAlert,
  showToast,
} from "@/lib/alerts/sweetalert";

export default function AppointmentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [appt, setAppt] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAppointmentById(resolvedParams.id).then((res) => {
      setAppt(res || null);
      setLoading(false);
    });
  }, [resolvedParams.id]);

  const handleRescheduleRequest = async () => {
    const confirmed = await confirmCriticalAction({
      title: "Request Reschedule?",
      text: "Submit a request to change your scheduled visit date or time window? An AgeWellRI safety specialist will reach out within 2 business hours.",
      confirmButtonText: "Yes, Request Reschedule",
      isDestructive: false,
    });

    if (!confirmed) return;

    await showSuccessAlert(
      "Reschedule Request Received",
      "Our dispatch team has received your request. A safety coordinator will contact you to confirm a new time slot."
    );
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC]">
        Loading visit details...
      </div>
    );
  }

  if (!appt) {
    return notFound();
  }

  const isCompleted = appt.status === "completed";

  const formattedDate = new Date(appt.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard/appointments"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#5E8FB2] hover:text-[#294B68] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Visits</span>
        </Link>
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 sm:p-10 shadow-xs space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D9E4EC]">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  isCompleted
                    ? "bg-[#EAF3F8] text-[#3F8F6B] border border-[#3F8F6B]/30"
                    : "bg-[#EAF3F8] text-[#294B68] border border-[#5E8FB2]/30"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-[#3F8F6B]" />
                ) : (
                  <Calendar className="w-4 h-4 text-[#294B68]" />
                )}
                {isCompleted ? "Visit Completed" : "Scheduled Visit"}
              </span>

              {appt.bookedBy === "AgeWellRI Team" && (
                <span className="text-xs font-semibold text-[#64748B] bg-[#F7FAFC] px-2.5 py-1 rounded-full border border-[#D9E4EC]">
                  Booked by AgeWellRI
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746] mt-3">
              {appt.serviceType}
            </h1>
          </div>

          {!isCompleted && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRescheduleRequest}
                className="px-4 py-2 bg-[#EAF3F8] hover:bg-[#D9E4EC] text-[#294B68] font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Request Reschedule
              </button>
            </div>
          )}
        </div>

        {/* Date & Time Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-[#F7FAFC] rounded-2xl border border-[#D9E4EC]">
          <div className="space-y-1">
            <span className="text-xs text-[#64748B] font-semibold block">Scheduled Date</span>
            <div className="flex items-center gap-2 font-bold text-[#243746]">
              <Calendar className="w-4 h-4 text-[#294B68]" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-[#64748B] font-semibold block">Time Window</span>
            <div className="flex items-center gap-2 font-bold text-[#243746]">
              <Clock className="w-4 h-4 text-[#5E8FB2]" />
              <span>{appt.timeSlot}</span>
            </div>
          </div>
        </div>

        {/* Technician Info */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-[#243746]">Assigned Specialist</h3>
          <div className="p-4 bg-white rounded-2xl border border-[#D9E4EC] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#EAF3F8] text-[#294B68] rounded-xl">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#243746] text-base">{appt.technicianName}</h4>
                <p className="text-xs text-[#64748B]">{appt.technicianTitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-semibold text-[#5E8FB2]">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Specialist</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {appt.notes && (
          <div className="space-y-2">
            <h3 className="text-base font-bold text-[#243746]">Visit Notes</h3>
            <p className="text-sm text-[#64748B] bg-[#F7FAFC] p-4 rounded-2xl border border-[#D9E4EC]">
              {appt.notes}
            </p>
          </div>
        )}

        {/* Report Section */}
        {isCompleted && appt.reportId && (
          <div className="p-5 bg-[#EAF3F8]/60 rounded-2xl border border-[#5E8FB2]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-[#294B68]" />
              <div>
                <h4 className="font-bold text-[#243746] text-sm sm:text-base">
                  Home Safety Report Available
                </h4>
                <p className="text-xs text-[#64748B]">
                  View the completed assessment score and caregiver observations.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/reports"
              className="px-4 py-2 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs rounded-xl transition-colors shrink-0"
            >
              View Report →
            </Link>
          </div>
        )}

        {/* Help footer */}
        <div className="pt-4 border-t border-[#D9E4EC] flex items-center justify-between text-xs text-[#64748B]">
          <span>Need to modify this visit?</span>
          <a
            href="tel:4015550199"
            className="font-bold text-[#294B68] flex items-center gap-1 hover:underline"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Member Services: (401) 555-AGEWELL</span>
          </a>
        </div>
      </div>
    </div>
  );
}
