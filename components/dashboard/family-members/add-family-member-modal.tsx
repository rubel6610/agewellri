"use client";

import React, { useState } from "react";
import {
  X,
  UserPlus,
  Mail,
  Phone,
  User,
  Shield,
  FileCheck,
  CreditCard,
  AlertCircle,
  Loader2,
  Send,
  HeartHandshake,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  KeyRound,
} from "lucide-react";
import { useCreateFamilyMemberMutation } from "@/redux/features/family/familyApi";
import { showSuccessAlert, showErrorAlert, showToast } from "@/lib/alerts/sweetalert";

interface AddFamilyMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const RELATIONSHIP_OPTIONS = [
  "Daughter",
  "Son",
  "Spouse",
  "Caregiver",
  "Power of Attorney",
  "Sister",
  "Brother",
  "Grandchild",
  "Legal Guardian",
  "Healthcare Proxy",
  "Other",
];

function generateRandomPassword() {
  return "Agewell@" + Math.floor(1000 + Math.random() * 9000);
}

export function AddFamilyMemberModal({
  isOpen,
  onClose,
  onSuccess,
}: AddFamilyMemberModalProps) {
  const [createFamilyMember, { isLoading }] = useCreateFamilyMemberMutation();

  const [formData, setFormData] = useState({
    name: "",
    relationship: "Daughter",
    customRelationship: "",
    email: "",
    phone: "",
    password: "",
    reportAccess: true,
    portalAccess: false,
    billingAccess: false,
    isEmergencyContact: false,
    sendCredentialsNow: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleTogglePortalAccess = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      portalAccess: checked,
      billingAccess: checked ? prev.billingAccess : false,
      password: checked && !prev.password ? generateRandomPassword() : prev.password,
    }));
  };

  const handleGeneratePassword = () => {
    setFormData((prev) => ({
      ...prev,
      password: generateRandomPassword(),
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.relationship === "Other" && !formData.customRelationship.trim()) {
      newErrors.customRelationship = "Please specify relationship";
    }

    if (formData.portalAccess && formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const finalRelationship =
        formData.relationship === "Other"
          ? formData.customRelationship.trim()
          : formData.relationship;

      const payload = {
        name: formData.name.trim(),
        relationship: finalRelationship,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        password: formData.portalAccess ? (formData.password.trim() || undefined) : undefined,
        reportAccess: formData.reportAccess,
        portalAccess: formData.portalAccess,
        billingAccess: formData.portalAccess ? formData.billingAccess : false,
        isEmergencyContact: formData.isEmergencyContact,
        sendCredentialsNow: formData.portalAccess ? formData.sendCredentialsNow : false,
      };

      const res = await createFamilyMember(payload).unwrap();

      if (res.success) {
        showToast("Family member added successfully!", "success");
        if (formData.portalAccess && formData.sendCredentialsNow) {
          showSuccessAlert(
            "Login Credentials Emailed!",
            `We have emailed the login URL, email (${payload.email}), and password to ${formData.name}. They can log in immediately!`
          );
        }
        onSuccess?.();
        onClose();
        // Reset form
        setFormData({
          name: "",
          relationship: "Daughter",
          customRelationship: "",
          email: "",
          phone: "",
          password: "",
          reportAccess: true,
          portalAccess: false,
          billingAccess: false,
          isEmergencyContact: false,
          sendCredentialsNow: true,
        });
      }
    } catch (err: any) {
      const message =
        err?.data?.message || err?.message || "Failed to add family member. Please try again.";
      showErrorAlert("Could Not Add Member", message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl border border-[#D9E4EC] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto z-10 animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-xs px-6 py-5 border-b border-[#D9E4EC] flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF3F8] text-[#294B68] flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#243746]">
                Add Family Member
              </h2>
              <p className="text-xs text-[#64748B]">
                Share portal access and authorize visit report delivery
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#64748B] hover:text-[#243746] rounded-xl hover:bg-[#F0F5F9] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Member Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="e.g. Jane Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-[#243746] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#294B68] ${
                    errors.name ? "border-rose-400 bg-rose-50/20" : "border-[#D9E4EC]"
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-xs font-semibold text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                  Relationship <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <HeartHandshake className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                  <select
                    value={formData.relationship}
                    onChange={(e) =>
                      setFormData({ ...formData, relationship: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9E4EC] text-sm text-[#243746] bg-white focus:outline-none focus:ring-2 focus:ring-[#294B68]"
                  >
                    {RELATIONSHIP_OPTIONS.map((rel) => (
                      <option key={rel} value={rel}>
                        {rel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-[#243746] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#294B68] ${
                      errors.email ? "border-rose-400 bg-rose-50/20" : "border-[#D9E4EC]"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs font-semibold text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.email}
                  </p>
                )}
              </div>
            </div>

            {formData.relationship === "Other" && (
              <div>
                <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                  Specify Relationship <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Neighbor / Case Manager"
                  value={formData.customRelationship}
                  onChange={(e) =>
                    setFormData({ ...formData, customRelationship: e.target.value })
                  }
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-[#243746] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#294B68] ${
                    errors.customRelationship
                      ? "border-rose-400 bg-rose-50/20"
                      : "border-[#D9E4EC]"
                  }`}
                />
                {errors.customRelationship && (
                  <p className="text-xs font-semibold text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.customRelationship}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                Phone Number <span className="text-xs font-normal text-[#64748B]">(Optional)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  placeholder="(401) 555-0123"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9E4EC] text-sm text-[#243746] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#294B68]"
                />
              </div>
            </div>
          </div>

          {/* Access & Permissions Section */}
          <div className="pt-4 border-t border-[#D9E4EC] space-y-3">
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Access &amp; Permissions
            </h3>

            {/* Report Access Switch */}
            <div className="flex items-start justify-between p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#D9E4EC] hover:bg-[#F1F5F9] transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EAF3F8] text-[#294B68] flex items-center justify-center shrink-0 mt-0.5">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <label htmlFor="reportAccess" className="text-sm font-bold text-[#243746] cursor-pointer">
                    Receive Safety Visit Reports
                  </label>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Automatically sends completed visit PDF reports to their email.
                  </p>
                </div>
              </div>
              <input
                id="reportAccess"
                type="checkbox"
                checked={formData.reportAccess}
                onChange={(e) =>
                  setFormData({ ...formData, reportAccess: e.target.checked })
                }
                className="w-5 h-5 rounded border-[#CBD5E1] text-[#294B68] focus:ring-[#294B68] cursor-pointer mt-1"
              />
            </div>

            {/* Portal Access Switch */}
            <div className="flex items-start justify-between p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#D9E4EC] hover:bg-[#F1F5F9] transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EAF3F8] text-[#294B68] flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <label htmlFor="portalAccess" className="text-sm font-bold text-[#243746] cursor-pointer">
                    Client Portal Access
                  </label>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Allow this family member to log in directly and view your safety dashboard.
                  </p>
                </div>
              </div>
              <input
                id="portalAccess"
                type="checkbox"
                checked={formData.portalAccess}
                onChange={(e) => handleTogglePortalAccess(e.target.checked)}
                className="w-5 h-5 rounded border-[#CBD5E1] text-[#294B68] focus:ring-[#294B68] cursor-pointer mt-1"
              />
            </div>

            {/* Password input when portal access is enabled */}
            {formData.portalAccess && (
              <div className="p-4 rounded-2xl bg-[#EAF3F8]/60 border border-[#5E8FB2]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#243746] uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#294B68]" />
                    <span>Portal Login Password</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-xs font-bold text-[#294B68] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Auto-Generate</span>
                  </button>
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Set password for family member"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#D9E4EC] bg-white text-sm text-[#243746] focus:outline-none focus:ring-2 focus:ring-[#294B68]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#64748B] hover:text-[#243746] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs font-semibold text-rose-500">
                    {errors.password}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-[#294B68]" />
                    <span className="text-xs font-bold text-[#243746]">
                      Email login credentials (email &amp; password) immediately
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.sendCredentialsNow}
                    onChange={(e) =>
                      setFormData({ ...formData, sendCredentialsNow: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-[#CBD5E1] text-[#294B68] focus:ring-[#294B68] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Emergency Contact */}
            <div className="flex items-start justify-between p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#D9E4EC] hover:bg-[#F1F5F9] transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <label htmlFor="isEmergencyContact" className="text-sm font-bold text-[#243746] cursor-pointer">
                    Emergency Contact
                  </label>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Flag as a primary emergency contact for our Rhode Island safety specialists.
                  </p>
                </div>
              </div>
              <input
                id="isEmergencyContact"
                type="checkbox"
                checked={formData.isEmergencyContact}
                onChange={(e) =>
                  setFormData({ ...formData, isEmergencyContact: e.target.checked })
                }
                className="w-5 h-5 rounded border-[#CBD5E1] text-[#294B68] focus:ring-[#294B68] cursor-pointer mt-1"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#D9E4EC] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl border border-[#D9E4EC] text-sm font-bold text-[#64748B] hover:bg-[#F0F5F9] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white text-sm font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Add Member</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
