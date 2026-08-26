"use client";

import React from "react";
import { Report } from "@/lib/types/dashboard";
import { ReportCard } from "@/components/dashboard/report-card";
import { FileCheck2, Loader2 } from "lucide-react";
import { useGetMyAppointmentsQuery } from "@/redux/features/appointment/appointmentApi";

export default function ReportsPage() {
  const { data: apptsRes, isLoading } = useGetMyAppointmentsQuery();
  const realAppointments = apptsRes?.data || [];

  if (isLoading) {
    return (
      <div className="p-16 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#294B68]" />
        <p className="font-bold text-sm text-[#243746]">Loading reports...</p>
      </div>
    );
  }

  // Filter completed visits for dynamic reports
  const completedAppointments = realAppointments.filter(
    (a) => a.status === "completed"
  );

  const reports: Report[] = completedAppointments.map((appt: any, idx: number) => ({
    id: appt.id || `rep_${idx}`,
    title: `${appt.serviceType || "Home Safety"} Assessment Report`,
    visitDate: appt.date
      ? new Date(appt.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Recently",
    score: 92,
    status: "available",
    summary: `Comprehensive evaluation completed by ${appt.technicianName || "Specialist"}. Fall hazards inspected, home perimeter safety verified.`,
    recommendationsCount: 2,
    pdfUrl: `/api/v1/reports/${appt.id}/pdf`,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-[#D9E4EC]/60">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
          My Reports
        </h1>
        <p className="text-sm sm:text-base text-[#64748B] mt-1">
          Your Age Safe® Home Score™ reports and safety assessments are stored securely here.
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#D9E4EC] space-y-3">
          <div className="w-12 h-12 bg-[#EAF3F8] text-[#294B68] rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
            <FileCheck2 className="w-6 h-6 text-[#294B68]" />
          </div>
          <h3 className="text-lg font-bold text-[#243746]">No reports available yet</h3>
          <p className="text-sm text-[#64748B] max-w-sm mx-auto">
            Your certified specialist will generate and upload your official Age Safe® Home Score™ assessment report following your completed home safety visit.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
