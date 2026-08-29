"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  useGetAdminAppointmentsQuery,
  useUpdateAppointmentStatusMutation,
  useCancelAppointmentMutation,
  useDeclineVisitRequestMutation,
} from "@/redux/features/appointment/appointmentApi";
import {
  CalendarCheck,
  Plus,
  Search,
  CheckCircle2,
  FileUp,
  Download,
  Eye,
  FileText,
  Clock,
  RefreshCw,
  UserCheck,
  AlertCircle,
  XCircle,
  Calendar,
} from "lucide-react";
import { AdminScheduleModal } from "@/components/admin/admin-schedule-modal";
import { ReportUploadModal } from "@/components/admin/report-upload-modal";
import { AcceptVisitRequestModal } from "@/components/admin/accept-visit-request-modal";
import { downloadReportPdf } from "@/lib/api/report-download";
import {
  confirmCriticalAction,
  showSuccessAlert,
  showErrorAlert,
} from "@/lib/alerts/sweetalert";
import { TablePagination } from "@/components/ui/table-pagination";

export default function AppointmentsAdminPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"REQUESTS" | "SCHEDULED" | "COMPLETED" | "CANCELLED" | "ALL">("REQUESTS");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: apptsRes, isLoading, refetch } = useGetAdminAppointmentsQuery({
    search: search || undefined,
  });

  const [updateStatusMutation] = useUpdateAppointmentStatusMutation();
  const [cancelAppointmentMutation] = useCancelAppointmentMutation();
  const [declineVisitRequestMutation] = useDeclineVisitRequestMutation();

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);
  const [selectedClientName, setSelectedClientName] = useState<string | undefined>(undefined);

  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [selectedApptForAccept, setSelectedApptForAccept] = useState<any>(null);

  const [reportUploadModalOpen, setReportUploadModalOpen] = useState(false);
  const [selectedApptForReport, setSelectedApptForReport] = useState<any>(null);

  const allAppointments = apptsRes?.data || [];

  // Filter based on active tab and search
  const requestedCount = allAppointments.filter((a) => a.status === "requested" || (!a.technicianId && a.status !== "cancelled")).length;
  const scheduledCount = allAppointments.filter((a) => ["scheduled", "confirmed", "rescheduled"].includes(a.status) && Boolean(a.technicianId)).length;
  const completedCount = allAppointments.filter((a) => a.status === "completed").length;
  const cancelledCount = allAppointments.filter((a) => (a.status || "").toLowerCase() === "cancelled").length;

  const filteredAppointments = allAppointments.filter((appt) => {
    const statusLower = (appt.status || "").toLowerCase();
    const isReq = statusLower === "requested" || (!appt.technicianId && statusLower !== "cancelled");

    if (activeTab === "REQUESTS") {
      return isReq;
    }
    if (activeTab === "SCHEDULED") {
      return ["scheduled", "confirmed", "rescheduled"].includes(statusLower) && Boolean(appt.technicianId);
    }
    if (activeTab === "COMPLETED") {
      return statusLower === "completed";
    }
    if (activeTab === "CANCELLED") {
      return statusLower === "cancelled";
    }
    return true; // "ALL"
  });

  const totalItems = filteredAppointments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedAppointments = filteredAppointments.slice(startIndex, endIndex);

  const handleDeclineRequest = async (appt: any) => {
    const confirmed = await confirmCriticalAction({
      title: `Decline Visit Request?`,
      text: `Decline ${appt.serviceType} visit request from ${appt.clientName} for ${appt.date}? This will notify the client and restore their visit entitlement quota.`,
      confirmButtonText: "Yes, Decline Request",
      isDestructive: true,
    });

    if (!confirmed) return;

    try {
      await declineVisitRequestMutation({
        id: appt.id,
        body: { reason: "Declined by admin due to specialist scheduling capacity" },
      }).unwrap();
      refetch();
      showSuccessAlert("Request Declined", "Visit request has been declined and the client's quota has been restored.");
    } catch (err: any) {
      showErrorAlert("Decline Failed", err?.data?.message || "Failed to decline visit request.");
    }
  };

  const handleMarkComplete = async (appt: any) => {
    const confirmed = await confirmCriticalAction({
      title: `Mark Visit Completed?`,
      text: `Mark ${appt.serviceType} visit for ${appt.clientName} as COMPLETED? This will record visit completion.`,
      confirmButtonText: "Yes, Mark Completed",
      isDestructive: false,
    });

    if (!confirmed) return;

    try {
      await updateStatusMutation({
        id: appt.id,
        body: { status: "COMPLETED" },
      }).unwrap();
      refetch();

      const proceedWithReport = await confirmCriticalAction({
        title: "Visit Marked Completed",
        text: `Would you like to upload the technician's PDF visit report for ${appt.clientName} now?`,
        confirmButtonText: "Yes, Upload PDF",
        cancelButtonText: "Later",
        isDestructive: false,
      });

      if (proceedWithReport) {
        setSelectedApptForReport(appt);
        setReportUploadModalOpen(true);
      } else {
        showSuccessAlert("Visit Completed", "Appointment marked as completed successfully.");
      }
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
      refetch();
      showSuccessAlert("Visit Cancelled", "Appointment has been cancelled and visit entitlement restored.");
    } catch (err: any) {
      showErrorAlert("Cancellation Failed", err?.data?.message || "Failed to cancel appointment.");
    }
  };

  const handleDownloadPdf = (reportId: string, clientName?: string, serviceType?: string) => {
    downloadReportPdf(reportId, `${clientName || "Client"}_${serviceType || "Visit"}_Report.pdf`);
  };

  return (
    <div className="space-y-6 text-[#243746]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9E4EC]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746] tracking-tight">
            Appointments &amp; Visit Requests
          </h1>
          <p className="text-sm text-[#64748B] mt-1 font-medium">
            Review client visit requests, assign certified specialists, dispatch scheduled visits, and upload completed reports.
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

      {/* Tabs & Search Filter Bar */}
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => {
              setActiveTab("REQUESTS");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === "REQUESTS"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-white text-[#243746] hover:bg-amber-50 border border-[#D9E4EC]"
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Visit Requests</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === "REQUESTS"
                  ? "bg-white/20 text-white"
                  : requestedCount > 0
                  ? "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                  : "bg-[#F0F5F9] text-[#64748B]"
              }`}
            >
              {requestedCount}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("SCHEDULED");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === "SCHEDULED"
                ? "bg-[#294B68] text-white shadow-xs"
                : "bg-white text-[#243746] hover:bg-[#EAF3F8] border border-[#D9E4EC]"
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Scheduled &amp; Confirmed ({scheduledCount})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("COMPLETED");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === "COMPLETED"
                ? "bg-[#294B68] text-white shadow-xs"
                : "bg-white text-[#243746] hover:bg-[#EAF3F8] border border-[#D9E4EC]"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed Visits ({completedCount})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("CANCELLED");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === "CANCELLED"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-white text-[#243746] hover:bg-rose-50 border border-[#D9E4EC]"
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled Visits ({cancelledCount})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("ALL");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === "ALL"
                ? "bg-[#294B68] text-white shadow-xs"
                : "bg-white text-[#243746] hover:bg-[#EAF3F8] border border-[#D9E4EC]"
            }`}
          >
            <span>All Appointments ({allAppointments.length})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl border border-[#D9E4EC] p-3.5 flex items-center justify-between shadow-2xs">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by client name, client number, or service..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#294B68]"
            />
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#D9E4EC] text-xs font-bold text-[#64748B] uppercase tracking-wider">
                <th className="py-3.5 px-4">Date &amp; Time</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Service Type</th>
                <th className="py-3.5 px-4">Assigned Specialist</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Report Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E4EC]/60 text-sm font-medium text-[#243746]">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4 space-y-2">
                      <div className="h-4 bg-[#E2E8F0] rounded-md w-28"></div>
                      <div className="h-3 bg-[#F1F5F9] rounded-md w-20"></div>
                    </td>
                    <td className="py-4 px-4 space-y-2">
                      <div className="h-4 bg-[#E2E8F0] rounded-md w-32"></div>
                      <div className="h-3 bg-[#F1F5F9] rounded-md w-40"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 bg-[#E2E8F0] rounded-md w-28"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-[#E2E8F0] rounded-md w-24"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 bg-[#E2E8F0] rounded-full w-20"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 bg-[#E2E8F0] rounded-full w-24"></div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-8 bg-[#E2E8F0] rounded-xl w-24 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#64748B]">
                    <div className="space-y-2">
                      <CalendarCheck className="w-8 h-8 mx-auto text-[#94A3B8]" />
                      <p className="font-bold text-sm text-[#243746]">
                        {activeTab === "REQUESTS"
                          ? "No Pending Visit Requests"
                          : activeTab === "CANCELLED"
                          ? "No Cancelled Appointments"
                          : "No Appointments Found"}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        {activeTab === "REQUESTS"
                          ? "All client visit requests have been assigned and dispatched."
                          : activeTab === "CANCELLED"
                          ? "There are no cancelled appointments on record."
                          : "No appointments matched your selected filter criteria."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedAppointments.map((appt) => {
                  const isRequested = appt.status === "requested" || (!appt.technicianId && appt.status !== "cancelled");
                  const isCompleted = appt.status === "completed";
                  const isCancelled = appt.status === "cancelled";
                  const hasReport = Boolean(appt.hasReport || appt.reportStatus === "uploaded");

                  return (
                    <tr
                      key={appt.id}
                      className={`hover:bg-[#F7FAFC] transition-colors ${
                        isRequested ? "bg-amber-50/40" : isCancelled ? "bg-rose-50/20 opacity-90" : ""
                      }`}
                    >
                      {/* Date & Time */}
                      <td className="py-4 px-4 font-semibold">
                        <span className="block font-bold text-[#243746]">{appt.date}</span>
                        <span className="text-xs text-[#64748B]">{appt.timeSlot}</span>
                      </td>

                      {/* Client */}
                      <td className="py-4 px-4 font-bold">
                        <Link
                          href={`/admin/clients/${appt.clientId}`}
                          className="hover:underline text-[#294B68] block"
                        >
                          {appt.clientName}
                        </Link>
                        <span className="block text-xs font-normal text-[#64748B]">
                          {appt.clientNumber} • {appt.clientPhone || "No Phone"}
                        </span>
                      </td>

                      {/* Service Type */}
                      <td className="py-4 px-4 font-semibold text-[#294B68]">
                        <span>{appt.serviceType}</span>
                        {appt.notes && (
                          <span
                            className="block text-[11px] font-normal text-[#64748B] line-clamp-1 italic max-w-xs"
                            title={appt.notes}
                          >
                            &quot;{appt.notes}&quot;
                          </span>
                        )}
                      </td>

                      {/* Specialist */}
                      <td className="py-4 px-4">
                        {isRequested ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                              Unassigned
                            </span>
                            <span className="block text-[10px] font-semibold text-amber-600">
                              Needs Specialist Assignment
                            </span>
                          </div>
                        ) : isCancelled ? (
                          <span className="text-xs text-rose-700 font-semibold italic">
                            Cancelled
                          </span>
                        ) : (
                          <div>
                            <span className="text-xs font-bold text-[#243746] block">
                              {appt.technicianName}
                            </span>
                            <span className="text-[11px] text-[#64748B] block">
                              {appt.technicianTitle}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {isRequested ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-700" />
                            Visit Requested
                          </span>
                        ) : isCompleted ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            Completed
                          </span>
                        ) : isCancelled ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            Cancelled
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAF3F8] text-[#294B68]">
                            Scheduled
                          </span>
                        )}
                      </td>

                      {/* Report Status */}
                      <td className="py-4 px-4">
                        {isCompleted ? (
                          hasReport ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Report Uploaded</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Not Uploaded</span>
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-[#94A3B8]">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        {isRequested ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedApptForAccept(appt);
                                setAcceptModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-xs cursor-pointer"
                              title="Accept visit request and assign specialist"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Accept &amp; Assign</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeclineRequest(appt)}
                              className="px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                              title="Decline visit request"
                            >
                              Decline
                            </button>
                          </div>
                        ) : !isCompleted && !isCancelled ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedApptForAccept(appt);
                                setAcceptModalOpen(true);
                              }}
                              title="Reassign specialist or adjust schedule"
                              className="text-xs font-bold text-[#294B68] hover:underline cursor-pointer"
                            >
                              Reassign
                            </button>
                            <span className="text-[#D9E4EC]">|</span>
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
                          </div>
                        ) : isCompleted ? (
                          <div className="flex items-center justify-end gap-2">
                            {!hasReport ? (
                              <button
                                onClick={() => {
                                  setSelectedApptForReport(appt);
                                  setReportUploadModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#294B68] hover:bg-[#1E374D] text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
                                title="Upload technician PDF report"
                              >
                                <FileUp className="w-3.5 h-3.5" />
                                <span>Upload Report</span>
                              </button>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5">
                                {appt.reportId && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDownloadPdf(
                                        appt.reportId!,
                                        appt.clientName,
                                        appt.serviceType
                                      )
                                    }
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#294B68] hover:bg-[#1E374D] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                    title="Download PDF Report"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download PDF</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setSelectedApptForReport(appt);
                                    setReportUploadModalOpen(true);
                                  }}
                                  className="p-1.5 text-[#64748B] hover:text-[#243746] hover:bg-[#F8FAFC] rounded-lg transition-colors cursor-pointer"
                                  title="Replace PDF Report"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedClientId(appt.clientId);
                                setSelectedClientName(appt.clientName);
                                setScheduleModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#EAF3F8] hover:bg-[#D9E4EC] text-[#294B68] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                              title="Rebook new visit for this client"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Rebook</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && filteredAppointments.length > 0 && (
          <TablePagination
            currentPage={validCurrentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="appointments"
          />
        )}
      </div>

      {/* Modals */}
      <AdminScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        defaultClientId={selectedClientId}
        clientName={selectedClientName}
      />

      <AcceptVisitRequestModal
        isOpen={acceptModalOpen}
        onClose={() => {
          setAcceptModalOpen(false);
          setSelectedApptForAccept(null);
        }}
        appointment={selectedApptForAccept}
        onSuccess={() => refetch()}
      />

      <ReportUploadModal
        isOpen={reportUploadModalOpen}
        onClose={() => {
          setReportUploadModalOpen(false);
          setSelectedApptForReport(null);
        }}
        appointment={selectedApptForReport}
      />
    </div>
  );
}
