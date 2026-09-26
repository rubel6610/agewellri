"use client";

import React, { useEffect, useState } from "react";
import { Key, DoorClosed, ShieldAlert, ArrowRight, ArrowLeft } from "lucide-react";

interface Step5HomeAccessProps {
  initialData?: {
    accessType: "RESIDENT_ANSWERS" | "DIGITAL_CODE";
    entryCode?: string;
    isAuthorized?: boolean;
    specialInstructions?: string;
  };
  onSave: (accessData: {
    accessType: "RESIDENT_ANSWERS" | "DIGITAL_CODE";
    entryCode: string;
    isAuthorized: boolean;
    specialInstructions: string;
  }) => void;
  onBack: () => void;
}

export function Step5HomeAccess({ initialData, onSave, onBack }: Step5HomeAccessProps) {
  const [mounted, setMounted] = useState(false);
  const [accessType, setAccessType] = useState<"RESIDENT_ANSWERS" | "DIGITAL_CODE">(
    initialData?.accessType || "RESIDENT_ANSWERS"
  );
  const [entryCode, setEntryCode] = useState(initialData?.entryCode || "");
  const [isAuthorized, setIsAuthorized] = useState(initialData?.isAuthorized ?? false);
  const [specialInstructions, setSpecialInstructions] = useState(
    initialData?.specialInstructions || ""
  );

  useEffect(() => {
    setMounted(true);
    try {
      const saved = sessionStorage.getItem("agewellri_signup_step5");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          if (parsed.accessType) setAccessType(parsed.accessType);
          if (typeof parsed.entryCode === "string") setEntryCode(parsed.entryCode);
          if (typeof parsed.isAuthorized === "boolean") setIsAuthorized(parsed.isAuthorized);
          if (typeof parsed.specialInstructions === "string") setSpecialInstructions(parsed.specialInstructions);
        }
      }
    } catch (err) {
      console.error("Failed to restore step5 form data:", err);
    }
  }, []);

  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      try {
        sessionStorage.setItem(
          "agewellri_signup_step5",
          JSON.stringify({ accessType, entryCode, isAuthorized, specialInstructions })
        );
      } catch (err) {
        console.error("Failed to save step5 form data:", err);
      }
    }
  }, [accessType, entryCode, isAuthorized, specialInstructions, mounted]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (accessType === "DIGITAL_CODE") {
      if (!entryCode.trim()) {
        setErrorMessage("Please enter the keypad code or lockbox combination.");
        return;
      }
      if (!isAuthorized) {
        setErrorMessage(
          "Please check the authorization box permitting AgeWellRI specialists to use this entry code."
        );
        return;
      }
    }

    onSave({
      accessType,
      entryCode: accessType === "DIGITAL_CODE" ? entryCode.trim() : "",
      isAuthorized: accessType === "DIGITAL_CODE" ? isAuthorized : true,
      specialInstructions: specialInstructions.trim(),
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EAF3F8] text-[#294B68] text-xs font-bold uppercase tracking-wider">
          Step 5 of 9
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
          Home Access Method
        </h2>
        <p className="text-sm text-[#5E8FB2] max-w-md mx-auto">
         Home Access Method: Choose how our certified, background-checked specialists will access the home for scheduled safety visits.
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

        {/* Radio Option Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option A: Resident Answers */}
          <div
            onClick={() => setAccessType("RESIDENT_ANSWERS")}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
              accessType === "RESIDENT_ANSWERS"
                ? "bg-[#EAF3F8]/50 border-[#294B68] shadow-sm"
                : "bg-[#F8FAFC] border-[#D9E4EC] hover:bg-white"
            }`}
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#294B68] text-white flex items-center justify-center">
                <DoorClosed className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#243746]">
                  Resident Answers Door
                </h4>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  The resident or onsite family member will greet the technician and open the door at the scheduled arrival time.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-2 flex items-center justify-between border-t border-[#D9E4EC]">
              <span className="text-xs font-bold text-[#64748B]">
                {accessType === "RESIDENT_ANSWERS" ? "Selected" : "Select Option"}
              </span>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  accessType === "RESIDENT_ANSWERS"
                    ? "border-[#294B68] bg-[#294B68]"
                    : "border-[#CBD5E1] bg-white"
                }`}
              >
                {accessType === "RESIDENT_ANSWERS" && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </div>
          </div>

          {/* Option B: Digital Code / Lockbox */}
          <div
            onClick={() => setAccessType("DIGITAL_CODE")}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
              accessType === "DIGITAL_CODE"
                ? "bg-[#EAF3F8]/50 border-[#294B68] shadow-sm"
                : "bg-[#F8FAFC] border-[#D9E4EC] hover:bg-white"
            }`}
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#5E8FB2] text-white flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#243746]">
                  Digital Keypad / Lockbox
                </h4>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  Technicians enter via an authorized smart lock keypad, garage entry code, or exterior key lockbox.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-2 flex items-center justify-between border-t border-[#D9E4EC]">
              <span className="text-xs font-bold text-[#64748B]">
                {accessType === "DIGITAL_CODE" ? "Selected" : "Select Option"}
              </span>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  accessType === "DIGITAL_CODE"
                    ? "border-[#294B68] bg-[#294B68]"
                    : "border-[#CBD5E1] bg-white"
                }`}
              >
                {accessType === "DIGITAL_CODE" && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Digital Code Details Container */}
        {accessType === "DIGITAL_CODE" && (
          <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] space-y-4 animate-in fade-in">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Digital Keypad / Lockbox Entry Code *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={entryCode}
                  onChange={(e) => setEntryCode(e.target.value)}
                  placeholder="e.g. 4821 or Lockbox #9012"
                  className="w-full h-12 pl-11 pr-4 text-sm font-semibold text-[#243746] bg-white border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                />
                <Key className="w-5 h-5 text-[#94A3B8] absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Mandatory Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={isAuthorized}
                onChange={(e) => setIsAuthorized(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-[#D9E4EC] text-[#294B68] focus:ring-[#5E8FB2] cursor-pointer"
              />
              <span className="text-xs text-[#475569] leading-relaxed">
                <strong>I authorize</strong> AgeWellRI specialists and technicians to use this entry code to access the residence during confirmed, scheduled service appointments.
              </span>
            </label>

            {/* Security Isolation Notice */}
            <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/80 flex items-start gap-2.5 text-amber-900 text-xs leading-relaxed">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Privacy &amp; Security Note:</strong> For your protection, your access code is encrypted and stored in your private client portal. It is never printed in public service agreements or displayed on downloadable documents.
              </span>
            </div>
          </div>
        )}

        {/* Special Access Instructions */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Special Access Instructions (Optional)
          </label>
          <textarea
            rows={3}
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="e.g. Ring front doorbell before entering; lockbox is located on the back porch railing..."
            className="w-full p-4 text-xs sm:text-sm font-medium text-[#243746] bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] transition-all resize-none"
          />
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
            <span>Continue to Review Agreement</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  );
}
