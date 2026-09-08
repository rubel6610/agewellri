"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Share2,
  Mail,
  Users,
  CheckCircle2,
  Loader2,
  Send,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import {
  useGetFamilyMembersQuery,
  useSendReportToFamilyMutation,
} from "@/redux/features/family/familyApi";
import { showSuccessAlert, showErrorAlert, showToast } from "@/lib/alerts/sweetalert";

interface SendReportModalProps {
  isOpen: boolean;
  reportId: string;
  reportTitle?: string;
  onClose: () => void;
}

export function SendReportModal({
  isOpen,
  reportId,
  reportTitle,
  onClose,
}: SendReportModalProps) {
  const { data: familyRes, isLoading: isLoadingMembers } = useGetFamilyMembersQuery();
  const [sendReport, { isLoading: isSending }] = useSendReportToFamilyMutation();

  const familyMembers = familyRes?.data || [];

  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [additionalEmails, setAdditionalEmails] = useState("");
  const [customMessage, setCustomMessage] = useState("");

  useEffect(() => {
    if (familyMembers.length > 0) {
      // By default, select members who have reportAccess enabled
      const defaultIds = familyMembers
        .filter((m) => m.reportAccess)
        .map((m) => m.id);
      setSelectedMemberIds(defaultIds);
    }
  }, [familyMembers]);

  if (!isOpen) return null;

  const handleToggleMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedMemberIds.length === familyMembers.length) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(familyMembers.map((m) => m.id));
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    const extraEmails = additionalEmails
      .split(/[,;\s]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    if (selectedMemberIds.length === 0 && extraEmails.length === 0) {
      showErrorAlert(
        "No Recipients Selected",
        "Please select at least one family member or enter a valid email address."
      );
      return;
    }

    try {
      const res = await sendReport({
        reportId,
        familyMemberIds: selectedMemberIds,
        additionalEmails: extraEmails.length > 0 ? extraEmails : undefined,
        customMessage: customMessage.trim() || undefined,
      }).unwrap();

      if (res.success) {
        const count = res.data?.sentCount || selectedMemberIds.length + extraEmails.length;
        showToast(`Report emailed to ${count} recipient(s)!`, "success");
        showSuccessAlert(
          "Safety Report Shared!",
          `The official visit report document has been dispatched to ${count} recipient(s).`
        );
        onClose();
        setAdditionalEmails("");
        setCustomMessage("");
      }
    } catch (err: any) {
      const message =
        err?.data?.message || err?.message || "Failed to dispatch report emails.";
      showErrorAlert("Email Dispatch Failed", message);
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
      <div className="relative bg-white rounded-3xl border border-[#D9E4EC] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10 animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-xs px-6 py-5 border-b border-[#D9E4EC] flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF3F8] text-[#294B68] flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#243746]">
                Share Safety Report
              </h2>
              <p className="text-xs text-[#64748B]">
                {reportTitle ? reportTitle : "Email visit report to family members"}
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

        {/* Content */}
        <form onSubmit={handleSend} className="p-6 space-y-5">
          {/* Family Members Selection List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#243746] uppercase tracking-wider">
                Select Family Members ({selectedMemberIds.length}/{familyMembers.length})
              </label>
              {familyMembers.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs font-bold text-[#5E8FB2] hover:text-[#294B68] cursor-pointer"
                >
                  {selectedMemberIds.length === familyMembers.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              )}
            </div>

            {isLoadingMembers ? (
              <div className="p-6 text-center text-[#64748B] bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC]">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#294B68] mb-2" />
                <p className="text-xs font-bold">Loading family contacts...</p>
              </div>
            ) : familyMembers.length === 0 ? (
              <div className="p-5 text-center bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] space-y-2">
                <Users className="w-6 h-6 text-[#94A3B8] mx-auto" />
                <p className="text-xs font-bold text-[#243746]">
                  No family members registered yet
                </p>
                <p className="text-[11px] text-[#64748B]">
                  You can enter recipient email addresses manually below.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {familyMembers.map((member) => {
                  const isChecked = selectedMemberIds.includes(member.id);
                  return (
                    <div
                      key={member.id}
                      onClick={() => handleToggleMember(member.id)}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? "bg-[#EAF3F8] border-[#294B68]/30 shadow-2xs"
                          : "bg-white border-[#D9E4EC] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#5E8FB2] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-[#243746] truncate">
                              {member.name}
                            </p>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#5E8FB2] border border-[#D9E4EC]">
                              {member.relationship}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#64748B] truncate">
                            {member.email}
                          </p>
                        </div>
                      </div>

                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Handled by parent div
                        className="w-4 h-4 rounded border-[#CBD5E1] text-[#294B68] focus:ring-[#294B68] shrink-0 pointer-events-none"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Additional Email Input */}
          <div className="space-y-1.5 pt-2 border-t border-[#D9E4EC]">
            <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider">
              Additional Recipient Emails <span className="text-xs font-normal text-[#64748B]">(Optional)</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="doctor@example.com, attorney@example.com"
                value={additionalEmails}
                onChange={(e) => setAdditionalEmails(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9E4EC] text-xs text-[#243746] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#294B68]"
              />
            </div>
            <p className="text-[10px] text-[#64748B]">
              Separate multiple email addresses with commas or spaces.
            </p>
          </div>

          {/* Custom Message */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider">
              Personal Note <span className="text-xs font-normal text-[#64748B]">(Optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Hi everyone, here is the latest safety visit report from AgeWellRI..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#D9E4EC] text-xs text-[#243746] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#294B68] resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#D9E4EC] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="px-5 py-2.5 rounded-xl border border-[#D9E4EC] text-xs font-bold text-[#64748B] hover:bg-[#F0F5F9] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending || (selectedMemberIds.length === 0 && !additionalEmails.trim())}
              className="px-6 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Report...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Report Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
