"use client";

import React from "react";
import Image from "next/image";
import {
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  FileCheck,
  Download,
} from "lucide-react";
import { AgreementDocument } from "@/redux/features/auth/authTypes";
import { AdminAgreementRecord } from "@/redux/features/client/clientApi";
import { formatPlanDuration } from "@/redux/features/plan/planTypes";
import { AgreementPdfData } from "@/lib/utils/agreement-pdf";
import {
  downloadAuthorityDocument,
} from "@/lib/utils/authority-document-download";

const AGEWELL_OWNER_DETAILS = {
  name: "Cory Poplaski",
  title: "Founder & Director ",
  company: "AgeWellRI LLC",
  phone: "(401) 212-3002",
  email: "agewellri@gmail.com",
};

const OWNER_SIGNATURE_SVG_DATA_URI ="/signature.png"

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
      <div className="text-center space-y-1.5 pb-6 border-b border-[#D9E4EC]">
        <div className="flex justify-center mb-2">
          <Image
            src="/logo.png"
            alt="AgeWellRI"
            width={200}
            height={50}
            priority
            className="h-auto w-auto max-h-11 object-contain"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746] tracking-tight">
          AGEWELLRI HYBRID SERVICES AGREEMENT 
        </h1>
        <p className="text-sm sm:text-base font-bold text-[#5E8FB2]">
          Company Name: © 2026 AgeWellRI LLC. All rights reserved. | Location: Westerly, Rhode Island
        </p>
       
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

      {/* Full 16-Section Legal Agreement Document */}
      <div className="space-y-6 pt-2">

        {/* 1. PARTIES, PLANS, & SCOPE OF SERVICE */}
        <div className="space-y-3">
          <div className="bg-[#243746] text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between">
            <span>1. PARTIES, PLANS, &amp; SCOPE OF SERVICE</span>
          </div>
          <div className="p-5 sm:p-6 bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl space-y-4 text-xs sm:text-sm text-[#475569] leading-relaxed">
            <p>
              This Hybrid Services Agreement (the &ldquo;Agreement&rdquo;) is entered into by and between <strong>AgeWellRI LLC</strong> (&ldquo;Company&rdquo;) and the undersigned client and/or responsible family representative (&ldquo;Client&rdquo;): <strong className="text-[#243746]">{clientFullName}</strong>, residing at <strong className="text-[#243746]">{fullAddress || "Address on file"}</strong>. Company agrees to provide its recurring monthly subscription services based on the specific plan tier selected by the Client below. Both tiers operate on a biweekly rotation consisting of two (2) scheduled home visits per calendar month spaced approximately two weeks apart.
            </p>

            <div className="p-4 bg-white rounded-xl border border-[#D9E4EC] space-y-3">
              <div className="text-xs font-bold text-[#243746]">
                [Client Must Check Exactly One Box to Select a Plan Tier]:
              </div>

              {/* Plan 1 */}
              <div className={`p-4 rounded-xl border transition-all ${
                agreement.planPrice === 295 || (agreement.planName || agreement.selectedPlan || "").toLowerCase().includes("safeguard") || (agreement.planName || agreement.selectedPlan || "").toLowerCase().includes("plan 1")
                  ? "bg-[#EAF3F8] border-[#294B68] text-[#243746]"
                  : "bg-slate-50 border-slate-200 text-slate-700"
              }`}>
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded border text-xs font-bold bg-white text-[#294B68] border-[#294B68]">
                    {agreement.planPrice === 295 || (agreement.planName || agreement.selectedPlan || "").toLowerCase().includes("safeguard") || (agreement.planName || agreement.selectedPlan || "").toLowerCase().includes("plan 1") ? "✓" : ""}
                  </span>
                  <span className="font-extrabold text-[#243746]">
                    PLAN 1: THE PREMIUM SAFETY SAFEGUARD (Environmental Safety Oversight Only)
                  </span>
                  {(agreement.planPrice === 295 || (agreement.planName || agreement.selectedPlan || "").toLowerCase().includes("safeguard") || (agreement.planName || agreement.selectedPlan || "").toLowerCase().includes("plan 1")) && (
                    <span className="ml-auto text-[10px] font-bold bg-[#294B68] text-white px-2 py-0.5 rounded-full">
                      Selected Plan
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-3 flex-wrap">
                  <p className="font-bold text-xs text-[#294B68]">
                    Rate: $295.00 per month.
                  </p>
                  <span className="text-[11px] font-bold text-[#5E8FB2] bg-white border border-[#D9E4EC] px-2 py-0.5 rounded-md">
                    Time: {formatPlanDuration(1)}
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed">
                  <strong>Scope:</strong> Each biweekly visit provides a dedicated, objective environmental safety assessment of the home. During the visit, an AgeWellRI specialist conducts a structured walkthrough of the home&apos;s key areas &mdash; stairs and circulation, bathrooms, exterior entry, bedrooms and living areas, life-safety systems, and kitchen and laundry &mdash; to identify fall risks, hazards, and safety concerns. The specialist documents each finding with photos, notes recommended corrections, generates a standardized residential safety report, and delivers it to the Client&apos;s designated family dashboard the same day. This plan may include the complimentary minor safety courtesies described in Section 7 (such as replacing a bulb, placing a plug-in nightlight, or securing a loose cord). It does not include the proactive hazard-clearing, item relocation, or expanded mitigation services offered under Plan 2, and does not include any general or routine housekeeping, laundry, meal preparation, or personal care of any kind.
                </p>
              </div>

              {/* Plan 2 */}
              <div className={`p-4 rounded-xl border transition-all ${
                agreement.planPrice === 495 || (agreement.planName || agreement.selectedPlan || "").toLowerCase().includes("independence") || (agreement.planName || agreement.selectedPlan || "").toLowerCase().includes("plan 2") || (agreement.planPrice !== 295 && !(agreement.planName || agreement.selectedPlan || "").toLowerCase().includes("safeguard"))
                  ? "bg-[#EAF3F8] border-[#294B68] text-[#243746]"
                  : "bg-slate-50 border-slate-200 text-slate-700"
              }`}>
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded border text-xs font-bold bg-white text-[#294B68] border-[#294B68]">
                    {agreement.planPrice === 495 || (agreement.planName || agreement.selectedPlan || "").toLowerCase().includes("independence") || (agreement.planName || agreement.selectedPlan || "").toLowerCase().includes("plan 2") || (agreement.planPrice !== 295 && !(agreement.planName || agreement.selectedPlan || "").toLowerCase().includes("safeguard")) ? "✓" : ""}
                  </span>
                  <span className="font-extrabold text-[#243746]">
                    PLAN 2: THE INDEPENDENCE &amp; UPKEEP PLAN (Comprehensive Home Safety Oversight &amp; Proactive Hazard Removal)
                  </span>
                  {(agreement.planPrice === 495 || (agreement.planName || agreement.selectedPlan || "").toLowerCase().includes("independence") || (agreement.planName || agreement.selectedPlan || "").toLowerCase().includes("plan 2") || (agreement.planPrice !== 295 && !(agreement.planName || agreement.selectedPlan || "").toLowerCase().includes("safeguard"))) && (
                    <span className="ml-auto text-[10px] font-bold bg-[#294B68] text-white px-2 py-0.5 rounded-full">
                      Selected Plan
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-3 flex-wrap">
                  <p className="font-bold text-xs text-[#294B68]">
                    Rate: ${agreement.planPrice ? `${agreement.planPrice}.00` : "495.00"} per month.
                  </p>
                  <span className="text-[11px] font-bold text-[#5E8FB2] bg-white border border-[#D9E4EC] px-2 py-0.5 rounded-md">
                    Time: Up to 2 hours
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed">
                  <strong>Scope:</strong> Each biweekly visit provides everything in Plan 1, plus proactive hazard clearing performed during the same visit. This includes: verifying and improving lighting at key entrances and along stairs, hallways, and walkways by swapping in brighter LED bulbs and placing plug-in, battery, or solar nightlights and motion lights (no wiring); clearing clutter and obstacles from walkways, hallways, stairs, and entryways to establish clear walking paths; applying anti-slip backing or tape to loose rugs, runners, and stair treads, non-slip strips to bare stairs and to tub and shower surfaces, and foam guards to sharp furniture corners; marking stair edges and steps with high-contrast non-slip tape, adding clear hot/cold water indicators, and applying easy-to-read overlays on stove and appliance controls; securing loose cords along baseboards with safety clips; stabilizing unstable furniture; at the resident&apos;s direction, moving critical items such as a cane, phone, or eyeglasses within safe reach, and relocating frequently used items from unsafe high or low storage to a safer, reachable height where it reduces a clear fall or strain hazard; manual testing and battery replacement for smoke and carbon monoxide alarms; checking fire-extinguisher condition and expiration dates; testing that emergency alert and medical-alert devices are charged and connected to the home Wi-Fi network; mounting lightweight fire extinguishers in high-risk areas; posting emergency contact cards and exit-route plans; checking that water temperature settings remain below 120&deg;F; and addressing an immediate wet-floor or spill-related slip hazard identified during the visit, such as drying the affected area or placing a temporary caution marker, so the hazard does not persist between visits. This plan does not include general or routine housekeeping, laundry, meal preparation, or personal care of any kind.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. PURPOSE, SCOPE OF ASSESSMENT, & OUTSIDE PERIMETER BOUNDARIES */}
        <div className="space-y-3">
          <div className="bg-[#243746] text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between">
            <span>2. PURPOSE, SCOPE OF ASSESSMENT, &amp; OUTSIDE PERIMETER BOUNDARIES</span>
          </div>
          <div className="p-5 sm:p-6 bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl space-y-3 text-xs sm:text-sm text-[#475569] leading-relaxed">
            <p>
              The Client authorizes AgeWellRI to photograph the interior and exterior of the home during visits for the sole purpose of documenting safety findings, and to include those photographs in the Client&apos;s visit reports. The assessment, the Age Safe&reg; Home Score&trade; and the report are generated by the Age Safe&reg; America app, and photographs and report data are stored on Age Safe&reg; America&apos;s secure infrastructure. AgeWellRI decides what is collected and photographed, obtains the Client&apos;s consent, and delivers the reports. Age Safe&reg; America is a technology provider to AgeWellRI and is not a party to this agreement. Photographs are limited to areas and conditions relevant to home safety; AgeWellRI does not photograph the resident&apos;s person, medical information, or unrelated personal effects, and does not use these photographs for marketing or any purpose other than delivering and administering the services, except with the Client&apos;s separate written consent. The Client acknowledges that email is not a fully secure medium and consents to receiving reports and photographs by email where that delivery method is used.
            </p>
            <p>
              <strong>Scope of Additional Hazard-Mitigation Services (Plan 2):</strong> The additional services provided under Plan 2 are strictly limited to the specific, non-medical, targeted hazard-clearing tasks described in Section 1, performed at the resident&apos;s direction where indicated. These services do not include deep structural restoration, hazardous mold remediation, heavy lifting, or chemical abatement, and do not include general or routine housekeeping, laundry, meal preparation, or personal care of any kind. Company shall not be held liable for normal wear-and-tear, pre-existing surface degradation, or minor, incidental cosmetic imperfections occurring during a hazard-clearing visit.
            </p>
            <p>
              <strong>Prioritized Hazard Mitigation (Plan 2):</strong> Where multiple hazards are identified during a visit, Company addresses the highest-risk items first within the scheduled time. Remaining lower-priority items are documented in the visit report and addressed, where practicable, at the next scheduled visit. Company does not warrant that the home is, or will remain, free of all hazards, and hazard mitigation under this Agreement is an ongoing, visit-by-visit process rather than a one-time guarantee.
            </p>
            <p>
              <strong>Outside Perimeter Boundaries:</strong> External property tasks are strictly restricted to ground-level debris clearing, light walkway sweeping, and the visual reporting of obvious exterior structural hazards. To comply with the Rhode Island Contractors&apos; Registration and Licensing Board (CRLB) rules, Company personnel are strictly prohibited from using ladders, applying commercial chemical pesticides, performing tree trimming, or executing any structural hardscape, masonry, or carpentry repairs.
            </p>
          </div>
        </div>

        {/* 3. EXCLUSION OF MEDICAL AND CLINICAL ADVICE */}
        <div className="space-y-3">
          <div className="bg-[#243746] text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between">
            <span>3. EXCLUSION OF MEDICAL AND CLINICAL ADVICE</span>
          </div>
          <div className="p-5 sm:p-6 bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl text-xs sm:text-sm text-[#475569] leading-relaxed">
            <p>
              AgeWellRI LLC is an environmental safety and consulting service. We do not provide medical diagnoses, clinical evaluations, physical therapy, occupational therapy, dispensing of medications, or any other form of professional healthcare services or advice. The reports, checklists, recommendations, and safety scores provided by AgeWellRI are not medical assessments and are not intended to substitute for professional clinical judgment, medical care, or qualified caregiver supervision. Clients are strongly advised to consult with their primary care physicians, licensed occupational therapists, or other qualified healthcare providers regarding specific physical limitations, mobility challenges, or physiological fall-risk factors. AgeWellRI does not provide personal care, homemaker services, or hands-on assistance with activities of daily living such as bathing, dressing, feeding, grooming, or mobility transfer.
            </p>
          </div>
        </div>

        {/* 4. NO GUARANTEE OR WARRANTY (ACCIDENT PREVENTION) */}
        <div className="space-y-3">
          <div className="bg-[#243746] text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between">
            <span>4. NO GUARANTEE OR WARRANTY (ACCIDENT PREVENTION)</span>
          </div>
          <div className="p-5 sm:p-6 bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl text-xs sm:text-sm text-[#475569] leading-relaxed">
            <p>
              While our structured assessment methodologies are designed to assist in identifying and mitigating environmental hazards, no residential environment can be rendered entirely accident-proof. AgeWellRI makes no representations, warranties, or guarantees&mdash;either express or implied&mdash;that implementing our recommendations, performing suggested modifications, or achieving any specific safety score will prevent future slips, trips, falls, bodily injuries, or other adverse incidents. Falls are multifactorial events influenced by environmental, behavioral, and physiological variables beyond the scope and control of this assessment.
            </p>
          </div>
        </div>

        {/* 5. IMPLEMENTATION AND THIRD-PARTY PROVIDERS */}
        <div className="space-y-3">
          <div className="bg-[#243746] text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between">
            <span>5. IMPLEMENTATION AND THIRD-PARTY PROVIDERS</span>
          </div>
          <div className="p-5 sm:p-6 bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl text-xs sm:text-sm text-[#475569] leading-relaxed">
            <p>
              Any recommendations, modifications, or product suggestions contained within our reports are for informational purposes only. The decision to act upon, modify, or ignore any portion of the report is made at the sole and absolute discretion, and risk, of the client. AgeWellRI does not perform structural home repairs, heavy construction, or complex plumbing/electrical installations. If the client chooses to engage third-party contractors, handymen, or other service providers to perform recommended modifications (such as installing wall-anchored grab bars, structural ramps, or dedicated lighting fixtures), AgeWellRI disclaims all liability and responsibility for the quality, safety, regulatory compliance, or efficacy of those third-party services or products.
            </p>
          </div>
        </div>

        {/* 5A. THIRD-PARTY CONTRACTOR REFERRALS */}
        <div className="space-y-3">
          <div className="bg-[#243746] text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between">
            <span>5A. THIRD-PARTY CONTRACTOR REFERRALS</span>
          </div>
          <div className="p-5 sm:p-6 bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl space-y-2.5 text-xs sm:text-sm text-[#475569] leading-relaxed">
            <p>
              Where AgeWellRI&apos;s safety assessment identifies work that requires a licensed trade or structural modification &mdash; such as anchoring grab bars, installing ramps, or performing plumbing, electrical, or carpentry work &mdash; AgeWellRI does not perform that work. As a convenience only, AgeWellRI may provide the Client with the names of local contractors for the Client&apos;s consideration.
            </p>
            <p>
              <strong>Independent Third Parties:</strong> Any contractor referenced by AgeWellRI is an independent third party and is not an employee, agent, partner, joint venturer, or subcontractor of AgeWellRI. AgeWellRI does not employ, supervise, direct, or control any contractor&apos;s work.
            </p>
            <p>
              <strong>No Guarantee or Warranty of Contractors:</strong> AgeWellRI does not guarantee, warrant, or assume responsibility for the licensing, registration, insurance, workmanship, quality, safety, pricing, timeliness, regulatory compliance, or conduct of any contractor &mdash; whether that contractor was named by AgeWellRI or selected independently by the Client. The Client is responsible for verifying a contractor&apos;s license, registration, and insurance before hiring.
            </p>
            <p>
              <strong>Client&apos;s Sole Decision:</strong> The decision to hire any contractor, and all agreements, payments, and dealings with that contractor, are solely between the Client and the contractor, entered into at the Client&apos;s own risk. AgeWellRI is not a party to any agreement between the Client and any contractor.
            </p>
            <p>
              <strong>No Referral Compensation:</strong> AgeWellRI receives no fee, commission, or other compensation in exchange for referring any contractor, unless such an arrangement is separately and expressly disclosed to the Client in writing.
            </p>
            <p>
              <strong>Release:</strong> To the fullest extent permitted by law, the Client releases and holds harmless AgeWellRI (and its owners, employees, and agents) from any liability, claim, demand, or damage &mdash; including property damage or personal injury &mdash; arising out of or relating to work performed, or not performed, by any third-party contractor, whether recommended by AgeWellRI or sourced independently by the Client. This release does not apply to loss or injury caused by AgeWellRI&apos;s own gross negligence, recklessness, or willful misconduct.
            </p>
          </div>
        </div>

        {/* 6. LIMITATION OF LIABILITY AND RELEASE */}
        <div className="space-y-3">
          <div className="bg-[#243746] text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between">
            <span>6. LIMITATION OF LIABILITY AND RELEASE</span>
          </div>
          <div className="p-5 sm:p-6 bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl text-xs sm:text-sm text-[#475569] leading-relaxed">
            <p>
              By accepting, accessing, or utilizing the AgeWellRI report, checklist, or scoring data, and by receiving services under this Agreement, the Client acknowledges that reliance on this information, and receipt of these services, is at the Client&apos;s own risk. AgeWellRI does not guarantee absolute home safety, fall prevention, or any specific health outcome, and does not provide continuous or real-time remote monitoring. Except as stated below, AgeWellRI is not liable for any direct, indirect, incidental, consequential, special, or compensatory damages, including personal injury, property damage, or medical expenses, arising from latent or undetected hazards, the implementation or omission of any recommendation, or any slip, trip, fall, or medical emergency on the property, except to the extent directly caused by AgeWellRI&apos;s own negligence. AgeWellRI&apos;s total liability for any claim arising out of this Agreement is limited to the fees paid in the calendar month the claim arose. These limitations do not apply to AgeWellRI&apos;s gross negligence, recklessness, or willful misconduct, or to liability that cannot be limited under applicable law.
            </p>
          </div>
        </div>

        {/* 7. LIABILITY DISCLAIMER: COMPLIMENTARY SAFETY & CONVENIENCE ADJUSTMENTS */}
        <div className="space-y-3">
          <div className="bg-[#243746] text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between">
            <span>7. LIABILITY DISCLAIMER: COMPLIMENTARY SAFETY &amp; CONVENIENCE ADJUSTMENTS</span>
          </div>
          <div className="p-5 sm:p-6 bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl space-y-2.5 text-xs sm:text-sm text-[#475569] leading-relaxed">
            <p>
              <strong>Scope of Complimentary Adjustments:</strong> All complimentary, low-impact adjustments (including, but not limited to, replacing standard lightbulbs, installing plug-in or adhesive nightlights, replacing surface cabinet hardware, securing exposed electrical cords with safety clips, and swapping minor convenience fixtures) are provided strictly as a gratuitous safety courtesy and do not constitute professional construction, carpentry, plumbing, or electrical contracting services. No separate labor or installation fees are assessed for these minor adjustments.
            </p>
            <p>
              <strong>No-Load Bearing Limitation:</strong> AgeWellRI does not install heavy, load-bearing safety equipment (including wall-anchored grab bars, structural transfer poles, or wall-mounted shower benches) under this courtesy service. The client explicitly agrees that no low-impact convenience adjustment made by AgeWellRI is designed, intended, or structurally certified to support a human being&apos;s body weight.
            </p>
            <p>
              <strong>Waiver of Liability:</strong> While AgeWellRI exercises reasonable care and certified safety practices in performing these minor convenience adjustments, the Client hereby releases, waives, and forever discharges AgeWellRI (along with its officers, employees, and agents) from any and all liability, claims, demands, or causes of action arising out of property damage, personal injury, or accidental falls associated with the use, wear-and-tear, structural failure, or placement of any complimentary items installed. This release does not apply to loss or injury caused by AgeWellRI&apos;s gross negligence, recklessness, or willful misconduct.
            </p>
            <p>
              <strong>Product Warranties:</strong> AgeWellRI does not manufacture the convenience items used (such as LED bulbs, safety nightlights, or adhesive clips) and provides no independent warranty, express or implied, regarding the performance, lifespan, or mechanical defects of third-party products.
            </p>
            <p>
              <strong>Right of Refusal:</strong> AgeWellRI reserves the absolute right to decline any minor adjustment request if, in the technician&apos;s professional judgment, the installation would require a licensed trade, alter the structural integrity of the home, or present an unforeseen safety hazard.
            </p>
          </div>
        </div>

        {/* 8. FOOD & KITCHEN SAFETY MONITORING */}
        <div className="space-y-3">
          <div className="bg-[#243746] text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between">
            <span>8. FOOD &amp; KITCHEN SAFETY MONITORING</span>
          </div>
          <div className="p-5 sm:p-6 bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl space-y-2 text-xs sm:text-sm text-[#475569] leading-relaxed">
            <p>
              As part of our environmental safety monitoring, technicians may perform a visual, non-invasive check of readily accessible kitchen, refrigerator, and pantry areas to identify visibly spoiled, expired, or molding food items. AgeWellRI&apos;s role is limited to observation and reporting. Where technicians identify items that appear spoiled or expired, they will note the observation in the digital visit report and, where appropriate, notify the resident and/or the designated family contact so that the resident or family may decide whether to remove or discard the item. Technicians do not remove, discard, or dispose of the resident&apos;s food, medications, or other property under this Agreement, and do not open, move, or handle items beyond what is necessary for a visual check.
            </p>
            <p>
              To the fullest extent permitted by law, the Client releases AgeWellRI (and its officers, employees, and agents) from liability for foodborne illness, food spoilage, or any related illness arising from the condition of food in the home, and acknowledges that decisions to keep, remove, or discard any food item rest solely with the resident and their family. This release does not apply to loss or injury caused by AgeWellRI&apos;s gross negligence, recklessness, or willful misconduct.
            </p>
          </div>
        </div>

        {/* 9. MONTHLY RATE, CHECK PARITY, & RECURRING AUTO-BILLING TERMS */}
        <div className="space-y-3">
          <div className="bg-[#243746] text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between">
            <span>9. MONTHLY RATE, CHECK PARITY, &amp; RECURRING AUTO-BILLING TERMS</span>
          </div>
          <div className="p-5 sm:p-6 bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl space-y-2 text-xs sm:text-sm text-[#475569] leading-relaxed">
            <p>
              <strong>Subscription Rate:</strong> Client authorizes Company to securely store their billing credentials on file and automatically process a recurring flat charge corresponding to their selected tier: $295.00 per month for Plan 1 OR $495.00 per month for Plan 2.
            </p>
            <p>
              <strong>Service Commencement:</strong> Regardless of the date on which the Client signs up, service and billing begin on the first (1st) day of the calendar month following sign-up. The Client&apos;s first automatic charge will process on that date for that month&apos;s scheduled biweekly visits, and recurring monthly billing will continue on the 1st of each calendar month thereafter. No charge is made, and no visits are scheduled, for the partial month in which the Client signs up.
            </p>
            <p>
              <strong>Automatic Processing:</strong> Payment is processed automatically and in advance on the 1st day of each calendar month for that upcoming month&apos;s scheduled biweekly services.
            </p>
            <p>
              <strong>Advance Billing Notification:</strong> As a matter of Company policy, Company&apos;s automated accounting system will issue an electronic notice (via email or SMS text statement) to Client fifteen (15) days prior to the end of each calendar month. This notice will detail the upcoming charge amount and explicitly state the processing date for the next month&apos;s service.
            </p>
            <p>
              <strong>Payment Method Parity:</strong> As a matter of AgeWellRI policy, clients who pay their recurring balance by physical or paper check receive the same base subscription rate as clients paying by credit card or ACH, with no penalty fee or processing surcharge for choosing check payment.
            </p>
            <p>
              <strong>Explicit Auto-Renewal Terms:</strong> Client acknowledges that this Agreement involves an automatically renewing monthly subscription ($295.00/month for Plan 1 or $495.00/month for Plan 2). Services and recurring auto-billing will continue on the 1st of each calendar month until affirmatively canceled by the Client or Company in accordance with Section 10.
            </p>
          </div>
        </div>

        {/* 10. CLIENT CANCELLATION & RISK TERMINATION POLICY */}
        <div className="space-y-3">
          <div className="bg-[#243746] text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between">
            <span>10. CLIENT CANCELLATION &amp; RISK TERMINATION POLICY</span>
          </div>
          <div className="p-5 sm:p-6 bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl space-y-2 text-xs sm:text-sm text-[#475569] leading-relaxed">
            <p>
              <strong>Right to Cancel:</strong> Client may cancel this Agreement at any time by submitting a request via email to agewellri@gmail.com or through the client dashboard. A cancellation request is deemed received, and Company will begin processing it, immediately upon submission. A Client who cancels before their service commencement date under Section 9 owes nothing and is not subject to the notice period below, since no charge has yet processed and no services have yet been scheduled.
            </p>
            <p>
              <strong>Standard Cancellation Window:</strong> To prevent an automated recurring charge on the 1st of the upcoming month, Client&apos;s cancellation request must be submitted at least ten (10) days prior to the end of the current calendar month. If a cancellation request is received fewer than 10 days before the month&apos;s end, the upcoming monthly charge will process as scheduled, and services will permanently conclude at the end of that final paid month.
            </p>
            <p>
              <strong>Permanent Medical Exit Provision:</strong> In the event of a sudden, unexpected health change resulting in the senior resident being permanently placed into a hospital, skilled nursing rehabilitation facility, or long-term care community, the standard 10-day notice is completely waived. Upon receiving verifiable written notice or proof of facility admission, Company will immediately halt all future recurring auto-billing and issue a prorated refund for any unrendered service visits remaining in that active billing cycle.
            </p>
            <p>
              <strong>Rescheduling &amp; Missed Visits:</strong> Client must provide a minimum of forty-eight (48) hours&apos; notice to temporarily reschedule a biweekly block. Missed visits without 48 hours&apos; notice will not be rescheduled or refunded and will be documented as missed. Company reserves the right to utilize its open evening and Saturday overflow windows to accommodate weather-related, municipal state-of-emergency, or medical reschedules.
            </p>
          </div>
        </div>

        {/* 11. PAPER INVOICE COMPLIANCE (RHODE ISLAND ONLY) */}
        <div className="space-y-3">
          <div className="bg-[#243746] text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between">
            <span>11. PAPER INVOICE COMPLIANCE (RHODE ISLAND ONLY)</span>
          </div>
          <div className="p-5 sm:p-6 bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl text-xs sm:text-sm text-[#475569] leading-relaxed">
            <p>
              In strict compliance with the Rhode Island Senior Savings Protection Act (R.I. Gen. Laws &sect; 6-40.1-2), if the Client or senior resident is sixty-five (65) years of age or older and requests a printed, physical paper invoice sent via United States Postal Service mail rather than electronic delivery, Company will provide such physical mailings completely free of charge. No handling, processing, environmental, or printing fees will ever be applied to physical mailings.
            </p>
          </div>
        </div>

        {/* 12. REQUIRED INTERACTIVE SECTIONS */}
        <div className="space-y-3">
          <div className="bg-[#243746] text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between">
            <span>12. Required Authorizations </span>
          </div>
          <div className="p-5 sm:p-6 bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl space-y-4 text-xs sm:text-sm text-[#475569]">
           

            <div className="p-4 bg-white rounded-xl border border-[#D9E4EC] space-y-2.5">
            

              <div className="pt-2.5 border-t border-slate-100">
                <strong className="text-[#243746] block text-xs sm:text-sm">Section 12.2: Emergency Right of Entry Authorization</strong>
                <p className="mt-1 pl-2 text-xs leading-relaxed">
                  <strong>EMERGENCY ACCESS AGREEMENT:</strong> Regardless of the selection made in Section 12.1, the Client explicitly grants AgeWellRI LLC the right to enter the home during a scheduled visit window if the technician has a reasonable belief that a medical emergency or safety crisis is occurring inside (e.g., viewing a resident fallen on the floor through a window, or hearing cries for help). I authorize AgeWellRI LLC to utilize any available key/code, contact emergency services (911), or follow instructions from designated family contacts. AgeWellRI LLC and its technicians shall be held completely harmless for any property damage (such as forced entry) or liabilities resulting from responding to a suspected medical or safety emergency in good faith, except to the extent caused by AgeWellRI’s gross negligence, recklessness, or willful misconduct.
                </p>
              </div>

              <div className="pt-2.5 border-t border-slate-100">
                <strong className="text-[#243746] block text-xs sm:text-sm">Section 12.3: Resident Autonomy & Refusal Acknowledgment </strong>
                <p className="mt-1 pl-2 text-xs leading-relaxed">
                  <strong>RESIDENT BOUNDARIES ACKNOWLEDGMENT:</strong> Client acknowledges that AgeWellRI LLC technicians prioritize the dignity, comfort, and personal boundaries of all residents. If a resident explicitly refuses entry, objects to a specific safety checklist item, or requests that a technician leave a specific area during a scheduled visit, our technicians will immediately respect those boundaries and cease that portion of the service. Client agrees that such a refusal by the resident does not constitute a breach of contract by AgeWellRI LLC, and that the standard visit fee will still apply in full. Company is not liable for accidents or injuries caused by a hazard that remains in place solely because the resident declined to have it addressed, except to the extent caused by Company's gross negligence, recklessness, or willful misconduct.
                </p>
              </div>

              <div className="pt-2.5 border-t border-slate-100">
                <strong className="text-[#243746] block text-xs sm:text-sm">Section 12.4: Automatic Billing Authorization</strong>
                <p className="mt-1 pl-2 text-xs leading-relaxed">
                  <strong>AUTOMATED MONTHLY CHARGE AUTHORIZATION:</strong> I authorize AgeWellRI LLC to automatically charge my saved digital payment method or process my submitted check payment for the flat monthly fee corresponding to my selected tier ($295.00 for Plan 1 / $495.00 for Plan 2) on a recurring basis. I understand I can cancel this subscription at any time by emailing agewellri@gmail.com or utilizing my secure client dashboard portal link.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 13. PRIVACY AND CONFIDENTIALITY */}
        <div className="space-y-3">
          <div className="bg-[#243746] text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between">
            <span>13. PRIVACY AND CONFIDENTIALITY &amp; OPERATIONAL POLICIES</span>
          </div>
          <div className="p-5 sm:p-6 bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl space-y-3 text-xs sm:text-sm text-[#475569] leading-relaxed">
            <p>
              Client information is collected solely to deliver services and optimize home routing safety. It is never shared, sold, or disclosed to third-party marketing entities without explicit written consent except as required by law. Visit reports and digital dashboards are securely accessible only to the client and designated family care team members. Technicians must always maintain strict client confidentiality.
            </p>
            <p>
              <strong>13A. CLIENT REPRESENTATIONS &amp; INDEMNIFICATION:</strong> The Client represents that all information the Client provides to AgeWellRI &mdash; including entry codes, contact information, the identity and authority of any representative, and details about the home and its occupants &mdash; is accurate and complete. To the fullest extent permitted by law, the Client agrees to indemnify and hold harmless AgeWellRI (and its owners, employees, and agents) from any claim, loss, or cost arising from inaccurate, incomplete, or outdated information the Client provides, including entry to an incorrect location or reliance on a representative who lacked actual authority. This indemnity does not apply to loss or injury caused by AgeWellRI&apos;s gross negligence, recklessness, or willful misconduct.
            </p>
            <p>
              <strong>13B. FORCE MAJEURE &amp; INABILITY TO PERFORM:</strong> AgeWellRI is not in breach of this Agreement, and is not liable for any delay or failure to perform a scheduled visit, where performance is prevented or delayed by circumstances beyond its reasonable control &mdash; including severe weather, natural disaster, a declared state of emergency, public-health emergency, loss of utilities or access, or the illness or incapacity of its personnel. Where a visit cannot be performed for such a reason, AgeWellRI will make reasonable efforts to reschedule the visit within a reasonable time, or, if the visit cannot be rescheduled within the billing cycle, to credit or prorate the affected visit. This provision does not relieve the Client of payment obligations for services actually rendered.
            </p>
            <p>
              <strong>13C. CONSENT TO PHOTOGRAPH &amp; SHARE REPORTS:</strong> The Client authorizes AgeWellRI to photograph the interior and exterior of the home during visits for the sole purpose of documenting safety findings, and to include those photographs in the Client&apos;s visit reports. Reports and photographs are created and processed using the Age Safe&reg; America platform, stored in the Client&apos;s secure client portal, and, at the Client&apos;s request or as needed, delivered to the Client and their Authorized Recipients by email. Photographs are limited to areas and conditions relevant to home safety; AgeWellRI does not photograph the resident&apos;s person, medical information, or unrelated personal effects, and does not use these photographs for marketing or any purpose other than delivering and administering the services, except with the Client&apos;s separate written consent. The Client acknowledges that email is not a fully secure medium and consents to receiving reports and photographs by email where that delivery method is used.
            </p>
            <p>
              <strong>13D. AUTHORIZED REPORT RECIPIENTS:</strong> The Client designates, during sign-up and as updated from time to time, the specific family members, caregivers, or trusted contacts authorized to receive the Client&apos;s visit reports, photographs, and safety information (the &ldquo;Authorized Recipients&rdquo;). AgeWellRI will share reports and related information only with the Client and the Authorized Recipients, except as required by law or as described in Section 12.2 (emergency response). It is the Client&apos;s responsibility to keep the list of Authorized Recipients current, and to notify AgeWellRI promptly of any change or removal.
            </p>
            <p>
              <strong>13E. DATA RETENTION &amp; DELETION:</strong> AgeWellRI retains the Client&apos;s reports, photographs, and account information for the duration of the service relationship and for a reasonable period afterward to meet legal, tax, and recordkeeping obligations, after which such data is deleted or de-identified in the ordinary course. Entry codes and similar access credentials are deleted promptly following cancellation of service or removal of keypad/smart-lock access. Upon written request, and subject to applicable law, the Client may request a copy of, or the deletion of, their personal information.
            </p>
            <p>
              <strong>13F. COMPANY RIGHT TO TERMINATE FOR CAUSE:</strong> In addition to the Client&apos;s cancellation rights under Section 10, AgeWellRI may suspend or terminate service, effective upon written notice, for cause &mdash; including non-payment, abusive or threatening conduct toward AgeWellRI personnel, conditions in or around the home that are unsafe for personnel to work in, or the Client&apos;s material breach of this Agreement. Where AgeWellRI terminates for cause other than non-payment or safety, it will refund any prepaid fees for visits not yet rendered in the then-current billing cycle.
            </p>
            <p>
              <strong>13G. FAILED OR NON-PAYMENT:</strong> If a scheduled automatic payment fails or is declined, AgeWellRI will notify the Client and may attempt to process the payment again. If payment is not successfully completed within a reasonable grace period after notice, AgeWellRI may pause scheduled visits until the balance is resolved, and may terminate service for continued non-payment under Section 13F. Paused or missed visits resulting from non-payment are not owed or refundable, and service resumes once payment is current.
            </p>
          </div>
        </div>

        {/* 14. CLIENT COMPLAINTS */}
        <div className="space-y-3">
          <div className="bg-[#243746] text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between">
            <span>14. CLIENT COMPLAINTS</span>
          </div>
          <div className="p-5 sm:p-6 bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl space-y-2.5 text-xs sm:text-sm text-[#475569] leading-relaxed">
            <p>
              AgeWellRI is committed to resolving any concern about our services promptly and fairly. If you have a complaint, please contact us first so we can address it directly: <strong>AgeWellRI &mdash; Client Concerns. Phone: (401) 212-3002. Email: agewellri@gmail.com.</strong>
            </p>
            <p>
              We will acknowledge your complaint within three (3) business days and work in good faith to resolve it. Please describe the concern, the visit or service involved, and the outcome you&apos;re seeking, so we can respond as quickly as possible.
            </p>
            <p>
              If we are unable to resolve your concern directly, Rhode Island consumers may contact the Rhode Island Office of the Attorney General, Consumer Protection Unit, which enforces the Rhode Island Deceptive Trade Practices Act (R.I. Gen. Laws Chapter 6-13.1). This provision does not limit any right or remedy available to you under law.
            </p>
          </div>
        </div>

        {/* 15. DISPUTE RESOLUTION, SEVERABILITY, & GOVERNING LAW */}
        <div className="space-y-3">
          <div className="bg-[#243746] text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between">
            <span>15. DISPUTE RESOLUTION, SEVERABILITY, &amp; GOVERNING LAW</span>
          </div>
          <div className="p-5 sm:p-6 bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl space-y-2 text-xs sm:text-sm text-[#475569] leading-relaxed">
            <p>
              Both parties agree to a good-faith resolution process before initiating any legal action, and mandatory mediation before formal litigation. This agreement is governed by and construed under the laws of the State of Rhode Island. This agreement supersedes all prior communications, verbal representations, or early text message drafts. Amendments require the express written consent of both parties. AgeWellRI LLC may update general terms with 30 days&apos; notice; continued enrollment following notice constitutes acceptance of updated terms.
            </p>
            <p>
              <strong>Severability:</strong> If any provision or portion of this Agreement is held to be invalid, illegal, or unenforceable by a court of competent jurisdiction, such provision shall be severed or modified to the minimum extent necessary, and the remaining provisions of this Agreement shall continue in full force and effect.
            </p>
          </div>
        </div>

        {/* 16. SIGNATURES */}
        <div className="space-y-4 pt-2">
          <div className="bg-[#243746] text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between">
            <span>16. SIGNATURES &amp; EXECUTION</span>
            <span className="text-xs font-normal text-slate-200">
              {isRepresentative ? "Track B: Representative Signing" : "Track A: Resident Signing"}
            </span>
          </div>

          <p className="text-xs text-[#64748B]">
            This Agreement is signed electronically through AgeWellRI&apos;s online client portal. One of the two signature tracks below applies, depending on who is signing.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Client / Signer Signature Box */}
            <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
                  {isRepresentative
                    ? "Track B — Representative Signature"
                    : "Track A — Resident Signature"}
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
                {isRepresentative ? (
                  <>
                    <div className="text-[11px] text-[#64748B]">
                      Signing Capacity:{" "}
                      <strong>
                        {formatCapacity(
                          agreement.representativeCapacity ||
                            agreement.legalAuthority,
                        )}
                      </strong>
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      On behalf of Resident: <strong>{clientFullName}</strong>
                    </div>
                  </>
                ) : (
                  <div className="text-[11px] text-[#64748B]">
                    Capacity: <strong>Primary Resident (Self-Signer)</strong>
                  </div>
                )}
                <div className="text-[11px] text-[#64748B]">
                  Date: {formattedDate}
                </div>
                {/* <div className="text-[10px] text-emerald-700 font-bold pt-1">
                  ✓ Verified Digital E-Signature (ESIGN / UETA Compliant)
                </div> */}
              </div>
            </div>

            {/* AgeWellRI Provider Counter-Signature Box */}
            <div className="p-5 bg-[#EBF8F2] rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2E7D32] uppercase tracking-wider block">
                  AgeWellRI Authorized Signature
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
                  className="h-16 w-[200px] max-w-full object-contain"
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
              
                {/* <div className="text-[10px] text-emerald-700 font-bold pt-1">
                  ✓ Verified Officer Counter-Signature On File
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Footer Disclaimer */}
      <div className="pt-6 border-t border-[#D9E4EC] text-center space-y-2">
        <p className="text-[11px] text-[#94A3B8]">
         © 2026 AgeWellRI LLC. All rights reserved. • (401) 212-3002 • agewellri@gmail.com
        </p>
        {/* <p className="text-[10px] text-[#CBD5E1]">
          Document Ref: {agreement.id || "AW-AG"} • Confidential Legal Record
        </p> */}
      </div>
    </div>
  );
}
