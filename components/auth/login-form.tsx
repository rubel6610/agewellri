"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { AuthCard } from "./auth-card";
import { AuthInput } from "./auth-input";
import { PasswordInput } from "./password-input";
import { useLoginMutation } from "@/redux/features/auth/authApi";
import { useAppSelector } from "@/redux/hooks";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const {
    isAuthenticated,
    isInitialized,
    user: currentAuthUser,
  } = useAppSelector((state) => state.auth);

  // Password Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [loginSuccessMessage, setLoginSuccessMessage] = useState<string | null>(
    null,
  );

  const [login, { isLoading: isPasswordLoading }] = useLoginMutation();

  const handleRedirect = (user: any) => {
    const safeRedirect =
      redirectUrl &&
      redirectUrl.startsWith("/") &&
      !redirectUrl.startsWith("/login") &&
      !redirectUrl.startsWith("/register")
        ? redirectUrl
        : null;

    let targetRoute = "/dashboard";
    if (user.role === "ADMIN") {
      targetRoute =
        safeRedirect && safeRedirect.startsWith("/admin")
          ? safeRedirect
          : "/admin";
    } else if (user.role === "TECHNICIAN") {
      targetRoute =
        safeRedirect && safeRedirect.startsWith("/technician")
          ? safeRedirect
          : "/technician";
    } else if (user.role === "CLIENT") {
      // Authorized family members never sign agreements -> go straight to dashboard
      if (user.isFamilyMember) {
        targetRoute =
          safeRedirect && safeRedirect.startsWith("/dashboard")
            ? safeRedirect
            : "/dashboard";
      } else if (user.requiresAgreement || !user.hasCompletedAgreement) {
        targetRoute = "/agreement";
      } else {
        targetRoute =
          safeRedirect && safeRedirect.startsWith("/dashboard")
            ? safeRedirect
            : "/dashboard";
      }
    }

    setTimeout(() => {
      router.replace(targetRoute);
    }, 300);
  };

  // If already authenticated when visiting /login -> auto redirect
  useEffect(() => {
    if (isInitialized && isAuthenticated && currentAuthUser) {
      handleRedirect(currentAuthUser);
    }
  }, [isInitialized, isAuthenticated, currentAuthUser]);

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Please enter your password.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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
        setLoginSuccessMessage(
          `Welcome, ${user.firstName || "Member"}! Redirecting...`,
        );
        handleRedirect(user);
      }
    } catch (err: any) {
      const errorData = err?.data;
      setErrors({
        general:
          errorData?.message ||
          err?.message ||
          "Unable to sign in. Please verify your email and password.",
      });
    }
  };

  return (
    <AuthCard>
      {/* Header / Branding */}
      <div className="flex flex-col items-center text-center space-y-4 mb-6">
        <div className="space-y-1 pt-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#243746] tracking-tight">
            Welcome 
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
            <h3 className="text-lg font-bold text-[#243746]">
              Signed In Successfully
            </h3>
            <p className="text-sm text-[#64748B] mt-1">{loginSuccessMessage}</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-[#294B68] font-semibold">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Redirecting to your portal...</span>
          </div>
        </div>
      ) : (
        /* Password Form */
        <form onSubmit={handlePasswordSubmit} noValidate className="space-y-5">
          {errors.general && (
            <div className="p-3.5 bg-red-50 border border-[#C95C5C]/30 rounded-xl text-sm font-medium text-[#C95C5C] flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          <AuthInput
            id="login-email"
            name="email"
            type="email"
            label="Email address"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email)
                setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            error={errors.email}
            icon={<Mail className="w-5 h-5" aria-hidden="true" />}
            required
            autoComplete="email"
          />

          <PasswordInput
            id="login-password"
            name="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password)
                setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            error={errors.password}
            required
            autoComplete="current-password"
          />

          <div className="flex justify-end pt-1">
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-[#5E8FB2] hover:text-[#294B68] hover:underline focus-visible:outline-2 focus-visible:outline-[#5E8FB2] rounded"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isPasswordLoading}
            className="w-full h-12 sm:h-[50px] mt-2 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-base rounded-xl shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#294B68] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPasswordLoading ? (
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
