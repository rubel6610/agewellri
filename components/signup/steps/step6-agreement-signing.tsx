"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  UserCheck,
  UploadCloud,
  FileCheck,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Download,
} from "lucide-react";
import { useUploadAuthorityDocumentMutation } from "@/redux/features/agreement/agreementApi";
import { downloadAuthorityDocument } from "@/lib/utils/authority-document-download";
import { formatPlanDuration } from "@/redux/features/plan/planTypes";

interface Point {
  x: number;
  y: number;
}

const AGEWELL_OWNER_DETAILS = {
  name: "Cory Poplaski",
  title: "Founder",
  company: "AgeWellRI LLC",
  location: "Westerly, RI",
};

const OWNER_SIGNATURE_SVG_DATA_URI ="/signature.png"

interface Step6AgreementSigningProps {
  planDetails: {
    planName: string;
    planPrice: number;
    billingInterval: string;
    totalVisits: number;
    times?: string;
  };
  residentDetails: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
    email: string;
  };
  accountHolder: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  initialData?: {
    signingTrack: "TRACK_A" | "TRACK_B";
    residentPrintedName?: string;
    repFullName?: string;
    repCapacity?: "ATTORNEY_IN_FACT" | "GUARDIAN" | "CONSERVATOR" | null;
    repRelationship?: string;
    authorityDocumentUrl?: string | null;
    authorityDocumentName?: string | null;
    agreementDate?: string;
    signatureDataUrl?: string;
    consentElectronicSignature?: boolean;
  };
  onSave: (signingData: {
    signingTrack: "TRACK_A" | "TRACK_B";
    residentPrintedName: string;
    repFullName?: string;
    repCapacity?: "ATTORNEY_IN_FACT" | "GUARDIAN" | "CONSERVATOR" | null;
    repRelationship?: string;
    authorityDocumentUrl?: string | null;
    authorityDocumentName?: string | null;
    agreementDate: string;
    signatureDataUrl: string;
    consentElectronicSignature: boolean;
  }) => void;
  onBack: () => void;
}

export function Step6AgreementSigning({
  planDetails,
  residentDetails,
  accountHolder,
  initialData,
  onSave,
  onBack,
}: Step6AgreementSigningProps) {
  const [uploadAuthorityDoc, { isLoading: isUploadingDoc }] =
    useUploadAuthorityDocumentMutation();

  const todayStr = new Date().toISOString().split("T")[0];

  const [signingTrack, setSigningTrack] = useState<"TRACK_A" | "TRACK_B">(
    initialData?.signingTrack || "TRACK_A",
  );

  // Track A states
  const [residentPrintedName, setResidentPrintedName] = useState(
    initialData?.residentPrintedName || residentDetails.fullName,
  );

  // Track B states
  const [repFullName, setRepFullName] = useState(
    initialData?.repFullName ||
      `${accountHolder.firstName} ${accountHolder.lastName}`.trim(),
  );
  const [repCapacity, setRepCapacity] = useState<
    "ATTORNEY_IN_FACT" | "GUARDIAN" | "CONSERVATOR"
  >(initialData?.repCapacity || "ATTORNEY_IN_FACT");
  const [repRelationship, setRepRelationship] = useState(
    initialData?.repRelationship || "Power of Attorney / Family Member",
  );
  const [authorityDocumentUrl, setAuthorityDocumentUrl] = useState<
    string | null
  >(initialData?.authorityDocumentUrl || null);
  const [authorityDocumentName, setAuthorityDocumentName] = useState<
    string | null
  >(initialData?.authorityDocumentName || null);

  // Common signing states
  const [agreementDate, setAgreementDate] = useState(
    initialData?.agreementDate || todayStr,
  );
  const [consentElectronicSignature, setConsentElectronicSignature] = useState(
    initialData?.consentElectronicSignature ?? false,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Canvas signature states
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(
    !!initialData?.signatureDataUrl,
  );
  const lastPointRef = useRef<Point | null>(null);

  // Canvas setup & redraw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI displays
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.strokeStyle = "#1E374D";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // If existing signature exists
    if (initialData?.signatureDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = initialData.signatureDataUrl;
    }
  }, [initialData?.signatureDataUrl]);

  const getCanvasCoordinates = (
    e: React.MouseEvent | React.TouchEvent,
  ): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const coords = getCanvasCoordinates(e);
    if (!coords) return;
    setIsDrawing(true);
    lastPointRef.current = coords;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getCanvasCoordinates(e);
    if (!coords || !lastPointRef.current) return;

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    lastPointRef.current = coords;
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasSignature(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size <= 15MB
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage("The uploaded file exceeds the maximum 15MB limit.");
      return;
    }

    setErrorMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("authorityDocument", file);

    try {
      const res = await uploadAuthorityDoc(formData).unwrap();
      if (res?.success && res?.data?.fileUrl) {
        setAuthorityDocumentUrl(res.data.fileUrl);
        setAuthorityDocumentName(res.data.originalName || file.name);
      } else {
        setErrorMessage(res?.message || "Failed to upload authority document.");
      }
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message ||
          err?.message ||
          "Error uploading authority document.",
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const printedName =
      signingTrack === "TRACK_A"
        ? residentPrintedName.trim()
        : repFullName.trim();

    if (!printedName) {
      setErrorMessage("Please enter the printed legal name.");
      return;
    }

    if (signingTrack === "TRACK_B") {
      if (!authorityDocumentUrl) {
        setErrorMessage(
          "Representative / Power of Attorney signing requires uploading a legal authority document (POA, Guardianship, or Conservatorship order).",
        );
        return;
      }
    }

    if (!hasSignature || !canvasRef.current) {
      setErrorMessage("Please draw your signature in the signature box below.");
      return;
    }

    if (!consentElectronicSignature) {
      setErrorMessage(
        "Please acknowledge the electronic signature consent checkbox before proceeding.",
      );
      return;
    }

    const signatureDataUrl = canvasRef.current.toDataURL("image/png");

    onSave({
      signingTrack,
      residentPrintedName: printedName,
      repFullName: signingTrack === "TRACK_B" ? repFullName.trim() : undefined,
      repCapacity: signingTrack === "TRACK_B" ? repCapacity : null,
      repRelationship:
        signingTrack === "TRACK_B" ? repRelationship.trim() : undefined,
      authorityDocumentUrl:
        signingTrack === "TRACK_B" ? authorityDocumentUrl : null,
      authorityDocumentName:
        signingTrack === "TRACK_B" ? authorityDocumentName : null,
      agreementDate: todayStr,
      signatureDataUrl,
      consentElectronicSignature,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EAF3F8] text-[#294B68] text-xs font-bold uppercase tracking-wider">
          Step 6 of 9
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
          Review &amp; Sign Service Agreement
        </h2>
        <p className="text-sm text-[#5E8FB2] max-w-lg mx-auto">
          Please review the AgeWellRI Service Agreement terms below and execute
          the agreement with your digital signature.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-sm space-y-7"
      >
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Scrollable Agreement Viewer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#294B68]" /> Service Agreement Document (RI)
            </span>
            <span className="text-[11px] text-[#5E8FB2] font-semibold">
              Scroll to read full terms
            </span>
          </div>

          <div className="h-80 sm:h-96 overflow-y-auto p-5 sm:p-6 bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl text-xs text-[#475569] leading-relaxed space-y-5 font-sans select-text border-dashed shadow-inner">
            {/* Agreement Header */}
            <div className="text-center pb-4 border-b border-[#D9E4EC] space-y-1">
              <h4 className="font-extrabold text-sm sm:text-base text-[#243746] tracking-tight">
                AGEWELLRI HYBRID SERVICES AGREEMENT
              </h4>
              <p className="text-xs font-bold text-[#5E8FB2]">
                Company Name: © 2026 AgeWellRI LLC. All rights reserved. | Location: Westerly, Rhode Island - 02891
              </p>
              {/* <p className="text-[11px] text-[#64748B]">
                Jurisdiction: State of Rhode Island &bull; Active Version 2.0
              </p> */}
            </div>

            {/* 1. PARTIES, PLANS, & SCOPE OF SERVICE */}
            <div className="space-y-3">
              <div className="font-extrabold text-sm text-[#243746] bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
                1. PARTIES, PLANS, &amp; SCOPE OF SERVICE
              </div>
              <p>
                This Hybrid Services Agreement (the &ldquo;Agreement&rdquo;) is entered into by and between <strong>AgeWellRI LLC</strong> (&ldquo;Company&rdquo;) and the undersigned client and/or responsible family representative (&ldquo;Client&rdquo;): <strong className="text-[#243746]">{residentDetails.fullName || "Client Member"}</strong>, residing at <strong className="text-[#243746]">{residentDetails.address ? `${residentDetails.address}, ${residentDetails.city}, ${residentDetails.state || "RI"} ${residentDetails.postalCode}` : "Address on file"}</strong>. Company agrees to provide its recurring monthly subscription services based on the specific plan tier selected by the Client below. Both tiers operate on a biweekly rotation consisting of two (2) scheduled home visits per calendar month spaced approximately two weeks apart.
              </p>

              <div className="p-3.5 bg-white rounded-xl border border-[#D9E4EC] space-y-3">
                <div className="text-xs font-bold text-[#243746]">
                  [Client Must Check Exactly One Box to Select a Plan Tier]:
                </div>

                {/* Plan 1 */}
                <div className={`p-3 rounded-lg border transition-all ${
                  planDetails.planPrice === 295 || planDetails.planName.toLowerCase().includes("safeguard") || planDetails.planName.toLowerCase().includes("plan 1")
                    ? "bg-[#EAF3F8] border-[#294B68] text-[#243746]"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}>
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded border text-[10px] font-bold bg-white text-[#294B68] border-[#294B68]">
                      {planDetails.planPrice === 295 || planDetails.planName.toLowerCase().includes("safeguard") || planDetails.planName.toLowerCase().includes("plan 1") ? "✓" : ""}
                    </span>
                    <span className="font-extrabold text-[#243746]">
                      PLAN 1: THE PREMIUM SAFETY SAFEGUARD (Environmental Safety Oversight Only)
                    </span>
                    {(planDetails.planPrice === 295 || planDetails.planName.toLowerCase().includes("safeguard") || planDetails.planName.toLowerCase().includes("plan 1")) && (
                      <span className="ml-auto text-[10px] font-bold bg-[#294B68] text-white px-2 py-0.5 rounded-full">
                        Selected Plan
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 flex-wrap">
                    <p className="font-bold text-xs text-[#294B68]">
                      Rate: $295.00 per  month.
                    </p>
                    <span className="text-[10px] font-bold text-[#5E8FB2] bg-white border border-[#D9E4EC] px-2 py-0.5 rounded-md">
                      Time: {formatPlanDuration(1)}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed">
                    <strong>Scope:</strong> Each biweekly visit provides a dedicated, objective environmental safety assessment of the home. During the visit, an AgeWellRI specialist conducts a structured walkthrough of the home&apos;s key areas &mdash; stairs and circulation, bathrooms, exterior entry, bedrooms and living areas, life-safety systems, and kitchen and laundry &mdash; to identify fall risks, hazards, and safety concerns. The specialist documents each finding with photos, notes recommended corrections, generates a standardized residential safety report, and delivers it to the Client&apos;s designated family dashboard the same day. This plan may include the complimentary minor safety courtesies described in Section 7 (such as replacing a bulb, placing a plug-in nightlight, or securing a loose cord). It does not include the proactive hazard-clearing, item relocation, or expanded mitigation services offered under Plan 2, and does not include any general or routine housekeeping, laundry, meal preparation, or personal care of any kind.
                  </p>
                </div>

                {/* Plan 2 */}
                <div className={`p-3 rounded-lg border transition-all ${
                  planDetails.planPrice === 495 || planDetails.planName.toLowerCase().includes("independence") || planDetails.planName.toLowerCase().includes("plan 2") || (planDetails.planPrice !== 295 && !planDetails.planName.toLowerCase().includes("safeguard"))
                    ? "bg-[#EAF3F8] border-[#294B68] text-[#243746]"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}>
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded border text-[10px] font-bold bg-white text-[#294B68] border-[#294B68]">
                      {planDetails.planPrice === 495 || planDetails.planName.toLowerCase().includes("independence") || planDetails.planName.toLowerCase().includes("plan 2") || (planDetails.planPrice !== 295 && !planDetails.planName.toLowerCase().includes("safeguard")) ? "✓" : ""}
                    </span>
                    <span className="font-extrabold text-[#243746]">
                      PLAN 2: THE INDEPENDENCE &amp; UPKEEP PLAN (Comprehensive Home Safety Oversight &amp; Proactive Hazard Removal)
                    </span>
                    {(planDetails.planPrice === 495 || planDetails.planName.toLowerCase().includes("independence") || planDetails.planName.toLowerCase().includes("plan 2") || (planDetails.planPrice !== 295 && !planDetails.planName.toLowerCase().includes("safeguard"))) && (
                      <span className="ml-auto text-[10px] font-bold bg-[#294B68] text-white px-2 py-0.5 rounded-full">
                        Selected Plan
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 flex-wrap">
                    <p className="font-bold text-xs text-[#294B68]">
                      Rate: ${planDetails.planPrice ? `${planDetails.planPrice}.00` : "495.00"} per month.
                    </p>
                    <span className="text-[10px] font-bold text-[#5E8FB2] bg-white border border-[#D9E4EC] px-2 py-0.5 rounded-md">
                      Time: Up to 2 hours
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed">
                    <strong>Scope:</strong> Each biweekly visit provides everything in Plan 1, plus proactive hazard clearing performed during the same visit. This includes: verifying and improving lighting at key entrances and along stairs, hallways, and walkways by swapping in brighter LED bulbs and placing plug-in, battery, or solar nightlights and motion lights (no wiring); clearing clutter and obstacles from walkways, hallways, stairs, and entryways to establish clear walking paths; applying anti-slip backing or tape to loose rugs, runners, and stair treads, non-slip strips to bare stairs and to tub and shower surfaces, and foam guards to sharp furniture corners; marking stair edges and steps with high-contrast non-slip tape, adding clear hot/cold water indicators, and applying easy-to-read overlays on stove and appliance controls; securing loose cords along baseboards with safety clips; stabilizing unstable furniture; at the resident&apos;s direction, moving critical items such as a cane, phone, or eyeglasses within safe reach, and relocating frequently used items from unsafe high or low storage to a safer, reachable height where it reduces a clear fall or strain hazard; manual testing and battery replacement for smoke and carbon monoxide alarms; checking fire-extinguisher condition and expiration dates; testing that emergency alert and medical-alert devices are charged and connected to the home Wi-Fi network; mounting lightweight fire extinguishers in high-risk areas; posting emergency contact cards and exit-route plans; checking that water temperature settings remain below 120&deg;F; and addressing an immediate wet-floor or spill-related slip hazard identified during the visit, such as drying the affected area or placing a temporary caution marker, so the hazard does not persist between visits. This plan does not include general or routine housekeeping, laundry, meal preparation, or personal care of any kind.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. PURPOSE, SCOPE OF ASSESSMENT, & OUTSIDE PERIMETER BOUNDARIES */}
            <div className="space-y-2">
              <div className="font-extrabold text-sm text-[#243746] bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
                2. PURPOSE, SCOPE OF ASSESSMENT, &amp; OUTSIDE PERIMETER BOUNDARIES
              </div>
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

            {/* 3. EXCLUSION OF MEDICAL AND CLINICAL ADVICE */}
            <div className="space-y-2">
              <div className="font-extrabold text-sm text-[#243746] bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
                3. EXCLUSION OF MEDICAL AND CLINICAL ADVICE
              </div>
              <p>
                AgeWellRI LLC is an environmental safety and consulting service. We do not provide medical diagnoses, clinical evaluations, physical therapy, occupational therapy, dispensing of medications, or any other form of professional healthcare services or advice. The reports, checklists, recommendations, and safety scores provided by AgeWellRI are not medical assessments and are not intended to substitute for professional clinical judgment, medical care, or qualified caregiver supervision. Clients are strongly advised to consult with their primary care physicians, licensed occupational therapists, or other qualified healthcare providers regarding specific physical limitations, mobility challenges, or physiological fall-risk factors. AgeWellRI does not provide personal care, homemaker services, or hands-on assistance with activities of daily living such as bathing, dressing, feeding, grooming, or mobility transfer.
              </p>
            </div>

            {/* 4. NO GUARANTEE OR WARRANTY (ACCIDENT PREVENTION) */}
            <div className="space-y-2">
              <div className="font-extrabold text-sm text-[#243746] bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
                4. NO GUARANTEE OR WARRANTY (ACCIDENT PREVENTION)
              </div>
              <p>
                While our structured assessment methodologies are designed to assist in identifying and mitigating environmental hazards, no residential environment can be rendered entirely accident-proof. AgeWellRI makes no representations, warranties, or guarantees&mdash;either express or implied&mdash;that implementing our recommendations, performing suggested modifications, or achieving any specific safety score will prevent future slips, trips, falls, bodily injuries, or other adverse incidents. Falls are multifactorial events influenced by environmental, behavioral, and physiological variables beyond the scope and control of this assessment.
              </p>
            </div>

            {/* 5. IMPLEMENTATION AND THIRD-PARTY PROVIDERS */}
            <div className="space-y-2">
              <div className="font-extrabold text-sm text-[#243746] bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
                5. IMPLEMENTATION AND THIRD-PARTY PROVIDERS
              </div>
              <p>
                Any recommendations, modifications, or product suggestions contained within our reports are for informational purposes only. The decision to act upon, modify, or ignore any portion of the report is made at the sole and absolute discretion, and risk, of the client. AgeWellRI does not perform structural home repairs, heavy construction, or complex plumbing/electrical installations. If the client chooses to engage third-party contractors, handymen, or other service providers to perform recommended modifications (such as installing wall-anchored grab bars, structural ramps, or dedicated lighting fixtures), AgeWellRI disclaims all liability and responsibility for the quality, safety, regulatory compliance, or efficacy of those third-party services or products.
              </p>
            </div>

            {/* 5A. THIRD-PARTY CONTRACTOR REFERRALS */}
            <div className="space-y-2">
              <div className="font-extrabold text-sm text-[#243746] bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
                5A. THIRD-PARTY CONTRACTOR REFERRALS
              </div>
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

            {/* 6. LIMITATION OF LIABILITY AND RELEASE */}
            <div className="space-y-2">
              <div className="font-extrabold text-sm text-[#243746] bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
                6. LIMITATION OF LIABILITY AND RELEASE
              </div>
              <p>
                By accepting, accessing, or utilizing the AgeWellRI report, checklist, or scoring data, and by receiving services under this Agreement, the Client acknowledges that reliance on this information, and receipt of these services, is at the Client&apos;s own risk. AgeWellRI does not guarantee absolute home safety, fall prevention, or any specific health outcome, and does not provide continuous or real-time remote monitoring. Except as stated below, AgeWellRI is not liable for any direct, indirect, incidental, consequential, special, or compensatory damages, including personal injury, property damage, or medical expenses, arising from latent or undetected hazards, the implementation or omission of any recommendation, or any slip, trip, fall, or medical emergency on the property, except to the extent directly caused by AgeWellRI&apos;s own negligence. AgeWellRI&apos;s total liability for any claim arising out of this Agreement is limited to the fees paid in the calendar month the claim arose. These limitations do not apply to AgeWellRI&apos;s gross negligence, recklessness, or willful misconduct, or to liability that cannot be limited under applicable law.
              </p>
            </div>

            {/* 7. LIABILITY DISCLAIMER: COMPLIMENTARY SAFETY & CONVENIENCE ADJUSTMENTS */}
            <div className="space-y-2">
              <div className="font-extrabold text-sm text-[#243746] bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
                7. LIABILITY DISCLAIMER: COMPLIMENTARY SAFETY &amp; CONVENIENCE ADJUSTMENTS
              </div>
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

            {/* 8. FOOD & KITCHEN SAFETY MONITORING */}
            <div className="space-y-2">
              <div className="font-extrabold text-sm text-[#243746] bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
                8. FOOD &amp; KITCHEN SAFETY MONITORING
              </div>
              <p>
                As part of our environmental safety monitoring, technicians may perform a visual, non-invasive check of readily accessible kitchen, refrigerator, and pantry areas to identify visibly spoiled, expired, or molding food items. AgeWellRI&apos;s role is limited to observation and reporting. Where technicians identify items that appear spoiled or expired, they will note the observation in the digital visit report and, where appropriate, notify the resident and/or the designated family contact so that the resident or family may decide whether to remove or discard the item. Technicians do not remove, discard, or dispose of the resident&apos;s food, medications, or other property under this Agreement, and do not open, move, or handle items beyond what is necessary for a visual check.
              </p>
              <p>
                To the fullest extent permitted by law, the Client releases AgeWellRI (and its officers, employees, and agents) from liability for foodborne illness, food spoilage, or any related illness arising from the condition of food in the home, and acknowledges that decisions to keep, remove, or discard any food item rest solely with the resident and their family. This release does not apply to loss or injury caused by AgeWellRI&apos;s gross negligence, recklessness, or willful misconduct.
              </p>
            </div>

            {/* 9. MONTHLY RATE, CHECK PARITY, & RECURRING AUTO-BILLING TERMS */}
            <div className="space-y-2">
              <div className="font-extrabold text-sm text-[#243746] bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
                9. MONTHLY RATE, CHECK PARITY, &amp; RECURRING AUTO-BILLING TERMS
              </div>
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

            {/* 10. CLIENT CANCELLATION & RISK TERMINATION POLICY */}
            <div className="space-y-2">
              <div className="font-extrabold text-sm text-[#243746] bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
                10. CLIENT CANCELLATION &amp; RISK TERMINATION POLICY
              </div>
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

            {/* 11. PAPER INVOICE COMPLIANCE (RHODE ISLAND ONLY) */}
            <div className="space-y-2">
              <div className="font-extrabold text-sm text-[#243746] bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
                11. PAPER INVOICE COMPLIANCE (RHODE ISLAND ONLY)
              </div>
              <p>
                In strict compliance with the Rhode Island Senior Savings Protection Act (R.I. Gen. Laws &sect; 6-40.1-2), if the Client or senior resident is sixty-five (65) years of age or older and requests a printed, physical paper invoice sent via United States Postal Service mail rather than electronic delivery, Company will provide such physical mailings completely free of charge. No handling, processing, environmental, or printing fees will ever be applied to physical mailings.
              </p>
            </div>

            {/* 12. REQUIRED INTERACTIVE SECTIONS */}
            <div className="space-y-3">
              <div className="font-extrabold text-sm text-[#243746] bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
                12. REQUIRED INTERACTIVE SECTIONS
              </div>
              <p className="text-[11px] text-[#64748B] italic">
                (The Client must review and check each individual box below in order to authorize service tracking and execution)
              </p>

              <div className="p-3 bg-white rounded-xl border border-[#D9E4EC] space-y-2.5">
                <div>
                  <strong className="text-[#243746] block text-xs">Section 12.1: Scheduled Access Selection (Check EXACTLY One Box)</strong>
                  <div className="mt-1 space-y-1 pl-2 text-[11px]">
                    <p>
                      <strong>&bull; RESIDENT ANSWERS DOOR:</strong> A resident will be present to unlock the door and grant entry at the scheduled time. If the resident is unresponsive or fails to open the door within fifteen (15) minutes of arrival, it will be treated as a &ldquo;Client Lockout,&rdquo; the visit will be canceled, and the standard visit fee will still apply.
                    </p>
                    <p>
                      <strong>&bull; DIGITAL KEYPAD / SMART LOCK:</strong> AgeWellRI LLC is authorized to use the digital keypad code provided by the Client during sign-up to unlock the door. Where Client authorizes keypad or smart-lock access, the entry code is collected and stored through Company&apos;s secure, access-controlled client portal rather than in this signed Agreement, and is accessible only to Company personnel assigned to service the Client&apos;s account.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <strong className="text-[#243746] block text-xs">Section 12.2: Emergency Right of Entry Authorization (Mandatory Standalone Checkbox)</strong>
                  <p className="mt-1 pl-2 text-[11px]">
                    <strong>EMERGENCY ACCESS AGREEMENT:</strong> Regardless of the selection made in Section 12.1, the Client explicitly grants AgeWellRI LLC the right to enter the home during a scheduled visit window if the technician has a reasonable belief that a medical emergency or safety crisis is occurring inside (e.g., viewing a resident fallen on the floor through a window, or hearing cries for help). I authorize AgeWellRI LLC to utilize any available key/code, contact emergency services (911), or follow instructions from designated family contacts. AgeWellRI LLC and its technicians shall be held completely harmless for any property damage (such as forced entry) or liabilities resulting from responding to a suspected medical or safety emergency in good faith, except to the extent caused by AgeWellRI&apos;s gross negligence, recklessness, or willful misconduct.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <strong className="text-[#243746] block text-xs">Section 12.3: Resident Autonomy &amp; Refusal Acknowledgment (Mandatory Standalone Checkbox)</strong>
                  <p className="mt-1 pl-2 text-[11px]">
                    <strong>RESIDENT BOUNDARIES ACKNOWLEDGMENT:</strong> Client acknowledges that AgeWellRI LLC technicians prioritize the dignity, comfort, and personal boundaries of all residents. If a resident explicitly refuses entry, objects to a specific safety checklist item, or requests that a technician leave a specific area during a scheduled visit, our technicians will immediately respect those boundaries and cease that portion of the service. Client agrees that such a refusal by the resident does not constitute a breach of contract by AgeWellRI LLC, and that the standard visit fee will still apply in full. Company is not liable for accidents or injuries caused by a hazard that remains in place solely because the resident declined to have it addressed, except to the extent caused by Company&apos;s gross negligence, recklessness, or willful misconduct.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <strong className="text-[#243746] block text-xs">Section 12.4: Automatic Billing Authorization (Mandatory Standalone Checkbox)</strong>
                  <p className="mt-1 pl-2 text-[11px]">
                    <strong>AUTOMATED MONTHLY CHARGE AUTHORIZATION:</strong> I authorize AgeWellRI LLC to automatically charge my saved digital payment method or process my submitted check payment for the flat monthly fee corresponding to my selected tier ($295.00 for Plan 1 / $495.00 for Plan 2) on a recurring basis. I understand I can cancel this subscription at any time by emailing agewellri@gmail.com or utilizing my secure client dashboard portal link.
                  </p>
                </div>
              </div>
            </div>

            {/* 13. PRIVACY AND CONFIDENTIALITY */}
            <div className="space-y-2">
              <div className="font-extrabold text-sm text-[#243746] bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
                13. PRIVACY AND CONFIDENTIALITY
              </div>
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

            {/* 14. CLIENT COMPLAINTS */}
            <div className="space-y-2">
              <div className="font-extrabold text-sm text-[#243746] bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
                14. CLIENT COMPLAINTS
              </div>
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

            {/* 15. DISPUTE RESOLUTION, SEVERABILITY, & GOVERNING LAW */}
            <div className="space-y-2">
              <div className="font-extrabold text-sm text-[#243746] bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
                15. DISPUTE RESOLUTION, SEVERABILITY, &amp; GOVERNING LAW
              </div>
              <p>
                Both parties agree to a good-faith resolution process before initiating any legal action, and mandatory mediation before formal litigation. This agreement is governed by and construed under the laws of the State of Rhode Island. This agreement supersedes all prior communications, verbal representations, or early text message drafts. Amendments require the express written consent of both parties. AgeWellRI LLC may update general terms with 30 days&apos; notice; continued enrollment following notice constitutes acceptance of updated terms.
              </p>
              <p>
                <strong>Severability:</strong> If any provision or portion of this Agreement is held to be invalid, illegal, or unenforceable by a court of competent jurisdiction, such provision shall be severed or modified to the minimum extent necessary, and the remaining provisions of this Agreement shall continue in full force and effect.
              </p>
            </div>

            {/* 16. SIGNATURES */}
            <div className="space-y-3 pt-2 border-t-2 border-[#243746]">
              <div className="font-extrabold text-sm text-[#243746] bg-[#243746] text-white px-3 py-2 rounded-lg flex items-center justify-between">
                <span>16. SIGNATURES &amp; EXECUTION</span>
                <span className="text-[11px] font-normal text-slate-200">
                  Active Track: {signingTrack === "TRACK_A" ? "Track A (Resident)" : "Track B (Representative)"}
                </span>
              </div>
              <p className="text-[11px] text-[#64748B]">
                This Agreement is signed electronically through AgeWellRI&apos;s online client portal. One of the two signature tracks below applies, depending on who is signing.
              </p>

              {/* Track A Box */}
              <div className={`p-4 rounded-xl border transition-all space-y-2 ${
                signingTrack === "TRACK_A"
                  ? "bg-white border-[#294B68] ring-2 ring-[#294B68]/20 shadow-xs"
                  : "bg-slate-50/70 border-slate-200 opacity-75"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-[#243746]">
                    Track A &mdash; Resident Signature (resident is signing for themselves)
                  </span>
                  {signingTrack === "TRACK_A" && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Selected Signing Track
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#475569] italic leading-relaxed">
                  By signing below, I confirm that I am the resident receiving services under this Agreement, that I have read and understood this Agreement in full, and that I agree to its terms.
                </p>

                <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs border-t border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase block">Printed Name:</span>
                    <span className="font-bold text-[#243746] text-xs">
                      {signingTrack === "TRACK_A" ? (residentPrintedName || residentDetails.fullName || "_______________________________") : "_______________________________"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase block">Signature:</span>
                    <span className="font-serif italic font-bold text-[#294B68] text-xs">
                      {signingTrack === "TRACK_A" ? (
                        hasSignature
                          ? `[✓ Signed: ${residentPrintedName || residentDetails.fullName}]`
                          : (residentPrintedName || residentDetails.fullName ? `[Pending: ${residentPrintedName || residentDetails.fullName}]` : "_______________________________")
                      ) : "_______________________________"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase block">Date:</span>
                    <span className="font-bold text-[#243746] text-xs">
                      {signingTrack === "TRACK_A" ? (agreementDate || todayStr) : "______________"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Track B Box */}
              <div className={`p-4 rounded-xl border transition-all space-y-2 ${
                signingTrack === "TRACK_B"
                  ? "bg-white border-[#294B68] ring-2 ring-[#294B68]/20 shadow-xs"
                  : "bg-slate-50/70 border-slate-200 opacity-75"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-[#243746]">
                    Track B &mdash; Representative Signature (someone is signing on the resident&apos;s behalf)
                  </span>
                  {signingTrack === "TRACK_B" && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Selected Signing Track
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#64748B]">
                  Company routes every Client through Track A whenever the resident is able to sign for themselves. Track B applies only when the resident is genuinely unable to sign.
                </p>
                <p className="text-[11px] text-[#475569] italic leading-relaxed">
                  By signing below, I confirm that I am signing on behalf of the resident identified above, that I hold legal authority to do so under a durable or general power of attorney, a court-appointed guardianship, or a court-appointed conservatorship, and that this authority includes both the power to enter into this Agreement and the power to release and waive claims on the resident&apos;s behalf. A healthcare proxy or health care power of attorney, standing alone, does not satisfy this requirement, since that authority is limited to health care decision-making and does not include the power to contract or to release legal claims. I have provided a copy of the document establishing this authority as part of sign-up. By signing in this representative capacity, I represent that the above is true, and I agree to personally indemnify and hold harmless AgeWellRI from any claims, losses, or costs, including reasonable attorneys&apos; fees, arising from my lack of actual authority to bind the resident or release claims on the resident&apos;s behalf.
                </p>

                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-t border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase block">Representative Printed Name:</span>
                    <span className="font-bold text-[#243746] text-xs">
                      {signingTrack === "TRACK_B" ? (repFullName || "_______________________________") : "_______________________________"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase block">Signing Capacity:</span>
                    <span className="font-bold text-[#243746] text-xs">
                      {signingTrack === "TRACK_B" ? (
                        repCapacity === "ATTORNEY_IN_FACT"
                          ? "Attorney-in-Fact (Durable Power of Attorney)"
                          : repCapacity === "GUARDIAN"
                          ? "Court-Appointed Legal Guardian"
                          : repCapacity === "CONSERVATOR"
                          ? "Court-Appointed Conservator"
                          : "Power of Attorney / Legal Guardian"
                      ) : "_______________________________"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase block">On behalf of Resident:</span>
                    <span className="font-bold text-[#243746] text-xs">
                      {signingTrack === "TRACK_B" ? (residentDetails.fullName || "_______________________________") : "_______________________________"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase block">Signature:</span>
                    <span className="font-serif italic font-bold text-[#294B68] text-xs">
                      {signingTrack === "TRACK_B" ? (
                        hasSignature
                          ? `[✓ Signed: ${repFullName || "Representative"}]`
                          : (repFullName ? `[Pending: ${repFullName}]` : "_______________________________")
                      ) : "_______________________________"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase block">Date:</span>
                    <span className="font-bold text-[#243746] text-xs">
                      {signingTrack === "TRACK_B" ? (agreementDate || todayStr) : "______________"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Signing Track Selection */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Select Signing Role / Legal Authority *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Primary Resident */}
            <div
              onClick={() => setSigningTrack("TRACK_A")}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                signingTrack === "TRACK_A"
                  ? "bg-[#EAF3F8]/50 border-[#294B68] shadow-sm"
                  : "bg-[#F8FAFC] border-[#D9E4EC] hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#294B68]" />
                  <span className="font-extrabold text-sm text-[#243746]">
                    Primary Resident
                  </span>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    signingTrack === "TRACK_A"
                      ? "border-[#294B68] bg-[#294B68]"
                      : "border-[#CBD5E1]"
                  }`}
                >
                  {signingTrack === "TRACK_A" && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
              </div>
              <p className="text-xs text-[#64748B] mt-2">
                I confirm I am the resident, am at least 18, have read and agree
                to this Agreement, and am signing on my own behalf.
              </p>
            </div>

            {/* Representative / POA */}
            <div
              onClick={() => setSigningTrack("TRACK_B")}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                signingTrack === "TRACK_B"
                  ? "bg-[#EAF3F8]/50 border-[#294B68] shadow-sm"
                  : "bg-[#F8FAFC] border-[#D9E4EC] hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#5E8FB2]" />
                  <span className="font-extrabold text-sm text-[#243746]">
                    Representative
                  </span>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    signingTrack === "TRACK_B"
                      ? "border-[#294B68] bg-[#294B68]"
                      : "border-[#CBD5E1]"
                  }`}
                >
                  {signingTrack === "TRACK_B" && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
              </div>
              <p className="text-xs text-[#64748B] mt-2">
                I am signing on behalf of the resident under a durable/general
                POA, guardianship, or conservatorship, which includes authority
                to contract and release claims. A healthcare proxy alone does
                NOT qualify. I agree to indemnify AgeWellRI if I lack actual
                authority.
              </p>
            </div>
          </div>
        </div>

        {/* Track B Additional Requirements: Capacity & File Upload */}
        {signingTrack === "TRACK_B" && (
          <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
                  Representative Legal Capacity *
                </label>
                <select
                  value={repCapacity}
                  onChange={(e) =>
                    setRepCapacity(
                      e.target.value as
                        | "ATTORNEY_IN_FACT"
                        | "GUARDIAN"
                        | "CONSERVATOR",
                    )
                  }
                  className="w-full h-12 px-4 text-sm font-semibold text-[#243746] bg-white border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] cursor-pointer"
                >
                  <option value="ATTORNEY_IN_FACT">
                    Attorney-in-Fact (POA)
                  </option>
                  <option value="GUARDIAN">
                     Guardian
                  </option>
                  <option value="CONSERVATOR">
                     Conservator
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
                  Representative Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={repFullName}
                  onChange={(e) => setRepFullName(e.target.value)}
                  placeholder="e.g. Sarah Vance"
                  className="w-full h-12 px-4 text-sm font-semibold text-[#243746] bg-white border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                />
              </div>
            </div>

            {/* Authority Document Upload Card */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Upload Legal Authority Document * (.PDF, .PNG, .JPG &bull; Max
                15MB)
              </label>

              {authorityDocumentUrl ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <h5 className="font-bold text-xs text-emerald-900">
                        {authorityDocumentName ||
                          "Legal Authority Document Attached"}
                      </h5>
                      <span className="text-[11px] text-emerald-700">
                        Verified &bull; Ready for agreement execution
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        downloadAuthorityDocument({
                          url: authorityDocumentUrl,
                          fileName: authorityDocumentName || "Legal_Authority_Document.pdf",
                        })
                      }
                      className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                      title="Download uploaded document to verify"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                    <span className="text-emerald-300">|</span>
                    <label className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer">
                      Replace
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="p-6 border-2 border-dashed border-[#CBD5E1] hover:border-[#294B68] rounded-2xl bg-white flex flex-col items-center justify-center gap-2 cursor-pointer transition-all">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {isUploadingDoc ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-[#294B68]">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Uploading document to secure server...</span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-[#5E8FB2]" />
                      <span className="text-xs font-extrabold text-[#294B68]">
                        Click to upload Power of Attorney or Guardianship
                        Document
                      </span>
                      <span className="text-[11px] text-[#94A3B8]">
                        PDF or clear photo / scanned image up to 15MB
                      </span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>
        )}

        {/* Printed Name & Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Printed Signer Full Legal Name *
            </label>
            <input
              type="text"
              required
              value={
                signingTrack === "TRACK_A" ? residentPrintedName : repFullName
              }
              onChange={(e) => {
                if (signingTrack === "TRACK_A") {
                  setResidentPrintedName(e.target.value);
                } else {
                  setRepFullName(e.target.value);
                }
              }}
              placeholder="Full Legal Name"
              className="w-full h-12 px-4 text-sm font-semibold text-[#243746] bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center justify-between">
              <span>Agreement Execution Date *</span>
              <span className="text-[11px] font-normal text-[#94A3B8] normal-case">
                (Today)
              </span>
            </label>
            <input
              type="date"
              disabled
              readOnly
              value={todayStr}
              className="w-full h-12 px-4 text-sm font-semibold text-[#64748B] bg-[#F1F5F9] border border-[#D9E4EC] rounded-xl cursor-not-allowed select-none"
            />
          </div>
        </div>

        {/* HTML5 Canvas Signature Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Draw Electronic Signature *
            </label>
            <button
              type="button"
              onClick={handleClearSignature}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#5E8FB2] hover:text-[#294B68] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Signature</span>
            </button>
          </div>

          <div className="relative border-2 border-[#D9E4EC] rounded-2xl bg-[#F8FAFC] overflow-hidden focus-within:border-[#5E8FB2]">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-36 sm:h-40 cursor-crosshair touch-none bg-white"
            />

            {!hasSignature && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-[#94A3B8] gap-1">
                <span className="text-xs font-medium">
                  Draw your digital signature here using mouse, trackpad, or
                  finger
                </span>
                <span className="text-[10px] text-[#CBD5E1]">
                  (Legally binding under the ESIGN Act)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* AgeWellRI Pre-Execution Signature */}
        <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              AgeWellRI Authorized Signature (Pre-Executed)
            </span>
            <span className="text-[11px] font-extrabold text-[#3F8F6B] bg-[#EBF8F2] px-2.5 py-0.5 rounded-full">
              Executed by Provider
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div>
              <div className="text-sm font-black text-[#243746]">
                {AGEWELL_OWNER_DETAILS.name}
              </div>
              <div className="text-xs text-[#64748B] mt-0.5">
                {AGEWELL_OWNER_DETAILS.title} &bull;{" "}
                {AGEWELL_OWNER_DETAILS.company}
              </div>
              <div className="text-[11px] text-[#5E8FB2] mt-0.5">
                {AGEWELL_OWNER_DETAILS.location} &bull; Date: {todayStr}
              </div>
            </div>

            <div className="w-50 h-24 relative shrink-0 bg-white rounded-xl border border-[#D9E4EC] p-1.5 flex flex-col items-center justify-center shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={OWNER_SIGNATURE_SVG_DATA_URI}
                alt="AgeWellRI Authorized Signature"
                className="max-h-22 max-w-full object-contain"
              />
      
            </div>
          </div>
        </div>

        {/* Electronic Consent Checkbox */}
        <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC]">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              required
              checked={consentElectronicSignature}
              onChange={(e) => setConsentElectronicSignature(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-[#D9E4EC] text-[#294B68] focus:ring-[#5E8FB2] cursor-pointer"
            />
            <span className="text-xs text-[#475569] leading-relaxed">
              <strong>Electronic Signature Consent:</strong> I acknowledge and
              agree that my electronic signature above is legally binding and
              equivalent to a handwritten signature under the Electronic
              Signatures in Global and National Commerce Act (E-SIGN) and the
              Uniform Electronic Transactions Act (UETA).
            </span>
          </label>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#D9E4EC]">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-[#D9E4EC] bg-white text-sm font-bold text-[#64748B] hover:text-[#243746] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#294B68] hover:bg-[#1E374D] text-white text-sm font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer group"
          >
            <span>Continue to Authorizations</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  );
}
