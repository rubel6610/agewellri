"use client";

import React, { useState } from "react";
import {
  X,
  Mail,
  Send,
  Loader2,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { useSendContactMessageMutation } from "@/redux/features/contact/contactApi";
import { useAppSelector } from "@/redux/hooks";
import { showSuccessAlert, showErrorAlert } from "@/lib/alerts/sweetalert";

interface ContactSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubject?: string;
}

/**
 * Resolves the webmail inbox link and brand name based on the email domain
 */
function resolveWebmailInfo(email: string): { url: string; providerName: string } {
  if (!email || !email.includes("@")) {
    return { url: "https://mail.google.com", providerName: "Email" };
  }

  const domain = email.split("@")[1]?.toLowerCase().trim() || "";

  if (domain === "gmail.com" || domain === "googlemail.com") {
    return { url: "https://mail.google.com", providerName: "Gmail" };
  }
  if (domain === "yahoo.com" || domain === "myyahoo.com" || domain === "ymail.com") {
    return { url: "https://mail.yahoo.com", providerName: "Yahoo Mail" };
  }
  if (
    domain === "outlook.com" ||
    domain === "hotmail.com" ||
    domain === "live.com" ||
    domain === "msn.com"
  ) {
    return { url: "https://outlook.live.com/mail", providerName: "Outlook" };
  }
  if (domain === "icloud.com" || domain === "me.com" || domain === "mac.com") {
    return { url: "https://www.icloud.com/mail", providerName: "iCloud Mail" };
  }
  if (domain === "aol.com") {
    return { url: "https://mail.aol.com", providerName: "AOL Mail" };
  }
  if (domain === "proton.me" || domain === "protonmail.com") {
    return { url: "https://mail.proton.me", providerName: "Proton Mail" };
  }
  if (domain === "zoho.com") {
    return { url: "https://mail.zoho.com", providerName: "Zoho Mail" };
  }
  if (domain === "comcast.net") {
    return { url: "https://connect.xfinity.com", providerName: "Xfinity Mail" };
  }

  return { url: `https://${domain}`, providerName: `${domain}` };
}

export function ContactSupportModal({
  isOpen,
  onClose,
  defaultSubject = "",
}: ContactSupportModalProps) {
  const authUser = useAppSelector((state) => state.auth.user);
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState("");
  const [isSent, setIsSent] = useState(false);

  const [sendContactMessage, { isLoading }] = useSendContactMessageMutation();

  if (!isOpen) return null;

  const clientEmail = authUser?.email || "your email";
  const clientName = authUser
    ? `${authUser.firstName || ""} ${authUser.lastName || ""}`.trim()
    : "Valued Client";

  const webmail = resolveWebmailInfo(clientEmail);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      showErrorAlert("Missing Subject", "Please enter a subject for your message.");
      return;
    }

    if (!message.trim() || message.trim().length < 10) {
      showErrorAlert(
        "Message Too Short",
        "Please provide a detailed message (at least 10 characters)."
      );
      return;
    }

    try {
      const response = await sendContactMessage({
        subject: subject.trim(),
        message: message.trim(),
        senderName: clientName,
        senderEmail: authUser?.email || undefined,
        senderPhone: authUser?.phone || undefined,
      }).unwrap();

      if (response.success) {
        setIsSent(true);
        showSuccessAlert(
          "Message Sent Successfully!",
          `Thank you, ${clientName}. Your message has been sent directly to our administrative team. We will reply to ${clientEmail}.`
        );
      } else {
        showErrorAlert("Could Not Send Message", response.message || "Please try again later.");
      }
    } catch (err: any) {
      const errMsg =
        err?.data?.message || err?.message || "Failed to send message. Please try again.";
      showErrorAlert("Submission Error", errMsg);
    }
  };

  const handleResetAndClose = () => {
    setIsSent(false);
    setMessage("");
    setSubject("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#D9E4EC] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
      >
        {/* Header */}
        <div className="bg-[#294B68] px-5 sm:px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#243746]/60 text-white flex items-center justify-center shadow-xs">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 id="contact-modal-title" className="text-base sm:text-lg font-black tracking-tight">
                Send Message to AgeWellRI LLC
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {isSent ? (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-[#243746]">Message Delivered!</h4>
              <p className="text-sm text-[#64748B] max-w-md mx-auto leading-relaxed mt-2">
                Your inquiry has been delivered directly to our administrative management inbox. Our team will review your message and reply directly to{" "}
                <strong className="text-[#243746]">{clientEmail}</strong>.
              </p>
            </div>

            {/* Actions: Open Webmail and Done */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {webmail.url && (
                <a
                  href={webmail.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open {webmail.providerName} Inbox</span>
                </a>
              )}
              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full sm:w-auto px-6 py-3 bg-[#F0F5F9] hover:bg-[#E2EDF4] text-[#294B68] font-bold text-sm rounded-xl transition-all border border-[#D9E4EC] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
            {/* Notice card */}
            <div className="p-3.5 sm:p-4 bg-[#F0F5F9] rounded-2xl border border-[#D9E4EC] flex items-start gap-3">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#294B68] shrink-0 mt-0.5" />
              <div className="text-xs text-[#475569] leading-relaxed">
                <strong>Direct Email Contact:</strong> When you send this message, it is delivered straight to our management inbox. Replies will be sent directly to your email (<strong>{clientEmail}</strong>).
              </div>
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="contact-subject" className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                Subject <span className="text-rose-500">*</span>
              </label>
              <input
                id="contact-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Question regarding upcoming safety visit"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9E4EC] text-sm text-[#243746] focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] focus:border-[#5E8FB2] transition-colors"
              />
            </div>

            {/* Message Body */}
            <div>
              <label htmlFor="contact-message" className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                Your Message <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="contact-message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your question or request here..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9E4EC] text-sm text-[#243746] focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] focus:border-[#5E8FB2] transition-colors resize-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D9E4EC]">
              <button
                type="button"
                onClick={handleResetAndClose}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl border border-[#D9E4EC] text-xs sm:text-sm font-bold text-[#64748B] hover:bg-[#F7FAFC] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-[#294B68] hover:bg-[#1E374D] text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
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
