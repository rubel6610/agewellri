"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Shield,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  AlertCircle,
 
} from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { useSubmitAgreementMutation } from "@/redux/features/auth/authApi";

export function ClientAgreementForm() {
  const router = useRouter();
  const authUser = useAppSelector((state) => state.auth.user);
  const [submitAgreement, { isLoading }] = useSubmitAgreementMutation();

  const [formData, setFormData] = useState({
    clientFullName: "",
    address: "",
    city: "",
    state: "RI",
    postalCode: "",
    phone: "",
    dob: "",
    email: "",
    primaryContactName: "",
    primaryContactPhone: "",
    primaryContactEmail: "",
    primaryContactRelation: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    selectedPlan: "ESSENTIAL_GUARD" as "ESSENTIAL_GUARD" | "GUARDIAN_PLUS",
    hasCleaningAddon: false,
    clientPrintedName: "",
    authorizedRepName: "",
    relationshipToClient: "",
    agreementDate: new Date().toISOString().split("T")[0],
    agreedToTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  // Canvas Signature Pad State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (authUser) {
      const fullName = `${authUser.firstName || ""} ${authUser.lastName || ""}`.trim();
      setFormData((prev) => ({
        ...prev,
        clientFullName: prev.clientFullName || fullName,
        clientPrintedName: prev.clientPrintedName || fullName,
        email: authUser.email || "",
        phone: prev.phone || authUser.phone || "",
        address: prev.address || authUser.client?.address || "",
        city: prev.city || authUser.client?.city || "Providence",
        state: prev.state || authUser.client?.state || "RI",
        postalCode: prev.postalCode || authUser.client?.postalCode || "02906",
        emergencyContactName:
          prev.emergencyContactName || authUser.client?.emergencyContactName || "",
        emergencyContactPhone:
          prev.emergencyContactPhone || authUser.client?.emergencyContactPhone || "",
        emergencyContactRelation:
          prev.emergencyContactRelation ||
          authUser.client?.emergencyContactRelation ||
          "Daughter",
      }));
    }
  }, [authUser]);

  // Handle Input Changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Canvas Drawing Handlers
  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x =
      "touches" in e
        ? e.touches[0].clientX - rect.left
        : (e as React.MouseEvent).clientX - rect.left;
    const y =
      "touches" in e
        ? e.touches[0].clientY - rect.top
        : (e as React.MouseEvent).clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x =
      "touches" in e
        ? e.touches[0].clientX - rect.left
        : (e as React.MouseEvent).clientX - rect.left;
    const y =
      "touches" in e
        ? e.touches[0].clientY - rect.top
        : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1E374D";
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const validate = () => {
    const err: Record<string, string> = {};

    if (!formData.clientFullName.trim()) err.clientFullName = "Full name is required.";
    if (!formData.address.trim()) err.address = "Street address is required.";
    if (!formData.city.trim()) err.city = "City is required.";
    if (!formData.postalCode.trim()) err.postalCode = "ZIP code is required.";
    if (!formData.phone.trim()) err.phone = "Phone number is required.";
    if (!formData.dob.trim()) err.dob = "Date of birth is required.";
    if (!formData.emergencyContactName.trim())
      err.emergencyContactName = "Emergency contact name is required.";
    if (!formData.emergencyContactPhone.trim())
      err.emergencyContactPhone = "Emergency contact phone is required.";
    if (!formData.clientPrintedName.trim())
      err.clientPrintedName = "Client printed name is required.";
    if (!formData.agreementDate.trim()) err.agreementDate = "Date is required.";
    if (!formData.agreedToTerms)
      err.agreedToTerms = "You must check the box to confirm agreement.";
    if (!hasSignature)
      err.signature = "Please sign your signature in the signature area.";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const canvas = canvasRef.current;
    const signatureData = canvas ? canvas.toDataURL("image/png") : "data:image/png;base64,signed";

    try {
      const response = await submitAgreement({
        clientFullName: formData.clientFullName.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.postalCode.trim(),
        phone: formData.phone.trim(),
        dob: formData.dob.trim(),
        email: formData.email.trim(),
        primaryContactName: formData.primaryContactName.trim() || null,
        primaryContactPhone: formData.primaryContactPhone.trim() || null,
        primaryContactEmail: formData.primaryContactEmail.trim() || null,
        primaryContactRelation: formData.primaryContactRelation.trim() || null,
        emergencyContactName: formData.emergencyContactName.trim(),
        emergencyContactPhone: formData.emergencyContactPhone.trim(),
        emergencyContactRelation: formData.emergencyContactRelation.trim() || null,
        selectedPlan: formData.selectedPlan,
        hasCleaningAddon: formData.hasCleaningAddon,
        clientPrintedName: formData.clientPrintedName.trim(),
        authorizedRepName: formData.authorizedRepName.trim() || null,
        relationshipToClient: formData.relationshipToClient.trim() || null,
        agreementDate: formData.agreementDate.trim(),
        clientSignature: signatureData,
        agreedToTerms: true,
      }).unwrap();

      if (response.success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.replace("/dashboard");
        }, 1200);
      } else {
        setErrors({ general: response.message || "Failed to submit agreement." });
      }
    } catch (err: unknown) {
      const errorData = (
        err as {
          data?: {
            message?: string;
            errors?: Record<string, string[]>;
          };
        }
      )?.data;

      if (errorData?.errors && typeof errorData.errors === "object") {
        const fieldErrors: Record<string, string> = {};
        Object.entries(errorData.errors).forEach(([k, v]) => {
          if (v?.[0]) fieldErrors[k] = v[0];
        });
        fieldErrors.general = errorData.message || "Please correct the highlighted fields.";
        setErrors(fieldErrors);
      } else {
        setErrors({
          general:
            errorData?.message ||
            (err as { message?: string })?.message ||
            "Unable to submit agreement. Please try again.",
        });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F5F9] text-[#243746]">
      {/* Top Simple Navigation */}
      <header className="bg-white border-b border-[#D9E4EC] py-3.5 px-6 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="AgeWellRI"
              width={200}
              height={50}
              priority
              className="h-auto w-auto max-h-11 object-contain"
            />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#294B68] bg-[#EAF3F8] px-3 py-1 rounded-full border border-[#5E8FB2]/20">
            Client Onboarding Step 1 of 1
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
        {/* White Agreement Document Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-[#D9E4EC] p-6 sm:p-10 space-y-8">
          {/* Document Header */}
          <div className="text-center space-y-2 pb-6 border-b border-[#D9E4EC]">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746] tracking-tight">
              AgeWellRI
            </h1>
            <p className="text-base sm:text-lg font-bold text-[#5E8FB2]">
              Client Service Agreement
            </p>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-xl mx-auto pt-1">
              Please review and complete the service agreement below to activate your AgeWellRI safety oversight and care plan.
            </p>
          </div>

          {isSuccess ? (
            <div className="p-10 bg-[#EAF3F8] border border-[#3F8F6B]/30 rounded-3xl text-center space-y-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-[#3F8F6B] text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#243746]">
                Agreement Signed &amp; Accepted!
              </h2>
              <p className="text-sm sm:text-base text-[#64748B] max-w-md mx-auto">
                Thank you! Your client service agreement has been executed. Redirecting you to your member dashboard...
              </p>
              <div className="flex items-center justify-center gap-2 text-sm font-bold text-[#294B68] pt-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Entering Member Portal...</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {errors.general && (
                <div className="p-4 bg-red-50 border border-[#C95C5C]/30 rounded-2xl text-sm font-medium text-[#C95C5C] flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{errors.general}</span>
                </div>
              )}

              {/* 1. Client Information */}
              <div className="space-y-5">
                <div className="bg-[#243746] text-white px-5 py-3 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 shadow-xs">
                  <span>1. Client Information</span>
                </div>

                <div className="space-y-4 px-1">
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">
                      Client full name (person receiving services) *
                    </label>
                    <input
                      type="text"
                      name="clientFullName"
                      value={formData.clientFullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Eleanor Vance"
                      className="w-full h-11 px-4 text-sm font-semibold text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                    />
                    {errors.clientFullName && (
                      <p className="text-xs text-red-500 mt-1">{errors.clientFullName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">
                        Client home address (street address) *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="148 Hope Street"
                        className="w-full h-11 px-4 text-sm font-semibold text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                      />
                      {errors.address && (
                        <p className="text-xs text-red-500 mt-1">{errors.address}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">
                        City, State, ZIP *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="City"
                          className="w-1/2 h-11 px-3 text-sm font-semibold text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                        />
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          placeholder="ZIP"
                          className="w-1/2 h-11 px-3 text-sm font-semibold text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">
                        Client phone number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(401) 555-0199"
                        className="w-full h-11 px-4 text-sm font-semibold text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">
                        Client date of birth *
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleInputChange}
                        className="w-full h-11 px-4 text-sm font-semibold text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                      />
                      {errors.dob && (
                        <p className="text-xs text-red-500 mt-1">{errors.dob}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">
                      Client email address (read-only)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full h-11 px-4 text-sm font-semibold text-[#64748B] bg-[#F1F5F9] border border-[#D9E4EC] rounded-xl cursor-not-allowed select-none opacity-80"
                    />
                  </div>

                  {/* Primary Contact */}
                  <div className="pt-2">
                    <p className="text-xs font-black text-[#5E8FB2] uppercase tracking-wider mb-2">
                      PRIMARY CONTACT / AUTHORIZED REPRESENTATIVE
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="primaryContactName"
                        value={formData.primaryContactName}
                        onChange={handleInputChange}
                        placeholder="Primary contact full name (relationship to client)"
                        className="w-full h-11 px-4 text-sm font-semibold text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                      />
                      <input
                        type="text"
                        name="primaryContactPhone"
                        value={formData.primaryContactPhone}
                        onChange={handleInputChange}
                        placeholder="Primary contact phone | email"
                        className="w-full h-11 px-4 text-sm font-semibold text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                      />
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="pt-2">
                    <p className="text-xs font-black text-[#5E8FB2] uppercase tracking-wider mb-2">
                      EMERGENCY CONTACT
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          name="emergencyContactName"
                          value={formData.emergencyContactName}
                          onChange={handleInputChange}
                          placeholder="Emergency contact name *"
                          className="w-full h-11 px-4 text-sm font-semibold text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                        />
                        {errors.emergencyContactName && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.emergencyContactName}
                          </p>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          name="emergencyContactPhone"
                          value={formData.emergencyContactPhone}
                          onChange={handleInputChange}
                          placeholder="Emergency contact phone | relationship *"
                          className="w-full h-11 px-4 text-sm font-semibold text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                        />
                        {errors.emergencyContactPhone && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.emergencyContactPhone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Selected Service Plan */}
              <div className="space-y-5">
                <div className="bg-[#243746] text-white px-5 py-3 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 shadow-xs">
                  <span>2. Selected Service Plan</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-1">
                  {/* Plan 1: Essential Guard */}
                  <label
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                      formData.selectedPlan === "ESSENTIAL_GUARD"
                        ? "border-[#294B68] bg-[#EAF3F8]/60 shadow-sm"
                        : "border-[#D9E4EC] bg-white hover:border-[#5E8FB2]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Heart className="w-5 h-5 text-[#294B68]" />
                          <h3 className="font-extrabold text-base text-[#243746]">
                            Essential Guard
                          </h3>
                        </div>
                        <p className="text-xs text-[#64748B]">
                          Standard quarterly home safety &amp; oversight visits.
                        </p>
                      </div>
                      <input
                        type="radio"
                        name="selectedPlan"
                        value="ESSENTIAL_GUARD"
                        checked={formData.selectedPlan === "ESSENTIAL_GUARD"}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-[#294B68] accent-[#294B68] mt-1"
                      />
                    </div>
                    <div className="pt-2 border-t border-[#D9E4EC]">
                      <span className="text-lg font-black text-[#294B68]">
                        $99/quarter
                      </span>
                      <span className="text-xs text-[#64748B] block font-semibold">
                        4 visits / quarter
                      </span>
                    </div>
                  </label>

                  {/* Plan 2: Guardian Plus */}
                  <label
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                      formData.selectedPlan === "GUARDIAN_PLUS"
                        ? "border-[#294B68] bg-[#EAF3F8]/60 shadow-sm"
                        : "border-[#D9E4EC] bg-white hover:border-[#5E8FB2]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-[#294B68]" />
                          <h3 className="font-extrabold text-base text-[#243746]">
                            Guardian Plus
                          </h3>
                        </div>
                        <p className="text-xs text-[#64748B]">
                          Intensive bi-weekly safety audits &amp; ongoing care check-ins.
                        </p>
                      </div>
                      <input
                        type="radio"
                        name="selectedPlan"
                        value="GUARDIAN_PLUS"
                        checked={formData.selectedPlan === "GUARDIAN_PLUS"}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-[#294B68] accent-[#294B68] mt-1"
                      />
                    </div>
                    <div className="pt-2 border-t border-[#D9E4EC]">
                      <span className="text-lg font-black text-[#294B68]">
                        $1,800/quarter
                      </span>
                      <span className="text-xs text-[#64748B] block font-semibold">
                        8 visits / quarter
                      </span>
                    </div>
                  </label>
                </div>

                {/* Addon Checkbox */}
                <div className="px-1 pt-2">
                  <label className="flex items-center gap-3 p-4 bg-[#F7FAFC] rounded-xl border border-[#D9E4EC] cursor-pointer hover:bg-[#EAF3F8]/50 transition-colors">
                    <input
                      type="checkbox"
                      name="hasCleaningAddon"
                      checked={formData.hasCleaningAddon}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-[#294B68] rounded border-[#D9E4EC] accent-[#294B68]"
                    />
                    <span className="text-sm font-bold text-[#243746]">
                      Cleaning Add-On — <span className="text-[#5E8FB2]">$50/quarter</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* 3. Scope of Services */}
              <div className="space-y-3">
                <div className="bg-[#243746] text-white px-5 py-3 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 shadow-xs">
                  <span>3. Scope of Services</span>
                </div>

                <div className="p-4 bg-[#F7FAFC] border border-[#D9E4EC] rounded-2xl max-h-48 overflow-y-auto text-xs text-[#475569] space-y-2.5 leading-relaxed">
                  <p className="font-bold text-[#243746]">
                    Includes everything in the Selected Plan plus complete safety auditing, organization and specialized coaching across all rooms of the household:
                  </p>
                  <p>
                    <strong>Bedrooms &amp; Living Areas:</strong> Walk pathways, clear indoor electrical cords, ensure bedside lighting and emergency call devices are easily reachable, secure throw rugs with non-skid backing, and perform HEPA vacuuming and dusting to reduce respiratory allergens.
                  </p>
                  <p>
                    <strong>Life Safety Systems:</strong> Routinely tests and cleans smoke detectors, carbon monoxide alarms, fire extinguishers, and medical alert systems; checks water heater temperature to prevent accidental scalding, and reviews emergency exit pathways.
                  </p>
                  <p>
                    <strong>Kitchen &amp; Laundry:</strong> Reorganizes heavy or daily items to lower-level shelves for easy, safe reach; inspects appliances for potential hazards, clears dryer lint pathways, and audits moisture/mold concerns.
                  </p>
                </div>
              </div>

              {/* 4. Billing, Payment & Cancellation */}
              <div className="space-y-3">
                <div className="bg-[#243746] text-white px-5 py-3 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 shadow-xs">
                  <span>4. Billing, Payment &amp; Cancellation</span>
                </div>

                <div className="p-4 bg-[#F7FAFC] border border-[#D9E4EC] rounded-2xl max-h-40 overflow-y-auto text-xs text-[#475569] space-y-2 leading-relaxed">
                  <p>
                    <strong>Billing and Payment:</strong> Billed quarterly or monthly via check, ACH, or credit/debit card. Invoices are generated at the commencement of each cycle. Payments overdue 14+ days will incur a grace reminder and potential temporary service hold.
                  </p>
                  <p>
                    <strong>Cancellation by Client:</strong> Cancel at any time with 30 days written notice. Cancellation takes effect at the end of the current billing quarter. Fees are non-refundable except in certified cases of emergency hospitalization or relocation to a residential medical facility.
                  </p>
                </div>
              </div>

              {/* 5. Liability, Privacy & Dispute Resolution */}
              <div className="space-y-3">
                <div className="bg-[#243746] text-white px-5 py-3 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 shadow-xs">
                  <span>5. Liability, Privacy &amp; Dispute Resolution</span>
                </div>

                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Please read carefully. This section defines the limits of AgeWellRI&apos;s legal responsibility.</span>
                </div>

                <div className="p-4 bg-[#F7FAFC] border border-[#D9E4EC] rounded-2xl max-h-44 overflow-y-auto text-xs text-[#475569] space-y-2 leading-relaxed">
                  <p>
                    <strong>Limitation of Liability:</strong> AgeWellRI is a safety inspection, coaching, and oversight service. It does not provide medical care, skilled nursing, physical therapy, continuous monitoring, or emergency dispatch services. Total liability is limited strictly to fees paid in the quarter a claim arises. AgeWellRI is not liable for incidents occurring outside scheduled visit times.
                  </p>
                  <p>
                    <strong>Privacy and Confidentiality:</strong> Client safety data, contact info, and home assessment results are collected solely to deliver and coordinate services. Reports are confidential and accessible only to the client and designated authorized representatives.
                  </p>
                </div>
              </div>

              {/* 6. Acknowledgment and Signatures */}
              <div className="space-y-5">
                <div className="bg-[#243746] text-white px-5 py-3 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 shadow-xs">
                  <span>6. Acknowledgment and Signatures</span>
                </div>

                {/* Consent Checkbox */}
                <div className="px-1">
                  <label className="flex items-start gap-3 p-4 bg-[#F7FAFC] rounded-2xl border border-[#D9E4EC] cursor-pointer group">
                    <input
                      type="checkbox"
                      name="agreedToTerms"
                      checked={formData.agreedToTerms}
                      onChange={handleInputChange}
                      className="w-5 h-5 mt-0.5 rounded border-[#D9E4EC] text-[#294B68] accent-[#294B68] shrink-0"
                    />
                    <span className="text-xs sm:text-sm font-medium text-[#243746] leading-relaxed">
                      By checking this box, the client and authorized representative confirm they have read, understood, and agreed to all terms of this Client Service Agreement. If the client cannot sign due to cognitive or physical limitations, the authorized representative may sign on their behalf. *
                    </span>
                  </label>
                  {errors.agreedToTerms && (
                    <p className="text-xs text-red-500 mt-1">{errors.agreedToTerms}</p>
                  )}
                </div>

                {/* Signature Names and Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-1">
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">
                      Client printed name *
                    </label>
                    <input
                      type="text"
                      name="clientPrintedName"
                      value={formData.clientPrintedName}
                      onChange={handleInputChange}
                      placeholder="e.g. Eleanor Vance"
                      className="w-full h-11 px-4 text-sm font-semibold text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                    />
                    {errors.clientPrintedName && (
                      <p className="text-xs text-red-500 mt-1">{errors.clientPrintedName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">
                      Authorized representative printed name (if applicable)
                    </label>
                    <input
                      type="text"
                      name="authorizedRepName"
                      value={formData.authorizedRepName}
                      onChange={handleInputChange}
                      placeholder="e.g. Sarah Jenkins (Optional)"
                      className="w-full h-11 px-4 text-sm font-semibold text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">
                      Agreement Date *
                    </label>
                    <input
                      type="date"
                      name="agreementDate"
                      value={formData.agreementDate}
                      onChange={handleInputChange}
                      className="w-full h-11 px-4 text-sm font-semibold text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                    />
                    {errors.agreementDate && (
                      <p className="text-xs text-red-500 mt-1">{errors.agreementDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">
                      Relationship to client (if signed by representative)
                    </label>
                    <input
                      type="text"
                      name="relationshipToClient"
                      value={formData.relationshipToClient}
                      onChange={handleInputChange}
                      placeholder="e.g. Daughter / Power of Attorney"
                      className="w-full h-11 px-4 text-sm font-semibold text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                    />
                  </div>
                </div>

                {/* Digital Signature Canvas */}
                <div className="space-y-2 px-1 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                      Client signature (draw with mouse or finger) *
                    </label>
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="text-xs font-bold text-[#5E8FB2] hover:text-[#294B68] underline cursor-pointer"
                    >
                      Clear signature
                    </button>
                  </div>

                  <div className="border-2 border-dashed border-[#D9E4EC] hover:border-[#5E8FB2] rounded-2xl bg-[#FCFDFF] p-2 transition-colors">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={160}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-36 bg-white rounded-xl cursor-crosshair touch-none border border-[#E2E8F0]"
                    />
                  </div>
                  {errors.signature && (
                    <p className="text-xs text-red-500">{errors.signature}</p>
                  )}
                  <p className="text-[11px] text-[#94A3B8]">
                    Signing digitally certifies your legal agreement to the terms above.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-[#D9E4EC] flex justify-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-80 h-13 bg-[#243746] hover:bg-[#1A2834] text-white font-extrabold text-base rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Submitting Agreement...</span>
                    </>
                  ) : (
                    <span>Submit agreement</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Platform Footer */}
      <footer className="bg-[#1E293B] text-white py-12 px-6 mt-12">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <Image
                src="/logo.png"
                alt="AgeWellRI"
                width={160}
                height={40}
                className="h-auto w-auto max-h-10 object-contain brightness-0 invert"
              />
              <p className="text-xs text-slate-300 leading-relaxed">
                Providing compassionate in-home care and support services to help seniors live safely, comfortably, and independently.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Our Services
              </h4>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li>Certifications &amp; Professional Standards</li>
                <li>The AgeWellRI Difference</li>
                <li>Discounts &amp; Savings</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Contact Us
              </h4>
              <p className="text-xs text-slate-300">Westerly, Rhode Island</p>
              <p className="text-xs text-slate-300">+1 (401) 712-3012</p>
              <p className="text-xs text-slate-300">agewellri@gmail.com</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-[11px] text-slate-400 leading-relaxed text-center">
            AgeWellRI is a home safety oversight service and is not a medical provider, healthcare agency, or emergency response service. Our services do not constitute medical care, medical advice, diagnosis, or treatment of any kind. AgeWellRI technicians are not licensed medical professionals, home health aides, or certified caregivers. In the event of a medical emergency, always call 911. If you have concerns about your health or the health of a loved one, please consult a licensed physician or qualified healthcare provider.
          </div>

          <div className="text-center text-[11px] text-slate-500">
            &copy; 2026 AgeWellRI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
