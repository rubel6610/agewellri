"use client";

import React, { useState } from "react";
import { X, UserPlus, Loader2, CheckCircle2, Copy, Check, Send, Sparkles } from "lucide-react";
import { useSendInvitationMutation } from "@/redux/features/client/clientApi";
import {
  confirmCriticalAction,
  showSuccessAlert,
  showErrorAlert,
  showToast,
} from "@/lib/alerts/sweetalert";

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddClientModal({ isOpen, onClose, onSuccess }: AddClientModalProps) {
  const [sendInvitation, { isLoading: isSubmitting }] = useSendInvitationMutation();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    state: "RI",
    customState: "",
    planName: "Guardian Plus",
    expiresInDays: 7,
  });

  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const effectiveState =
    formData.state === "OTHER"
      ? formData.customState.trim().toUpperCase() || "OTHER"
      : formData.state;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      setErrorMsg("Recipient email address is required.");
      return;
    }

    if (formData.state === "OTHER" && !formData.customState.trim()) {
      setErrorMsg("Please enter the custom state name.");
      return;
    }

    setErrorMsg(null);

    const confirmed = await confirmCriticalAction({
      title: `Send Welcome Link to ${formData.email}?`,
      text: `An official single-use onboarding welcome invitation will be generated for ${effectiveState} and dispatched to ${formData.email}.`,
      confirmButtonText: "Yes, Send Welcome Link",
      isDestructive: false,
    });

    if (!confirmed) return;

    try {
      const res = await sendInvitation({
        email: formData.email.trim().toLowerCase(),
        firstName: formData.firstName.trim() || undefined,
        lastName: formData.lastName.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        state: effectiveState,
        planName: formData.planName,
        expiresInDays: formData.expiresInDays,
      }).unwrap();

      if (res.success && res.data?.invitationLink) {
        setCreatedLink(res.data.invitationLink);
        if (onSuccess) onSuccess();
        await showSuccessAlert(
          "Welcome Link Dispatched",
          `Invitation sent to ${formData.email}. A direct onboarding link is also available below.`
        );
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to send invitation.";
      setErrorMsg(msg);
      showErrorAlert("Invitation Failed", msg);
    }
  };

  const handleCopyLink = async () => {
    if (!createdLink) return;
    try {
      await navigator.clipboard.writeText(createdLink);
      setCopied(true);
      showToast("Invitation link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast("Unable to copy automatically.");
    }
  };

  const handleReset = () => {
    setCreatedLink(null);
    setCopied(false);
    setErrorMsg(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      state: "RI",
      customState: "",
      planName: "Guardian Plus",
      expiresInDays: 7,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={handleReset} />

      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#D9E4EC] shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#D9E4EC]">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#294B68]" />
            <h3 className="text-xl font-bold text-[#243746]">Send Welcome Link / Add Client</h3>
          </div>
          <button
            onClick={handleReset}
            className="p-2 text-[#64748B] hover:text-[#243746] rounded-xl border border-[#D9E4EC] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdLink ? (
          <div className="py-6 text-center space-y-5">
            <div className="w-16 h-16 bg-[#3F8F6B] text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-[#243746]">Invitation Dispatched!</h4>
              <p className="text-sm text-[#64748B] mt-1">
                An email has been sent to <strong>{formData.email}</strong> with a secure onboarding link.
              </p>
            </div>

            <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] text-left space-y-2">
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
                Direct Onboarding URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdLink}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#D9E4EC] text-xs font-mono text-[#243746] select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <p className="text-[11px] text-[#64748B]">
                This secure token expires in {formData.expiresInDays} days and creates an activated client profile upon agreement submission.
              </p>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-3 bg-[#294B68] text-white font-bold text-sm rounded-xl cursor-pointer"
            >
              Done &amp; Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="e.g. Eleanor"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9E4EC] text-sm text-[#243746] focus:outline-none focus:ring-2 focus:ring-[#294B68]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="e.g. Vance"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9E4EC] text-sm text-[#243746] focus:outline-none focus:ring-2 focus:ring-[#294B68]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1">
                Recipient Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="client@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9E4EC] text-sm text-[#243746] focus:outline-none focus:ring-2 focus:ring-[#294B68]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(401) 555-0199"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9E4EC] text-sm text-[#243746] focus:outline-none focus:ring-2 focus:ring-[#294B68]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1">
                  State *
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9E4EC] text-sm font-semibold text-[#243746] bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#294B68]"
                >
                  <option value="RI">Rhode Island (RI)</option>
                  <option value="CT">Connecticut (CT)</option>
                  <option value="MA">Massachusetts (MA)</option>
                  <option value="OTHER">Other State </option>
                </select>
              </div>
            </div>

            {/* Custom State text input if OTHER selected */}
            {formData.state === "OTHER" && (
              <div className="p-3 bg-[#EAF3F8] rounded-xl border border-[#5E8FB2]/30 space-y-1 animate-in fade-in duration-200">
                <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider">
                 Territory Name or Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.customState}
                  onChange={(e) => setFormData({ ...formData, customState: e.target.value })}
                  placeholder="e.g. New York, Florida, California, NH, TX..."
                  className="w-full px-3 py-2 bg-white rounded-lg border border-[#D9E4EC] text-sm font-semibold text-[#243746] focus:outline-none focus:ring-2 focus:ring-[#294B68]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1">
                Recommended Plan
              </label>
              <select
                value={formData.planName}
                onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9E4EC] text-sm font-semibold text-[#243746] bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#294B68]"
              >
                <option value="Guardian Plus">Guardian Plus (Comprehensive Senior Care)</option>
                <option value="Essential Guard">Essential Guard (Core Safety)</option>
              </select>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-extrabold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Welcome Link...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Welcome Link &amp; Invitation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
