"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  KeyRound,
  Lock,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { AuthCard } from "./auth-card";
import { AuthInput } from "./auth-input";
import { PasswordInput } from "./password-input";
import {
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
} from "@/redux/features/auth/authApi";

type ForgotStep = "EMAIL" | "OTP" | "NEW_PASSWORD" | "SUCCESS";

export function ForgotPasswordForm() {
  const router = useRouter();

  const [step, setStep] = useState<ForgotStep>("EMAIL");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [resendCooldown, setResendCooldown] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // RTK Query Mutations
  const [forgotPassword, { isLoading: isSendingOtp }] = useForgotPasswordMutation();
  const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();
  const [resetPassword, { isLoading: isResettingPassword }] = useResetPasswordMutation();

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend Countdown Timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto focus first OTP input when entering OTP step
  useEffect(() => {
    if (step === "OTP") {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // -------------------------------------------------------------
  // STEP 1: Request OTP
  // -------------------------------------------------------------
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    try {
      const res = await forgotPassword({ email: trimmedEmail }).unwrap();
      if (res.success) {
        setSuccessMessage(`A 6-digit verification code has been sent to ${trimmedEmail}`);
        setResendCooldown(60);
        setStep("OTP");
      } else {
        setErrorMessage(res.message || "Unable to send verification code. Please try again.");
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to send verification code.";
      setErrorMessage(msg);
    }
  };

  // -------------------------------------------------------------
  // STEP 2: OTP Input Handling & Verification
  // -------------------------------------------------------------
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric digits
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned && value !== "") return;

    const newOtp = [...otp];
    newOtp[index] = cleaned ? cleaned.slice(-1) : "";
    setOtp(newOtp);
    setErrorMessage(null);

    // Auto-advance to next input
    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newOtp = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    setErrorMessage(null);

    // Focus appropriate box
    const nextIndex = Math.min(pasted.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    try {
      const res = await verifyOtp({
        email: email.trim().toLowerCase(),
        otp: fullOtp,
      }).unwrap();

      if (res.success) {
        setSuccessMessage("Code verified successfully!");
        setStep("NEW_PASSWORD");
      } else {
        setErrorMessage(res.message || "Invalid verification code.");
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Invalid or expired verification code.";
      setErrorMessage(msg);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isSendingOtp) return;
    setErrorMessage(null);

    try {
      const res = await forgotPassword({ email: email.trim().toLowerCase() }).unwrap();
      if (res.success) {
        setSuccessMessage(`New verification code sent to ${email}`);
        setResendCooldown(60);
        setOtp(["", "", "", "", "", ""]);
        otpInputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      setErrorMessage(err?.data?.message || "Failed to resend code.");
    }
  };

  // -------------------------------------------------------------
  // STEP 3: Reset Password
  // -------------------------------------------------------------
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-type your password.");
      return;
    }

    try {
      const res = await resetPassword({
        email: email.trim().toLowerCase(),
        otp: otp.join(""),
        newPassword,
      }).unwrap();

      if (res.success) {
        setStep("SUCCESS");
        setTimeout(() => {
          router.push("/login");
        }, 2500);
      } else {
        setErrorMessage(res.message || "Failed to reset password.");
      }
    } catch (err: any) {
      setErrorMessage(err?.data?.message || err?.message || "Password reset failed. Please try again.");
    }
  };

  return (
    <AuthCard>
      {/* ------------------------------------------------------------- */}
      {/* STEP 1: EMAIL REQUEST */}
      {/* ------------------------------------------------------------- */}
      {step === "EMAIL" && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF3F8] text-[#294B68] flex items-center justify-center mx-auto shadow-2xs">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#243746]">
              Forgot password?
            </h1>
            <p className="text-sm text-[#64748B] max-w-sm mx-auto">
              Enter your registered email address and we will send you a 6-digit verification code.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm font-medium text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSendOtp} className="space-y-4">
            <AuthInput
              id="reset-email"
              name="email"
              type="email"
              label="Email address"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              icon={<Mail className="w-5 h-5" />}
              required
              autoComplete="email"
              autoFocus
            />

            <button
              type="submit"
              disabled={isSendingOtp}
              className="w-full h-12 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-base rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isSendingOtp ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending Verification Code...</span>
                </>
              ) : (
                <span>Send Verification Code</span>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[#D9E4EC] text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#5E8FB2] hover:text-[#294B68] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 2: OTP VERIFICATION */}
      {/* ------------------------------------------------------------- */}
      {step === "OTP" && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF3F8] text-[#294B68] flex items-center justify-center mx-auto shadow-2xs">
              <ShieldCheck className="w-6 h-6 text-[#3F8F6B]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#243746]">
              Enter Verification Code
            </h1>
            <p className="text-sm text-[#64748B] max-w-sm mx-auto">
              We sent a 6-digit code to <strong className="text-[#243746]">{email}</strong>.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm font-medium text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-5">
            {/* 6 Digit Boxes */}
            <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    otpInputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black text-[#243746] bg-[#F7FAFC] border-2 border-[#D9E4EC] rounded-xl focus:bg-white focus:border-[#294B68] focus:outline-none transition-all shadow-2xs"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isVerifyingOtp || otp.join("").length !== 6}
              className="w-full h-12 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-base rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isVerifyingOtp ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <span>Verify &amp; Continue</span>
              )}
            </button>
          </form>

          {/* Resend & Back options */}
          <div className="flex items-center justify-between text-xs sm:text-sm pt-2">
            <button
              type="button"
              onClick={() => {
                setStep("EMAIL");
                setErrorMessage(null);
              }}
              className="font-bold text-[#64748B] hover:text-[#243746] transition-colors cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change email</span>
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || isSendingOtp}
              className={`font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                resendCooldown > 0
                  ? "text-[#94A3B8] cursor-not-allowed"
                  : "text-[#5E8FB2] hover:text-[#294B68]"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSendingOtp ? "animate-spin" : ""}`} />
              <span>
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 3: CREATE NEW PASSWORD */}
      {/* ------------------------------------------------------------- */}
      {step === "NEW_PASSWORD" && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF3F8] text-[#294B68] flex items-center justify-center mx-auto shadow-2xs">
              <Lock className="w-6 h-6 text-[#294B68]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#243746]">
              Set New Password
            </h1>
            <p className="text-sm text-[#64748B] max-w-sm mx-auto">
              Please enter and confirm your new account password.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm font-medium text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <PasswordInput
              id="new-password"
              name="newPassword"
              label="New Password"
              placeholder="Min. 8 characters"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              required
              autoFocus
            />

            <PasswordInput
              id="confirm-new-password"
              name="confirmPassword"
              label="Confirm New Password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              required
            />

            <button
              type="submit"
              disabled={isResettingPassword}
              className="w-full h-12 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-base rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
            >
              {isResettingPassword ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 4: SUCCESS CONFIRMATION */}
      {/* ------------------------------------------------------------- */}
      {step === "SUCCESS" && (
        <div className="text-center space-y-4 py-4 animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-[#3F8F6B] text-white rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-bold text-[#243746]">
            Password Reset Successfully!
          </h2>
          <p className="text-sm text-[#64748B] max-w-sm mx-auto">
            Your password has been updated. You can now log into your AgeWellRI member account with your new credentials.
          </p>

          <div className="pt-4 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#294B68]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Redirecting to Sign In...</span>
            </div>

            <Link
              href="/login"
              className="w-full h-11 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-sm rounded-xl shadow-xs flex items-center justify-center transition-colors"
            >
              Sign In Now
            </Link>
          </div>
        </div>
      )}
    </AuthCard>
  );
}
