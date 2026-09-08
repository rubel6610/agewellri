import React from "react";
import Link from "next/link";
import { Calendar, Clock, UserCheck, ShieldCheck, CheckCircle2, ArrowRight, AlertCircle } from "lucide-react";
import { Appointment } from "@/lib/types/dashboard";

interface VisitCardProps {
  appointment: Appointment | any;
}

export function VisitCard({ appointment }: VisitCardProps) {
  const statusLower = (appointment.status || "").toLowerCase();
  const isRequested = statusLower === "requested" || (!appointment.technicianId && statusLower !== "cancelled");
  const isCompleted = statusLower === "completed";
  const isCancelled = statusLower === "cancelled";

  const formattedDate = new Date(appointment.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-xs hover:border-[#5E8FB2] transition-all flex flex-col justify-between space-y-4 ${
        isRequested ? "border-amber-200 bg-amber-50/20" : "border-[#D9E4EC]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
              isRequested
                ? "bg-amber-100 text-amber-800 border border-amber-300"
                : isCompleted
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                : isCancelled
                ? "bg-rose-100 text-rose-800 border border-rose-200"
                : "bg-[#EAF3F8] text-[#294B68] border border-[#5E8FB2]/20"
            }`}
          >
            {isRequested ? (
              <Clock className="w-3.5 h-3.5 text-amber-700" />
            ) : isCompleted ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            ) : isCancelled ? (
              <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
            ) : (
              <Calendar className="w-3.5 h-3.5 text-[#294B68]" />
            )}
            {isRequested
              ? "Visit Requested"
              : isCompleted
              ? "Completed"
              : isCancelled
              ? "Cancelled"
              : "Scheduled"}
          </span>

          <h4 className="text-lg font-bold text-[#243746] mt-2">
            {appointment.serviceType}
          </h4>
        </div>

        {isRequested ? (
          <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2 py-1 rounded-md border border-amber-200">
            Pending Admin Review
          </span>
        ) : appointment.bookedBy === "AgeWellRI Team" ? (
          <span className="text-[11px] font-semibold text-[#64748B] bg-[#F7FAFC] px-2 py-1 rounded-md border border-[#D9E4EC]">
            Booked by AgeWellRI
          </span>
        ) : null}
      </div>

      <div className="space-y-2 text-sm text-[#64748B] bg-[#F7FAFC] p-3.5 rounded-xl border border-[#D9E4EC]">
        <div className="flex items-center gap-2 font-medium text-[#243746]">
          <Calendar className="w-4 h-4 text-[#5E8FB2]" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#5E8FB2]" />
          <span>{appointment.timeSlot}</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-[#D9E4EC]/60 text-xs">
          <UserCheck className="w-3.5 h-3.5 text-[#294B68]" />
          <span>
            Specialist:{" "}
            <strong className={isRequested ? "text-amber-700 font-semibold italic" : "text-[#243746]"}>
              {isRequested ? "Pending Specialist Assignment" : appointment.technicianName}
            </strong>
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        {appointment.reportId ? (
          <Link
            href="/dashboard/reports"
            className="text-xs font-bold text-[#3F8F6B] hover:underline flex items-center gap-1"
          >
            <ShieldCheck className="w-4 h-4" />
            Report Available
          </Link>
        ) : (
          <span className="text-xs text-[#64748B]">
            {isRequested
              ? "Under Review by Admin"
              : isCompleted
              ? "Report Processing"
              : "Upcoming Visit"}
          </span>
        )}

        <Link
          href={`/dashboard/appointments/${appointment.id}`}
          className="text-xs font-bold text-[#5E8FB2] hover:text-[#294B68] flex items-center gap-1 hover:underline"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
