"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  UserCheck,
  Clock,
  Home,
  Check,
} from "lucide-react";
import {
  useVerifyInvitationTokenQuery,
  useAcceptInvitationMutation,
} from "@/redux/features/onboarding/onboardingApi";
import { AuthInput } from "@/components/auth/auth-input";
import { PasswordInput } from "@/components/auth/password-input";
import {
  showSuccessAlert,
  showErrorAlert,
} from "@/lib/alerts/sweetalert";

export default function WelcomeInvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const resolvedSearchParams = use(searchParams);
  const token = resolvedSearchParams.token || "";
  const router = useRouter();

  const {
    data: verifyRes,
    isLoading: isVerifying,
    isError: isVerifyError,
  } = useVerifyInvitationTokenQuery(token, {
    skip: !token,
  });

  const [acceptInvitation, { isLoading: isSubmitting }] = useAcceptInvitationMutation();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    state: "RI",
    customState: "",
    address: "",
    city: "",
    postalCode: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pre-fill form from verified invitation
  useEffect(() => {
    if (verifyRes?.data) {
      const inv = verifyRes.data;
      const rawState = inv.prefillData?.state || "RI";
      const standardStates = ["RI", "CT", "MA"];
      const isCustomState = rawState && !standardStates.includes(rawState.toUpperCase());

      setFormData((prev) => ({
        ...prev,
        email: inv.email || prev.email,
        firstName: inv.prefillData?.firstName || prev.firstName,
        lastName: inv.prefillData?.lastName || prev.lastName,
        phone: inv.prefillData?.phone || prev.phone,
        state: isCustomState ? "OTHER" : (rawState || "RI"),
        customState: isCustomState ? rawState : "",
        address: inv.prefillData?.address || prev.address,
        city: inv.prefillData?.city || prev.city,
        postalCode: inv.prefillData?.postalCode || prev.postalCode,
      }));
    }
  }, [verifyRes]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const effectiveState =
    formData.state === "OTHER"
      ? formData.customState.trim().toUpperCase() || "OTHER"
      : formData.state;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.firstName.trim()) errs.firstName = "First name is required.";
    if (!formData.lastName.trim()) errs.lastName = "Last name is required.";
    if (!formData.email.trim()) errs.email = "Email is required.";
    if (!formData.phone.trim()) errs.phone = "Phone number is required.";
    if (formData.state === "OTHER" && !formData.customState.trim()) {
      errs.state = "Please specify your state name.";
    }
    if (!formData.password) errs.password = "Password is required.";
    else if (formData.password.length < 6)
      errs.password = "Password must be at least 6 characters.";
    if (formData.password !== formData.confirmPassword)
      errs.confirmPassword = "Passwords do not match.";
    if (!formData.agreeToTerms)
      errs.agreeToTerms = "You must agree to the Terms of Service.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrors({ general: "No invitation token provided." });
      return;
    }

    if (!validate()) return;

    try {
      const response = await acceptInvitation({
        token,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        state: effectiveState,
        address: formData.address.trim(),
        city: formData.city.trim(),
        postalCode: formData.postalCode.trim(),
      }).unwrap();

      if (response.success) {
        setSuccessMessage(
          `Welcome to the AgeWellRI family, ${formData.firstName}! Directing you to your Service Agreement...`
        );
        setTimeout(() => {
          router.replace("/agreement");
        }, 400);
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to create account.";
      setErrors({ general: msg });
      showErrorAlert("Account Setup Failed", msg);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F0F5F9] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#D9E4EC] p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#243746]">Invitation Link Missing</h2>
          <p className="text-sm text-[#64748B]">
            Please use the complete link provided in your welcome email, or contact AgeWellRI member care at (401) 555-0199.
          </p>
          <Link
            href="/login"
            className="inline-block w-full py-3 bg-[#294B68] text-white font-bold rounded-xl text-sm hover:bg-[#1E374D]"
          >
            Go to Member Login
          </Link>
        </div>
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#F0F5F9] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-[#D9E4EC] p-8 text-center space-y-3 shadow-sm max-w-sm w-full">
          <Loader2 className="w-8 h-8 animate-spin text-[#294B68] mx-auto" />
          <h3 className="text-lg font-bold text-[#243746]">Verifying Invitation Link...</h3>
          <p className="text-xs text-[#64748B]">Connecting to secure AgeWellRI onboarding registry</p>
        </div>
      </div>
    );
  }

  if (isVerifyError || !verifyRes?.success) {
    return (
      <div className="min-h-screen bg-[#F0F5F9] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#D9E4EC] p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#243746]">Invitation Expired or Invalid</h2>
          <p className="text-sm text-[#64748B]">
            This welcome link has already been used or has expired. Please request a new invitation from your administrator or care coordinator.
          </p>
          <div className="pt-2 space-y-2">
            <Link
              href="/register"
              className="inline-block w-full py-3 bg-[#294B68] text-white font-bold rounded-xl text-sm hover:bg-[#1E374D]"
            >
              Register New Account
            </Link>
            <Link
              href="/login"
              className="inline-block w-full py-2.5 text-[#5E8FB2] font-bold rounded-xl text-xs hover:underline"
            >
              Existing Member? Log In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F5F9] py-10 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl">
        {/* Welcome Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF3F8] border border-[#5E8FB2]/30 text-xs font-bold text-[#294B68] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#3F8F6B]" />
            Official Member Onboarding
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#243746] tracking-tight">
            Welcome to the AgeWellRI family.
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] max-w-md mx-auto">
            Set up your member account to complete your official Service Agreement and start your senior home safety coverage.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-[#D9E4EC] shadow-xl p-6 sm:p-10">
          {successMessage ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-[#3F8F6B] text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-[#243746]">Account Ready!</h3>
              <p className="text-sm text-[#64748B] max-w-sm mx-auto">{successMessage}</p>
              <div className="flex items-center justify-center gap-2 text-sm text-[#294B68] font-bold pt-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Redirecting to Service Agreement...</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errors.general && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{errors.general}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AuthInput
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="e.g. Eleanor"
                  required
                  error={errors.firstName}
                />
                <AuthInput
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="e.g. Vance"
                  required
                  error={errors.lastName}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AuthInput
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  error={errors.email}
                />
                <AuthInput
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(401) 555-0199"
                  required
                  error={errors.phone}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <AuthInput
                    label="Street Address (Optional)"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Ocean State Way"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                    State
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#D9E4EC] bg-[#F8FAFC] text-[#243746] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#294B68]"
                  >
                    <option value="RI">Rhode Island (RI)</option>
                    <option value="CT">Connecticut (CT)</option>
                    <option value="MA">Massachusetts (MA)</option>
                    <option value="OTHER">Other State</option>
                  </select>
                </div>
              </div>

              {/* Custom State input */}
              {formData.state === "OTHER" && (
                <div className="p-3.5 bg-[#EAF3F8] rounded-2xl border border-[#5E8FB2]/30 space-y-1 animate-in fade-in duration-200">
                  <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider">
                  Territory Name or Code *
                  </label>
                  <input
                    type="text"
                    required
                    name="customState"
                    value={formData.customState}
                    onChange={handleChange}
                    placeholder="e.g. New York, Florida, California, NH, TX..."
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-[#D9E4EC] text-sm font-bold text-[#243746] focus:outline-none focus:ring-2 focus:ring-[#294B68]"
                  />
                  {errors.state && <p className="text-xs text-red-600 font-semibold mt-1">{errors.state}</p>}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PasswordInput
                  label="Create Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  error={errors.password}
                />
                <PasswordInput
                  label="Confirm Password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  error={errors.confirmPassword}
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 rounded text-[#294B68] focus:ring-[#5E8FB2] border-slate-300"
                  />
                  <span className="text-xs text-[#64748B] leading-relaxed font-medium">
                    I agree to the{" "}
                    <Link href="/terms" className="text-[#5E8FB2] font-bold hover:underline">
                      AgeWellRI Terms of Service
                    </Link>{" "}
                    and understand that I will review and execute the Client Service Agreement next.
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="text-xs text-rose-600 font-medium mt-1">{errors.agreeToTerms}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#294B68] hover:bg-[#1E374D] text-white font-extrabold text-base rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Service Agreement</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
