"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminAppointments } from "@/lib/api/admin-api";
import { AdminAppointment } from "@/lib/types/admin";
import { CalendarCheck, Clock, UserCheck, Plus, Search } from "lucide-react";
import { AdminScheduleModal } from "@/components/admin/admin-schedule-modal";
import {
  confirmCriticalAction,
  showSuccessAlert,
  showToast,
} from "@/lib/alerts/sweetalert";

export default function AppointmentsAdminPage() {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);

  useEffect(() => {
    getAdminAppointments().then((data) => {
      setAppointments(data);
      setLoading(false);
    });
  }, []);

  const handleModifyAppointment = async (appt: AdminAppointment) => {
    const confirmed = await confirmCriticalAction({
      title: `Modify Appointment for ${appt.clientName}?`,
      text: `Update the scheduled ${appt.serviceType} visit on ${appt.date} (${appt.timeSlot}) assigned to ${appt.technicianName}?`,
      confirmButtonText: "Open Reschedule Form",
      isDestructive: false,
    });

    if (!confirmed) return;

    setSelectedClientId(appt.clientId);
    setScheduleModalOpen(true);
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC]">
        Loading appointments...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9E4EC]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
            Appointments Management
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            View, schedule, and manage all AgeWellRI client appointments.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedClientId(undefined);
            setScheduleModalOpen(true);
          }}
          className="px-4 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Book Visit for Client</span>
        </button>
      </div>

      {/* Appointment Cards Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#D9E4EC] text-xs font-bold text-[#64748B] uppercase tracking-wider">
                <th className="py-3.5 px-4">Date &amp; Time</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Service Type</th>
                <th className="py-3.5 px-4">Assigned Specialist</th>
                <th className="py-3.5 px-4">Booked By</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E4EC]/60 text-sm font-medium text-[#243746]">
              {appointments.map((appt) => (
                <tr key={appt.id} className="hover:bg-[#F7FAFC]">
                  <td className="py-4 px-4 font-semibold">
                    <span className="block font-bold text-[#243746]">{appt.date}</span>
                    <span className="text-xs text-[#64748B]">{appt.timeSlot}</span>
                  </td>
                  <td className="py-4 px-4 font-bold">
                    <Link href={`/admin/clients/${appt.clientId}`} className="hover:underline">
                      {appt.clientName}
                    </Link>
                    <span className="block text-xs font-normal text-[#64748B]">{appt.clientPhone}</span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-[#294B68]">{appt.serviceType}</td>
                  <td className="py-4 px-4 text-xs font-semibold text-[#243746]">{appt.technicianName}</td>
                  <td className="py-4 px-4 text-xs text-[#64748B]">{appt.bookedBy}</td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAF3F8] text-[#3F8F6B] capitalize">
                      {appt.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleModifyAppointment(appt)}
                      className="text-xs font-bold text-[#5E8FB2] hover:text-[#294B68] hover:underline cursor-pointer"
                    >
                      Modify
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AdminScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        defaultClientId={selectedClientId}
      />
    </div>
  );
}
