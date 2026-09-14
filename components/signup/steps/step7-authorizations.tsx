"use client";

import React, { useState } from "react";
import { AlertTriangle, CreditCard, HeartHandshake, ArrowRight, ArrowLeft } from "lucide-react";

interface Step7AuthorizationsProps {
  planDetails?: {
    planName?: string;
    planPrice?: number;
  };
  initialAuthorizations?: {
    emergencyRightOfEntry: boolean;
    residentAutonomyAcknowledgment: boolean;
    automaticBillingAuthorization: boolean;
  };
  onSave: (authorizations: {
    emergencyRightOfEntry: boolean;
    residentAutonomyAcknowledgment: boolean;
    automaticBillingAuthorization: boolean;
  }) => void;
  onBack: () => void;
}

export function Step7Authorizations({
  planDetails,
  initialAuthorizations,
  onSave,
  onBack,
}: Step7AuthorizationsProps) {
  const [authorizations, setAuthorizations] = useState({
    emergencyRightOfEntry: initialAuthorizations?.emergencyRightOfEntry ?? false,
    residentAutonomyAcknowledgment:
      initialAuthorizations?.residentAutonomyAcknowledgment ?? false,
    automaticBillingAuthorization:
      initialAuthorizations?.automaticBillingAuthorization ?? false,
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAllChecked =
    authorizations.emergencyRightOfEntry &&
    authorizations.residentAutonomyAcknowledgment &&
    authorizations.automaticBillingAuthorization;

  const handleToggleAll = () => {
    const nextVal = !isAllChecked;
    setAuthorizations({
      emergencyRightOfEntry: nextVal,
      residentAutonomyAcknowledgment: nextVal,
      automaticBillingAuthorization: nextVal,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isAllChecked) {
      setErrorMessage("You must accept all three required legal authorizations to continue.");
      return;
    }

    onSave(authorizations);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EAF3F8] text-[#294B68] text-xs font-bold uppercase tracking-wider">
          Step 7 of 9
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
          Required Authorizations
        </h2>
        <p className="text-sm text-[#5E8FB2] max-w-md mx-auto">
          Please confirm the following mandatory contract authorizations to complete your service onboarding.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-sm space-y-6"
      >
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-in fade-in">
            <span className="font-bold shrink-0">Required:</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Quick Select All Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#D9E4EC]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Contract Clauses (3 of 3 Required)
          </span>
          <button
            type="button"
            onClick={handleToggleAll}
            className="text-xs font-bold text-[#294B68] hover:underline cursor-pointer"
          >
            {isAllChecked ? "Deselect All" : "Select All 3"}
          </button>
        </div>

        {/* Clause 1: Emergency Right of Entry (12.2) */}
        <div className="p-4 sm:p-5 rounded-2xl border border-[#D9E4EC] bg-[#F8FAFC] space-y-2">
          <label className="flex items-start gap-3.5 cursor-pointer select-none">
            <input
              type="checkbox"
              required
              checked={authorizations.emergencyRightOfEntry}
              onChange={(e) =>
                setAuthorizations({
                  ...authorizations,
                  emergencyRightOfEntry: e.target.checked,
                })
              }
              className="mt-1 w-5 h-5 rounded border-[#D9E4EC] text-[#294B68] focus:ring-[#5E8FB2] cursor-pointer shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h4 className="text-sm font-extrabold text-[#243746]">
                  1. Emergency Right of Entry (Section 12.2) *
                </h4>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed">
               I authorize AgeWellRI to enter the home during a scheduled visit if a technician has a reasonable belief that a medical emergency or safety crisis is occurring inside. I authorize the use of any available key/code, contacting emergency services (911), and following instructions from designated family contacts. AgeWellRI and its technicians are held harmless for property damage (such as forced entry) or liabilities resulting from a good-faith emergency response — except in cases of gross negligence, recklessness, or willful misconduct.
              </p>
            </div>
          </label>
        </div>

        {/* Clause 2: Resident Autonomy (12.3) */}
        <div className="p-4 sm:p-5 rounded-2xl border border-[#D9E4EC] bg-[#F8FAFC] space-y-2">
          <label className="flex items-start gap-3.5 cursor-pointer select-none">
            <input
              type="checkbox"
              required
              checked={authorizations.residentAutonomyAcknowledgment}
              onChange={(e) =>
                setAuthorizations({
                  ...authorizations,
                  residentAutonomyAcknowledgment: e.target.checked,
                })
              }
              className="mt-1 w-5 h-5 rounded border-[#D9E4EC] text-[#294B68] focus:ring-[#5E8FB2] cursor-pointer shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-[#294B68]" />
                <h4 className="text-sm font-extrabold text-[#243746]">
                  2. Resident Autonomy & Refusal (Section 12.3) *
                </h4>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed">
               I acknowledge that AgeWellRI technicians respect the dignity, comfort, and personal boundaries of all residents. If a resident refuses entry, objects to a checklist item, or asks a technician to leave an area, the technician will immediately respect that and stop that part of the service. I understand this refusal is not a breach of contract by AgeWellRI, the standard visit fee still applies, and AgeWellRI is not liable for accidents caused by a hazard left in place because the resident declined to have it addressed — except in cases of gross negligence, recklessness, or willful misconduct.
              </p>
            </div>
          </label>
        </div>

        {/* Clause 3: Automatic Billing (12.4) */}
        <div className="p-4 sm:p-5 rounded-2xl border border-[#D9E4EC] bg-[#F8FAFC] space-y-2">
          <label className="flex items-start gap-3.5 cursor-pointer select-none">
            <input
              type="checkbox"
              required
              checked={authorizations.automaticBillingAuthorization}
              onChange={(e) =>
                setAuthorizations({
                  ...authorizations,
                  automaticBillingAuthorization: e.target.checked,
                })
              }
              className="mt-1 w-5 h-5 rounded border-[#D9E4EC] text-[#294B68] focus:ring-[#5E8FB2] cursor-pointer shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#3F8F6B]" />
                <h4 className="text-sm font-extrabold text-[#243746]">
                  3. Automatic Billing Authorization (Section 12.4) *
                </h4>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed">
             I authorize AgeWellRI to automatically charge my saved payment method (or process my check payment) the flat monthly fee for my selected plan ($495 for Plan 1 / $295 for Plan 2) on a recurring basis. I understand I can cancel anytime by emailing <strong className="text-agewell-green">agewellri@gmail.com</strong> or using my secure client dashboard.
              </p>
            </div>
          </label>
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
            disabled={!isAllChecked}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#294B68] hover:bg-[#1E374D] text-white text-sm font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Continue to Billing Setup</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  );
}
