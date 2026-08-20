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
  FileText,
  CreditCard,
  ArrowRight,
  Lock,
} from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { useSubmitAgreementMutation } from "@/redux/features/auth/authApi";
import { PaymentStepCard } from "../payment/payment-step-card";

export function ClientAgreementForm() {
  const router = useRouter();
  const authUser = useAppSelector((state) => state.auth.user);
  const [submitAgreement, { isLoading: isSubmittingAgreement }] =
    useSubmitAgreementMutation();

  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

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
  const [savedSignatureData, setSavedSignatureData] = useState<string>("");

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
        email: prev.email || authUser.email || "",
        phone: prev.phone || authUser.phone || "",
        clientPrintedName: prev.clientPrintedName || fullName,
        address: prev.address || authUser.client?.address || "",
        city: prev.city || authUser.client?.city || "",
        state: prev.state || authUser.client?.state || "RI",
        postalCode: prev.postalCode || authUser.client?.postalCode || "",
        emergencyContactName:
          prev.emergencyContactName || authUser.client?.emergencyContactName || "",
        emergencyContactPhone:
          prev.emergencyContactPhone || authUser.client?.emergencyContactPhone || "",
        emergencyContactRelation:
          prev.emergencyContactRelation ||
          authUser.client?.emergencyContactRelation ||
          "",
      }));
    }
  }, [authUser]);

  // Set up canvas resolution
  useEffect(() => {
    if (currentStep === 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;
      ctx.scale(scale, scale);

      ctx.strokeStyle = "#1A365D";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  }, [currentStep]);

  // Signature Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
    setErrors((prev) => ({ ...prev, signature: "" }));
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
    setSavedSignatureData("");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Step 1 Validation -> Proceed to Payment Step
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.clientFullName.trim()) newErrors.clientFullName = "Client name is required.";
    if (!formData.address.trim()) newErrors.address = "Address is required.";
    if (!formData.city.trim()) newErrors.city = "City is required.";
    if (!formData.postalCode.trim()) newErrors.postalCode = "ZIP/Postal code is required.";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
    if (!formData.dob.trim()) newErrors.dob = "Date of birth is required.";
    if (!formData.emergencyContactName.trim())
      newErrors.emergencyContactName = "Emergency contact name is required.";
    if (!formData.emergencyContactPhone.trim())
      newErrors.emergencyContactPhone = "Emergency contact phone is required.";
    if (!formData.clientPrintedName.trim())
      newErrors.clientPrintedName = "Printed name is required.";
    if (!formData.agreedToTerms)
      newErrors.agreedToTerms = "You must agree to the terms to proceed.";
    if (!hasSignature && !savedSignatureData)
      newErrors.signature = "Please sign in the digital signature box.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Capture Signature Data URL
    const canvas = canvasRef.current;
    const signatureData = canvas
      ? canvas.toDataURL("image/png")
      : savedSignatureData || "data:image/png;base64,signed";
    setSavedSignatureData(signatureData);

    setErrors({});
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Final Submission on Step 2 after Stripe Payment Confirmation
  const handleFinalPaymentSuccess = async (
    setupIntentId: string,
    paymentMethodId: string
  ) => {
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
        clientSignature: savedSignatureData || "data:image/png;base64,signed",
        agreedToTerms: true,
        paymentMethodId: paymentMethodId || null,
        setupIntentId: setupIntentId || null,
      }).unwrap();

      if (response.success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.replace("/dashboard");
        }, 1500);
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
            "Unable to complete agreement and payment. Please try again.",
        });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F5F9] text-[#243746]">
      {/* Top Header */}
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

          {/* Stepper Pill Indicator */}
          <div className="flex items-center gap-2 bg-[#F0F5F9] p-1 rounded-full border border-[#D9E4EC]">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                currentStep === 1
                  ? "bg-[#294B68] text-white shadow-xs"
                  : "text-[#64748B] hover:text-[#243746]"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. Agreement</span>
            </button>
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                currentStep === 2
                  ? "bg-[#294B68] text-white shadow-xs"
                  : "text-[#64748B]"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>2. Payment</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
        {/* Document Card Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-[#D9E4EC] p-6 sm:p-10 space-y-8">
          {isSuccess ? (
            <div className="p-10 bg-[#EAF3F8] border border-[#3F8F6B]/30 rounded-3xl text-center space-y-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-[#3F8F6B] text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#243746]">
                Agreement Executed &amp; Membership Activated!
              </h2>
              <p className="text-sm text-[#64748B] max-w-md mx-auto">
                Thank you for joining AgeWellRI, <strong>{formData.clientFullName}</strong>. Your safety oversight plan is now fully active. Redirecting you to your Member Dashboard...
              </p>
              <div className="pt-2 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#294B68]" />
              </div>
            </div>
          ) : currentStep === 2 ? (
            /* STEP 2: STRIPE PAYMENT & ACTIVATION */
            <PaymentStepCard
              selectedPlan={formData.selectedPlan}
              hasCleaningAddon={formData.hasCleaningAddon}
              clientFullName={formData.clientFullName}
              clientEmail={formData.email}
              clientPostalCode={formData.postalCode}
              onBackToAgreement={() => {
                setCurrentStep(1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onPaymentConfirmed={handleFinalPaymentSuccess}
              isSubmittingOverall={isSubmittingAgreement}
            />
          ) : (
            /* STEP 1: SERVICE AGREEMENT REVIEW & SIGNATURE */
            <form onSubmit={handleProceedToPayment} className="space-y-8">
              {/* Document Header */}
              <div className="text-center space-y-2 pb-6 border-b border-[#D9E4EC]">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746] tracking-tight">
                  AgeWellRI
                </h1>
                <p className="text-base sm:text-lg font-bold text-[#5E8FB2]">
                  Client Service Agreement
                </p>
                <p className="text-xs sm:text-sm text-[#64748B] max-w-xl mx-auto pt-1">
                  Please review and complete the service agreement below to set up your AgeWellRI safety oversight and care plan.
                </p>
              </div>

              {errors.general && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-sm text-red-700">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="font-semibold">{errors.general}</div>
                </div>
              )}

              {/* SECTION 1: Client Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#243746] pb-2 border-b border-[#D9E4EC]">
                  <span>1. Client Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">
                      Client Full Name *
                    </label>
                    <input
                      type="text"
                      name="clientFullName"
                      value={formData.clientFullName}
                      onChange={handleChange}
                      placeholder="e.g. Jane Doe"
                      className={`w-full h-11 px-3.5 text-sm font-medium text-[#243746] bg-[#F8FAFC] border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] transition-all ${
                        errors.clientFullName ? "border-red-400" : "border-[#D9E4EC]"
                      }`}
                    />
                    {errors.clientFullName && (
                      <p className="text-xs text-red-500 mt-1">{errors.clientFullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className={`w-full h-11 px-3.5 text-sm font-medium text-[#243746] bg-[#F8FAFC] border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] transition-all ${
                        errors.dob ? "border-red-400" : "border-[#D9E4EC]"
                      }`}
                    />
                    {errors.dob && (
                      <p className="text-xs text-red-500 mt-1">{errors.dob}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">
                      Home Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="e.g. 148 Hope Street"
                      className={`w-full h-11 px-3.5 text-sm font-medium text-[#243746] bg-[#F8FAFC] border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] transition-all ${
                        errors.address ? "border-red-400" : "border-[#D9E4EC]"
                      }`}
                    />
                    {errors.address && (
                      <p className="text-xs text-red-500 mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Providence"
                      className={`w-full h-11 px-3.5 text-sm font-medium text-[#243746] bg-[#F8FAFC] border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] transition-all ${
                        errors.city ? "border-red-400" : "border-[#D9E4EC]"
                      }`}
                    />
                    {errors.city && (
                      <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full h-11 px-3.5 text-sm font-medium text-[#243746] bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="02906"
                        className={`w-full h-11 px-3.5 text-sm font-medium text-[#243746] bg-[#F8FAFC] border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] transition-all ${
                          errors.postalCode ? "border-red-400" : "border-[#D9E4EC]"
                        }`}
                      />
                      {errors.postalCode && (
                        <p className="text-xs text-red-500 mt-1">{errors.postalCode}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(401) 555-0199"
                      className={`w-full h-11 px-3.5 text-sm font-medium text-[#243746] bg-[#F8FAFC] border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] transition-all ${
                        errors.phone ? "border-red-400" : "border-[#D9E4EC]"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="jane@example.com"
                      className="w-full h-11 px-3.5 text-sm font-medium text-[#243746] bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                    />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="pt-4 border-t border-[#D9E4EC]/60 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">
                      Emergency Contact Name *
                    </label>
                    <input
                      type="text"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleChange}
                      placeholder="e.g. Sarah Jenkins"
                      className={`w-full h-11 px-3.5 text-sm font-medium text-[#243746] bg-[#F8FAFC] border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] transition-all ${
                        errors.emergencyContactName ? "border-red-400" : "border-[#D9E4EC]"
                      }`}
                    />
                    {errors.emergencyContactName && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.emergencyContactName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">
                      Emergency Phone *
                    </label>
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleChange}
                      placeholder="(401) 555-0182"
                      className={`w-full h-11 px-3.5 text-sm font-medium text-[#243746] bg-[#F8FAFC] border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] transition-all ${
                        errors.emergencyContactPhone ? "border-red-400" : "border-[#D9E4EC]"
                      }`}
                    />
                    {errors.emergencyContactPhone && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.emergencyContactPhone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">
                      Relationship
                    </label>
                    <input
                      type="text"
                      name="emergencyContactRelation"
                      value={formData.emergencyContactRelation}
                      onChange={handleChange}
                      placeholder="e.g. Daughter"
                      className="w-full h-11 px-3.5 text-sm font-medium text-[#243746] bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Selected Service Plan */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#243746] pb-2 border-b border-[#D9E4EC]">
                  <span>2. Selected Service Plan</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Essential Guard */}
                  <label
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      formData.selectedPlan === "ESSENTIAL_GUARD"
                        ? "border-[#294B68] bg-[#EAF3F8]/40 shadow-xs"
                        : "border-[#D9E4EC] bg-white hover:border-[#5E8FB2]/50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#294B68] text-white flex items-center justify-center">
                          <Heart className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-[#243746] text-base">
                            Essential Guard
                          </h4>
                          <span className="text-xs text-[#64748B]">
                            4 Visits / Quarter
                          </span>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="selectedPlan"
                        value="ESSENTIAL_GUARD"
                        checked={formData.selectedPlan === "ESSENTIAL_GUARD"}
                        onChange={handleChange}
                        className="w-4 h-4 text-[#294B68] accent-[#294B68] mt-1"
                      />
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#D9E4EC] flex items-baseline justify-between">
                      <span className="text-xl font-black text-[#243746]">
                        $99.00
                      </span>
                      <span className="text-xs text-[#64748B]">Billed Quarterly</span>
                    </div>
                  </label>

                  {/* Guardian Plus */}
                  <label
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      formData.selectedPlan === "GUARDIAN_PLUS"
                        ? "border-[#294B68] bg-[#EAF3F8]/40 shadow-xs"
                        : "border-[#D9E4EC] bg-white hover:border-[#5E8FB2]/50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#3F8F6B] text-white flex items-center justify-center">
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-[#243746] text-base">
                            Guardian Plus
                          </h4>
                          <span className="text-xs text-[#64748B]">
                            8 Visits / Quarter
                          </span>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="selectedPlan"
                        value="GUARDIAN_PLUS"
                        checked={formData.selectedPlan === "GUARDIAN_PLUS"}
                        onChange={handleChange}
                        className="w-4 h-4 text-[#294B68] accent-[#294B68] mt-1"
                      />
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#D9E4EC] flex items-baseline justify-between">
                      <span className="text-xl font-black text-[#243746]">
                        $1,800.00
                      </span>
                      <span className="text-xs text-[#64748B]">Billed Quarterly</span>
                    </div>
                  </label>
                </div>

                {/* Add-on */}
                <label className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] flex items-center justify-between cursor-pointer hover:bg-[#F0F5F9] transition-all">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="hasCleaningAddon"
                      checked={formData.hasCleaningAddon}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-[#294B68] accent-[#294B68]"
                    />
                    <div>
                      <span className="text-sm font-bold text-[#243746]">
                        Add Quarterly Deep Cleaning (+ $50.00 / Quarter)
                      </span>
                      <p className="text-xs text-[#64748B]">
                        Includes 2 specialized home sanitation visits each quarter.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#294B68] bg-[#EAF3F8] px-2.5 py-1 rounded-full border border-[#5E8FB2]/30">
                    +$50.00
                  </span>
                </label>
              </div>

              {/* SECTION 3: Scope of Services & Disclaimer */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#243746] pb-2 border-b border-[#D9E4EC]">
                  <span>3. Scope of Services &amp; Medical Disclaimer</span>
                </div>
                <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] text-xs text-[#475569] leading-relaxed space-y-2">
                  <p>
                    <strong>Non-Medical Safety Oversight:</strong> AgeWellRI provides non-medical home safety assessments, hazard mitigation, fall prevention checks, and senior wellness check-ins.
                  </p>
                  <p className="text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    <strong>Medical Emergency Notice:</strong> AgeWellRI is NOT an emergency response service or healthcare provider. In the event of a medical emergency, call 911 immediately.
                  </p>
                </div>
              </div>

              {/* SECTION 4: Digital Signature Pad */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm font-bold uppercase tracking-wider text-[#243746] pb-2 border-b border-[#D9E4EC]">
                  <span>4. Digital Signature &amp; Acknowledgment</span>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-xs font-bold text-[#5E8FB2] hover:text-[#294B68] cursor-pointer"
                  >
                    Clear Signature Pad
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#64748B] uppercase">
                    Draw Signature with Mouse or Finger *
                  </label>
                  <div
                    className={`h-40 bg-[#F8FAFC] border-2 rounded-2xl relative overflow-hidden transition-all ${
                      errors.signature ? "border-red-400 bg-red-50/20" : "border-[#D9E4EC]"
                    }`}
                  >
                    <canvas
                      ref={canvasRef}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-full cursor-crosshair touch-none"
                    />
                    {!hasSignature && !savedSignatureData && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs font-semibold text-[#94A3B8]">
                        Sign in this box using your mouse or finger
                      </div>
                    )}
                  </div>
                  {errors.signature && (
                    <p className="text-xs text-red-500 font-medium">{errors.signature}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">
                      Printed Name *
                    </label>
                    <input
                      type="text"
                      name="clientPrintedName"
                      value={formData.clientPrintedName}
                      onChange={handleChange}
                      placeholder="Jane Doe"
                      className={`w-full h-11 px-3.5 text-sm font-medium text-[#243746] bg-[#F8FAFC] border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] ${
                        errors.clientPrintedName ? "border-red-400" : "border-[#D9E4EC]"
                      }`}
                    />
                    {errors.clientPrintedName && (
                      <p className="text-xs text-red-500 mt-1">{errors.clientPrintedName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">
                      Agreement Date *
                    </label>
                    <input
                      type="date"
                      name="agreementDate"
                      value={formData.agreementDate}
                      onChange={handleChange}
                      className="w-full h-11 px-3.5 text-sm font-medium text-[#243746] bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                    />
                  </div>
                </div>

                {/* Terms checkbox */}
                <label className="flex items-start gap-3 p-4 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] cursor-pointer hover:bg-[#F0F5F9] transition-all">
                  <input
                    type="checkbox"
                    name="agreedToTerms"
                    checked={formData.agreedToTerms}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-[#294B68] accent-[#294B68] mt-0.5"
                  />
                  <span className="text-xs text-[#475569] leading-relaxed">
                    I have read, understood, and agree to the AgeWellRI Client Service Agreement, scope of non-medical services, and automatic quarterly billing policies.
                  </span>
                </label>
                {errors.agreedToTerms && (
                  <p className="text-xs text-red-500 font-medium">{errors.agreedToTerms}</p>
                )}
              </div>

              {/* Proceed Button */}
              <div className="pt-4 border-t border-[#D9E4EC] flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 h-13 bg-[#294B68] hover:bg-[#1E374D] text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <span>Continue to Secure Payment</span>
                  <ArrowRight className="w-5 h-5" />
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
            AgeWellRI is a home safety oversight service and is not a medical provider, healthcare agency, or emergency response service. Our services do not constitute medical care, medical advice, diagnosis, or treatment of any kind.
          </div>

          <div className="text-center text-[11px] text-slate-500">
            &copy; 2026 AgeWellRI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
