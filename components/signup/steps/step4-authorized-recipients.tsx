"use client";

import React, { useState } from "react";
import { Plus, Trash2, Mail, User, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";

export interface AuthorizedRecipient {
  name: string;
  relationship: string;
  email: string;
}

interface Step4AuthorizedRecipientsProps {
  initialRecipients?: AuthorizedRecipient[];
  onSave: (recipients: AuthorizedRecipient[]) => void;
  onBack: () => void;
}

const RELATIONSHIP_OPTIONS = [
  "Daughter",
  "Son",
  "Spouse",
  "Power of Attorney",
  "Case Manager / Social Worker",
  "Sibling",
  "Neighbor / Trusted Friend",
  "Other",
];

export function Step4AuthorizedRecipients({
  initialRecipients = [],
  onSave,
  onBack,
}: Step4AuthorizedRecipientsProps) {
  const [recipients, setRecipients] = useState<AuthorizedRecipient[]>(
    initialRecipients.length > 0
      ? initialRecipients
      : [{ name: "", relationship: "Daughter", email: "" }]
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddRecipient = () => {
    setRecipients([...recipients, { name: "", relationship: "Daughter", email: "" }]);
  };

  const handleRemoveRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleUpdateRecipient = (
    index: number,
    field: keyof AuthorizedRecipient,
    value: string
  ) => {
    const updated = [...recipients];
    updated[index] = { ...updated[index], [field]: value };
    setRecipients(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Filter out completely blank rows
    const filledRecipients = recipients.filter(
      (r) => r.name.trim() !== "" || r.email.trim() !== ""
    );

    // Validate that each filled row has valid name and email
    for (let i = 0; i < filledRecipients.length; i++) {
      const r = filledRecipients[i];
      if (!r.name.trim()) {
        setErrorMessage(`Please provide a name for recipient #${i + 1}.`);
        return;
      }
      if (!r.email.trim() || !r.email.includes("@")) {
        setErrorMessage(`Please provide a valid email for ${r.name.trim() || `recipient #${i + 1}`}.`);
        return;
      }
    }

    onSave(filledRecipients);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EAF3F8] text-[#294B68] text-xs font-bold uppercase tracking-wider">
          Step 4 of 9
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
          Authorized Report Recipients
        </h2>
        <p className="text-sm text-[#5E8FB2] max-w-md mx-auto">
          Add family members or advocates who should receive digital visit reports, photos, and safety notes after each technician visit.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-sm space-y-6"
      >
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-in fade-in">
            <span className="font-bold shrink-0">Error:</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Informational banner */}
        <div className="p-4 bg-[#F0F5F9] rounded-2xl border border-[#D9E4EC] flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#294B68] shrink-0 mt-0.5" />
          <div className="text-xs text-[#475569] leading-relaxed">
            <strong>Family Peace of Mind:</strong> After every scheduled visit, our technicians upload photos and a completion checklist. Authorized recipients will receive automatic email updates with full visit details.
          </div>
        </div>

        {/* Recipients List */}
        <div className="space-y-4">
          {recipients.map((rec, index) => (
            <div
              key={index}
              className="p-4 sm:p-5 rounded-2xl border border-[#D9E4EC] bg-[#F8FAFC] space-y-4 relative transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#294B68]">
                  Recipient #{index + 1}
                </span>
                {recipients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRecipient(index)}
                    className="p-1.5 text-[#94A3B8] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="Remove recipient"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#64748B]">
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={rec.name}
                      onChange={(e) => handleUpdateRecipient(index, "name", e.target.value)}
                      placeholder="e.g. Sarah Vance"
                      className="w-full h-11 pl-10 pr-3 text-sm font-medium text-[#243746] bg-white border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                    />
                    <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3.5" />
                  </div>
                </div>

                {/* Relationship */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#64748B]">
                    Relationship *
                  </label>
                  <select
                    value={rec.relationship}
                    onChange={(e) => handleUpdateRecipient(index, "relationship", e.target.value)}
                    className="w-full h-11 px-3 text-sm font-semibold text-[#243746] bg-white border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] cursor-pointer"
                  >
                    {RELATIONSHIP_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Email */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-[#64748B]">
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={rec.email}
                      onChange={(e) => handleUpdateRecipient(index, "email", e.target.value)}
                      placeholder="sarah.vance@example.com"
                      className="w-full h-11 pl-10 pr-3 text-sm font-medium text-[#243746] bg-white border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                    />
                    <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3.5" />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add Recipient Button */}
          <button
            type="button"
            onClick={handleAddRecipient}
            className="w-full py-3 px-4 border-2 border-dashed border-[#CBD5E1] hover:border-[#294B68] bg-[#F8FAFC] hover:bg-[#EAF3F8] text-[#294B68] text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Another Authorized Recipient</span>
          </button>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#D9E4EC]">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-[#D9E4EC] bg-white text-sm font-bold text-[#64748B] hover:text-[#243746] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#294B68] hover:bg-[#1E374D] text-white text-sm font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer group"
          >
            <span>Continue to Home Access Method</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  );
}
