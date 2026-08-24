"use client";

import React, { useState, use } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { useGetAdminClientByIdQuery } from "@/redux/features/client/clientApi";
import { ClientStatusBadge } from "@/components/admin/client-status-badge";
import { AdminScheduleModal } from "@/components/admin/admin-schedule-modal";
import { FullAgreementViewer } from "@/components/dashboard/full-agreement-viewer";

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const clientId = resolvedParams.id;

  const { data: clientRes, isLoading, isError } = useGetAdminClientByIdQuery(clientId);
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "agreement" | "billing" | "activity">("overview");
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const client = clientRes?.data;

  if (isLoading) {
    return (
      <div className="p-16 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#294B68]" />
        <p className="font-bold text-sm text-[#243746]">Loading client profile from database...</p>
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

          <div className="flex items-center gap-3">
            <ClientStatusBadge status={client.status} />
            <button
              onClick={() => setScheduleModalOpen(true)}
              className="px-4 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Visit</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#D9E4EC] overflow-x-auto pb-1 text-sm font-bold">
          {[
            { id: "overview", label: "Overview & Contacts" },
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
                      <p className="text-xs text-[#64748B] mt-0.5">{log.details}</p>
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
    </div>
  );
}
