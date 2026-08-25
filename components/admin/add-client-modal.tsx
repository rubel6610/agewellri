"use client";

import React, { useState } from "react";
import { X, UserPlus, Loader2, CheckCircle2, Copy, Check, Send, Mail, Link as LinkIcon } from "lucide-react";
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

  const [email, setEmail] = useState("");
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Generate direct link without requiring email
  const handleGenerateLinkOnly = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const trimmedEmail = email.trim().toLowerCase();

    const link = trimmedEmail
      ? `${origin}/register?email=${encodeURIComponent(trimmedEmail)}`
      : `${origin}/register`;

    setCreatedLink(link);
    setErrorMsg(null);
    showToast("Registration invitation link ready!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMsg("Please enter recipient email address to dispatch email invitation.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setErrorMsg(null);

    const confirmed = await confirmCriticalAction({
      title: `Send Invitation to ${trimmedEmail}?`,
      text: `An invitation email will be dispatched to ${trimmedEmail}, directing them to complete registration and their Client Service Agreement.`,
      confirmButtonText: "Yes, Send Invitation",
      isDestructive: false,
    });

    if (!confirmed) return;

    try {
      const res = await sendInvitation({
        email: trimmedEmail,
      }).unwrap();

      if (res.success && res.data?.invitationLink) {
        setCreatedLink(res.data.invitationLink);
        if (onSuccess) onSuccess();
        await showSuccessAlert(
          "Invitation Dispatched",
          `An invitation link has been emailed to ${trimmedEmail}. You can also copy the direct registration link below.`
        );
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to generate invitation.";
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
    setEmail("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={handleReset} />

      <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#D9E4EC] shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#D9E4EC]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EAF3F8] text-[#294B68] flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#243746]">Send Invitation / Add Client</h3>
              <p className="text-xs text-[#64748B]">Generate client onboarding registration link</p>
            </div>
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
              <h4 className="text-xl font-black text-[#243746]">Invitation Link Ready!</h4>
              <p className="text-xs text-[#64748B] mt-1">
                {email ? (
                  <>
                    Generated for <strong>{email}</strong>
                  </>
                ) : (
                  "Direct client registration link ready to copy and share"
                )}
              </p>
            </div>

            <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] text-left space-y-2">
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-[#294B68]" />
                <span>Direct Registration Link</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdLink}
                  className="w-full px-3 py-2.5 bg-white rounded-xl border border-[#D9E4EC] text-xs font-mono text-[#243746] select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <p className="text-[11px] text-[#64748B]">
                This link takes the client directly to account registration and their Service Agreement.
              </p>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-3 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-sm rounded-xl cursor-pointer transition-colors"
            >
              Done &amp; Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 pt-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600">
                {errorMsg}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider">
                  Recipient Email Address
                </label>
                <button
                  type="button"
                  onClick={handleGenerateLinkOnly}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#294B68] bg-[#EAF3F8] hover:bg-[#D4E6F1] active:scale-98 rounded-xl transition-all cursor-pointer border border-[#5E8FB2]/30 shadow-2xs"
                  title="Generate registration link directly without entering an email"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-[#294B68]" />
                  <span>Generate Link</span>
                </button>
              </div>

              <div className="relative">
                <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="client@example.com (optional to generate link)"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-[#D9E4EC] text-sm font-medium text-[#243746] focus:outline-none focus:ring-2 focus:ring-[#294B68]"
                />
              </div>
              <p className="text-[11px] text-[#64748B] mt-1.5">
                Click <strong>Generate Link</strong> to create a direct registration link to share manually, or enter an email to dispatch an invitation email.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="w-full py-3.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-black text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dispatching Invitation Email...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Dispatch Email Invitation</span>
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
