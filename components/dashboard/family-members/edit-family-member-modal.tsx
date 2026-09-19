"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Edit3,
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
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  KeyRound,
} from "lucide-react";
import {
  useUpdateFamilyMemberMutation,
  useInviteFamilyMemberMutation,
} from "@/redux/features/family/familyApi";
import { FamilyMember } from "@/redux/features/family/familyTypes";
import {
  showSuccessAlert,
  showErrorAlert,
  showToast,
} from "@/lib/alerts/sweetalert";

interface EditFamilyMemberModalProps {
  isOpen: boolean;
  member: FamilyMember | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const RELATIONSHIP_OPTIONS = [
  "Daughter",
  "Son",
  "Spouse",
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

export function EditFamilyMemberModal({
  isOpen,
  member,
  onClose,
  onSuccess,
}: EditFamilyMemberModalProps) {
  const [updateFamilyMember, { isLoading: isUpdating }] =
    useUpdateFamilyMemberMutation();
  const [inviteFamilyMember, { isLoading: isInviting }] =
    useInviteFamilyMemberMutation();

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

  useEffect(() => {
    if (member) {
      const isCustomRel = !RELATIONSHIP_OPTIONS.includes(member.relationship);
      setFormData({
        name: member.name || "",
        relationship: isCustomRel ? "Other" : member.relationship,
        customRelationship: isCustomRel ? member.relationship : "",
        email: member.email || "",
        phone: member.phone || "",
        password: "",
        reportAccess: !!member.reportAccess,
        portalAccess: !!member.portalAccess,
        billingAccess: !!member.billingAccess,
        isEmergencyContact: !!member.isEmergencyContact,
        sendCredentialsNow: true,
      });
      setErrors({});
    }
  }, [member]);

  if (!isOpen || !member) return null;

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

    if (formData.password && formData.password.length < 6) {
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
        password: formData.password.trim() || undefined,
        reportAccess: formData.reportAccess,
        portalAccess: formData.portalAccess,
        billingAccess: formData.portalAccess ? formData.billingAccess : false,
        isEmergencyContact: formData.isEmergencyContact,
        sendCredentialsNow: formData.sendCredentialsNow,
      };

      const res = await updateFamilyMember({
        id: member.id,
        data: payload,
      }).unwrap();

      if (res.success) {
        showToast("Family member updated successfully!", "success");
        if (formData.password && formData.sendCredentialsNow) {
          showSuccessAlert(
            "New Credentials Emailed!",
            `We emailed the new password and login URL to ${payload.email}.`
          );
        }
        onSuccess?.();
        onClose();
      }
    } catch (err: any) {
      const message =
        err?.data?.message || err?.message || "Failed to update family member.";
      showErrorAlert("Update Failed", message);
    }
  };

  const handleSendCredentialsDirect = async () => {
    const pass = formData.password.trim() || generateRandomPassword();
    try {
      const res = await inviteFamilyMember({
        id: member.id,
        password: pass,
      }).unwrap();

      if (res.success) {
        showSuccessAlert(
          "Credentials Emailed!",
          `Portal login credentials (email: ${member.email}, password: ${pass}) have been sent directly to ${member.email}.`
        );
        onSuccess?.();
      }
    } catch (err: any) {
      const message =
        err?.data?.message || err?.message || "Failed to email login credentials.";
      showErrorAlert("Email Error", message);
    }
  };

  const isPortalActive = Boolean(member.portalAccess);

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
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#243746]">
                Edit Family Member
              </h2>
              <p className="text-xs text-[#64748B]">
                Modify contact info, manage permissions &amp; credentials
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
          {/* Member Status Pill Banner */}
          <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#D9E4EC] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Portal Access:
              </span>
              {isPortalActive ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active Portal Access
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  Reports Only
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleSendCredentialsDirect}
              disabled={isInviting}
              className="px-3 py-1.5 bg-[#294B68] hover:bg-[#1E374D] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isInviting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Email Credentials</span>
            </button>
          </div>

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
                  <label htmlFor="editReportAccess" className="text-sm font-bold text-[#243746] cursor-pointer">
                    Receive Safety Visit Reports
                  </label>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Automatically sends completed visit PDF reports to their email.
                  </p>
                </div>
              </div>
              <input
                id="editReportAccess"
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
                  <label htmlFor="editPortalAccess" className="text-sm font-bold text-[#243746] cursor-pointer">
                    Client Portal Access
                  </label>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Allow this family member to log in directly and view your safety dashboard.
                  </p>
                </div>
              </div>
              <input
                id="editPortalAccess"
                type="checkbox"
                checked={formData.portalAccess}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setFormData({
                    ...formData,
                    portalAccess: checked,
                    billingAccess: checked ? formData.billingAccess : false,
                  });
                }}
                className="w-5 h-5 rounded border-[#CBD5E1] text-[#294B68] focus:ring-[#294B68] cursor-pointer mt-1"
              />
            </div>

            {/* Reset / Set Password Section */}
            {formData.portalAccess && (
              <div className="p-4 rounded-2xl bg-[#EAF3F8]/60 border border-[#5E8FB2]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#243746] uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#294B68]" />
                    <span>Set / Reset Portal Password</span>
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
                    placeholder="Enter new password (or leave blank to keep current)"
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

                {formData.password && (
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4 text-[#294B68]" />
                      <span className="text-xs font-bold text-[#243746]">
                        Email updated credentials to {formData.email || member.email}
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
                )}
              </div>
            )}

            {/* Emergency Contact */}
            <div className="flex items-start justify-between p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#D9E4EC] hover:bg-[#F1F5F9] transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <label htmlFor="editIsEmergencyContact" className="text-sm font-bold text-[#243746] cursor-pointer">
                    Emergency Contact
                  </label>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Flag as a primary emergency contact for our Rhode Island safety specialists.
                  </p>
                </div>
              </div>
              <input
                id="editIsEmergencyContact"
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
              disabled={isUpdating}
              className="px-5 py-2.5 rounded-xl border border-[#D9E4EC] text-sm font-bold text-[#64748B] hover:bg-[#F0F5F9] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white text-sm font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
