"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Shield,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lock,
} from "lucide-react";
import { AuthInput } from "../auth/auth-input";
import { useUpdateProfileMutation } from "@/redux/features/auth/authApi";
import { AuthUser } from "@/redux/features/auth/authTypes";
import {
  confirmEdit,
  showSuccessAlert,
  showErrorAlert,
} from "@/lib/alerts/sweetalert";

interface AdminEditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
}

export function AdminEditProfileModal({
  isOpen,
  onClose,
  user,
}: AdminEditProfileModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
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
      title: "Update Administrator Details?",
      text: "Save your updated name and contact phone number?",
      confirmButtonText: "Yes, Save Details",
    });

    if (!confirmed) return;

    setErrors({});

    try {
      const response = await updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || null,
      }).unwrap();

      if (response.success) {
        setSuccessMessage("Administrator profile updated successfully!");
        await showSuccessAlert(
          "Profile Updated",
          "Your administrator contact details have been updated."
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

      if (errorData?.errors && typeof errorData.errors === "object") {
        const fieldErrors: typeof errors = {};
        if (errorData.errors.firstName?.[0])
          fieldErrors.firstName = errorData.errors.firstName[0];
        if (errorData.errors.lastName?.[0])
          fieldErrors.lastName = errorData.errors.lastName[0];
        if (errorData.errors.phone?.[0])
          fieldErrors.phone = errorData.errors.phone[0];
        const genMsg = errorData.message || "Please check highlighted fields.";
        fieldErrors.general = genMsg;
        setErrors(fieldErrors);
        showErrorAlert("Validation Error", genMsg);
      } else {
        const genMsg =
          errorData?.message ||
          (err as { message?: string })?.message ||
          "Unable to update profile. Please try again.";
        setErrors({ general: genMsg });
        showErrorAlert("Update Failed", genMsg);
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
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D9E4EC] z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D9E4EC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#294B68] text-white flex items-center justify-center shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#243746]">
                Edit Administrator Details
              </h2>
              <p className="text-xs text-[#64748B]">
                Manage your administrative contact information
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
          <form onSubmit={handleSubmit} className="space-y-5 mt-6">
            {errors.general && (
              <div className="p-3.5 bg-red-50 border border-[#C95C5C]/30 rounded-xl text-sm font-medium text-[#C95C5C] flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errors.general}</span>
              </div>
            )}

            {/* Role Badge Card */}
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#D9E4EC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#294B68]" />
                <span className="text-xs font-bold text-[#243746]">System Role:</span>
              </div>
              <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-full bg-[#294B68] text-white">
                {user?.role || "ADMIN"}
              </span>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AuthInput
                id="admin-firstName"
                name="firstName"
                type="text"
                label="First Name"
                placeholder="Sarah"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                icon={<User className="w-5 h-5" />}
                required
              />

              <AuthInput
                id="admin-lastName"
                name="lastName"
                type="text"
                label="Last Name"
                placeholder="Jenkins"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                icon={<User className="w-5 h-5" />}
                required
              />
            </div>

            {/* Email Address - Immutable */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[#243746] flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[#5E8FB2]" />
                  <span>Administrative Email</span>
                </label>
                <span className="text-[11px] font-semibold text-[#64748B] flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#64748B]" />
                  Read-only
                </span>
              </div>
              <input
                type="email"
                value={formData.email}
                disabled
                aria-readonly="true"
                className="w-full h-12 px-4 text-sm font-medium text-[#64748B] bg-[#F1F5F9] border border-[#D9E4EC] rounded-xl cursor-not-allowed select-none opacity-80"
              />
              <p className="text-[11px] text-[#64748B]">
                Primary administrative login email is managed by system root policies.
              </p>
            </div>

            {/* Phone Number */}
            <AuthInput
              id="admin-phone"
              name="phone"
              type="tel"
              label="Direct Phone Number"
              placeholder="(401) 555-0100"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              icon={<Phone className="w-5 h-5" />}
            />

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-[#D9E4EC]">
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
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Details</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
