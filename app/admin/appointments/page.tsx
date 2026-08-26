"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  useGetAdminAppointmentsQuery,
  useUpdateAppointmentStatusMutation,
  useCancelAppointmentMutation,
} from "@/redux/features/appointment/appointmentApi";
import { CalendarCheck, Clock, UserCheck, Plus, Search, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { AdminScheduleModal } from "@/components/admin/admin-schedule-modal";
import {
  confirmCriticalAction,
  showSuccessAlert,
  showErrorAlert,
} from "@/lib/alerts/sweetalert";

import { TablePagination } from "@/components/ui/table-pagination";

export default function AppointmentsAdminPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: apptsRes, isLoading } = useGetAdminAppointmentsQuery({
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const [updateStatusMutation] = useUpdateAppointmentStatusMutation();
  const [cancelAppointmentMutation] = useCancelAppointmentMutation();

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);
  const [selectedClientName, setSelectedClientName] = useState<string | undefined>(undefined);

  const appointments = apptsRes?.data || [];

  const totalItems = appointments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedAppointments = appointments.slice(startIndex, endIndex);

  const handleMarkComplete = async (appt: any) => {
    const confirmed = await confirmCriticalAction({
      title: `Mark Visit Completed?`,
      text: `Mark ${appt.serviceType} visit for ${appt.clientName} as COMPLETED? This will update visit completion records.`,
      confirmButtonText: "Yes, Mark Completed",
      isDestructive: false,
    });

    if (!confirmed) return;

    try {
      await updateStatusMutation({
        id: appt.id,
        body: { status: "COMPLETED" },
      }).unwrap();
      showSuccessAlert("Visit Completed", "Appointment marked as completed successfully.");
    } catch (err: any) {
      showErrorAlert("Update Failed", err?.data?.message || "Failed to update visit status.");
    }
  };

  const handleCancelVisit = async (appt: any) => {
    const confirmed = await confirmCriticalAction({
      title: `Cancel Appointment?`,
      text: `Are you sure you want to cancel ${appt.serviceType} visit for ${appt.clientName}? This will restore their visit entitlement quota.`,
      confirmButtonText: "Yes, Cancel Visit",
      isDestructive: true,
    });

    if (!confirmed) return;

    try {
      await cancelAppointmentMutation({
        id: appt.id,
        reason: "Admin cancelled from appointment directory",
      }).unwrap();
      showSuccessAlert("Visit Cancelled", "Appointment has been cancelled and visit entitlement restored.");
    } catch (err: any) {
      showErrorAlert("Cancellation Failed", err?.data?.message || "Failed to cancel appointment.");
    }
  };

  return (
    <div className="space-y-6 text-[#243746]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9E4EC]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746] tracking-tight">
            Appointments &amp; Visit Management
          </h1>
          <p className="text-sm text-[#64748B] mt-1 font-medium">
            View, schedule, dispatch, and track all AgeWellRI client visits and caregiver assignments.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedClientId(undefined);
            setSelectedClientName(undefined);
            setScheduleModalOpen(true);
          }}
          className="px-4 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Book Visit for Client</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#D9E4EC] p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by client name, ID, specialist..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#294B68]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs font-semibold bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#294B68] w-full sm:w-auto"
          >
            <option value="">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 shadow-xs space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-[#64748B] flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#294B68]" />
            <p className="font-bold text-sm text-[#243746]">Loading scheduled visits...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center text-[#64748B] bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] space-y-2">
            <CalendarCheck className="w-8 h-8 mx-auto text-[#94A3B8]" />
            <p className="font-bold text-sm text-[#243746]">No Appointments Found</p>
            <p className="text-xs text-[#64748B]">No appointments matched your query or filter criteria.</p>
          </div>
        ) : (
          <>
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
                  {paginatedAppointments.map((appt) => {
                    const isCompleted = appt.status === "completed";
                    const isCancelled = appt.status === "cancelled";

                    return (
                      <tr key={appt.id} className="hover:bg-[#F7FAFC]">
                        <td className="py-4 px-4 font-semibold">
                          <span className="block font-bold text-[#243746]">{appt.date}</span>
                          <span className="text-xs text-[#64748B]">{appt.timeSlot}</span>
                        </td>
                        <td className="py-4 px-4 font-bold">
                          <Link href={`/admin/clients/${appt.clientId}`} className="hover:underline text-[#294B68]">
                            {appt.clientName}
                          </Link>
                          <span className="block text-xs font-normal text-[#64748B]">
                            {appt.clientNumber} • {appt.clientPhone || "No Phone"}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-semibold text-[#294B68]">{appt.serviceType}</td>
                        <td className="py-4 px-4 text-xs font-semibold text-[#243746]">
                          {appt.technicianName}
                        </td>
                        <td className="py-4 px-4 text-xs text-[#64748B]">{appt.bookedBy}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                              isCompleted
                                ? "bg-emerald-100 text-emerald-800"
                                : isCancelled
                                ? "bg-rose-100 text-rose-800"
                                : "bg-[#EAF3F8] text-[#294B68]"
                            }`}
                          >
                            {appt.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right space-x-2">
                          {!isCompleted && !isCancelled && (
                            <>
                              <button
                                onClick={() => handleMarkComplete(appt)}
                                title="Mark Completed"
                                className="text-xs font-bold text-[#3F8F6B] hover:text-[#166534] hover:underline cursor-pointer"
                              >
                                Complete
                              </button>
                              <span className="text-[#D9E4EC]">|</span>
                              <button
                                onClick={() => handleCancelVisit(appt)}
                                title="Cancel Visit"
                                className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {isCompleted && (
                            <span className="text-xs font-semibold text-[#3F8F6B] flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <TablePagination
              currentPage={validCurrentPage}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              itemLabel="appointments"
            />
          </>
        )}
      </div>

      <AdminScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        defaultClientId={selectedClientId}
        clientName={selectedClientName}
      />
    </div>
  );
}
