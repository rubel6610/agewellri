"use client";

import React from "react";
import Image from "next/image";
import {
  ShieldCheck,
  CheckCircle2,
  Shield,
  UserCheck,
  Key,
  DoorClosed,
  AlertTriangle,
  CreditCard,
  HeartHandshake,
  FileCheck,
  Download,
  ExternalLink,
} from "lucide-react";
import { AgreementDocument } from "@/redux/features/auth/authTypes";
import { AdminAgreementRecord } from "@/redux/features/client/clientApi";
import { AgreementPdfData } from "@/lib/utils/agreement-pdf";
import {
  downloadAuthorityDocument,
  getAuthorityDocumentPreviewUrl,
} from "@/lib/utils/authority-document-download";

const AGEWELL_OWNER_DETAILS = {
  name: "Cory Poplaski",
  title: "Founder & Director of Care Management",
  company: "AgeWellRI LLC",
  location: "Westerly, RI",
  phone: "(401) 212-3002",
  email: "agewellri@gmail.com",
};

const OWNER_SIGNATURE_SVG_DATA_URI =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='70' viewBox='0 0 240 70'><path d='M 15 45 Q 35 15 60 40 T 110 35 T 160 45 T 210 30' stroke='%23294B68' stroke-width='2.8' fill='none' stroke-linecap='round' stroke-linejoin='round'/><path d='M 45 42 Q 85 58 140 48' stroke='%23294B68' stroke-width='1.8' fill='none' stroke-linecap='round'/></svg>";

interface AgreementDocumentContentProps {
  agreement: AgreementDocument | AdminAgreementRecord | AgreementPdfData;
}

function formatPlanName(plan?: string | null): string {
  if (!plan) return "Peace of Mind Plan";
  return plan
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatCapacity(cap?: string | null): string {
  if (!cap) return "Attorney-in-Fact (DPOA)";
  switch (cap) {
    case "ATTORNEY_IN_FACT":
      return "Attorney-in-Fact (Durable Power of Attorney)";
    case "GUARDIAN":
      return "Court-Appointed Legal Guardian";
    case "CONSERVATOR":
      return "Court-Appointed Conservator";
    default:
      return cap.replace(/_/g, " ");
  }
}

function formatAccessType(accessType?: string | null): string {
  if (!accessType) return "Resident Answers Door";
  switch (accessType) {
    case "RESIDENT_ANSWERS":
      return "Resident Answers Door (Onsite Resident / Family Member greets specialist)";
    case "DIGITAL_CODE":
      return "Digital Keypad / Lockbox (Specialist enters via authorized code/lockbox)";
    case "LOCKBOX":
      return "Key Lockbox (Exterior key vault access)";
    default:
      return accessType.replace(/_/g, " ");
  }
}

export function AgreementDocumentContent({
  agreement,
}: AgreementDocumentContentProps) {
  const formattedPlan = formatPlanName(
    agreement.selectedPlan || agreement.planName,
  );

  const statusUpper = (agreement.status || "").toUpperCase();
  const isExecuted =
    Boolean(agreement.clientSignature) ||
    statusUpper === "EXECUTED" ||
    statusUpper === "SIGNED" ||
    statusUpper === "ACTIVE" ||
    statusUpper === "COMPLETED" ||
    Boolean(agreement.signedAt) ||
    Boolean(agreement.executedAt) ||
    Boolean(agreement.signedDate);

  const rawDate =
    agreement.agreementDate ||
    agreement.signedAt ||
    agreement.executedAt ||
    agreement.signedDate ||
    agreement.createdAt;

  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : isExecuted
      ? "Executed & Active"
      : "Pending Execution";

  const isRepresentative =
    agreement.signingTrack === "TRACK_B" ||
    (agreement.signerRole && agreement.signerRole !== "RESIDENT") ||
    Boolean(agreement.authorizedRepName) ||
    Boolean(agreement.repFullName);

  const clientFullName =
    agreement.clientFullName ||
    agreement.clientName ||
    agreement.clientPrintedName ||
    "Client Member";

  const signerLegalName = isRepresentative
    ? agreement.repFullName ||
      agreement.signerName ||
      agreement.authorizedRepName ||
      agreement.clientPrintedName ||
      clientFullName
    : agreement.clientPrintedName || clientFullName;

  const recipients = agreement.authorizedRecipients || [];
  const authorityDocUrl =
    agreement.authorityDocumentUrl || agreement.documentUrl;

  const fullAddress = [
    agreement.address,
    agreement.city,
    agreement.state || agreement.stateAddress || "RI",
    agreement.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="bg-white rounded-3xl border border-[#D9E4EC] shadow-sm p-6 sm:p-10 space-y-8 text-[#243746]">
      {/* Document Header */}
      <div className="text-center space-y-2 pb-6 border-b border-[#D9E4EC]">
        <div className="flex justify-center mb-2">
          <Image
            src="/logo.png"
            alt="AgeWellRI"
            width={220}
            height={55}
            priority
            className="h-auto w-auto max-h-12 object-contain"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746] tracking-tight">
          AgeWellRI Care Management
        </h1>
        <p className="text-base sm:text-lg font-bold text-[#5E8FB2]">
          Client Service Agreement ({agreement.state || "RI"} Jurisdiction)
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#64748B] pt-1">
          <span>
            Agreement Ref:{" "}
            <strong>{agreement.id?.slice(-8)?.toUpperCase() || "AW-AG"}</strong>
          </span>
          <span>•</span>
          <span>
            Client ID:{" "}
            <strong>
              {agreement.clientNumber || agreement.clientId || "AW-MEMBER"}
            </strong>
          </span>
          <span>•</span>
          <span>
            Version:{" "}
            <strong>
              {agreement.templateVersion || agreement.version || "v2.0"}
            </strong>
          </span>
          <span>•</span>
          <span>
            Effective Date: <strong>{formattedDate}</strong>
          </span>
        </div>
      </div>

      {/* 1. Client Information */}
      <div className="space-y-4">
        <div className="bg-[#243746] text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between">
          <span>1. Resident / Client Profile &amp; Residence Location</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] text-xs sm:text-sm">
          <div>
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
              Client Full Legal Name
            </span>
            <p className="font-bold text-[#243746] text-base mt-0.5">
              {clientFullName}
            </p>
          </div>

          <div>
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
              Service Residence Address
            </span>
            <p className="font-bold text-[#243746] mt-0.5">
              {fullAddress || "On File"}
            </p>
          </div>

          <div>
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
              Phone Number
            </span>
            <p className="font-bold text-[#243746] mt-0.5">
              {agreement.phone || "On File"}
            </p>
          </div>

          <div>
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
              Date of Birth
            </span>
            <p className="font-bold text-[#243746] mt-0.5">
              {agreement.dob || agreement.dateOfBirth || "On File"}
            </p>
          </div>

          <div className="sm:col-span-2">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
              Email Address
            </span>
            <p className="font-bold text-[#243746] mt-0.5">
              {agreement.email || agreement.clientEmail || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Signer Role & Legal Representation Authority */}
      <div className="space-y-4">
        <div className="bg-[#243746] text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between">
          <span>2. Signing Track &amp; Legal Representation Authority</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-5 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] text-xs sm:text-sm">
          <div>
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
              Signing Track
            </span>
            <div className="mt-1">
              {isRepresentative ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#EAF3F8] text-[#294B68] border border-[#294B68]/20">
                  <UserCheck className="w-3.5 h-3.5 text-[#294B68]" />
                  <span>Track B: Representative / POA</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Track A: Primary Resident (Self)</span>
                </span>
              )}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
              Signer Full Legal Name
            </span>
            <p className="font-bold text-[#243746] text-sm mt-1">
              {signerLegalName}
            </p>
          </div>

          <div>
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
              Representative Legal Capacity
            </span>
            <p className="font-bold text-[#243746] text-sm mt-1">
              {isRepresentative
                ? formatCapacity(
                    agreement.representativeCapacity ||
                      agreement.legalAuthority,
                  )
                : "Primary Resident (Self-Signer)"}
            </p>
          </div>

          <div>
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
              Relationship to Client
            </span>
            <p className="font-bold text-[#243746] mt-1">
              {agreement.relationshipToClient ||
                (isRepresentative ? "Authorized Representative" : "Self")}
            </p>
          </div>

          <div>
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
              Signer Contact Phone
            </span>
            <p className="font-bold text-[#243746] mt-1">
              {agreement.signerPhone || agreement.phone || "On File"}
            </p>
          </div>

          <div>
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
              Legal Authority Document
            </span>
            <div className="mt-1">
              {authorityDocUrl ? (
                <div className="inline-flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      downloadAuthorityDocument({
                        url: authorityDocUrl,
                        agreementId: agreement.id,
                        customName: `AgeWellRI_Legal_Authority_${signerLegalName.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
                      })
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-300 transition-colors shadow-2xs cursor-pointer"
                    title="Download uploaded legal authority document"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Attached &amp; Verified</span>
                    <Download className="w-3 h-3 text-emerald-700 ml-0.5" />
                  </button>

                  {/* <a
                    href={getAuthorityDocumentPreviewUrl({
                      url: authorityDocUrl,
                      agreementId: agreement.id,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#294B68] hover:text-[#1E374D] bg-[#EAF3F8] hover:bg-[#D9E4EC] px-2.5 py-1 rounded-lg border border-[#5E8FB2]/30 transition-colors"
                    title="Open document in a new tab"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a> */}
                </div>
              ) : isRepresentative ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#64748B] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                  <span>Legal Capacity Declared</span>
                </span>
              ) : (
                <span className="text-xs text-[#64748B]">
                  N/A (Resident Signature)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Primary & Emergency Contacts */}
      <div className="space-y-4">
        <div className="bg-[#243746] text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between">
          <span>3. Primary Billing &amp; Emergency Contacts</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] space-y-2 text-xs">
            <span className="font-black text-[#5E8FB2] uppercase tracking-wider block text-xs">
              Primary / Billing Contact
            </span>
            <p className="font-bold text-[#243746] text-sm">
              {agreement.primaryContactName ||
                (isRepresentative ? signerLegalName : clientFullName)}
            </p>
            <p className="text-[#64748B]">
              Relationship:{" "}
              <strong>
                {agreement.primaryContactRelation ||
                  (isRepresentative ? "Authorized Representative" : "Self")}
              </strong>
            </p>
            <p className="text-[#64748B]">
              Phone:{" "}
              <strong>
                {agreement.primaryContactPhone || agreement.phone || "On File"}
              </strong>
            </p>
            <p className="text-[#64748B]">
              Email:{" "}
              <strong>
                {agreement.primaryContactEmail ||
                  agreement.primaryBillingContact ||
                  agreement.email ||
                  agreement.clientEmail}
              </strong>
            </p>
          </div>

          <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] space-y-2 text-xs">
            <span className="font-black text-[#5E8FB2] uppercase tracking-wider block text-xs">
              Designated Emergency Contact
            </span>
            <p className="font-bold text-[#243746] text-sm">
              {agreement.emergencyContactName || "Not Provided"}
            </p>
            <p className="text-[#64748B]">
              Relationship:{" "}
              <strong>
                {agreement.emergencyContactRelation ||
                  "Designated Emergency Contact"}
              </strong>
            </p>
            <p className="text-[#64748B]">
              Phone:{" "}
              <strong>
                {agreement.emergencyContactPhone || "Not Provided"}
              </strong>
            </p>
            {agreement.emergencyContactEmail && (
              <p className="text-[#64748B]">
                Email: <strong>{agreement.emergencyContactEmail}</strong>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 4. Authorized Report Recipients */}
      {recipients.length > 0 && (
        <div className="space-y-4">
          <div className="bg-[#243746] text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between">
            <span>
              4. Authorized Report Recipients (Post-Visit Updates &amp; Photos)
            </span>
          </div>

          <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] space-y-3">
            <p className="text-xs text-[#64748B]">
              The following designated individuals receive automatic digital
              visit reports, safety checklists, and photographic updates after
              every scheduled service visit:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {recipients.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white rounded-xl border border-[#D9E4EC] space-y-1 text-xs"
                >
                  <div className="font-bold text-[#243746] text-sm">
                    {rec.name}
                  </div>
                  <div className="text-[11px] text-[#5E8FB2] font-semibold">
                    Relationship: {rec.relationship}
                  </div>
                  <div className="text-[11px] text-[#64748B] font-mono break-all">
                    {rec.email}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Home Access Specifications */}
      <div className="space-y-4">
        <div className="bg-[#243746] text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between">
          <span>5. Home Access Specifications &amp; Entry Protocol</span>
        </div>

        <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] space-y-3 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
                Scheduled Entry Method
              </span>
              <p className="font-bold text-[#243746] text-sm mt-1">
                {formatAccessType(agreement.homeAccessType)}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
                Authorization Status
              </span>
              <div className="mt-1 flex items-center gap-1.5 font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Authorized for Confirmed Scheduled Visits</span>
              </div>
            </div>
          </div>

          {/* <div className="pt-2 border-t border-[#D9E4EC]">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
              Special Access Instructions &amp; Security Protocol
            </span>
            <p className="text-xs text-[#475569] mt-1 leading-relaxed">
              {agreement.homeAccessInstructions ||
                "Standard entry protocol. Specialist will knock and verify identity prior to entering property."}
            </p>
          </div> */}
        </div>
      </div>

      {/* 6. Selected Service Plan */}
      <div className="space-y-4">
        <div className="bg-[#243746] text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between">
          <span>6. Selected Service Plan &amp; Pricing Structure</span>
        </div>

        <div className="p-6 bg-[#EAF3F8] rounded-2xl border border-[#5E8FB2]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#294B68]/10 text-[#294B68] flex items-center justify-center shrink-0 border border-[#294B68]/15">
                <Shield className="w-5 h-5 text-[#294B68]" />
              </div>
              <div>
                <h3 className="font-black text-lg text-[#243746] tracking-tight">
                  {formattedPlan}
                </h3>
                <p className="text-xs text-[#64748B]">
                  Comprehensive Home Safety Oversight, Maintenance &amp;
                  Proactive Hazard Mitigation
                </p>
              </div>
            </div>
            {/* {agreement.hasCleaningAddon ? (
              <div className="pl-12.5 pt-0.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#166534] bg-white px-2.5 py-0.5 rounded-md border border-[#166534]/30 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#166534]" />
                  <span>
                    Includes Light Cleaning Add-On ($50/month • 6 extra
                    visits/year)
                  </span>
                </span>
              </div>
            ) : (
              <div className="pl-12.5 pt-0.5">
                <span className="text-xs text-[#64748B]">
                  First billing on Commencement Date (1st of calendar month) •
                  $0.00 charged today
                </span>
              </div>
            )} */}
          </div>

          <div className="text-left sm:text-right sm:border-l sm:border-[#D9E4EC] sm:pl-6 shrink-0">
            <span className="text-xs text-[#64748B] block font-semibold">
              Monthly Membership Fee
            </span>
            <span className="text-2xl sm:text-3xl font-black text-[#294B68]">
              ${agreement.planPrice ?? 495}
              <span className="text-xs font-normal text-[#64748B]">/month</span>
            </span>
          </div>
        </div>
      </div>

      {/* 7. Scope of Services & Operational Provisions*/}
      <div className="space-y-4">
        <div className="bg-[#243746] text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between">
          <span>7. Scope of Services &amp; Operational Provisions</span>
        </div>

        <div className="p-6 bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl space-y-6 text-xs text-[#475569]">
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-sm text-[#243746] border-b border-[#D9E4EC] pb-2">
              Scope of Non-Medical Maintenance &amp; Safety Assistance
            </h4>
            <div className="space-y-2 leading-relaxed">
              <p>
                <strong className="text-[#243746]">
                  Bedrooms &amp; Living Areas:
                </strong>{" "}
                Walk pathways, clear indoor electrical cords, ensure bedside
                lighting and emergency phones are easily reachable, secure throw
                rugs with non-skid backing, and perform HEPA vacuuming and
                dusting to reduce respiratory allergens.
              </p>
              <p>
                <strong className="text-[#243746]">Life Safety Systems:</strong>{" "}
                Routinely tests and cleans smoke detectors, carbon monoxide
                alarms, fire extinguishers, and medical alert systems; checks
                water heater temperature to prevent accidental scalding, and
                reviews emergency exit pathways.
              </p>
              <p>
                <strong className="text-[#243746]">
                  Kitchen &amp; Laundry:
                </strong>{" "}
                Reorganizes heavy or daily items to lower-level shelves for
                easy, safe reach; inspects appliances for potential hazards,
                clears dryer lint pathways, and audits moisture/mold concerns.
              </p>
              <p>
                <strong className="text-[#243746]">
                  Non-Medical Scope Notice:
                </strong>{" "}
                AgeWellRI is a residential maintenance and home safety
                coordination service. Specialists do not provide clinical
                nursing, physical therapy, medical triage, or continuous
                emergency dispatch.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <h4 className="font-extrabold text-sm text-[#243746] border-b border-[#D9E4EC] pb-2">
              Billing Schedule &amp; Cancellation Terms
            </h4>
            <div className="space-y-2 leading-relaxed">
              <p>
                <strong className="text-[#243746]">
                  Billing &amp; Payment:
                </strong>{" "}
                Billed monthly via credit card, debit card, or ACH on the 1st of
                each calendar month. $0.00 is charged at initial agreement
                execution.
              </p>
              <p>
                <strong className="text-[#243746]">Cancellation Policy:</strong>{" "}
                Cancel at any time with 30-day notice prior to the monthly
                billing cutoff via your client dashboard or by emailing{" "}
                <strong className="text-[#294B68]">agewellri@gmail.com</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 8. State Statutory Consumer Rights */}
      {/* <div className="space-y-4">
        <div className="bg-[#991B1B] text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between">
          <span>
            8. State Statutory Consumer Rights ({agreement.state || "RI"})
          </span>
        </div>

        <div className="p-5 bg-rose-50/80 border border-rose-200 rounded-2xl space-y-2.5 text-xs text-rose-950">
          <h4 className="font-extrabold text-sm text-rose-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Notice of Mandatory 3-Business-Day Right to Cancel</span>
          </h4>
          <p className="leading-relaxed">
            Under {agreement.state || "Rhode Island"} Consumer Protection
            Regulations (R.I. Gen. Laws § 6-28-3), you may cancel this agreement
            at any time prior to midnight of the third business day after the
            date of execution without any penalty or obligation.
          </p>
          {agreement.cancellationDeadline && (
            <p className="font-bold text-rose-900 pt-1">
              Statutory Cancellation Deadline: {agreement.cancellationDeadline}{" "}
              ({agreement.cancellationDeadlineRule || "3 business days"})
            </p>
          )}
        </div>
      </div> */}

      {/* 9. Required Contract Authorizations & Legal Consents (Exact Contract Clauses) */}
      <div className="space-y-4">
        <div className="bg-[#243746] text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between">
          <span>
            8. Mandatory Legal Authorizations &amp; Consents (Sections 12.2 -
            12.4)
          </span>
        </div>

        <div className="p-6 bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl space-y-4 text-xs">
          {/* Clause 1: Emergency Right of Entry */}
          <div className="p-5 bg-white rounded-2xl border border-[#D9E4EC] space-y-2">
            <div className="flex items-center gap-2 font-extrabold text-[#243746] text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>1. Emergency Right of Entry (Section 12.2) *</span>
              <span className="ml-auto text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ✓ Confirmed &amp; Authorized
              </span>
            </div>
            <p className="text-[#475569] leading-relaxed pl-6">
              I authorize AgeWellRI to enter the home during a scheduled visit
              if a technician has a reasonable belief that a medical emergency
              or safety crisis is occurring inside. I authorize the use of any
              available key/code, contacting emergency services (911), and
              following instructions from designated family contacts. AgeWellRI
              and its technicians are held harmless for property damage (such as
              forced entry) or liabilities resulting from a good-faith emergency
              response — except in cases of gross negligence, recklessness, or
              willful misconduct.
            </p>
          </div>

          {/* Clause 2: Resident Autonomy & Refusal */}
          <div className="p-5 bg-white rounded-2xl border border-[#D9E4EC] space-y-2">
            <div className="flex items-center gap-2 font-extrabold text-[#243746] text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <HeartHandshake className="w-4 h-4 text-[#294B68] shrink-0" />
              <span>2. Resident Autonomy &amp; Refusal (Section 12.3) *</span>
              <span className="ml-auto text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ✓ Confirmed &amp; Authorized
              </span>
            </div>
            <p className="text-[#475569] leading-relaxed pl-6">
              I acknowledge that AgeWellRI technicians respect the dignity,
              comfort, and personal boundaries of all residents. If a resident
              refuses entry, objects to a checklist item, or asks a technician
              to leave an area, the technician will immediately respect that and
              stop that part of the service. I understand this refusal is not a
              breach of contract by AgeWellRI, the standard visit fee still
              applies, and AgeWellRI is not liable for accidents caused by a
              hazard left in place because the resident declined to have it
              addressed — except in cases of gross negligence, recklessness, or
              willful misconduct.
            </p>
          </div>

          {/* Clause 3: Automatic Billing Authorization */}
          <div className="p-5 bg-white rounded-2xl border border-[#D9E4EC] space-y-2">
            <div className="flex items-center gap-2 font-extrabold text-[#243746] text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <CreditCard className="w-4 h-4 text-[#166534] shrink-0" />
              <span>3. Automatic Billing Authorization (Section 12.4) *</span>
              <span className="ml-auto text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ✓ Confirmed &amp; Authorized
              </span>
            </div>
            <p className="text-[#475569] leading-relaxed pl-6">
              I authorize AgeWellRI to automatically charge my saved payment
              method (or process my check payment) the flat monthly fee for my
              selected plan ($495 for Plan 1 / $295 for Plan 2) on a recurring
              basis. I understand I can cancel anytime by emailing{" "}
              <strong className="text-[#294B68]">agewellri@gmail.com</strong> or
              using my secure client dashboard.
            </p>
          </div>

          {/* Clause 4: Electronic Signature Consent */}
          <div className="p-5 bg-white rounded-2xl border border-[#D9E4EC] space-y-2">
            <div className="flex items-center gap-2 font-extrabold text-[#243746] text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <FileCheck className="w-4 h-4 text-[#5E8FB2] shrink-0" />
              <span>4. Electronic Signature Consent (E-SIGN / UETA) *</span>
              <span className="ml-auto text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ✓ Confirmed &amp; Agreed
              </span>
            </div>
            <p className="text-[#475569] leading-relaxed pl-6">
              I acknowledge and agree that my electronic signature attached
              below is legally binding and equivalent to a handwritten signature
              under the Electronic Signatures in Global and National Commerce
              Act (E-SIGN) and the Uniform Electronic Transactions Act (UETA).
            </p>
          </div>
        </div>
      </div>

      {/* 10. Dual E-Signatures Execution */}
      <div className="space-y-4">
        <div className="bg-[#243746] text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between">
          <span>9. Execution Electronic Signatures</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Client / Signer Signature Box */}
          <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
                {isRepresentative
                  ? "Authorized Representative Signature"
                  : "Client / Primary Resident Signature"}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Executed
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#D9E4EC] flex items-center justify-center min-h-[72px]">
              {agreement.clientSignature &&
              agreement.clientSignature.startsWith("data:image") ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={agreement.clientSignature}
                  alt="Signer Digital Signature"
                  className="h-14 w-auto max-w-full object-contain"
                />
              ) : (
                <p className="font-serif italic text-lg text-[#294B68]">
                  {agreement.clientSignature ||
                    signerLegalName ||
                    "Digital Signature On File"}
                </p>
              )}
            </div>

            <div className="text-xs space-y-1">
              <div className="font-bold text-[#243746] text-sm">
                {signerLegalName}
              </div>
              <div className="text-[11px] text-[#64748B]">
                Capacity:{" "}
                {isRepresentative
                  ? formatCapacity(
                      agreement.representativeCapacity ||
                        agreement.legalAuthority,
                    )
                  : "Primary Resident (Self)"}
              </div>
              <div className="text-[11px] text-[#64748B]">
                Date: {formattedDate}
              </div>
              <div className="text-[10px] text-emerald-700 font-bold pt-1">
                ✓ Verified Digital E-Signature (ESIGN / UETA Compliant)
              </div>
            </div>
          </div>

          {/* AgeWellRI Provider Counter-Signature Box */}
          <div className="p-5 bg-[#EBF8F2] rounded-2xl border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2E7D32] uppercase tracking-wider block">
                AgeWellRI Authorized Signatur
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-emerald-800 border border-emerald-300">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Authorized
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-emerald-200 flex items-center justify-center min-h-[72px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={OWNER_SIGNATURE_SVG_DATA_URI}
                alt="AgeWellRI Counter-Signature"
                className="h-12 w-auto max-w-full object-contain"
              />
            </div>

            <div className="text-xs space-y-1">
              <div className="font-bold text-[#243746] text-sm">
                {AGEWELL_OWNER_DETAILS.name}
              </div>
              <div className="text-[11px] text-[#64748B]">
                {AGEWELL_OWNER_DETAILS.title} &bull;{" "}
                {AGEWELL_OWNER_DETAILS.company}
              </div>
              <div className="text-[11px] text-[#64748B]">
                Location: {AGEWELL_OWNER_DETAILS.location} &bull; Date:{" "}
                {formattedDate}
              </div>
              <div className="text-[10px] text-emerald-700 font-bold pt-1">
                ✓ Verified Officer Counter-Signature On File
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Footer Disclaimer */}
      <div className="pt-6 border-t border-[#D9E4EC] text-center space-y-2">
        <p className="text-[11px] text-[#94A3B8]">
          &copy; 2026 AgeWellRI LLC • (401) 212-3002 • agewellri@gmail.com
        </p>
        <p className="text-[10px] text-[#CBD5E1]">
          Document Ref: {agreement.id || "AW-AG"} • Confidential Legal Record
        </p>
      </div>
    </div>
  );
}
