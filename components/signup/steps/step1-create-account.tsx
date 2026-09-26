"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useRegisterMutation } from "@/redux/features/auth/authApi";
import { useAppSelector } from "@/redux/hooks";

interface Step1CreateAccountProps {
  onSuccess: (accountData: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  }) => void;
  initialData?: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
}

export function Step1CreateAccount({ onSuccess, initialData }: Step1CreateAccountProps) {
  const authUser = useAppSelector((state) => state.auth.user);
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = sessionStorage.getItem("agewellri_signup_step1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setFormData((prev) => ({
            ...prev,
            ...parsed,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to restore step1 form data:", err);
    }
  }, []);

  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    password: "",
    confirmPassword: "",
    agreedToLegal: false,
  });

  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      try {
        sessionStorage.setItem("agewellri_signup_step1", JSON.stringify(formData));
      } catch (err) {
        console.error("Failed to persist step1 form data:", err);
      }
    }
  }, [formData, mounted]);

  useEffect(() => {
    if (initialData?.email || authUser?.email) {
      setFormData((prev) => ({
        ...prev,
        firstName: prev.firstName || initialData?.firstName || authUser?.firstName || "",
        lastName: prev.lastName || initialData?.lastName || authUser?.lastName || "",
        phone: prev.phone || initialData?.phone || authUser?.phone || "",
        email: prev.email || initialData?.email || authUser?.email || "",
      }));
    }
  }, [initialData, authUser]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // If already authenticated and email matches, simply proceed
    if (authUser && authUser.email === formData.email) {
      onSuccess({
        firstName: formData.firstName || authUser.firstName,
        lastName: formData.lastName || authUser.lastName,
        phone: formData.phone || authUser.phone || "",
        email: authUser.email,
      });
      return;
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setErrorMessage("Please enter both first and last name.");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!formData.phone.trim()) {
      setErrorMessage("Please enter a valid phone number.");
      return;
    }

    if (!formData.password || formData.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!formData.agreedToLegal) {
      setErrorMessage("You must agree to the Terms of Use and Privacy Policy to create an account.");
      return;
    }

    try {
      const res = await registerUser({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
      }).unwrap();

      if (res?.success) {
        onSuccess({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim().toLowerCase(),
        });
      } else {
        setErrorMessage(res?.message || "Registration failed. Please try again.");
      }
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.message ||
        (typeof err?.data?.errors === "string" ? err.data.errors : null) ||
        "An error occurred while creating your account. The email may already be in use.";
      setErrorMessage(msg);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EAF3F8] text-[#294B68] text-xs font-bold uppercase tracking-wider">
          Step 1 of 9
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
          Create Your Account
        </h2>
        <p className="text-sm text-[#5E8FB2] max-w-md mx-auto">
          Start by setting up your AgeWellRI member portal account. You will use this account to manage visits and billing.
        </p>
      </div>

      {/* Form Container */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-sm space-y-6"
      >
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-in fade-in">
            <span className="font-bold shrink-0">Error:</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {mounted && authUser && (
          <div className="p-4 bg-[#EAF3F8] border border-[#5E8FB2]/30 text-[#294B68] rounded-2xl text-xs sm:text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#3F8F6B]" />
              <span>
                Logged in as <strong>{authUser.email}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                onSuccess({
                  firstName: authUser.firstName,
                  lastName: authUser.lastName,
                  phone: authUser.phone || "",
                  email: authUser.email,
                })
              }
              className="px-3 py-1 bg-[#294B68] text-white text-xs font-bold rounded-lg hover:bg-[#1E374D] cursor-pointer"
            >
              Continue &rarr;
            </button>
          </div>
        )}

        {/* First & Last Name Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
              First Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Eleanor"
                className="w-full h-12 pl-11 pr-4 text-sm font-medium text-[#243746] bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] transition-all"
              />
              <User className="w-5 h-5 text-[#94A3B8] absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Last Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Vance"
                className="w-full h-12 pl-11 pr-4 text-sm font-medium text-[#243746] bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] transition-all"
              />
              <User className="w-5 h-5 text-[#94A3B8] absolute left-3.5 top-3.5" />
            </div>
          </div>
        </div>

        {/* Phone & Email Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Phone Number *
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(401) 555-0123"
                className="w-full h-12 pl-11 pr-4 text-sm font-medium text-[#243746] bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] transition-all"
              />
              <Phone className="w-5 h-5 text-[#94A3B8] absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="eleanor@example.com"
                className="w-full h-12 pl-11 pr-4 text-sm font-medium text-[#243746] bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] transition-all"
              />
              <Mail className="w-5 h-5 text-[#94A3B8] absolute left-3.5 top-3.5" />
            </div>
          </div>
        </div>

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full h-12 pl-11 pr-11 text-sm font-medium text-[#243746] bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] transition-all"
              />
              <Lock className="w-5 h-5 text-[#94A3B8] absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-[#94A3B8] hover:text-[#243746] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full h-12 pl-11 pr-11 text-sm font-medium text-[#243746] bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] transition-all"
              />
              <Lock className="w-5 h-5 text-[#94A3B8] absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-3.5 text-[#94A3B8] hover:text-[#243746] cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mandatory Checkbox for Terms & Privacy */}
        <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] space-y-2">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              required
              checked={formData.agreedToLegal}
              onChange={(e) => setFormData({ ...formData, agreedToLegal: e.target.checked })}
              className="mt-1 w-5 h-5 rounded border-[#D9E4EC] text-[#294B68] focus:ring-[#5E8FB2] cursor-pointer"
            />
            <span className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              I agree to the{" "}
              <Link
                href="/terms-of-use"
                className="text-[#294B68] font-bold underline hover:text-[#1E374D]"
              >
                Terms of Use
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                className="text-[#294B68] font-bold underline hover:text-[#1E374D]"
              >
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 bg-[#294B68] hover:bg-[#1E374D] text-white font-extrabold text-base rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Continue to Choose Plan</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <div className="text-center">
          <p className="text-xs text-[#64748B]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#294B68] font-bold hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
