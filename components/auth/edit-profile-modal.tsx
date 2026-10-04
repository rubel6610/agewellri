"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lock,
} from "lucide-react";
import { AuthInput } from "./auth-input";
import { useUpdateProfileMutation } from "@/redux/features/auth/authApi";
import { AuthUser } from "@/redux/features/auth/authTypes";
import {
  confirmEdit,
  showSuccessAlert,
  showErrorAlert,
} from "@/lib/alerts/sweetalert";

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

    const confirmed = await confirmEdit({
      title: "Save Profile Changes?",
      text: "Update your personal contact information and address?",
      confirmButtonText: "Yes, Save Profile",
    });

    if (!confirmed) return;

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
      }).unwrap();

      if (response.success) {
        setSuccessMessage("Profile updated successfully!");
        await showSuccessAlert(
          "Profile Updated",
          "Your member details have been updated."
        );
        onClose();
      } else {
        const msg = response.message || "Failed to update profile.";
        setErrors({ general: msg });
        showErrorAlert("Update Failed", msg);
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

      const message =
        errorData?.message || "Something went wrong while updating profile.";

      if (errorData?.errors) {
        const fieldErrors: typeof errors = {};
        Object.entries(errorData.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            fieldErrors[field as keyof typeof errors] = messages[0];
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: message });
      }

      showErrorAlert("Update Failed", message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl border border-[#D9E4EC] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto z-10 animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-xs px-6 py-5 border-b border-[#D9E4EC] flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF3F8] text-[#294B68] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#243746]">
                Edit Member Profile
              </h2>
              <p className="text-xs text-[#64748B]">
                Update your personal info and service address
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#64748B] hover:text-[#243746] rounded-xl hover:bg-[#F0F5F9] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mx-6 mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* General Error Alert */}
        {errors.general && (
          <div className="mx-6 mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.general}</span>
          </div>
        )}

        {/* Modal Form */}
        {!successMessage && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Section 1: Basic Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                Personal Contact Details
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
                  placeholder="(401) 212-3002"
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
