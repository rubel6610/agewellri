"use client";

import React, { useState } from "react";
import { X, KeyRound, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { PasswordInput } from "./password-input";
import { useChangePasswordMutation } from "@/lib/redux/features/auth/authApi";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errors, setErrors] = useState<{
    oldPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
    general?: string;
  }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [changePassword, { isLoading }] = useChangePasswordMutation();

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!oldPassword) {
      newErrors.oldPassword = "Current password is required.";
    }
    if (!newPassword) {
      newErrors.newPassword = "New password is required.";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters.";
    }
    if (newPassword !== confirmNewPassword) {
      newErrors.confirmNewPassword = "Passwords do not match.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setErrors({});

    try {
      const response = await changePassword({
        oldPassword,
        newPassword,
      }).unwrap();

      if (response.success) {
        setSuccessMessage(
          response.message || "Password updated successfully!"
        );
        setTimeout(() => {
          setSuccessMessage(null);
          setOldPassword("");
          setNewPassword("");
          setConfirmNewPassword("");
          onClose();
        }, 1500);
      } else {
        setErrors({
          general: response.message || "Failed to update password.",
        });
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
        if (errorData.errors.oldPassword?.[0]) {
          fieldErrors.oldPassword = errorData.errors.oldPassword[0];
        }
        if (errorData.errors.newPassword?.[0]) {
          fieldErrors.newPassword = errorData.errors.newPassword[0];
        }
        fieldErrors.general = errorData.message || "Please check the fields.";
        setErrors(fieldErrors);
      } else {
        setErrors({
          general:
            errorData?.message ||
            (err as { message?: string })?.message ||
            "Unable to change password. Please verify your current password.",
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D9E4EC] z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-[#D9E4EC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF3F8] text-[#294B68] flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#243746]">
                Change Password
              </h2>
              <p className="text-xs text-[#64748B]">
                Update your account security credentials
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
          <div className="p-6 text-center space-y-3 my-4 bg-[#EAF3F8] rounded-2xl border border-[#5E8FB2]/30">
            <div className="w-12 h-12 bg-[#3F8F6B] text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[#243746] text-base">
              Password Changed!
            </h3>
            <p className="text-xs text-[#64748B]">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            {errors.general && (
              <div className="p-3.5 bg-red-50 border border-[#C95C5C]/30 rounded-xl text-sm font-medium text-[#C95C5C] flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errors.general}</span>
              </div>
            )}

            <PasswordInput
              id="oldPassword"
              name="oldPassword"
              label="Current Password"
              placeholder="Enter current password"
              value={oldPassword}
              onChange={(e) => {
                setOldPassword(e.target.value);
                if (errors.oldPassword)
                  setErrors((prev) => ({ ...prev, oldPassword: undefined }));
              }}
              error={errors.oldPassword}
              required
            />

            <PasswordInput
              id="newPassword"
              name="newPassword"
              label="New Password"
              placeholder="Enter new password (min. 6 chars)"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.newPassword)
                  setErrors((prev) => ({ ...prev, newPassword: undefined }));
              }}
              error={errors.newPassword}
              required
            />

            <PasswordInput
              id="confirmNewPassword"
              name="confirmNewPassword"
              label="Confirm New Password"
              placeholder="Confirm new password"
              value={confirmNewPassword}
              onChange={(e) => {
                setConfirmNewPassword(e.target.value);
                if (errors.confirmNewPassword)
                  setErrors((prev) => ({
                    ...prev,
                    confirmNewPassword: undefined,
                  }));
              }}
              error={errors.confirmNewPassword}
              required
            />

            <div className="flex gap-3 pt-4 border-t border-[#D9E4EC]">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-[#F7FAFC] hover:bg-[#EAF3F8] text-[#243746] font-bold text-sm rounded-xl border border-[#D9E4EC] cursor-pointer"
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
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
