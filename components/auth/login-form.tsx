"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Phone,
  KeyRound,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { AuthCard } from "./auth-card";
import { AuthInput } from "./auth-input";
import { PasswordInput } from "./password-input";
import {
  useLoginMutation,
  useRequestSmsOtpMutation,
  useVerifySmsOtpMutation,
} from "@/redux/features/auth/authApi";
import { useAppSelector } from "@/redux/hooks";

interface FormErrors {
  email?: string;
  password?: string;
  phone?: string;
  otp?: string;
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

  const [authMode, setAuthMode] = useState<"password" | "sms">("password");

  // Password Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // SMS OTP Login State
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [errors, setErrors] = useState<FormErrors>({});
  const [loginSuccessMessage, setLoginSuccessMessage] = useState<string | null>(
    null,
  );

  const [login, { isLoading: isPasswordLoading }] = useLoginMutation();
  const [requestSmsOtp, { isLoading: isSmsSending }] =
    useRequestSmsOtpMutation();
  const [verifySmsOtp, { isLoading: isSmsVerifying }] =
    useVerifySmsOtpMutation();

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
      if (user.requiresAgreement || !user.hasCompletedAgreement) {
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

  // Cooldown countdown timer
  useEffect(() => {
    let timer: any = null;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendCooldown]);

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
          `Welcome back, ${user.firstName || "Member"}! Redirecting...`,
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

  const handleRequestSmsCode = async () => {
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      setErrors({
        phone: "Please enter a valid 10-digit mobile phone number.",
      });
      return;
    }

    setErrors({});

    try {
      await requestSmsOtp({ phone: phone.trim() }).unwrap();
      setIsOtpSent(true);
      setResendCooldown(60);
    } catch (err: any) {
      setErrors({
        general:
          err?.data?.message ||
          err?.message ||
          "Failed to send SMS verification code.",
      });
    }
  };

  const handleVerifySmsCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      setErrors({ otp: "Please enter the 6-digit verification code." });
      return;
    }

    setErrors({});

    try {
      const response = await verifySmsOtp({
        phone: phone.trim(),
        otp: otp.trim(),
      }).unwrap();

      if (response.success && response.data) {
        const user = response.data.user;
        setLoginSuccessMessage(
          `Verified successfully! Welcome back, ${user.firstName || "Member"}.`,
        );
        handleRedirect(user);
      }
    } catch (err: any) {
      setErrors({
        general:
          err?.data?.message ||
          err?.message ||
          "Invalid or expired code. Please try again.",
      });
    }
  };

  return (
    <AuthCard>
      {/* Header / Branding */}
      <div className="flex flex-col items-center text-center space-y-4 mb-6">
        <div className="space-y-1 pt-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#243746] tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm sm:text-base text-[#64748B]">
            Sign in to access your AgeWellRI member portal.
          </p>
        </div>
      </div>

      {/* Auth Mode Tabs */}
      <div className="flex p-1 bg-[#F0F5F9] rounded-xl mb-6 border border-[#D9E4EC]">
        <button
          type="button"
          onClick={() => {
            setAuthMode("password");
            setErrors({});
          }}
          className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            authMode === "password"
              ? "bg-[#294B68] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#243746]"
          }`}
        >
          Email & Password
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMode("sms");
            setErrors({});
          }}
          className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            authMode === "sms"
              ? "bg-[#294B68] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#243746]"
          }`}
        >
          📱 Sign in with SMS Code
        </button>
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
      ) : authMode === "password" ? (
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
      ) : (
        /* SMS OTP Form */
        <div className="space-y-5">
          {errors.general && (
            <div className="p-3.5 bg-red-50 border border-[#C95C5C]/30 rounded-xl text-sm font-medium text-[#C95C5C] flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          {!isOtpSent ? (
            <div className="space-y-4">
              <AuthInput
                id="login-phone"
                name="phone"
                type="tel"
                label="Registered Mobile Phone"
                placeholder="(401) 555-0199"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone)
                    setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                error={errors.phone}
                icon={<Phone className="w-5 h-5" aria-hidden="true" />}
                required
                autoComplete="tel"
              />

              <button
                type="button"
                onClick={handleRequestSmsCode}
                disabled={isSmsSending}
                className="w-full h-12 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-base rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isSmsSending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send 6-Digit Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <form onSubmit={handleVerifySmsCode} className="space-y-4">
              <div className="p-3 bg-[#EAF3F8] rounded-xl text-xs font-semibold text-[#294B68] flex items-center justify-between">
                <span>Code sent to {phone}</span>
                <button
                  type="button"
                  onClick={() => setIsOtpSent(false)}
                  className="text-xs text-[#5E8FB2] hover:text-[#294B68] underline font-bold cursor-pointer"
                >
                  Change
                </button>
              </div>

              <AuthInput
                id="login-otp"
                name="otp"
                type="text"
                maxLength={6}
                label="6-Digit Verification Code"
                placeholder="123456"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));
                  if (errors.otp)
                    setErrors((prev) => ({ ...prev, otp: undefined }));
                }}
                error={errors.otp}
                icon={<KeyRound className="w-5 h-5" aria-hidden="true" />}
                required
              />

              <div className="flex items-center justify-between text-xs font-bold text-[#64748B]">
                <span>Didn&apos;t receive code?</span>
                <button
                  type="button"
                  disabled={resendCooldown > 0 || isSmsSending}
                  onClick={handleRequestSmsCode}
                  className="text-[#5E8FB2] hover:text-[#294B68] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend Code"}
                </button>
              </div>

              <button
                type="submit"
                disabled={isSmsVerifying}
                className="w-full h-12 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-base rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isSmsVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <span>Verify & Sign In</span>
                )}
              </button>
            </form>
          )}
        </div>
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
