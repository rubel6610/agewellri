"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Key,
  Hash,
  Bell,
  HelpCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Star,
} from "lucide-react";
import {
  ClientAccessMethod,
  CreateAccessMethodPayload,
  UpdateAccessMethodPayload,
  useAddClientAccessMethodMutation,
  useUpdateClientAccessMethodMutation,
} from "@/redux/features/client/clientApi";
import { showSuccessAlert, showErrorAlert } from "@/lib/alerts/sweetalert";

interface AccessMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  methodToEdit?: ClientAccessMethod | null;
  onSuccess?: () => void;
}

const ACCESS_TYPES: Array<{
  type: "LOCKBOX" | "DIGITAL_CODE" | "RESIDENT_ANSWERS" | "OTHER";
  label: string;
  description: string;
  icon: React.ElementType;
  defaultTitle: string;
  placeholderCode: string;
  placeholderInstructions: string;
}> = [
  {
    type: "LOCKBOX",
    label: "Lockbox / Key Safe",
    description: "Physical lockbox containing a spare key on property.",
    icon: Key,
    defaultTitle: "Front Door Lockbox",
    placeholderCode: "e.g. 4921 or 1234",
    placeholderInstructions: "e.g. Mounted on the handrail of the front porch. Turn dial to 4921 and pull down.",
  },
  {
    type: "DIGITAL_CODE",
    label: "Digital Keypad Code",
    description: "Keyless door lock or smart keypad entry.",
    icon: Hash,
    defaultTitle: "Keypad Entry Code",
    placeholderCode: "e.g. #1984 or *5829#",
    placeholderInstructions: "e.g. Enter code on front door smart lock, then press the checkmark.",
  },
  {
    type: "RESIDENT_ANSWERS",
    label: "Resident Answers Door",
    description: "Resident or caregiver is present and will open the door upon arrival.",
    icon: Bell,
    defaultTitle: "Resident Answers Door",
    placeholderCode: "N/A (optional)",
    placeholderInstructions: "e.g. Ring front doorbell twice. Resident may need 1-2 minutes to reach the door.",
  },
  {
    type: "OTHER",
    label: "Custom / Other Method",
    description: "Concierge, gate code, side entrance, or family coordinator.",
    icon: HelpCircle,
    defaultTitle: "Custom Access Method",
    placeholderCode: "e.g. Gate code #7721 (optional)",
    placeholderInstructions: "e.g. Check in with building front desk / concierge. They have a key for unit 4B.",
  },
];

export function AccessMethodModal({
  isOpen,
  onClose,
  methodToEdit,
  onSuccess,
}: AccessMethodModalProps) {
  const [addMethodMutation, { isLoading: isAdding }] = useAddClientAccessMethodMutation();
  const [updateMethodMutation, { isLoading: isUpdating }] = useUpdateClientAccessMethodMutation();

  const isEditing = Boolean(methodToEdit);
  const isLoading = isAdding || isUpdating;

  const [type, setType] = useState<"LOCKBOX" | "DIGITAL_CODE" | "RESIDENT_ANSWERS" | "OTHER">("LOCKBOX");
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (methodToEdit) {
      setType(methodToEdit.type || "LOCKBOX");
      setTitle(methodToEdit.title || "");
      setCode(methodToEdit.code || "");
      setInstructions(methodToEdit.instructions || "");
      setIsDefault(Boolean(methodToEdit.isDefault));
    } else {
      setType("LOCKBOX");
      setTitle("Front Door Lockbox");
      setCode("");
      setInstructions("");
      setIsDefault(false);
    }
  }, [methodToEdit, isOpen]);

  if (!isOpen) return null;

  const currentTypeConfig = ACCESS_TYPES.find((t) => t.type === type) || ACCESS_TYPES[0];

  const handleTypeSelect = (selectedType: "LOCKBOX" | "DIGITAL_CODE" | "RESIDENT_ANSWERS" | "OTHER") => {
    setType(selectedType);
    const config = ACCESS_TYPES.find((t) => t.type === selectedType);
    if (!isEditing && config) {
      setTitle(config.defaultTitle);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showErrorAlert("Title Required", "Please provide a name or label for this access method (e.g. Front Door Lockbox).");
      return;
    }

    if (type !== "RESIDENT_ANSWERS" && !code.trim() && !instructions.trim()) {
      showErrorAlert(
        "Instructions or Code Required",
        "Please provide either an access code or specific entry instructions for the visiting specialist."
      );
      return;
    }

    try {
      if (isEditing && methodToEdit) {
        const payload: UpdateAccessMethodPayload = {
          type,
          title: title.trim(),
          code: code.trim() || null,
          instructions: instructions.trim() || null,
          isDefault,
        };

        await updateMethodMutation({ id: methodToEdit.id, body: payload }).unwrap();
        await showSuccessAlert("Access Method Updated", `"${title.trim()}" has been updated successfully.`);
      } else {
        const payload: CreateAccessMethodPayload = {
          type,
          title: title.trim(),
          code: code.trim() || undefined,
          instructions: instructions.trim() || undefined,
          isDefault,
        };

        await addMethodMutation(payload).unwrap();
        await showSuccessAlert("Access Method Added", `"${title.trim()}" has been added to your access profile.`);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to save access method. Please try again.";
      showErrorAlert("Save Failed", msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-[#D9E4EC] shadow-2xl p-6 sm:p-8 z-10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh] flex flex-col text-[#243746]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D9E4EC] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF3F8] text-[#294B68] flex items-center justify-center font-extrabold shadow-xs">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-[#243746]">
                {isEditing ? "Edit Home Access Method" : "Add New Home Access Method"}
              </h3>
              <p className="text-xs text-[#64748B] font-medium">
                Entry instructions for AgeWellRI visiting specialists
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-[#64748B] hover:text-[#243746] rounded-xl border border-[#D9E4EC] cursor-pointer hover:bg-[#F8FAFC] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-5 py-4 pr-1">
          {/* Access Type Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Access Method Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ACCESS_TYPES.map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.type;
                return (
                  <button
                    key={t.type}
                    type="button"
                    onClick={() => handleTypeSelect(t.type)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? "border-[#294B68] bg-[#EAF3F8]/70 shadow-xs"
                        : "border-[#D9E4EC] bg-white hover:border-[#5E8FB2]/50 hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isSelected
                          ? "bg-[#294B68] text-white"
                          : "bg-[#F0F5F9] text-[#294B68]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-[#243746] block leading-snug">
                        {t.label}
                      </span>
                      <span className="text-[11px] text-[#64748B] line-clamp-2 mt-0.5">
                        {t.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#243746]">
              Method Title / Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Front Porch Lockbox, Back Kitchen Door Code"
              className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl text-sm font-bold text-[#243746] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#294B68]"
            />
          </div>

          {/* Code / Combination (if applicable) */}
          {type !== "RESIDENT_ANSWERS" && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#243746] flex items-center justify-between">
                <span>Access Code / Combination</span>
                <span className="text-[11px] text-[#64748B] font-normal">
                  {type === "LOCKBOX" || type === "DIGITAL_CODE" ? "Required for automated entry" : "Optional"}
                </span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={currentTypeConfig.placeholderCode}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl text-sm font-mono font-bold text-[#243746] tracking-wider focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#294B68]"
              />
            </div>
          )}

          {/* Instructions / Location details */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#243746] flex items-center justify-between">
              <span>Location &amp; Entry Instructions</span>
              <span className="text-[11px] text-[#64748B] font-normal">
                Helps specialist access residence smoothly
              </span>
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={currentTypeConfig.placeholderInstructions}
              className="w-full p-3.5 bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl text-sm font-medium text-[#243746] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#294B68]"
            />
          </div>

          {/* Set as Default Toggle */}
          <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] flex items-center justify-between">
            <div className="space-y-0.5">
              <label htmlFor="isDefaultMethod" className="text-xs font-bold text-[#243746] cursor-pointer flex items-center gap-1.5">
                <Star className={`w-3.5 h-3.5 ${isDefault ? "text-amber-500 fill-amber-500" : "text-[#64748B]"}`} />
                <span>Set as Default Access Method</span>
              </label>
              <p className="text-[11px] text-[#64748B]">
                Automatically pre-select this entry method when scheduling safety visits.
              </p>
            </div>

            <input
              id="isDefaultMethod"
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-5 h-5 rounded border-[#D9E4EC] text-[#294B68] focus:ring-[#294B68] cursor-pointer accent-[#294B68]"
            />
          </div>

          {/* Security & Confidentiality Notice */}
          <div className="p-3 bg-[#EAF3F8]/60 rounded-xl border border-[#5E8FB2]/30 flex items-start gap-2.5 text-xs text-[#294B68]">
            <ShieldCheck className="w-4 h-4 text-[#294B68] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Your access codes and entry notes are securely encrypted and only shared with certified AgeWellRI specialists assigned to your scheduled visits.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D9E4EC] shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 text-sm font-bold text-[#64748B] hover:text-[#243746] bg-[#F0F5F9] hover:bg-[#E2E8F0] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? "Save Changes" : "Save Access Method"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
