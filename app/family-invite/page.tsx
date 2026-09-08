"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  Shield,
  FileCheck,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  HeartHandshake,
} from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import {
  useVerifyFamilyInviteQuery,
  useAcceptFamilyInviteMutation,
} from "@/redux/features/family/familyApi";
import { useAppDispatch } from "@/redux/hooks";
import { setCredentials } from "@/redux/features/auth/authSlice";
import { showSuccessAlert, showErrorAlert, showToast } from "@/lib/alerts/sweetalert";

function FamilyInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const token = searchParams.get("token") || "";

  const {
    data: verifyRes,
    isLoading: isVerifying,
    isError: isVerifyError,
    error: verifyErrorData,
  } = useVerifyFamilyInviteQuery(token, {
    skip: !token,
  });

  const [acceptInvite, { isLoading: isSubmitting }] = useAcceptFamilyInviteMutation();

  const inviteData = verifyRes?.data;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreedToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (inviteData?.name) {
      const parts = inviteData.name.trim().split(" ");
      const first = parts[0] || "";
      const last = parts.slice(1).join(" ") || "";
      setFormData((prev) => ({
        ...prev,
        firstName: first,
        lastName: last,
        phone: inviteData.phone || "",
      }));
    }
  }, [inviteData]);

  if (!token) {
    return (
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#D9E4EC] p-8 shadow-xl text-center space-y-4">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-[#243746]">Missing Invitation Token</h2>
        <p className="text-sm text-[#64748B]">
          Please check your email and click the official invitation link provided by AgeWellRI.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#294B68] text-white text-xs font-bold rounded-xl hover:bg-[#1E374D] transition-colors"
        >
          <span>Go to Sign In</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#D9E4EC] p-12 shadow-xl text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#294B68] mx-auto" />
        <h3 className="text-base font-bold text-[#243746]">
          Verifying Family Member Invitation...
        </h3>
        <p className="text-xs text-[#64748B]">
          Validating your secure invitation token with AgeWellRI.
        </p>
      </div>
    );
  }

  if (isVerifyError || !inviteData) {
    const errorMsg =
      (verifyErrorData as any)?.data?.message ||
      "This invitation is invalid, has expired, or was already accepted.";
    return (
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#D9E4EC] p-8 shadow-xl text-center space-y-4">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-[#243746]">Invitation Link Invalid</h2>
        <p className="text-sm text-[#64748B] leading-relaxed">{errorMsg}</p>
        <div className="pt-2 flex flex-col gap-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#294B68] text-white text-xs font-bold rounded-xl hover:bg-[#1E374D] transition-colors"
          >
            <span>Go to Member Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-[11px] text-[#94A3B8]">
            Need help? Contact support@agewellri.com
          </p>
        </div>
      </div>
    );
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms = "You must agree to the Terms & Privacy Policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await acceptInvite({
        token,
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined,
      }).unwrap();

      if (res.success && res.data) {
        const { user, token: authToken, refreshToken } = res.data;
        dispatch(setCredentials({ user, token: authToken, refreshToken }));

        showToast("Welcome to AgeWellRI!", "success");
        await showSuccessAlert(
          "Account Activated!",
          `Welcome to AgeWellRI, ${user.firstName}. Your family portal account is ready.`
        );

        router.push("/dashboard");
      }
    } catch (err: any) {
      const message =
        err?.data?.message || err?.message || "Failed to activate your account.";
      showErrorAlert("Activation Error", message);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-xl space-y-6">
      {/* Top Welcome Banner */}
      <div className="text-center space-y-2 pb-4 border-b border-[#D9E4EC]/60">
        <div className="w-12 h-12 bg-[#EAF3F8] text-[#294B68] rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#243746]">
          Activate Your Family Account
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B]">
          You have been invited by{" "}
          <strong className="text-[#243746]">{inviteData.clientName}</strong> to join their
          AgeWellRI safety network as their{" "}
          <strong className="text-[#294B68]">{inviteData.relationship}</strong>.
        </p>
      </div>

      {/* Permissions summary */}
      <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] space-y-2">
        <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
          Your Access Privileges:
        </span>
        <div className="flex flex-wrap gap-2">
          {inviteData.permissions?.reportAccess && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <FileCheck className="w-3.5 h-3.5" /> Visit Reports
            </span>
          )}
          {inviteData.permissions?.portalAccess && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
              <Shield className="w-3.5 h-3.5" /> Client Portal
            </span>
          )}
          {inviteData.permissions?.billingAccess && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
              <CreditCard className="w-3.5 h-3.5" /> Billing &amp; Invoices
            </span>
          )}
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1">
              First Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className={`w-full pl-9 pr-3 py-2 rounded-xl border text-sm text-[#243746] focus:outline-none focus:ring-2 focus:ring-[#294B68] ${
                  errors.firstName ? "border-rose-400 bg-rose-50/20" : "border-[#D9E4EC]"
                }`}
              />
            </div>
            {errors.firstName && (
              <p className="text-[11px] font-semibold text-rose-500 mt-1">
                {errors.firstName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1">
              Last Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className={`w-full pl-9 pr-3 py-2 rounded-xl border text-sm text-[#243746] focus:outline-none focus:ring-2 focus:ring-[#294B68] ${
                  errors.lastName ? "border-rose-400 bg-rose-50/20" : "border-[#D9E4EC]"
                }`}
              />
            </div>
            {errors.lastName && (
              <p className="text-[11px] font-semibold text-rose-500 mt-1">
                {errors.lastName}
              </p>
            )}
          </div>
        </div>

        {/* Email Field (Read Only) */}
        <div>
          <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
            <input
              type="email"
              value={inviteData.email}
              readOnly
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D9E4EC] bg-slate-50 text-sm text-[#64748B] cursor-not-allowed"
            />
          </div>
        </div>

        {/* Phone Field */}
        <div>
          <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1">
            Phone Number <span className="text-[11px] font-normal text-[#64748B]">(Optional)</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
            <input
              type="tel"
              placeholder="(401) 555-0123"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D9E4EC] text-sm text-[#243746] focus:outline-none focus:ring-2 focus:ring-[#294B68]"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1">
            Create Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className={`w-full pl-9 pr-10 py-2 rounded-xl border text-sm text-[#243746] focus:outline-none focus:ring-2 focus:ring-[#294B68] ${
                errors.password ? "border-rose-400 bg-rose-50/20" : "border-[#D9E4EC]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-[#64748B] hover:text-[#243746] cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] font-semibold text-rose-500 mt-1">
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1">
            Confirm Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className={`w-full pl-9 pr-10 py-2 rounded-xl border text-sm text-[#243746] focus:outline-none focus:ring-2 focus:ring-[#294B68] ${
                errors.confirmPassword
                  ? "border-rose-400 bg-rose-50/20"
                  : "border-[#D9E4EC]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-2.5 text-[#64748B] hover:text-[#243746] cursor-pointer"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-[11px] font-semibold text-rose-500 mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Terms Agreement Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.agreedToTerms}
              onChange={(e) =>
                setFormData({ ...formData, agreedToTerms: e.target.checked })
              }
              className="w-4 h-4 rounded border-[#CBD5E1] text-[#294B68] focus:ring-[#294B68] cursor-pointer mt-0.5"
            />
            <span className="text-xs text-[#64748B] leading-tight">
              I agree to the AgeWellRI{" "}
              <Link href="/terms-of-use" className="text-[#294B68] font-bold underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className="text-[#294B68] font-bold underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {errors.agreedToTerms && (
            <p className="text-[11px] font-semibold text-rose-500 mt-1">
              {errors.agreedToTerms}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#294B68] hover:bg-[#1E374D] text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Activating Account...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Activate Family Account</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function FamilyInvitePage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={
          <div className="p-8 text-center text-sm text-[#64748B]">
            Loading invitation...
          </div>
        }
      >
        <FamilyInviteForm />
      </Suspense>
    </AuthLayout>
  );
}
