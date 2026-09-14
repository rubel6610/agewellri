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
} from "lucide-react";
import { useUploadAuthorityDocumentMutation } from "@/redux/features/agreement/agreementApi";

interface Point {
  x: number;
  y: number;
}

const AGEWELL_OWNER_DETAILS = {
  name: "Cory Poplaski",
  title: "Founder",
  company: "AgeWellRI Care Management LLC",
  location: "Westerly, RI",
};

const OWNER_SIGNATURE_SVG_DATA_URI =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='70' viewBox='0 0 240 70'><path d='M 15 45 Q 35 15 60 40 T 110 35 T 160 45 T 210 30' stroke='%23294B68' stroke-width='2.8' fill='none' stroke-linecap='round' stroke-linejoin='round'/><path d='M 45 42 Q 85 58 140 48' stroke='%23294B68' stroke-width='1.8' fill='none' stroke-linecap='round'/></svg>";

interface Step6AgreementSigningProps {
  planDetails: {
    planName: string;
    planPrice: number;
    billingInterval: string;
    totalVisits: number;
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
          "Representative / Power of Attorney signing requires uploading a legal authority document (DPOA, Guardianship, or Conservatorship order).",
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
              <FileText className="w-4 h-4 text-[#294B68]" /> Service Agreement
              Document ({residentDetails.state || "RI"})
            </span>
            <span className="text-[11px] text-[#5E8FB2] font-semibold">
              Scroll to read full terms
            </span>
          </div>

          <div className="h-64 sm:h-72 overflow-y-auto p-5 bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl text-xs text-[#475569] leading-relaxed space-y-4 font-sans select-text border-dashed">
            <div className="text-center pb-2 border-b border-[#D9E4EC]">
              <h4 className="font-extrabold text-sm text-[#243746]">
                AGEWELLRI CLIENT SERVICE &amp; MAINTENANCE AGREEMENT
              </h4>
              <p className="text-[11px] text-[#64748B]">
                Jurisdiction: State of{" "}
                {residentDetails.state === "RI"
                  ? "Rhode Island"
                  : residentDetails.state}{" "}
                &bull; Active Version 2.0
              </p>
            </div>

            <div>
              <strong className="text-[#243746]">
                1. PARTIES &amp; PREMISES:
              </strong>
              <p>
                This Service Agreement is entered into by AgeWellRI Care
                Management LLC (&quot;Provider&quot;) and the Resident:{" "}
                <strong>
                  {residentDetails.fullName || "Primary Resident"}
                </strong>{" "}
                (&quot;Client&quot;), residing at{" "}
                <strong>
                  {residentDetails.address || "Residence Address"},{" "}
                  {residentDetails.city}, {residentDetails.state}{" "}
                  {residentDetails.postalCode}
                </strong>
                .
              </p>
            </div>

            <div>
              <strong className="text-[#243746]">
                2. CONTRACTED PLAN &amp; SCOPE OF SERVICES:
              </strong>
              <p>
                Client selects the <strong>{planDetails.planName}</strong> ($
                {planDetails.planPrice}.00 per month). Provider shall
                perform scheduled maintenance and safety upkeep visits. Services encompass preventative home
                checks, fixture maintenance, smoke/CO detector inspections,
                accessibility upkeep, and environmental safety assessments.
              </p>
            </div>

            <div>
              <strong className="text-[#243746]">
                3. NON-MEDICAL SCOPE &amp; RESIDENT AUTONOMY:
              </strong>
              <p>
                Provider is a non-medical residential maintenance and
                aging-in-place service. Specialists do not provide clinical
                healthcare, nursing, physical assistance, or emergency triage.
              </p>
            </div>

            <div>
              <strong className="text-[#243746]">
                4. BILLING &amp; FIRST PAYMENT:
              </strong>
              <p>
                <strong>$0.00 is charged at signup.</strong> Client authorizes
                automatic recurring charges to the saved payment method on the
                1st day of each month, beginning on the first day of the
                following calendar month (Commencement Date).
              </p>
            </div>

            <div>
              <strong className="text-[#243746]">
                5. CANCELLATION &amp; STATUTORY RIGHT:
              </strong>
              <p>
                Client may cancel this agreement at any time with 30 days
                written notice via the client portal. Under applicable state
                consumer protection laws, Client may also cancel within three
                (3) business days of execution without penalty.
              </p>
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
                I am the resident residing at the property and signing on my own
                behalf.
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
                    Representative / POA
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
                I am signing as an authorized Representative (Power of Attorney,
                Guardian, Conservator).
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
                    Attorney-in-Fact (DPOA)
                  </option>
                  <option value="GUARDIAN">
                    Court-Appointed Legal Guardian
                  </option>
                  <option value="CONSERVATOR">
                    Court-Appointed Conservator
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
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-6 h-6 text-emerald-600" />
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

            <div className="w-44 h-14 relative shrink-0 bg-white rounded-xl border border-[#D9E4EC] p-1.5 flex flex-col items-center justify-center shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={OWNER_SIGNATURE_SVG_DATA_URI}
                alt="AgeWellRI Authorized Signature"
                className="max-h-8 max-w-full object-contain"
              />
              <span className="text-[9px] font-bold text-[#3F8F6B] tracking-tight mt-0.5">
                ✓ Verified Officer Signature
              </span>
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
