"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Shield,
  Sparkles,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  ArrowRight,
  Lock,
  RotateCcw,
  ShieldAlert,
  Calendar,
  Check,
  UserCheck,
  Users,
  Key,
  Home,
  HelpCircle,
  Printer,
  Download,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/features/auth/authSlice";
import { useSubmitAgreementMutation } from "@/redux/features/auth/authApi";
import { useGetActivePlansQuery } from "@/redux/features/plan/planApi";
import { PaymentStepCard } from "../payment/payment-step-card";
import { TrustBadges } from "../support/trust-badges";

import {
  OWNER_SIGNATURE_SVG_DATA_URI,
  AGEWELL_OWNER_DETAILS,
} from "@/lib/agreement/owner-signature";
import {
  confirmDelete,
  confirmCriticalAction,
  showSuccessAlert,
  showErrorAlert,
  showToast,
} from "@/lib/alerts/sweetalert";

interface Point {
  x: number;
  y: number;
}

export function ClientAgreementForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const [submitAgreement, { isLoading: isSubmittingAgreement }] =
    useSubmitAgreementMutation();

  const { data: dynamicPlans = [], isLoading: isPlansLoading } =
    useGetActivePlansQuery();

  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const handleGoBackToLogin = async () => {
    const confirmed = await confirmCriticalAction({
      title: "Return to Login?",
      text: "You can sign back in at any time to resume and complete your Client Service Agreement.",
      confirmButtonText: "Yes, Return to Login",
      cancelButtonText: "Stay on Agreement",
      isDestructive: false,
    });

    if (confirmed) {
      dispatch(logout());
      router.push("/login");
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    clientFullName: "",
    address: "",
    city: "",
    state: "RI",
    customState: "",
    postalCode: "",
    phone: "",
    dob: "",
    email: "",
    // Signer Role & Authority
    signerRole: "RESIDENT" as
      | "RESIDENT"
      | "FAMILY_MEMBER"
      | "CAREGIVER"
      | "POWER_OF_ATTORNEY"
      | "AUTHORIZED_REPRESENTATIVE",
    signerName: "",
    legalAuthority: "",
    primaryBillingContact: "RESIDENT",
    // Primary / Authorized contact
    primaryContactName: "",
    primaryContactPhone: "",
    primaryContactEmail: "",
    primaryContactRelation: "",
    // Emergency contact (Secondary)
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    // Home Access
    homeAccessType: "RESIDENT_ANSWERS" as
      | "LOCKBOX"
      | "RESIDENT_ANSWERS"
      | "DIGITAL_CODE"
      | "OTHER",
    homeAccessInstructions: "",
    homeAccessCode: "",
    // Selected Plan
    selectedPlanId: "",
    selectedPlanCode: "GUARDIAN_PLUS",
    hasCleaningAddon: false,
    // Signature
    clientPrintedName: "",
    authorizedRepName: "",
    relationshipToClient: "",
    agreementDate: new Date().toISOString().split("T")[0],
    agreedToTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [savedSignatureData, setSavedSignatureData] = useState<string>("");

  // Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const pointsRef = useRef<Point[]>([]);
  const [hasSignature, setHasSignature] = useState(false);

  // Default plan selection when plans load
  useEffect(() => {
    if (dynamicPlans.length > 0 && !formData.selectedPlanId) {
      const invitedPlan = authUser?.client?.selectedPlan?.toLowerCase() || "";
      const defaultPlan =
        dynamicPlans.find(
          (p) =>
            invitedPlan &&
            (p.name.toLowerCase().includes(invitedPlan) ||
              p.code.toLowerCase() === invitedPlan.replace(/\s+/g, "_")),
        ) ||
        dynamicPlans.find((p) => p.code === "GUARDIAN_PLUS") ||
        dynamicPlans[0];

      if (defaultPlan) {
        setFormData((prev) => ({
          ...prev,
          selectedPlanId: defaultPlan.id,
          selectedPlanCode: defaultPlan.code,
        }));
      }
    }
  }, [dynamicPlans, formData.selectedPlanId, authUser]);

  // Sync auth registration info
  useEffect(() => {
    if (authUser) {
      const fullName =
        `${authUser.firstName || ""} ${authUser.lastName || ""}`.trim();
      const clean = (val?: string | null) => {
        if (!val) return "";
        const trimmed = val.trim();
        if (trimmed === "TBD" || trimmed === "00000") return "";
        return trimmed;
      };

      const rawAddress = clean(authUser.client?.address);
      const rawState = clean(authUser.client?.state);
      const standardStates = ["RI", "CT", "MA"];
      const isCustomState =
        rawState && !standardStates.includes(rawState.toUpperCase());

      setFormData((prev) => ({
        ...prev,
        clientFullName: prev.clientFullName || fullName,
        email: authUser.email || prev.email || "",
        phone: prev.phone || clean(authUser.phone) || "",
        clientPrintedName: prev.clientPrintedName || fullName,
        address: prev.address || rawAddress,
        city: prev.city || clean(authUser.client?.city),
        state: prev.state || (isCustomState ? "OTHER" : rawState || "RI"),
        customState: prev.customState || (isCustomState ? rawState : ""),
        postalCode: prev.postalCode || clean(authUser.client?.postalCode),
        emergencyContactName:
          prev.emergencyContactName ||
          clean(authUser.client?.emergencyContactName),
        emergencyContactPhone:
          prev.emergencyContactPhone ||
          clean(authUser.client?.emergencyContactPhone),
        emergencyContactRelation:
          prev.emergencyContactRelation ||
          clean(authUser.client?.emergencyContactRelation),
      }));
    }
  }, [authUser]);

  // Selected Plan Object & Pricing
  const selectedPlanObj = useMemo(() => {
    return (
      dynamicPlans.find((p) => p.id === formData.selectedPlanId) ||
      dynamicPlans.find((p) => p.code === formData.selectedPlanCode) ||
      dynamicPlans[0] ||
      null
    );
  }, [dynamicPlans, formData.selectedPlanId, formData.selectedPlanCode]);

  const basePrice = selectedPlanObj ? selectedPlanObj.price : 1892;
  const addonPrice = formData.hasCleaningAddon ? 60 : 0;
  const totalPrice = basePrice + addonPrice;

  // Resolve effective state code for submission and disclosure
  const effectiveState = useMemo(() => {
    if (formData.state === "OTHER") {
      return formData.customState.trim().toUpperCase() || "OTHER";
    }
    return formData.state || "RI";
  }, [formData.state, formData.customState]);

  // Compute 3-Business-Day Cancellation Date preview
  const cancellationDeadlineFormatted = useMemo(() => {
    const d = new Date(formData.agreementDate || Date.now());
    let daysAdded = 0;
    while (daysAdded < 3) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0) {
        // Skip Sundays
        daysAdded++;
      }
    }
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [formData.agreementDate]);

  // Canvas Setup
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.strokeStyle = "#1A365D";
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
  }, []);

  useEffect(() => {
    if (currentStep === 1) {
      setupCanvas();
      window.addEventListener("resize", setupCanvas);
      return () => window.removeEventListener("resize", setupCanvas);
    }
  }, [currentStep, setupCanvas]);

  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const pt = getCanvasCoords(e);
    pointsRef.current = [pt];

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = "#1A365D";
      ctx.fill();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const pt = getCanvasCoords(e);
    pointsRef.current.push(pt);

    if (pointsRef.current.length > 2) {
      const len = pointsRef.current.length;
      const p1 = pointsRef.current[len - 2];
      const p2 = pointsRef.current[len - 1];
      const midPoint = {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
      };

      ctx.beginPath();
      ctx.moveTo(pointsRef.current[len - 3].x, pointsRef.current[len - 3].y);
      ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
      ctx.stroke();

      setHasSignature(true);
      setErrors((prev) => ({ ...prev, signature: "" }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    pointsRef.current = [];
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  const clearSignature = async () => {
    if (hasSignature || savedSignatureData) {
      const confirmed = await confirmDelete({
        title: "Clear Signature?",
        text: "Do you want to reset your signature pad and sign again?",
        confirmButtonText: "Yes, Clear",
      });
      if (!confirmed) return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setSavedSignatureData("");
    pointsRef.current = [];
    showToast("Signature cleared", "info");
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "postalCode") {
      // ZIP postal code takes only numbers (up to 5 digits)
      const numericValue = value.replace(/\D/g, "").slice(0, 5);
      setFormData((prev) => ({ ...prev, postalCode: numericValue }));
    } else if (name === "email") {
      // Agreement email is fixed to authUser account and cannot be modified
      return;
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

    if (!formData.clientFullName.trim())
      newErrors.clientFullName = "Resident full name is required.";
    if (!formData.address.trim())
      newErrors.address = "Home street address is required.";
    if (!formData.city.trim()) newErrors.city = "City is required.";
    if (
      !formData.state.trim() ||
      (formData.state === "OTHER" && !formData.customState.trim())
    ) {
      newErrors.state = "State is required.";
    }
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = "ZIP code is required.";
    } else if (formData.postalCode.trim().length < 5) {
      newErrors.postalCode = "ZIP code must be 5 digits.";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
    if (!formData.dob.trim()) newErrors.dob = "Date of birth is required.";

    // Signer role specific checks
    if (formData.signerRole !== "RESIDENT") {
      if (!formData.signerName.trim())
        newErrors.signerName =
          "Signer / Authorized representative name is required.";
      if (!formData.legalAuthority.trim())
        newErrors.legalAuthority =
          "Please specify legal authority (e.g., Power of Attorney, Conservator).";
    }

    // Emergency Contact
    if (!formData.emergencyContactName.trim())
      newErrors.emergencyContactName = "Emergency contact name is required.";
    if (!formData.emergencyContactPhone.trim())
      newErrors.emergencyContactPhone = "Emergency contact phone is required.";

    if (!formData.clientPrintedName.trim())
      newErrors.clientPrintedName = "Printed name is required.";
    if (!formData.agreedToTerms)
      newErrors.agreedToTerms =
        "You must agree to the Client Service Agreement terms to proceed.";
    if (!hasSignature && !savedSignatureData)
      newErrors.signature =
        "Please sign in the digital signature box using your mouse, finger, or stylus.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const canvas = canvasRef.current;
    const signatureData = canvas
      ? canvas.toDataURL("image/png")
      : savedSignatureData || "data:image/png;base64,signed";
    setSavedSignatureData(signatureData);

    setErrors({});
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 2 Payment / Invoice Confirmation
  const handleFinalPaymentSuccess = async (
    setupIntentId: string,
    paymentMethodId: string,
  ) => {
    try {
      const response = await submitAgreement({
        clientFullName: formData.clientFullName.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: effectiveState,
        postalCode: formData.postalCode.trim(),
        phone: formData.phone.trim(),
        dob: formData.dob.trim(),
        email: (authUser?.email || formData.email).trim(),
        signerRole: formData.signerRole,
        signerName:
          formData.signerRole !== "RESIDENT"
            ? formData.signerName.trim()
            : formData.clientPrintedName.trim(),
        legalAuthority:
          formData.signerRole !== "RESIDENT"
            ? formData.legalAuthority.trim()
            : null,
        primaryBillingContact: formData.primaryBillingContact,
        primaryContactName: formData.primaryContactName.trim() || null,
        primaryContactPhone: formData.primaryContactPhone.trim() || null,
        primaryContactEmail: formData.primaryContactEmail.trim() || null,
        primaryContactRelation: formData.primaryContactRelation.trim() || null,
        emergencyContactName: formData.emergencyContactName.trim(),
        emergencyContactPhone: formData.emergencyContactPhone.trim(),
        emergencyContactRelation:
          formData.emergencyContactRelation.trim() || null,
        homeAccessType: formData.homeAccessType,
        homeAccessInstructions: formData.homeAccessInstructions.trim() || null,
        homeAccessCode: formData.homeAccessCode.trim() || null,
        planId: selectedPlanObj?.id || null,
        planVersionId: selectedPlanObj?.versionId || null,
        selectedPlan: selectedPlanObj?.code || formData.selectedPlanCode,
        hasCleaningAddon: formData.hasCleaningAddon,
        billingMethod: "AUTOMATIC",
        paymentMethodId,
        setupIntentId,
        clientPrintedName: formData.clientPrintedName.trim(),
        authorizedRepName:
          formData.signerRole !== "RESIDENT"
            ? formData.signerName.trim()
            : null,
        relationshipToClient:
          formData.signerRole !== "RESIDENT"
            ? formData.relationshipToClient.trim()
            : null,
        agreementDate: formData.agreementDate,
        clientSignature: savedSignatureData || "data:image/png;base64,signed",
        agreedToTerms: true,
      }).unwrap();

      if (response.success) {
        setIsSuccess(true);

        const now = new Date();
        const nextMonthFirst = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          1,
        );
        const commencementDateFormatted = nextMonthFirst.toLocaleDateString(
          "en-US",
          {
            month: "long",
            day: "numeric",
            year: "numeric",
          },
        );
        const planName =
          selectedPlanObj?.name ||
          formData.selectedPlanCode ||
          "AgeWellRI Membership Plan";
        const priceText = selectedPlanObj?.price
          ? `$${selectedPlanObj.price}/month`
          : "$295/month";

        await showSuccessAlert(
          "Agreement Signed — Welcome to AgeWellRI!",
          `Your service agreement is complete and your subscription is active.\n\n• Your plan: ${planName} — ${priceText}\n• Service begins: ${commencementDateFormatted}\n• First billing: ${commencementDateFormatted} — you won't be charged today\n• A copy of your signed agreement has been emailed to you for your records.\n\nWe'll be in touch shortly to schedule your first visit. Questions? Call us anytime at (401) 212-3002.`,
        );
        router.push("/dashboard");
      }
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.message ||
        "Failed to finalize membership activation.";
      setErrors({ payment: msg });
      showErrorAlert("Activation Failed", msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] text-[#243746]">
      {/* Horizontal Top Header Bar */}
      <header className="bg-white border-b border-[#D9E4EC] py-3 sm:py-3.5 px-3 sm:px-6 lg:px-8 fixed top-0 left-0 right-0 z-30 shadow-xs box-border">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="AgeWellRI Logo"
                width={165}
                height={44}
                priority
                className="h-auto w-auto max-h-8 sm:max-h-10 object-contain"
              />
              <div className="hidden sm:block border-l border-[#D9E4EC] pl-3.5 py-0.5">
                <h1 className="text-xs sm:text-sm font-extrabold text-[#243746] tracking-tight leading-tight">
                  Client Service Agreement
                </h1>
                <p className="text-[10px] sm:text-[11px] text-[#5E8FB2] font-medium">
                  Review &amp; Digital Activation
                </p>
              </div>
            </div>

            {/* Back button on small mobile header */}
            <div className="md:hidden">
              <button
                type="button"
                onClick={handleGoBackToLogin}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#D9E4EC] bg-white hover:bg-slate-50 text-[#64748B] hover:text-[#243746] text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
                title="Exit agreement and return to login screen"
              >
                <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Back</span>
              </button>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1 sm:gap-2 text-xs font-bold w-full md:w-auto justify-center">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentStep === 1
                    ? "bg-[#294B68] text-white shadow-2xs"
                    : "bg-[#EAF3F8] text-[#294B68]"
                }`}
              >
                <span className="hidden sm:inline">1. Service Agreement</span>
                <span className="sm:hidden">1. Agreement</span>
              </button>

              <span className="text-[#94A3B8]">/</span>

              <button
                type="button"
                onClick={() => {
                  if (hasSignature && formData.agreedToTerms) setCurrentStep(2);
                }}
                disabled={!(hasSignature && formData.agreedToTerms)}
                className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                  currentStep === 2
                    ? "bg-[#294B68] text-white shadow-2xs"
                    : hasSignature && formData.agreedToTerms
                      ? "bg-[#EAF3F8] text-[#294B68] cursor-pointer"
                      : "bg-slate-100 text-[#94A3B8] cursor-not-allowed opacity-60"
                }`}
              >
                <span className="hidden sm:inline">
                  2. Membership &amp; Billing
                </span>
                <span className="sm:hidden">2. Billing</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Fixed Header Height Spacer */}
      <div className="h-16 sm:h-20 shrink-0 mb-6 sm:mb-8" aria-hidden="true" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 pb-20">
        {/* STEP 1: Agreement Review & Signature */}
        {currentStep === 1 && (
          <form
            onSubmit={handleProceedToPayment}
            noValidate
            className="space-y-6"
          >
            {/* Signer Role Selector */}
            <div className="bg-white rounded-2xl border border-[#D9E4EC] p-6 shadow-xs space-y-4">
              <h2 className="text-base font-black text-[#243746] flex items-center gap-2 border-b border-[#D9E4EC]/60 pb-3">
                <UserCheck className="w-5 h-5 text-[#294B68]" />
                Who is signing this agreement?
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    formData.signerRole === "RESIDENT"
                      ? "border-[#294B68] bg-[#EAF3F8]"
                      : "border-[#D9E4EC] bg-white hover:bg-[#F0F5F9]/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="signerRole"
                    value="RESIDENT"
                    checked={formData.signerRole === "RESIDENT"}
                    onChange={() =>
                      setFormData({ ...formData, signerRole: "RESIDENT" })
                    }
                    className="mt-1 w-4 h-4 text-[#294B68]"
                  />
                  <div>
                    <div className="font-extrabold text-sm text-[#243746]">
                      I am the Resident / Senior
                    </div>
                    <div className="text-xs text-[#5E8FB2] mt-0.5 font-medium leading-relaxed">
                      I live at this residence and am signing on my own behalf.
                    </div>
                  </div>
                </label>

                <label
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    formData.signerRole !== "RESIDENT"
                      ? "border-[#294B68] bg-[#EAF3F8]"
                      : "border-[#D9E4EC] bg-white hover:bg-[#F0F5F9]/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="signerRole"
                    value="FAMILY_MEMBER"
                    checked={formData.signerRole !== "RESIDENT"}
                    onChange={() =>
                      setFormData({ ...formData, signerRole: "FAMILY_MEMBER" })
                    }
                    className="mt-1 w-4 h-4 text-[#294B68]"
                  />
                  <div>
                    <div className="font-extrabold text-sm text-[#243746]">
                      Family Member / Caregiver / POA
                    </div>
                    <div className="text-xs text-[#5E8FB2] mt-0.5 font-medium leading-relaxed">
                      I am an authorized family member, proxy, or legal
                      representative signing for the resident.
                    </div>
                  </div>
                </label>
              </div>

              {/* Representative Details (if not resident) */}
              {formData.signerRole !== "RESIDENT" && (
                <div className="p-4 bg-[#F0F5F9] rounded-xl border border-[#D9E4EC] space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                        Your Full Legal Name{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="signerName"
                        placeholder="e.g. Jane Doe"
                        value={formData.signerName}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#D9E4EC] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                      />
                      {errors.signerName && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.signerName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                        Relationship to Resident{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="relationshipToClient"
                        placeholder="e.g. Daughter, Son, Guardian, Representative"
                        value={formData.relationshipToClient}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#D9E4EC] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                      Legal Authority Designation{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="legalAuthority"
                      value={formData.legalAuthority}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D9E4EC] rounded-xl text-sm font-bold text-[#243746]"
                    >
                      <option value="">-- Select Legal Authority --</option>
                      <option value="Durable Power of Attorney (POA)">
                        Durable Power of Attorney (POA)
                      </option>
                      <option value="Healthcare Proxy / Surrogate">
                        Healthcare Proxy / Surrogate
                      </option>
                      <option value="Court-Appointed Conservator / Guardian">
                        Court-Appointed Conservator / Guardian
                      </option>
                      <option value="Authorized Family Representative">
                        Authorized Family Representative
                      </option>
                    </select>
                    {errors.legalAuthority && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.legalAuthority}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Section 1: Resident Info */}
            <div className="bg-white rounded-2xl border border-[#D9E4EC] p-6 shadow-xs space-y-4">
              <h2 className="text-base font-black text-[#243746] flex items-center gap-2 border-b border-[#D9E4EC]/60 pb-3">
                <Home className="w-5 h-5 text-[#294B68]" />
                Resident Information & Residence Location
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                    Resident Full Legal Name{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="clientFullName"
                    placeholder="e.g. Eleanor Vance"
                    value={formData.clientFullName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                  />
                  {errors.clientFullName && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.clientFullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                  />
                  {errors.dob && (
                    <p className="text-xs text-red-500 mt-1">{errors.dob}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                  Service Address (Street Address){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="e.g. 142 Ocean View Highway"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                />
                {errors.address && (
                  <p className="text-xs text-red-500 mt-1">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="e.g. Westerly"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                  />
                  {errors.city && (
                    <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-bold text-[#243746]"
                  >
                    <option value="RI">Rhode Island (RI)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                    ZIP Code (Numeric) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={5}
                    name="postalCode"
                    placeholder="02891"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                  />
                  {errors.postalCode && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.postalCode}
                    </p>
                  )}
                </div>

                {/* Custom State Input when 'OTHER' is chosen */}
                {formData.state === "OTHER" && (
                  <div className="sm:col-span-3 p-3.5 bg-[#EAF3F8] rounded-xl border border-[#294B68]/20 animate-in fade-in duration-200">
                    <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                      Territory Name or Code{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customState"
                      placeholder="e.g. NH, ME, VT, NJ, TX, California"
                      value={formData.customState}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#294B68]/30 rounded-xl text-sm font-bold text-[#243746] focus:outline-none focus:ring-2 focus:ring-[#294B68]"
                    />
                    {errors.state && (
                      <p className="text-xs text-red-500 mt-1 font-semibold">
                        {errors.state}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="(401) 555-0123"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#5E8FB2] bg-[#F0F5F9] px-2 py-0.5 rounded-md border border-[#D9E4EC]">
                      <Lock className="w-3 h-3 text-[#5E8FB2]" /> Account Email
                      (Fixed)
                    </span>
                  </div>
                  <input
                    type="email"
                    name="email"
                    readOnly
                    disabled
                    value={authUser?.email || formData.email}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-[#D9E4EC] rounded-xl text-sm font-bold text-slate-600 cursor-not-allowed select-none shadow-inner"
                  />
                  <p className="text-[11px] text-[#64748B] mt-1 font-medium">
                    Synced with your login account. All agreement receipts and
                    safety reports are routed here.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Emergency Contact (Mandatory Secondary Contact) */}
            <div className="bg-white rounded-2xl border border-[#D9E4EC] p-6 shadow-xs space-y-4">
              <h2 className="text-base font-black text-[#243746] flex items-center gap-2 border-b border-[#D9E4EC]/60 pb-3">
                <ShieldAlert className="w-5 h-5 text-[#C95C5C]" />
                Designated Emergency Contact (Family / Secondary)
              </h2>
              <p className="text-xs text-[#5E8FB2] font-medium">
                We notify your designated emergency contact whenever a home
                safety check-in report is filed or if a visit cannot be
                completed.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                    Emergency Contact Name{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    placeholder="e.g. Robert Vance"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                  />
                  {errors.emergencyContactName && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.emergencyContactName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                    Emergency Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    placeholder="(401) 555-0188"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                  />
                  {errors.emergencyContactPhone && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.emergencyContactPhone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                    Relationship to Resident
                  </label>
                  <input
                    type="text"
                    name="emergencyContactRelation"
                    placeholder="e.g. Son, Daughter, Neighbor"
                    value={formData.emergencyContactRelation}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Home Access Instructions */}
            <div className="bg-white rounded-2xl border border-[#D9E4EC] p-6 shadow-xs space-y-4">
              <h2 className="text-base font-black text-[#243746] flex items-center gap-2 border-b border-[#D9E4EC]/60 pb-3">
                <Key className="w-5 h-5 text-[#294B68]" />
                Technician Home Access Instructions
              </h2>
              <p className="text-xs text-[#5E8FB2] font-medium">
                Please specify how our certified AgeWellRI safety technicians
                should access the home for scheduled check-in visits.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center gap-3 ${
                    formData.homeAccessType === "RESIDENT_ANSWERS"
                      ? "border-[#294B68] bg-[#EAF3F8]"
                      : "border-[#D9E4EC] bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="homeAccessType"
                    value="RESIDENT_ANSWERS"
                    checked={formData.homeAccessType === "RESIDENT_ANSWERS"}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        homeAccessType: "RESIDENT_ANSWERS",
                      })
                    }
                    className="w-4 h-4 text-[#294B68]"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#243746]">
                      Resident Answers Door
                    </div>
                    <div className="text-[11px] text-[#5E8FB2]">
                      Technician knocks / rings doorbell
                    </div>
                  </div>
                </label>

                <label
                  className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center gap-3 ${
                    formData.homeAccessType === "LOCKBOX"
                      ? "border-[#294B68] bg-[#EAF3F8]"
                      : "border-[#D9E4EC] bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="homeAccessType"
                    value="LOCKBOX"
                    checked={formData.homeAccessType === "LOCKBOX"}
                    onChange={() =>
                      setFormData({ ...formData, homeAccessType: "LOCKBOX" })
                    }
                    className="w-4 h-4 text-[#294B68]"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#243746]">
                      Exterior Lockbox / Key Safe
                    </div>
                    <div className="text-[11px] text-[#5E8FB2]">
                      Key safe on side porch or door
                    </div>
                  </div>
                </label>

                <label
                  className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center gap-3 ${
                    formData.homeAccessType === "DIGITAL_CODE"
                      ? "border-[#294B68] bg-[#EAF3F8]"
                      : "border-[#D9E4EC] bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="homeAccessType"
                    value="DIGITAL_CODE"
                    checked={formData.homeAccessType === "DIGITAL_CODE"}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        homeAccessType: "DIGITAL_CODE",
                      })
                    }
                    className="w-4 h-4 text-[#294B68]"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#243746]">
                      Keyless Digital Code
                    </div>
                    <div className="text-[11px] text-[#5E8FB2]">
                      Electronic keypad deadbolt
                    </div>
                  </div>
                </label>

                <label
                  className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center gap-3 ${
                    formData.homeAccessType === "OTHER"
                      ? "border-[#294B68] bg-[#EAF3F8]"
                      : "border-[#D9E4EC] bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="homeAccessType"
                    value="OTHER"
                    checked={formData.homeAccessType === "OTHER"}
                    onChange={() =>
                      setFormData({ ...formData, homeAccessType: "OTHER" })
                    }
                    className="w-4 h-4 text-[#294B68]"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#243746]">
                      Other / Custom Instructions
                    </div>
                    <div className="text-[11px] text-[#5E8FB2]">
                      Neighbor key or gate entry
                    </div>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                  Detailed Access Instructions / Lockbox Code
                </label>
                <textarea
                  rows={2}
                  name="homeAccessInstructions"
                  placeholder="e.g. Key safe on side railing; code: 4821. Please ring bell before unlocking."
                  value={formData.homeAccessInstructions}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                />
              </div>
            </div>

            {/* Section 4: Dynamic Service Plan Selection */}
            <div className="bg-white rounded-2xl border border-[#D9E4EC] p-6 sm:p-7 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D9E4EC]/60 pb-4">
                <div>
                  <h2 className="text-lg font-black text-[#243746] flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-[#294B68]" />
                    Select Your Service Plan
                  </h2>
                  <p className="text-xs text-[#5E8FB2] mt-0.5 font-medium">
                    Choose your desired safety oversight and home upkeep tier.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EAF3F8] text-[#294B68] rounded-full text-xs font-black border border-[#D9E4EC] self-start sm:self-auto">
                  <Shield className="w-3.5 h-3.5 text-[#294B68]" /> Guaranteed
                  Rate Lock
                </div>
              </div>

              {isPlansLoading ? (
                <div className="py-16 text-center text-[#5E8FB2] flex flex-col items-center justify-center gap-3 font-bold bg-[#F8FAFC] rounded-2xl border border-dashed border-[#D9E4EC]">
                  <Loader2 className="w-7 h-7 animate-spin text-[#294B68]" />
                  <span>Loading certified service plans...</span>
                </div>
              ) : dynamicPlans.length === 0 ? (
                <div className="py-12 text-center text-[#5E8FB2] flex flex-col items-center justify-center gap-3 font-bold bg-[#F8FAFC] rounded-2xl border border-dashed border-[#D9E4EC]">
                  <AlertCircle className="w-7 h-7 text-amber-600" />
                  <span className="text-sm font-black text-[#243746]">
                    No active service plans available
                  </span>
                  <p className="text-xs text-[#64748B] max-w-md">
                    Please contact AgeWellRI support or try refreshing the
                    agreement page.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {dynamicPlans.map((plan) => {
                    const isSelected =
                      formData.selectedPlanId === plan.id ||
                      formData.selectedPlanCode === plan.code;

                    const isGuardianPlus = plan.code === "GUARDIAN_PLUS";
                    const isEssential = plan.code === "ESSENTIAL_GUARD";

                    return (
                      <div
                        key={plan.id}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            selectedPlanId: plan.id,
                            selectedPlanCode: plan.code,
                          })
                        }
                        className={`relative p-5 sm:p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer group ${
                          isSelected
                            ? "border-[#294B68] bg-linear-to-r from-[#F0F7FD] via-white to-white shadow-md ring-2 ring-[#294B68]/15"
                            : "border-[#D9E4EC] bg-white hover:border-[#5E8FB2] hover:bg-[#FBFDFE] hover:shadow-xs"
                        }`}
                      >
                        {/* Selection accent indicator left bar */}
                        {isSelected && (
                          <div className="absolute top-3 bottom-3 left-0 w-1.5 bg-[#294B68] rounded-r-full" />
                        )}

                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                          {/* Left Info Column */}
                          <div className="flex items-start gap-4 flex-1">
                            {/* Radio Checkbox */}
                            <div
                              className={`w-6 h-6 rounded-full mt-1 flex items-center justify-center transition-all shrink-0 ${
                                isSelected
                                  ? "bg-[#294B68] text-white shadow-xs ring-2 ring-[#294B68]/20"
                                  : "border-2 border-[#CBD5E1] bg-white group-hover:border-[#5E8FB2]"
                              }`}
                            >
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <h3 className="text-lg sm:text-xl font-black text-[#243746] tracking-tight group-hover:text-[#294B68] transition-colors">
                                  {plan.name}
                                </h3>

                                {isGuardianPlus ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                                    <Sparkles className="w-3 h-3 text-emerald-600" />{" "}
                                    Most Popular · Safety &amp; Upkeep
                                  </span>
                                ) : isEssential ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#EAF3F8] text-[#294B68] border border-[#294B68]/20 shadow-2xs">
                                    <Shield className="w-3 h-3 text-[#294B68]" />{" "}
                                    Essential Safety
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                                    <Sparkles className="w-3 h-3 text-amber-600" />{" "}
                                    Deep Sanitization
                                  </span>
                                )}
                              </div>

                              {plan.shortDescription && (
                                <p className="text-xs text-[#5E8FB2] leading-relaxed font-medium max-w-2xl">
                                  {plan.shortDescription}
                                </p>
                              )}

                              {/* Included Services Breakdown Badges */}
                              {plan.services && plan.services.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {plan.services.map((srv, sidx) => (
                                    <span
                                      key={sidx}
                                      className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#F8FAFC] border border-[#D9E4EC] text-[#243746]"
                                    >
                                      {srv.category === "CLEANING"
                                        ? "✨"
                                        : "🛡️"}{" "}
                                      {srv.allocatedVisits} {srv.serviceName}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Key Features Chips */}
                              {plan.features && plan.features.length > 0 && (
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1.5 text-xs text-[#243746]">
                                  {plan.features
                                    .slice(0, 3)
                                    .map((feat, fidx) => (
                                      <span
                                        key={fidx}
                                        className="inline-flex items-center gap-1.5 text-[#243746] font-semibold text-[11px]"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                        <span>{feat}</span>
                                      </span>
                                    ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right Pricing Column */}
                          <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l border-[#D9E4EC]/70 lg:pl-6 shrink-0 min-w-[190px]">
                            <div className="text-left lg:text-right">
                              <div className="flex items-baseline gap-1 lg:justify-end">
                                <span className="text-2xl sm:text-3xl font-black text-[#243746] tracking-tight">
                                  ${plan.price}
                                </span>
                                <span className="text-xs font-bold text-[#64748B]">
                                  / month
                                </span>
                              </div>
                              <div className="text-[11px] font-bold text-[#5E8FB2] mt-0.5">
                                {plan.totalVisits} Total Safety Visits / Cycle
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Live Total Pricing Summary Ribbon */}
              <div className="p-4 bg-linear-to-r from-[#294B68] to-[#1E374D] text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-300 font-extrabold">
                    Selected Membership Summary
                  </div>
                  <div className="text-base font-black flex items-center gap-2 mt-0.5">
                    <span>{selectedPlanObj?.name || "Service Plan"}</span>
                  </div>
                </div>
                <div className="sm:text-right">
                  <div className="text-2xl font-black text-white leading-tight">
                    ${basePrice.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-300 font-medium">
                    Billed monthly · Cancel anytime
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: State-Specific Legal Disclosure & 3-Day Cancellation Notice */}
            <div className="bg-white rounded-2xl border border-[#D9E4EC] p-6 shadow-xs space-y-4 text-xs leading-relaxed text-[#243746]">
              <h2 className="text-base font-black text-[#243746] flex items-center gap-2 border-b border-[#D9E4EC]/60 pb-3">
                <Shield className="w-5 h-5 text-[#294B68]" />
                State Statutory Cancellation Notice &amp; Legal Disclosures
              </h2>

              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2 text-[#243746]">
                <div className="font-black text-amber-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  NOTICE OF CANCELLATION ({effectiveState} Law)
                </div>
                <p>
                  <strong>
                    YOU MAY CANCEL THIS TRANSACTION WITHOUT PENALTY OR
                    OBLIGATION
                  </strong>{" "}
                  within three (3) business days from the date below.
                </p>
                <p className="text-[11px] text-amber-900/90 font-medium">
                  To cancel this agreement, mail or deliver a signed and dated
                  copy of this cancellation notice or any other written notice
                  to{" "}
                  <strong>AgeWellRI, 84 High Street, Westerly, RI 02891</strong>
                  , or via email to <strong>agewellri@gmail.com</strong> not
                  later than:
                </p>
                <div className="p-2.5 bg-white border border-amber-300 rounded-lg text-sm font-black text-[#294B68] text-center">
                  Midnight of {cancellationDeadlineFormatted}
                </div>
              </div>

              <div className="space-y-2 pt-2 text-[#64748B]">
                <p>
                  <strong>Non-Medical Safety Disclaimer:</strong> AgeWellRI
                  provides non-medical home safety assessments, hazard
                  mitigation, fall prevention checks, and safety oversight
                  visits. AgeWellRI is NOT a home health agency, licensed
                  medical provider, or 911 emergency dispatch service.
                </p>
                <p>
                  <strong>Billing & Payment Terms:</strong> Membership services
                  renew automatically at the contracted rate of{" "}
                  <strong>${totalPrice} / month</strong>. You may update billing
                  methods or cancel renewal at any time from your member portal.
                </p>
              </div>
            </div>

            {/* Section 6: Digital Signature Block */}
            <div className="bg-white rounded-2xl border border-[#D9E4EC] p-6 shadow-xs space-y-5">
              <h2 className="text-base font-black text-[#243746] flex items-center gap-2 border-b border-[#D9E4EC]/60 pb-3">
                <FileText className="w-5 h-5 text-[#294B68]" />
                Electronic Signature & Execution
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                    Printed Legal Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="clientPrintedName"
                    value={formData.clientPrintedName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                  />
                  {errors.clientPrintedName && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.clientPrintedName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                    Agreement Execution Date
                  </label>
                  <input
                    type="date"
                    disabled
                    value={formData.agreementDate}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-[#D9E4EC] rounded-xl text-sm font-semibold text-slate-600 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Signature Canvas */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#243746] uppercase tracking-wider">
                    Draw Your Signature Below{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-xs text-[#5E8FB2] hover:text-[#294B68] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Clear Signature
                  </button>
                </div>

                <div className="border-2 border-dashed border-[#5E8FB2] rounded-2xl bg-white p-1 relative overflow-hidden shadow-inner">
                  <canvas
                    ref={canvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className="w-full h-36 touch-none cursor-crosshair block bg-transparent"
                  />
                  {!hasSignature && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs text-[#94A3B8] font-semibold">
                      Sign here with mouse, finger, or stylus
                    </div>
                  )}
                </div>
                {errors.signature && (
                  <p className="text-xs text-red-500 font-semibold">
                    {errors.signature}
                  </p>
                )}
              </div>

              {/* AgeWellRI Representative Signature Counterpart */}
              <div className="p-4 bg-[#F0F5F9] rounded-xl border border-[#D9E4EC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#5E8FB2]">
                    Authorized Provider Counter-Signature
                  </div>
                  <div className="text-sm font-black text-[#243746] mt-0.5">
                    {AGEWELL_OWNER_DETAILS.name}, {AGEWELL_OWNER_DETAILS.title}
                  </div>
                  <div className="text-xs text-[#5E8FB2]">
                    {AGEWELL_OWNER_DETAILS.company} · Westerly, RI
                  </div>
                </div>
                <div className="w-36 h-12 relative shrink-0 bg-white rounded-lg border border-[#D9E4EC] p-1 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={OWNER_SIGNATURE_SVG_DATA_URI}
                    alt="AgeWellRI Counter-Signature"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>

              {/* Terms Agreement Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-[#294B68]/20 bg-[#EAF3F8]/50 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreedToTerms"
                    checked={formData.agreedToTerms}
                    onChange={handleChange}
                    className="w-5 h-5 mt-0.5 text-[#294B68] rounded cursor-pointer shrink-0"
                  />
                  <span className="text-xs font-bold text-[#243746] leading-relaxed">
                    I have read, understand, and agree to the terms of the
                    AgeWellRI Client Service Agreement, state cancellation
                    policy, and membership terms.
                  </span>
                </label>
                {errors.agreedToTerms && (
                  <p className="text-xs text-red-500 font-semibold mt-1">
                    {errors.agreedToTerms}
                  </p>
                )}
              </div>
            </div>

            {/* Proceed & Back Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-4">
              <button
                type="button"
                onClick={handleGoBackToLogin}
                className="w-full sm:w-auto px-5 py-3.5 border border-[#D9E4EC] bg-white hover:bg-slate-50 text-[#64748B] hover:text-[#243746] font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-extrabold text-base rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Membership & Billing</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Secure Payment & Billing Activation */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#D9E4EC] p-6 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#5E8FB2] uppercase tracking-wider">
                  Selected Plan
                </div>
                <div className="text-xl font-black text-[#243746]">
                  {selectedPlanObj?.name}{" "}
                  {formData.hasCleaningAddon ? "+ Cleaning Add-On" : ""}
                </div>
                <div className="text-xs text-[#5E8FB2] font-semibold">
                  ${totalPrice} billed monthly ·{" "}
                  {selectedPlanObj?.totalVisits || 6} visits
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGoBackToLogin}
                  className="px-3.5 py-1.5 rounded-lg border border-[#D9E4EC] text-[#64748B] hover:text-[#243746] font-bold text-xs hover:bg-[#F0F5F9] cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-3.5 py-1.5 rounded-lg border border-[#D9E4EC] text-[#294B68] font-bold text-xs hover:bg-[#F0F5F9] cursor-pointer"
                >
                  Edit Agreement
                </button>
              </div>
            </div>

            {errors.payment && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errors.payment}</span>
              </div>
            )}

            {isSuccess ? (
              <div className="bg-white rounded-3xl border border-emerald-200 p-8 text-center space-y-4 shadow-sm animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-[#243746]">
                  Agreement Signed & Activated!
                </h2>
                <p className="text-sm text-[#5E8FB2] max-w-md mx-auto font-medium">
                  Your AgeWellRI membership has been confirmed. Redirecting you
                  to schedule your first visit...
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-[#294B68] font-bold">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Opening Booking Calendar...</span>
                </div>
              </div>
            ) : (
              <PaymentStepCard
                selectedPlan={selectedPlanObj?.code || "GUARDIAN_PLUS"}
                hasCleaningAddon={formData.hasCleaningAddon}
                onPaymentSuccess={handleFinalPaymentSuccess}
              />
            )}
          </div>
        )}

        {/* Trust Badges Footer */}
        <TrustBadges className="mt-8" />
      </main>
    </div>
  );
}
