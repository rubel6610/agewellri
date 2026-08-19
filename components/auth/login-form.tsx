"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { AuthCard } from "./auth-card";
import { AuthInput } from "./auth-input";
import { PasswordInput } from "./password-input";
import { useLoginMutation } from "@/redux/features/auth/authApi";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loginSuccessMessage, setLoginSuccessMessage] = useState<string | null>(null);

  const [login, { isLoading }] = useLoginMutation();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Please enter your password.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setErrors({});

    try {
      const response = await login({
        email: email.trim().toLowerCase(),
        password,
      }).unwrap();

      if (response.success && response.data) {
        const user = response.data.user;
        setLoginSuccessMessage(`Welcome back, ${user.firstName || "Member"}! Redirecting...`);

        const targetRoute = user.role === "ADMIN" ? "/admin" : "/dashboard";
        setTimeout(() => {
          router.push(targetRoute);
        }, 700);
      } else {
        setErrors({
          general: response.message || "Unable to sign in. Please try again.",
        });
      }
    } catch (err: unknown) {
      const errorData = (err as { data?: { message?: string; errors?: Record<string, string[]> } })?.data;
      if (errorData?.errors && typeof errorData.errors === "object") {
        const fieldErrors: FormErrors = {};
        if (errorData.errors.email?.[0]) fieldErrors.email = errorData.errors.email[0];
        if (errorData.errors.password?.[0]) fieldErrors.password = errorData.errors.password[0];
        fieldErrors.general = errorData.message || "Please correct the highlighted fields.";
        setErrors(fieldErrors);
      } else {
        setErrors({
          general:
            errorData?.message ||
            (err as { message?: string })?.message ||
            "Unable to sign in. Please check your credentials and try again.",
        });
      }
    }
  };

  return (
    <AuthCard>
      {/* Header / Branding */}
      <div className="flex flex-col items-center text-center space-y-4 mb-8">

        <div className="space-y-1 pt-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#243746] tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm sm:text-base text-[#64748B]">
            Sign in to access your AgeWellRI member portal.
          </p>
        </div>
      </div>

      {loginSuccessMessage ? (
        <div className="p-6 bg-[#EAF3F8] border border-[#5E8FB2]/30 rounded-2xl text-center space-y-4 animate-in fade-in duration-300">
          <div className="w-12 h-12 bg-[#3F8F6B] text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#243746]">Signed In Successfully</h3>
            <p className="text-sm text-[#64748B] mt-1">
              {loginSuccessMessage}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-[#294B68] font-semibold">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Redirecting to your portal...</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {errors.general && (
            <div className="p-3.5 bg-red-50 border border-[#C95C5C]/30 rounded-xl text-sm font-medium text-[#C95C5C] flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Email Field */}
          <AuthInput
            id="login-email"
            name="email"
            type="email"
            label="Email address"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            error={errors.email}
            icon={<Mail className="w-5 h-5" aria-hidden="true" />}
            required
            autoComplete="email"
          />

          {/* Password Field */}
          <PasswordInput
            id="login-password"
            name="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            error={errors.password}
            required
            autoComplete="current-password"
          />

          {/* Forgot password */}
          <div className="flex justify-end pt-1">
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert("Password reset functionality will connect to backend API.");
              }}
              className="text-sm font-semibold text-[#5E8FB2] hover:text-[#294B68] hover:underline focus-visible:outline-2 focus-visible:outline-[#5E8FB2] rounded"
            >
              Forgot password?
            </Link>
          </div>

          {/* Primary CTA Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 sm:h-[50px] mt-2 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-base rounded-xl shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#294B68] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>
      )}

      {/* Footer Navigation */}
      <div className="mt-8 pt-6 border-t border-[#D9E4EC] text-center">
        <p className="text-sm text-[#64748B]">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-bold text-[#5E8FB2] hover:text-[#294B68] hover:underline focus-visible:outline-2 focus-visible:outline-[#5E8FB2] rounded"
          >
            Create your account
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
