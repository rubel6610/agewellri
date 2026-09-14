"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  FileCheck,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  HeartHandshake,
  ShieldCheck,
  Clock,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  Send,
  Shield,
  Home,
  UserCheck,
  FileUp,
  Eye,
  Trash2,
} from "lucide-react";
import {
  useGetAdminClientByIdQuery,
  useDeleteAdminClientMutation,
} from "@/redux/features/client/clientApi";
import { useGetAdminAppointmentsQuery } from "@/redux/features/appointment/appointmentApi";
import { ClientStatusBadge } from "@/components/admin/client-status-badge";
import { AdminScheduleModal } from "@/components/admin/admin-schedule-modal";
import { ReportUploadModal } from "@/components/admin/report-upload-modal";
import { FullAgreementViewer } from "@/components/dashboard/full-agreement-viewer";
import { downloadReportPdf } from "@/lib/api/report-download";
import {
  confirmDelete,
  showSuccessAlert,
  showErrorAlert,
} from "@/lib/alerts/sweetalert";

function formatAuditDetails(action: string, details: any): string {
  if (!details) {
    return action
      ? action.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
      : "Activity recorded";
  }

  let data: any = details;
  if (typeof details === "string") {
    if (!details.trim().startsWith("{")) {
      return details;
    }
    try {
      data = JSON.parse(details);
    } catch {
      return details;
    }
  }

  if (typeof data !== "object" || data === null) {
    return String(data);
  }

  const act = (action || "").toUpperCase().replace(/[\s_-]+/g, "_");

  const formatDate = (val: any) => {
    if (!val) return "";
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return String(val);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return String(val);
    }
  };

  const formatPlanName = (p?: string) => {
    if (!p) return "Membership";
    return p.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatRole = (r?: string) => {
    if (!r) return "";
    return r.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const stateNames: Record<string, string> = {
    RI: "Rhode Island",
    MA: "Massachusetts",
    CT: "Connecticut",
  };

  if (act.includes("AGREEMENT_EXECUTED")) {
    const signer = data.signerName || "Member";
    const role = formatRole(data.signerRole);
    const state = stateNames[data.state] || data.state || "Rhode Island";
    const deadline = data.cancellationDeadline ? formatDate(data.cancellationDeadline) : null;
    let text = `Service agreement executed for ${state} by ${signer}${role ? ` (${role})` : ""}.`;
    if (deadline) {
      text += ` Statutory cancellation deadline: ${deadline}.`;
    }
    return text;
  }

  if (act.includes("AGREEMENT_CREATED") || act.includes("AGREEMENT_SENT")) {
    const state = stateNames[data.state] || data.state || "Rhode Island";
    const version = data.templateVersion || "v2.0";
    return `Client service agreement initiated (${version} for ${state}).`;
  }

  if (act.includes("SUBSCRIPTION_ACTIVATED")) {
    const plan = formatPlanName(data.plan);
    const price = data.totalPrice ? `$${Number(data.totalPrice).toFixed(2)}` : null;
    const method = data.billingMethod
      ? data.billingMethod === "AUTOMATIC"
        ? "billed automatically"
        : data.billingMethod.replace(/_/g, " ").toLowerCase()
      : "billed automatically";
    const invoice = data.invoiceNumber ? `Invoice #${data.invoiceNumber}` : null;
    const parts = [
      `${plan} plan subscription activated`,
      price ? `(${price} / ${method})` : null,
      invoice ? `• ${invoice}` : null,
    ].filter(Boolean);
    return parts.join(" ");
  }

  if (act.includes("PAYMENT_STARTED")) {
    const plan = formatPlanName(data.plan);
    const addon = data.hasCleaningAddon ? " with House Cleaning add-on" : "";
    return `Payment checkout initiated for ${plan} plan${addon}.`;
  }

  if (act.includes("PAYMENT_PROCESSED") || act.includes("PAYMENT_SUCCEEDED")) {
    const amount = data.amount || data.totalPrice ? `$${Number(data.amount || data.totalPrice).toFixed(2)}` : "Payment";
    const plan = data.plan ? ` for ${formatPlanName(data.plan)} plan` : "";
    const invoice = data.invoiceNumber ? ` (Invoice #${data.invoiceNumber})` : "";
    return `${amount} processed successfully${plan}${invoice}.`;
  }

  if (act.includes("REPORT_UPLOADED")) {
    const title = data.title || "Visit Report";
    const specialist = data.specialistName ? ` from ${data.specialistName}` : "";
    return `Official PDF report "${title}"${specialist} uploaded and published to member portal.`;
  }

  if (act.includes("APPOINTMENT_SCHEDULED") || act.includes("VISIT_SCHEDULED")) {
    const service = data.serviceType || "Visit";
    const date = data.date ? formatDate(data.date) : "scheduled date";
    const time = data.timeSlot ? ` (${data.timeSlot})` : "";
    const specialist = data.technicianName ? ` with specialist ${data.technicianName}` : "";
    return `${service} booked for ${date}${time}${specialist}.`;
  }

  if (act.includes("APPOINTMENT_COMPLETED") || act.includes("VISIT_COMPLETED")) {
    const service = data.serviceType || "Visit";
    return `${service} marked as completed.`;
  }

  if (act.includes("APPOINTMENT_CANCELLED") || act.includes("VISIT_CANCELLED")) {
    const reason = data.reason ? ` Reason: ${data.reason}` : "";
    return `Visit appointment was cancelled.${reason}`;
  }

  if (act.includes("INVITATION_SENT")) {
    const email = data.email ? ` to ${data.email}` : "";
    return `Onboarding welcome invitation sent${email}.`;
  }

  if (act.includes("ACCOUNT_CREATED") || act.includes("USER_REGISTERED")) {
    return `Member user account registration completed.`;
  }

  // Generic fallback: strip IDs and format dates nicely
  const cleanParts: string[] = [];
  for (const [key, val] of Object.entries(data)) {
    if (
      key.toLowerCase().endsWith("id") ||
      key.toLowerCase() === "id" ||
      key.toLowerCase().includes("token") ||
      key.toLowerCase().includes("hash")
    ) {
      continue;
    }

    if (val === null || val === undefined || val === "") continue;

    const label = key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

    if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}/.test(val)) {
      cleanParts.push(`${label}: ${formatDate(val)}`);
    } else if (typeof val === "boolean") {
      cleanParts.push(val ? label : `No ${label}`);
    } else if (
      typeof val === "number" &&
      (key.toLowerCase().includes("price") ||
        key.toLowerCase().includes("amount") ||
        key.toLowerCase().includes("cost"))
    ) {
      cleanParts.push(`${label}: $${val.toFixed(2)}`);
    } else if (typeof val === "object") {
      continue;
    } else {
      const formattedVal = String(val).replace(/_/g, " ");
      cleanParts.push(`${label}: ${formattedVal}`);
    }
  }

  if (cleanParts.length > 0) {
    return cleanParts.join(" • ");
  }

  return action
    ? action.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    : "Activity recorded";
}

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const clientId = resolvedParams.id;
  const router = useRouter();

  const { data: clientRes, isLoading, isError } = useGetAdminClientByIdQuery(clientId);
  const { data: clientApptsRes } = useGetAdminAppointmentsQuery({ clientId });
  const [deleteAdminClient, { isLoading: isDeleting }] = useDeleteAdminClientMutation();

  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "visits" | "agreement" | "billing" | "activity">("overview");
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [reportUploadModalOpen, setReportUploadModalOpen] = useState(false);
  const [selectedApptForReport, setSelectedApptForReport] = useState<any>(null);

  const client = clientRes?.data;
  const clientAppointments = clientApptsRes?.data || [];

  const handleDeleteClient = async () => {
    if (!client) return;
    const clientFullName = `${client.firstName} ${client.lastName}`.trim();
    const confirmed = await confirmDelete({
      title: `Delete Client "${clientFullName}"?`,
      text: `This will permanently delete ${clientFullName} (${client.clientNumber || client.id}), including all their agreements, active subscriptions, invoices, appointments, and portal access. If they wish to return, they will need to be re-registered.`,
      confirmButtonText: "Yes, Permanently Delete",
      cancelButtonText: "Cancel",
    });

    if (!confirmed) return;

    try {
      const idToDelete = client.internalId || client.id || client.clientNumber || clientId;
      const res = await deleteAdminClient(idToDelete).unwrap();
      showSuccessAlert(
        "Client Deleted",
        res.message || `Client "${clientFullName}" has been permanently deleted.`
      );
      router.push("/admin/clients");
    } catch (err: any) {
      showErrorAlert(
        "Deletion Failed",
        err?.data?.message || err?.message || "Failed to delete client. Please try again."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#294B68]" />
        <p className="font-bold text-sm text-[#243746]">Loading ...</p>
      </div>
    );
  }

  if (isError || !client) {
    return (
      <div className="p-12 bg-white rounded-3xl border border-[#D9E4EC] text-center space-y-4 max-w-lg mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
        <h2 className="text-xl font-bold text-[#243746]">Client Not Found</h2>
        <p className="text-sm text-[#64748B]">Could not locate a client record with ID &quot;{clientId}&quot;.</p>
        <Link
          href="/admin/clients"
          className="inline-flex items-center justify-center px-6 py-2.5 bg-[#294B68] text-white font-bold text-sm rounded-xl"
        >
          Return to Client Directory
        </Link>
      </div>
    );
  }

  const latestAgreement = client.latestAgreement;
  const isExecutedAgreement =
    client.agreementStatus === "EXECUTED" ||
    client.agreementStatus === "SIGNED" ||
    latestAgreement?.status === "EXECUTED";

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#5E8FB2] hover:text-[#294B68] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Client Directory</span>
        </Link>
      </div>

      {/* Main Client Card Header */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D9E4EC]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#294B68] text-white flex items-center justify-center font-extrabold text-xl shrink-0">
              {client.firstName[0]}
              {client.lastName[0]}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
                  {client.firstName} {client.lastName}
                </h1>
                <span className="font-mono text-xs font-bold text-[#294B68] bg-[#EAF3F8] px-2.5 py-1 rounded-md">
                  {client.id}
                </span>
                <span className="text-xs font-extrabold bg-[#294B68] text-white px-2 py-0.5 rounded-md">
                  {client.state}
                </span>
              </div>
              <p className="text-xs text-[#64748B] flex flex-wrap items-center gap-2 mt-1">
                <span>Plan: <strong>{client.planName}</strong></span>
                <span>•</span>
                <span>Role: <strong>{client.signerRole}</strong></span>
                <span>•</span>
                <span>Enrolled: {client.createdAt}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <ClientStatusBadge status={client.status} />
            <button
              type="button"
              onClick={() => setScheduleModalOpen(true)}
              className="px-4 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Visit</span>
            </button>
            <button
              type="button"
              onClick={handleDeleteClient}
              disabled={isDeleting}
              className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title={`Permanently Delete Client ${client.firstName} ${client.lastName}`}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
              ) : (
                <Trash2 className="w-4 h-4 text-rose-600" />
              )}
              <span>Delete Client</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#D9E4EC] overflow-x-auto pb-1 text-sm font-bold">
          {[
            { id: "overview", label: "Overview & Contacts" },
            { id: "visits", label: `Visits & Reports (${clientAppointments.length})` },
            { id: "timeline", label: "Onboarding Timeline" },
            { id: "agreement", label: "Service Agreement" },
            { id: "billing", label: "Billing & Subscription" },
            { id: "activity", label: "Audit Log Trail" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl transition-colors cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? "bg-[#294B68] text-white"
                  : "text-[#64748B] hover:bg-[#EAF3F8] hover:text-[#243746]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW & CONTACTS */}
        {activeTab === "overview" && (
          <div className="space-y-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Resident Contact */}
              <div className="p-5 bg-[#F7FAFC] rounded-2xl border border-[#D9E4EC] space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#294B68]" /> Primary Client (Resident)
                </h3>
                <div className="space-y-2 text-sm text-[#243746]">
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#5E8FB2]" /> <strong>{client.email || "No email"}</strong>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#5E8FB2]" /> <strong>{client.phone || "No phone"}</strong>
                  </p>
                  <p className="flex items-start gap-2 pt-1 border-t border-[#D9E4EC]">
                    <MapPin className="w-4 h-4 text-[#5E8FB2] shrink-0 mt-0.5" />
                    <span>
                      {client.address.street}, {client.address.city}, {client.address.state} {client.address.zip}
                    </span>
                  </p>
                  {client.dateOfBirth && (
                    <p className="text-xs text-[#64748B]">DOB: {client.dateOfBirth}</p>
                  )}
                </div>
              </div>

              {/* Signer / Legal Authority */}
              <div className="p-5 bg-[#EAF3F8]/60 rounded-2xl border border-[#5E8FB2]/30 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#294B68] flex items-center gap-2">
                  <UserCheck className="w-4 h-4" /> Signing Party &amp; Legal Authority
                </h3>
                <div className="space-y-2 text-sm text-[#243746]">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Signer Role:</span>
                    <strong className="capitalize">{client.signerRole.replace(/_/g, " ").toLowerCase()}</strong>
                  </div>
                  {client.legalAuthority && (
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Legal Authority:</span>
                      <strong className="text-[#294B68]">{client.legalAuthority.replace(/_/g, " ")}</strong>
                    </div>
                  )}
                  {client.legalAuthorityOther && (
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Authority Details:</span>
                      <strong>{client.legalAuthorityOther}</strong>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t border-[#D9E4EC]/60">
                    <span className="text-[#64748B]">Applicable State:</span>
                    <strong>{client.state}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Emergency Contact */}
              <div className="p-5 bg-white rounded-2xl border border-[#D9E4EC] space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#3F8F6B]" /> Secondary Emergency Contact
                </h3>
                <div className="space-y-2 text-sm text-[#243746]">
                  <p>
                    <strong>{client.emergencyContactName || "Not Provided"}</strong>
                    {client.emergencyContactRelation && (
                      <span className="text-xs text-[#64748B]"> ({client.emergencyContactRelation})</span>
                    )}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#5E8FB2]" /> {client.emergencyContactPhone || "N/A"}
                  </p>
                  {client.emergencyContactEmail && (
                    <p className="flex items-center gap-2 text-xs text-[#64748B]">
                      <Mail className="w-4 h-4 text-[#5E8FB2]" /> {client.emergencyContactEmail}
                    </p>
                  )}
                </div>
              </div>

              {/* Home Access Instructions */}
              <div className="p-5 bg-white rounded-2xl border border-[#D9E4EC] space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-2">
                  <Home className="w-4 h-4 text-[#294B68]" /> Home Access &amp; Entry
                </h3>
                <div className="space-y-2 text-sm text-[#243746]">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Access Type:</span>
                    <strong className="capitalize">{client.homeAccessType?.replace(/_/g, " ").toLowerCase() || "Resident Answers"}</strong>
                  </div>
                  {client.homeAccessInstructions && (
                    <p className="text-xs text-[#64748B] bg-[#F8FAFC] p-2.5 rounded-lg border border-[#D9E4EC]">
                      {client.homeAccessInstructions}
                    </p>
                  )}
                  {client.homeAccessCode && (
                    <div className="flex justify-between text-xs">
                      <span className="text-[#64748B]">Access Code:</span>
                      <strong className="font-mono">{client.homeAccessCode}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Danger Zone: Permanent Client Deletion */}
            <div className="p-5 bg-rose-50/50 rounded-2xl border border-rose-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-600" /> Permanent Client Deletion
                  </h4>
                  <p className="text-xs text-rose-700 mt-1 max-w-2xl">
                    Permanently deletes this client record, user credentials, agreements, active subscriptions, and appointments. The client will immediately lose portal access and will need to be re-registered if they return.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteClient}
                  disabled={isDeleting}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                  title="Permanently Delete Client Account"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>Delete Client Account</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ONBOARDING STATUS TIMELINE */}
        {activeTab === "timeline" && (
          <div className="space-y-6 pt-2">
            <div>
              <h3 className="text-base font-extrabold text-[#243746]">
                Client Onboarding Status Timeline
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Tracks each required milestone in the AgeWellRI client intake lifecycle.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { title: "1. Welcome Sent", done: client.timeline.welcomeSent, desc: "Invitation dispatched to email" },
                { title: "2. Account Created", done: client.timeline.accountCreated, desc: "User credentials registered" },
                { title: "3. Signer Selected", done: client.timeline.signerSelected, desc: `Role: ${client.signerRole}` },
                { title: "4. Emergency Contact", done: client.timeline.emergencyContactAdded, desc: client.emergencyContactName || "Pending" },
                { title: "5. State Selected", done: client.timeline.stateSelected, desc: `Region: ${client.state}` },
                { title: "6. Agreement Sent", done: client.timeline.agreementSent, desc: "Template loaded" },
                { title: "7. Agreement Signed", done: client.timeline.agreementSigned, desc: isExecutedAgreement ? "Executed ✓" : "Pending" },
                { title: "8. Payment", done: client.timeline.paymentProcessed, desc: client.paymentStatus },
                { title: "9. Subscription", done: client.timeline.subscriptionActive, desc: client.subscriptionStatus },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border ${
                    step.done
                      ? "border-[#86EFAC] bg-[#F0FDF4]"
                      : "border-[#D9E4EC] bg-[#F8FAFC]"
                  } space-y-1.5`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#243746]">{step.title}</span>
                    {step.done ? (
                      <span className="w-5 h-5 rounded-full bg-[#166534] text-white flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full border-2 border-[#94A3B8] text-[#94A3B8] flex items-center justify-center text-[10px] font-bold">
                        •
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#64748B]">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SERVICE AGREEMENT DETAILS */}
        {activeTab === "agreement" && (
          <div className="space-y-6 pt-2">
            {latestAgreement ? (
              <div className="space-y-6">
                <div className="bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D9E4EC]">
                    <div>
                      <h3 className="text-lg font-bold text-[#243746]">
                        AgeWellRI Client Service Agreement ({latestAgreement.state} - {latestAgreement.templateVersion || "v2.0"})
                      </h3>
                      <p className="text-xs text-[#64748B]">
                        Executed: {latestAgreement.executedAt ? new Date(latestAgreement.executedAt).toLocaleDateString() : "Pending"}
                      </p>
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-[#EBF8F2] text-[#166534]">
                        <ShieldCheck className="w-4 h-4" /> {latestAgreement.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[#64748B] block">Primary Client:</span>
                      <strong className="text-[#243746] text-sm block">{client.firstName} {client.lastName}</strong>
                    </div>
                    <div>
                      <span className="text-[#64748B] block">Signer Legal Name:</span>
                      <strong className="text-[#243746] text-sm block">{latestAgreement.signerName || latestAgreement.clientPrintedName}</strong>
                    </div>
                    <div>
                      <span className="text-[#64748B] block">Cancellation Deadline:</span>
                      <strong className="text-[#294B68] text-sm block">
                        {latestAgreement.cancellationDeadline
                          ? new Date(latestAgreement.cancellationDeadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "N/A"}
                      </strong>
                    </div>
                  </div>
                </div>

                <FullAgreementViewer agreement={latestAgreement} />
              </div>
            ) : (
              <div className="p-12 text-center text-[#64748B] bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC]">
                <FileText className="w-8 h-8 mx-auto text-[#94A3B8] mb-2" />
                <p className="font-bold text-sm text-[#243746]">No Service Agreement Executed Yet</p>
                <p className="text-xs text-[#64748B] mt-1">Client has not yet completed the agreement signing wizard.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: BILLING & SUBSCRIPTION */}
        {activeTab === "billing" && (
          <div className="space-y-6 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] space-y-2">
                <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">Membership Plan</span>
                <strong className="text-lg text-[#243746] block">{client.planName}</strong>
                <span className="text-xs text-[#64748B] block">Status: <strong>{client.subscriptionStatus}</strong></span>
              </div>
              <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] space-y-2">
                <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">Payment &amp; Card</span>
                <strong className="text-lg text-[#243746] block">{client.paymentStatus}</strong>
                <span className="text-xs text-[#64748B] block">
                  {client.cardLast4 ? `${client.cardBrand || "Card"} ending in ${client.cardLast4}` : "No card on file"}
                </span>
              </div>
            </div>

            {/* Visit Entitlements Breakdown */}
            <div className="p-5 bg-white rounded-2xl border border-[#D9E4EC] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-[#243746] text-base">
                    Active Period Visit Entitlements
                  </h4>
                  <p className="text-xs text-[#64748B]">
                    Allocations configured dynamically from contracted plan services.
                  </p>
                </div>
                <span className="px-3 py-1 bg-[#EAF3F8] text-[#294B68] text-xs font-black rounded-full">
                  {client.remainingVisitsCount} / {client.totalVisitsAllowed} Remaining
                </span>
              </div>

              {client.visitEntitlements && client.visitEntitlements.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#D9E4EC] text-[#64748B] uppercase tracking-wider">
                        <th className="py-2.5 px-3">Service</th>
                        <th className="py-2.5 px-3 text-center">Allocated</th>
                        <th className="py-2.5 px-3 text-center">Scheduled</th>
                        <th className="py-2.5 px-3 text-center">Completed</th>
                        <th className="py-2.5 px-3 text-center">Remaining</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D9E4EC]/60 text-[#243746] font-semibold">
                      {client.visitEntitlements.map((ent: any) => (
                        <tr key={ent.id} className="hover:bg-[#F8FAFC]">
                          <td className="py-3 px-3">
                            <span className="font-bold block">{ent.serviceName}</span>
                            <span className="text-[11px] text-[#5E8FB2] font-normal">{ent.durationMinutes} min</span>
                          </td>
                          <td className="py-3 px-3 text-center font-bold">{ent.allocated}</td>
                          <td className="py-3 px-3 text-center text-[#5E8FB2]">{ent.scheduled}</td>
                          <td className="py-3 px-3 text-center text-[#166534]">{ent.completed}</td>
                          <td className="py-3 px-3 text-center font-extrabold text-[#294B68]">{ent.remaining}</td>
                          <td className="py-3 px-3 text-right">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black ${
                              ent.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                            }`}>
                              {ent.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-[#64748B] py-4 text-center">
                  No active visit allocation records found for this period.
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB: VISITS & REPORTS */}
        {activeTab === "visits" && (
          <div className="space-y-5 pt-2">
            {/* Active Month Entitlement Summary */}
            <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#294B68] text-white">
                    Current Active Month
                  </span>
                  {client.renewalDate && (
                    <span className="text-xs text-[#64748B] font-semibold">
                      Renewal Date: <strong>{client.renewalDate}</strong>
                    </span>
                  )}
                </div>
                <h3 className="text-base font-extrabold text-[#243746]">
                  {client.planName} Safety Entitlements
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] pt-0.5 font-medium">
                  <span>Allocated: <strong className="text-[#243746]">{client.totalVisitsAllowed || client.totalVisitsCount || 12}</strong></span>
                  <span>•</span>
                  <span>Scheduled: <strong className="text-[#294B68]">{clientAppointments.filter((a: any) => a.status === "scheduled" || a.status === "confirmed").length}</strong></span>
                  <span>•</span>
                  <span>Completed: <strong className="text-[#166534]">{client.completedVisitsCount ?? 0}</strong></span>
                  <span>•</span>
                  <span>Unscheduled: <strong className="text-[#294B68] font-bold">{client.remainingVisitsCount ?? 12}</strong></span>
                </div>
              </div>

              <button
                onClick={() => setScheduleModalOpen(true)}
                className="px-4 py-2 bg-[#294B68] hover:bg-[#1E374D] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Book / Schedule Visit</span>
              </button>
            </div>

            {clientAppointments.length === 0 ? (
              <div className="p-8 text-center bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] space-y-2">
                <Calendar className="w-8 h-8 mx-auto text-[#94A3B8]" />
                <p className="font-bold text-sm text-[#243746]">No Visits Scheduled</p>
                <p className="text-xs text-[#64748B]">Book a visit to assign a caregiver or technician.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#D9E4EC] text-[#64748B] uppercase tracking-wider font-bold">
                      <th className="py-2.5 px-3">Date &amp; Time</th>
                      <th className="py-2.5 px-3">Service</th>
                      <th className="py-2.5 px-3">Specialist</th>
                      <th className="py-2.5 px-3">Visit Status</th>
                      <th className="py-2.5 px-3">Report Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9E4EC]/60 text-[#243746] font-medium">
                    {clientAppointments.map((appt) => {
                      const isCompleted = appt.status === "completed";
                      const hasReport = Boolean(appt.hasReport || appt.reportStatus === "uploaded");

                      return (
                        <tr key={appt.id} className="hover:bg-[#F8FAFC]">
                          <td className="py-3 px-3 font-semibold">
                            <span className="font-bold block text-[#243746]">{appt.date}</span>
                            <span className="text-[11px] text-[#64748B]">{appt.timeSlot}</span>
                          </td>
                          <td className="py-3 px-3 font-bold text-[#294B68]">{appt.serviceType}</td>
                          <td className="py-3 px-3 text-[#243746]">{appt.technicianName}</td>
                          <td className="py-3 px-3 capitalize">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isCompleted
                                  ? "bg-emerald-100 text-emerald-800"
                                  : appt.status === "cancelled"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-[#EAF3F8] text-[#294B68]"
                              }`}
                            >
                              {appt.status}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {isCompleted ? (
                              hasReport ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3F8F6B]">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C28A3A]">
                                  <Clock className="w-3.5 h-3.5" /> Not Uploaded
                                </span>
                              )
                            ) : (
                              <span className="text-[#94A3B8]">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            {isCompleted ? (
                              !hasReport ? (
                                <button
                                  onClick={() => {
                                    setSelectedApptForReport(appt);
                                    setReportUploadModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 bg-[#294B68] hover:bg-[#1E374D] text-white text-[11px] font-bold rounded-lg transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1"
                                >
                                  <FileUp className="w-3 h-3" /> Upload Report
                                </button>
                              ) : (
                                <div className="flex items-center justify-end gap-1.5">
                                  {appt.reportId && (
                                    <button
                                      type="button"
                                      onClick={() => downloadReportPdf(appt.reportId!, `${client.firstName}_${client.lastName}_${appt.serviceType}_Report.pdf`)}
                                      className="px-2 py-1 bg-[#294B68] hover:bg-[#1E374D] text-white text-[11px] font-bold rounded-lg cursor-pointer inline-flex items-center gap-1"
                                      title="Download PDF Report"
                                    >
                                      <Download className="w-3 h-3" />
                                      <span>Download PDF</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      setSelectedApptForReport(appt);
                                      setReportUploadModalOpen(true);
                                    }}
                                    className="p-1 text-[#64748B] hover:text-[#243746] rounded-lg cursor-pointer"
                                    title="Replace PDF Report"
                                  >
                                    <FileUp className="w-3 h-3" />
                                  </button>
                                </div>
                              )
                            ) : (
                              <span className="text-[#94A3B8]">Scheduled</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: AUDIT LOG TRAIL */}
        {activeTab === "activity" && (
          <div className="space-y-4 pt-2">
            <h3 className="text-base font-extrabold text-[#243746]">Client Operations Audit Trail</h3>
            <div className="space-y-3 divide-y divide-[#D9E4EC]/60">
              {client.auditLogs && client.auditLogs.length > 0 ? (
                client.auditLogs.map((log: any) => (
                  <div key={log.id} className="pt-3 flex items-start justify-between text-sm">
                    <div>
                      <span className="font-bold text-[#243746]">{log.action}</span>
                      <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                        {formatAuditDetails(log.action, log.details)}
                      </p>
                    </div>
                    <div className="text-right text-xs shrink-0">
                      <span className="font-semibold text-[#294B68] block">{log.performedBy}</span>
                      <span className="text-[#64748B]">{log.timestamp}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#64748B] py-6 text-center">No audit trail entries recorded yet.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <AdminScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        defaultClientId={client.id || clientId}
        clientName={`${client.firstName} ${client.lastName}`}
        hideClientSelect={true}
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
