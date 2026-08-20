"use client";

import React, { useEffect, useState } from "react";
import { getAdminAppointments } from "@/lib/api/admin-api";
import { AdminAppointment } from "@/lib/types/admin";
import { AdminCalendarView } from "@/components/admin/admin-calendar-view";
import { AdminScheduleModal } from "@/components/admin/admin-schedule-modal";

export default function CalendarAdminPage() {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  useEffect(() => {
    getAdminAppointments().then((data) => {
      setAppointments(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC]">
        Loading operational calendar...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#D9E4EC]/60">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
          Operational Dispatch Calendar
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          Master calendar view of all client visits, specialist assignments, and field schedules.
        </p>
      </div>

      <AdminCalendarView
        appointments={appointments}
        onOpenScheduleModal={() => setScheduleModalOpen(true)}
      />

      <AdminScheduleModal isOpen={scheduleModalOpen} onClose={() => setScheduleModalOpen(false)} />
    </div>
  );
}
