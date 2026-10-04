"use client";

import React, { useState } from "react";
import {
  X,
  UserPlus,
  Mail,
  Phone,
  User,
  HeartHandshake,
  FileCheck,
  AlertCircle,
  Loader2,
  UploadCloud,
  FileText,
  Trash2,
  Scale,
  Download,
} from "lucide-react";
import { useCreateFamilyMemberMutation } from "@/redux/features/family/familyApi";
import { useUploadAuthorityDocumentMutation } from "@/redux/features/agreement/agreementApi";
import { downloadAuthorityDocument } from "@/lib/utils/authority-document-download";
import { showErrorAlert, showToast } from "@/lib/alerts/sweetalert";

interface AddFamilyMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialRole?: "REPRESENTATIVE" | "RECIPIENT" | "ALL";
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

const LEGAL_CAPACITY_OPTIONS = [
  { value: "ATTORNEY_IN_FACT", label: "Attorney-in-Fact (POA)" },
  { value: "GUARDIAN", label: "Guardian" },
  { value: "CONSERVATOR", label: "Conservator" },
  { value: "HEALTHCARE_PROXY", label: "Healthcare Proxy" },
  { value: "OTHER", label: "Other Authorized Legal Representative" },
];

export function AddFamilyMemberModal({
  isOpen,
  onClose,
  onSuccess,
  initialRole = "ALL",
}: AddFamilyMemberModalProps) {
  const [createFamilyMember, { isLoading }] = useCreateFamilyMemberMutation();
  const [uploadAuthorityDoc, { isLoading: isUploadingDoc }] =
    useUploadAuthorityDocumentMutation();

  const [formData, setFormData] = useState({
    name: "",
    relationship: "Daughter",
    customRelationship: "",
    legalCapacity: "ATTORNEY_IN_FACT",
    authorityDocumentUrl: "",
    authorityDocumentName: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        relationship: "Daughter",
        customRelationship: "",
        legalCapacity: "ATTORNEY_IN_FACT",
        authorityDocumentUrl: "",
        authorityDocumentName: "",
        email: "",
        phone: "",
      });
      setErrors({});
    }
  }, [isOpen, initialRole]);

  if (!isOpen) return null;

  const isRepMode = initialRole === "REPRESENTATIVE";
  const isRecipientMode = initialRole === "RECIPIENT";

  const modalTitle = isRepMode
    ? "Add Representative"
    : isRecipientMode
    ? "Add Authorized Report Recipient"
    : "Add Contact";

  const modalSubtitle = isRepMode
    ? "Emergency & Family Coordinator with Legal Authority"
    : isRecipientMode
    ? "Authorized Safety Report Recipient"
    : "Add a member contact";

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        authorityDoc: "File exceeds the 15MB size limit.",
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, authorityDoc: "" }));

    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await uploadAuthorityDoc(uploadData).unwrap();
      const docData = res?.data;
      if (res?.success && docData?.fileUrl) {
        setFormData((prev) => ({
          ...prev,
          authorityDocumentUrl: docData.fileUrl,
          authorityDocumentName: docData.originalName || file.name,
        }));
        showToast("Authority document uploaded successfully", "success");
      } else {
        setErrors((prev) => ({
          ...prev,
          authorityDoc: res?.message || "Failed to upload authority document.",
        }));
      }
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        authorityDoc:
          err?.data?.message || err?.message || "Error uploading authority document.",
      }));
    }
  };

  const handleRemoveDoc = () => {
    setFormData((prev) => ({
      ...prev,
      authorityDocumentUrl: "",
      authorityDocumentName: "",
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = isRepMode
        ? "Representative full legal name is required"
        : "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!isRepMode && formData.relationship === "Other" && !formData.customRelationship.trim()) {
      newErrors.customRelationship = "Please specify relationship";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      let finalRelationship = "Representative";
      if (isRepMode) {
        finalRelationship =
          LEGAL_CAPACITY_OPTIONS.find((c) => c.value === formData.legalCapacity)?.label ||
          "Representative";
      } else {
        finalRelationship =
          formData.relationship === "Other"
            ? formData.customRelationship.trim()
            : formData.relationship;
      }

      const payload = {
        name: formData.name.trim(),
        relationship: finalRelationship,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        legalCapacity: isRepMode ? formData.legalCapacity : undefined,
        authorityDocumentUrl: isRepMode ? formData.authorityDocumentUrl || undefined : undefined,
        authorityDocumentName: isRepMode ? formData.authorityDocumentName || undefined : undefined,
        reportAccess: true,
        portalAccess: false,
        billingAccess: false,
        isEmergencyContact: isRepMode,
        sendCredentialsNow: false,
      };

      const res = await createFamilyMember(payload).unwrap();

      if (res.success) {
        showToast(
          isRepMode
            ? "Representative added successfully!"
            : isRecipientMode
            ? "Report recipient added successfully!"
            : "Contact added successfully!",
          "success"
        );
        onSuccess?.();
        onClose();
      }
    } catch (err: any) {
      const message =
        err?.data?.message || err?.message || "Failed to add contact. Please try again.";
      showErrorAlert("Could Not Add Contact", message);
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
              {isRepMode ? (
                <Scale className="w-5 h-5" />
              ) : isRecipientMode ? (
                <FileCheck className="w-5 h-5" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#243746]">
                {modalTitle}
              </h2>
              <p className="text-xs text-[#64748B]">
                {modalSubtitle}
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
          {/* Contact Details */}
          <div className="space-y-4">
            {/* Full Legal Name */}
            <div>
              <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                {isRepMode ? "Representative Full Legal Name" : "Full Name"}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder={isRepMode ? "e.g. Sarah Vance" : "e.g. Jane Doe"}
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

            {/* Representative Legal Capacity (Representative only) */}
            {isRepMode && (
              <div>
                <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-[#294B68]" />
                  <span>Representative Legal Capacity</span>
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.legalCapacity}
                  onChange={(e) =>
                    setFormData({ ...formData, legalCapacity: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9E4EC] text-sm font-semibold text-[#243746] bg-white focus:outline-none focus:ring-2 focus:ring-[#294B68] cursor-pointer"
                >
                  {LEGAL_CAPACITY_OPTIONS.map((cap) => (
                    <option key={cap.value} value={cap.value}>
                      {cap.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Relationship (Report Recipient Only) */}
            {!isRepMode && (
              <>
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
              </>
            )}

            {/* Email Address for Representative (Full width or paired with Phone) */}
            {isRepMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            ) : (
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
            )}

            {/* Upload Legal Authority Document (Representative Only) */}
            {isRepMode && (
              <div className="pt-2 border-t border-[#D9E4EC] space-y-2">
                <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider flex items-center justify-between">
                  <span>Upload Legal Authority Document</span>
                </label>

                {formData.authorityDocumentUrl ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <p className="font-bold text-xs text-emerald-900 truncate">
                          {formData.authorityDocumentName || "Legal Authority Document"}
                        </p>
                        <span className="text-[11px] text-emerald-700">
                          Uploaded &bull; Verified
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          downloadAuthorityDocument({
                            url: formData.authorityDocumentUrl,
                            fileName:
                              formData.authorityDocumentName ||
                              "AgeWellRI_Legal_Authority_Document.pdf",
                          })
                        }
                        className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                        title="Download / View document"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                      <span className="text-emerald-300">|</span>
                      <label className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer">
                        Replace
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleRemoveDoc}
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer ml-1"
                        title="Remove document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="p-4 border-2 border-dashed border-[#CBD5E1] hover:border-[#294B68] rounded-2xl bg-[#F8FAFC] hover:bg-white flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {isUploadingDoc ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-[#294B68]">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading authority document...</span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-6 h-6 text-[#5E8FB2]" />
                        <span className="text-xs font-bold text-[#294B68]">
                          Click to upload Legal Authority Document (POA, Guardianship)
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          Optional for dashboard records
                        </span>
                      </>
                    )}
                  </label>
                )}

                {errors.authorityDoc && (
                  <p className="text-xs font-semibold text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.authorityDoc}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#D9E4EC] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading || isUploadingDoc}
              className="px-5 py-2.5 rounded-xl border border-[#D9E4EC] text-sm font-bold text-[#64748B] hover:bg-[#F0F5F9] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isUploadingDoc}
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
                  <span>{isRepMode ? "Save Representative" : isRecipientMode ? "Save Recipient" : "Save Contact"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
