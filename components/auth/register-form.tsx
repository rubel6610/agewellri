"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, User, Phone, Loader2, Check } from "lucide-react";
import { AuthCard } from "./auth-card";
import { AuthInput } from "./auth-input";
import { PasswordInput } from "./password-input";

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
  general?: string;
}

export function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // First Name
    if (!formData.firstName.trim()) {
      newErrors.firstName = "Please enter your first name.";
    }

    // Last Name
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Please enter your last name.";
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Phone Number
    if (!formData.phone.trim()) {
      newErrors.phone = "Please enter your phone number.";
    } else if (!/^[0-9()\-\s+.]{7,20}$/.test(formData.phone.trim())) {
      newErrors.phone = "Please enter a valid phone number.";
    }

    // Password
    if (!formData.password) {
      newErrors.password = "Please create a password.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    // Terms Agreement
    if (!formData.agreeToTerms) {
      newErrors.terms = "You must agree to the Terms of Service and Privacy Policy.";
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

      setRegisterSuccess(true);
    } catch {
      setErrors({
        general: "Registration failed. Please check your information and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard>
      {/* Header / Branding */}
      <div className="flex flex-col items-center text-center space-y-4 mb-6">

        <div className="space-y-1 pt-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#243746] tracking-tight">
            Welcome to AgeWellRI
          </h1>
          <p className="text-sm sm:text-base text-[#64748B]">
            Create your account to access your AgeWellRI member portal.
          </p>
        </div>
      </div>

      {registerSuccess ? (
        <div className="p-6 bg-[#EAF3F8] border border-[#5E8FB2]/30 rounded-2xl text-center space-y-4 animate-in fade-in duration-300">
          <div className="w-12 h-12 bg-[#3F8F6B] text-white rounded-full flex items-center justify-center mx-auto">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#243746]">Account Prepared Successfully!</h3>
            <p className="text-sm text-[#64748B] mt-1">
              Validation passed. Your registration form is ready for authentication backend integration.
            </p>
          </div>
          <button
            onClick={() => setRegisterSuccess(false)}
            className="text-sm font-semibold text-[#294B68] underline hover:text-[#5E8FB2]"
          >
            Modify details
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {errors.general && (
            <div className="p-3.5 bg-red-50 border border-[#C95C5C]/30 rounded-xl text-sm font-medium text-[#C95C5C]">
              {errors.general}
            </div>
          )}

          {/* First & Last Name row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AuthInput
              id="firstName"
              name="firstName"
              type="text"
              label="First Name"
              placeholder="Jane"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              icon={<User className="w-5 h-5" aria-hidden="true" />}
              required
              autoComplete="given-name"
            />

            <AuthInput
              id="lastName"
              name="lastName"
              type="text"
              label="Last Name"
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              icon={<User className="w-5 h-5" aria-hidden="true" />}
              required
              autoComplete="family-name"
            />
          </div>

          {/* Email Address */}
          <AuthInput
            id="register-email"
            name="email"
            type="email"
            label="Email Address"
            placeholder="jane.doe@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={<Mail className="w-5 h-5" aria-hidden="true" />}
            required
            autoComplete="email"
          />

          {/* Phone Number */}
          <AuthInput
            id="register-phone"
            name="phone"
            type="tel"
            label="Phone Number"
            placeholder="(401) 555-0199"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            icon={<Phone className="w-5 h-5" aria-hidden="true" />}
            required
            autoComplete="tel"
          />

          {/* Password */}
          <PasswordInput
            id="register-password"
            name="password"
            label="Password"
            placeholder="Create password (min. 8 chars)"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
            autoComplete="new-password"
          />

          {/* Confirm Password */}
          <PasswordInput
            id="register-confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Re-enter password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
            autoComplete="new-password"
          />

          {/* Terms Agreement Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="w-5 h-5 mt-0.5 rounded border-[#D9E4EC] text-[#294B68] focus:ring-2 focus:ring-[#5E8FB2] focus:ring-offset-1 accent-[#294B68] transition-colors cursor-pointer shrink-0"
              />
              <span className="text-sm text-[#243746] leading-snug">
                I agree to the{" "}
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("AgeWellRI Terms of Service details");
                  }}
                  className="font-bold text-[#5E8FB2] hover:text-[#294B68] underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("AgeWellRI Privacy Policy details");
                  }}
                  className="font-bold text-[#5E8FB2] hover:text-[#294B68] underline"
                >
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {errors.terms && (
              <p className="text-sm font-medium text-[#C95C5C] mt-1.5 flex items-center gap-1">
                <span>{errors.terms}</span>
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 sm:h-[50px] mt-4 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-base rounded-xl shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#294B68] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                <span>Creating account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>
      )}

      {/* Footer Navigation */}
      <div className="mt-6 pt-5 border-t border-[#D9E4EC] text-center">
        <p className="text-sm text-[#64748B]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-[#5E8FB2] hover:text-[#294B68] hover:underline focus-visible:outline-2 focus-visible:outline-[#5E8FB2] rounded"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
