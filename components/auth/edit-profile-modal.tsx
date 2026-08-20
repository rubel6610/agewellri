"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  HeartHandshake,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lock,
} from "lucide-react";
import { AuthInput } from "./auth-input";
import { useUpdateProfileMutation } from "@/redux/features/auth/authApi";
import { AuthUser } from "@/redux/features/auth/authTypes";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
}

export function EditProfileModal({
  isOpen,
  onClose,
  user,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
  });

  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    phone?: string;
    general?: string;
  }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.client?.address || "",
        city: user.client?.city || "",
        state: user.client?.state || "RI",
        postalCode: user.client?.postalCode || "",
        emergencyContactName: user.client?.emergencyContactName || "",
        emergencyContactPhone: user.client?.emergencyContactPhone || "",
        emergencyContactRelation: user.client?.emergencyContactRelation || "",
      });
      setErrors({});
      setSuccessMessage(null);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setErrors({});

    try {
      const response = await updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || null,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.postalCode.trim(),
        emergencyContactName: formData.emergencyContactName.trim() || null,
        emergencyContactPhone: formData.emergencyContactPhone.trim() || null,
        emergencyContactRelation: formData.emergencyContactRelation.trim() || null,
      }).unwrap();

      if (response.success) {
        setSuccessMessage("Profile updated successfully!");
        setTimeout(() => {
          setSuccessMessage(null);
          onClose();
        }, 1200);
      } else {
        setErrors({ general: response.message || "Failed to update profile." });
      }
    } catch (err: unknown) {
      const errorData = (
        err as {
          data?: {
            message?: string;
            errors?: Record<string, string[]>;
          };
        }
      )?.data;

      if (errorData?.errors && typeof errorData.errors === "object") {
        const fieldErrors: typeof errors = {};
        if (errorData.errors.firstName?.[0]) fieldErrors.firstName = errorData.errors.firstName[0];
        if (errorData.errors.lastName?.[0]) fieldErrors.lastName = errorData.errors.lastName[0];
        if (errorData.errors.phone?.[0]) fieldErrors.phone = errorData.errors.phone[0];
        fieldErrors.general = errorData.message || "Please check highlighted fields.";
        setErrors(fieldErrors);
      } else {
        setErrors({
          general:
            errorData?.message ||
            (err as { message?: string })?.message ||
            "Unable to update profile. Please try again.",
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D9E4EC] z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D9E4EC] sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF3F8] text-[#294B68] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#243746]">
                Edit Profile Information
              </h2>
              <p className="text-xs text-[#64748B]">
                Update your personal information and coordination contacts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#64748B] hover:text-[#243746] hover:bg-[#F7FAFC] border border-[#D9E4EC] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMessage ? (
          <div className="p-8 text-center space-y-3 my-6 bg-[#EAF3F8] rounded-2xl border border-[#5E8FB2]/30 animate-in fade-in">
            <div className="w-12 h-12 bg-[#3F8F6B] text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[#243746] text-lg">
              Profile Updated!
            </h3>
            <p className="text-sm text-[#64748B]">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            {errors.general && (
              <div className="p-3.5 bg-red-50 border border-[#C95C5C]/30 rounded-xl text-sm font-medium text-[#C95C5C] flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errors.general}</span>
              </div>
            )}

            {/* Section 1: Basic Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                Personal &amp; Contact Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AuthInput
                  id="profile-firstName"
                  name="firstName"
                  type="text"
                  label="First Name"
                  placeholder="Jane"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                  icon={<User className="w-5 h-5" />}
                  required
                />

                <AuthInput
                  id="profile-lastName"
                  name="lastName"
                  type="text"
                  label="Last Name"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                  icon={<User className="w-5 h-5" />}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email Address - Immutable */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-[#243746] flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-[#5E8FB2]" />
                      <span>Email Address</span>
                    </label>
                    <span className="text-[11px] font-semibold text-[#64748B] flex items-center gap-1">
                      <Lock className="w-3 h-3 text-[#64748B]" />
                      Read-only
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      aria-readonly="true"
                      className="w-full h-12 px-4 text-sm font-medium text-[#64748B] bg-[#F1F5F9] border border-[#D9E4EC] rounded-xl cursor-not-allowed select-none opacity-80"
                    />
                  </div>
                  <p className="text-[11px] text-[#64748B]">
                    Email address cannot be modified for account security.
                  </p>
                </div>

                {/* Phone Number */}
                <AuthInput
                  id="profile-phone"
                  name="phone"
                  type="tel"
                  label="Phone Number"
                  placeholder="(401) 555-0199"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  icon={<Phone className="w-5 h-5" />}
                />
              </div>
            </div>

            {/* Section 2: Address Information */}
            <div className="space-y-4 pt-4 border-t border-[#D9E4EC]">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                Home Address Information
              </h3>

              <AuthInput
                id="profile-address"
                name="address"
                type="text"
                label="Street Address"
                placeholder="148 Hope Street"
                value={formData.address}
                onChange={handleChange}
                icon={<MapPin className="w-5 h-5" />}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <AuthInput
                  id="profile-city"
                  name="city"
                  type="text"
                  label="City"
                  placeholder="Providence"
                  value={formData.city}
                  onChange={handleChange}
                />

                <AuthInput
                  id="profile-state"
                  name="state"
                  type="text"
                  label="State"
                  placeholder="RI"
                  value={formData.state}
                  onChange={handleChange}
                />

                <AuthInput
                  id="profile-postalCode"
                  name="postalCode"
                  type="text"
                  label="Postal Code"
                  placeholder="02906"
                  value={formData.postalCode}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Section 3: Emergency & Family Contact */}
            <div className="space-y-4 pt-4 border-t border-[#D9E4EC]">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-[#294B68]" />
                <span>Emergency Contact Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <AuthInput
                  id="profile-emergencyName"
                  name="emergencyContactName"
                  type="text"
                  label="Contact Name"
                  placeholder="Sarah Jenkins"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                />

                <AuthInput
                  id="profile-emergencyRel"
                  name="emergencyContactRelation"
                  type="text"
                  label="Relationship"
                  placeholder="Daughter"
                  value={formData.emergencyContactRelation}
                  onChange={handleChange}
                />

                <AuthInput
                  id="profile-emergencyPhone"
                  name="emergencyContactPhone"
                  type="tel"
                  label="Contact Phone"
                  placeholder="(401) 555-0182"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  icon={<Phone className="w-5 h-5" />}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-6 border-t border-[#D9E4EC]">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-[#F7FAFC] hover:bg-[#EAF3F8] text-[#243746] font-bold text-sm rounded-xl border border-[#D9E4EC] cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
