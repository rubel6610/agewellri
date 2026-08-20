"use client";

import React, { useEffect, useState } from "react";
import { getReports } from "@/lib/api/dashboard";
import { Report } from "@/lib/types/dashboard";
import { ReportCard } from "@/components/dashboard/report-card";
import { FileCheck2 } from "lucide-react";

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReports().then((data) => {
      setReports(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC]">
        Loading reports...
      </div>
    );
  }

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
          <div className="w-12 h-12 bg-[#EAF3F8] text-[#294B68] rounded-2xl flex items-center justify-center mx-auto">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#243746]">No reports available yet</h3>
          <p className="text-sm text-[#64748B] max-w-sm mx-auto">
            Your home safety reports will appear here after your completed visits.
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
