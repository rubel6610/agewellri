"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, Check } from "lucide-react";
import { AuthCard } from "./auth-card";

import { AuthInput } from "./auth-input";
import { PasswordInput } from "./password-input";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

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

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate API connection delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // For demonstration of UI state
      setLoginSuccess(true);
    } catch {
      setErrors({
        general: "Unable to sign in. Please check your credentials and try again.",
      });
    } finally {
      setIsLoading(false);
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

      {loginSuccess ? (
        <div className="p-6 bg-[#EAF3F8] border border-[#5E8FB2]/30 rounded-2xl text-center space-y-4 animate-in fade-in duration-300">
          <div className="w-12 h-12 bg-[#3F8F6B] text-white rounded-full flex items-center justify-center mx-auto">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#243746]">Validation Successful</h3>
            <p className="text-sm text-[#64748B] mt-1">
              You are ready to connect to your authentication API.
            </p>
          </div>
          <button
            onClick={() => setLoginSuccess(false)}
            className="text-sm font-semibold text-[#294B68] underline hover:text-[#5E8FB2]"
          >
            Back to Sign In form
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {errors.general && (
            <div className="p-3.5 bg-red-50 border border-[#C95C5C]/30 rounded-xl text-sm font-medium text-[#C95C5C]">
              {errors.general}
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
