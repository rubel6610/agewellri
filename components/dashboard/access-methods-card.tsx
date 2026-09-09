"use client";

import React, { useState } from "react";
import {
  Key,
  Hash,
  Bell,
  HelpCircle,
  Plus,
  Edit3,
  Trash2,
  Star,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Check,
  Loader2,
  Lock,
} from "lucide-react";
import {
  ClientAccessMethod,
  useGetClientAccessMethodsQuery,
  useDeleteClientAccessMethodMutation,
  useSetDefaultClientAccessMethodMutation,
} from "@/redux/features/client/clientApi";
import { AccessMethodModal } from "./access-method-modal";
import {
  confirmCriticalAction,
  showSuccessAlert,
  showErrorAlert,
  showToast,
} from "@/lib/alerts/sweetalert";

export function AccessMethodsCard() {
  const { data: methodsRes, isLoading, refetch } = useGetClientAccessMethodsQuery();
  const [deleteMethodMutation, { isLoading: isDeleting }] = useDeleteClientAccessMethodMutation();
  const [setDefaultMutation, { isLoading: isSettingDefault }] = useSetDefaultClientAccessMethodMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<ClientAccessMethod | null>(null);
  const [revealedCodes, setRevealedCodes] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const accessMethods = methodsRes?.data || [];

  const toggleRevealCode = (id: string) => {
    setRevealedCodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyCode = async (id: string, code?: string | null) => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      showToast("Access code copied to clipboard", "success");
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      showToast("Failed to copy code", "error");
    }
  };

  const handleOpenAdd = () => {
    setEditingMethod(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (method: ClientAccessMethod) => {
    setEditingMethod(method);
    setIsModalOpen(true);
  };

  const handleSetDefault = async (method: ClientAccessMethod) => {
    try {
      await setDefaultMutation(method.id).unwrap();
      showToast(`"${method.title}" is now your default access method`, "success");
    } catch (err: any) {
      showErrorAlert("Update Failed", err?.data?.message || "Failed to set default access method.");
    }
  };

  const handleDelete = async (method: ClientAccessMethod) => {
    const confirmed = await confirmCriticalAction({
      title: `Delete Access Method?`,
      text: `Are you sure you want to remove "${method.title}" from your saved access methods?`,
      confirmButtonText: "Yes, Delete",
      isDestructive: true,
    });

    if (!confirmed) return;

    try {
      await deleteMethodMutation(method.id).unwrap();
      await showSuccessAlert("Access Method Deleted", `"${method.title}" has been removed.`);
    } catch (err: any) {
      showErrorAlert("Delete Failed", err?.data?.message || "Unable to delete access method.");
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case "LOCKBOX":
        return <Key className="w-5 h-5 text-[#294B68]" />;
      case "DIGITAL_CODE":
        return <Hash className="w-5 h-5 text-[#5E8FB2]" />;
      case "RESIDENT_ANSWERS":
        return <Bell className="w-5 h-5 text-[#3F8F6B]" />;
      default:
        return <HelpCircle className="w-5 h-5 text-[#294B68]" />;
    }
  };

  const getMethodBadgeLabel = (type: string) => {
    switch (type) {
      case "LOCKBOX":
        return "Lockbox / Key Safe";
      case "DIGITAL_CODE":
        return "Digital Keypad";
      case "RESIDENT_ANSWERS":
        return "Resident Answers Door";
      default:
        return "Custom Method";
    }
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#D9E4EC]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#EAF3F8] text-[#294B68]">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-[#243746]">
              Home Access Methods
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Provide entry instructions and lockbox codes for AgeWellRI specialists visiting your residence.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Access Method</span>
        </button>
      </div>

      {/* Access Methods Content */}
      {isLoading ? (
        <div className="p-8 text-center text-[#64748B] flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#294B68]" />
          <span className="text-sm">Loading access methods...</span>
        </div>
      ) : accessMethods.length === 0 ? (
        <div className="p-8 text-center bg-[#F8FAFC] rounded-2xl border border-dashed border-[#D9E4EC] space-y-3">
          <Key className="w-8 h-8 text-[#5E8FB2] mx-auto opacity-70" />
          <div className="space-y-1">
            <h4 className="font-bold text-[#243746] text-sm sm:text-base">
              No Access Methods Configured
            </h4>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">
              Add how our certified specialists should enter your residence (e.g. lockbox code, digital keypad, or doorbell instructions).
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#294B68] text-white text-xs font-bold rounded-xl hover:bg-[#1E374D] cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Access Method Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {accessMethods.map((method) => {
            const isRevealed = Boolean(revealedCodes[method.id]);
            const isCopied = copiedId === method.id;

            return (
              <div
                key={method.id}
                className={`p-5 rounded-2xl border transition-all space-y-4 ${
                  method.isDefault
                    ? "border-[#294B68] bg-[#F7FAFC] shadow-xs"
                    : "border-[#D9E4EC] bg-white hover:border-[#5E8FB2]/60"
                }`}
              >
                {/* Method Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-[#EAF3F8] shrink-0 mt-0.5">
                      {getMethodIcon(method.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-[#243746] text-base">
                          {method.title}
                        </h4>
                        {method.isDefault && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-[#294B68] text-white px-2.5 py-0.5 rounded-full shadow-xs">
                            <Star className="w-3 h-3 fill-white" />
                            Default Method
                          </span>
                        )}
                        <span className="text-[11px] font-semibold text-[#64748B] bg-[#EAF3F8] px-2 py-0.5 rounded-md">
                          {getMethodBadgeLabel(method.type)}
                        </span>
                      </div>
                      {method.instructions && (
                        <p className="text-xs sm:text-sm text-[#64748B] mt-1 leading-relaxed">
                          {method.instructions}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {!method.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(method)}
                        disabled={isSettingDefault}
                        title="Make Default Access Method"
                        className="px-3 py-1.5 bg-white hover:bg-[#EAF3F8] text-[#294B68] border border-[#D9E4EC] rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Star className="w-3.5 h-3.5 text-[#5E8FB2]" />
                        <span>Set Default</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(method)}
                      title="Edit Access Method"
                      className="p-2 text-[#64748B] hover:text-[#294B68] hover:bg-[#EAF3F8] rounded-xl border border-[#D9E4EC] transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(method)}
                      disabled={isDeleting}
                      title="Delete Access Method"
                      className="p-2 text-[#64748B] hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-[#D9E4EC] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Code Display (if present) */}
                {method.code && (
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#D9E4EC] text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#64748B] uppercase tracking-wider text-[11px]">
                        Access Code:
                      </span>
                      <span className="font-mono font-bold text-sm text-[#243746] tracking-widest px-2 py-0.5 bg-[#F0F5F9] rounded-md">
                        {isRevealed ? method.code : "••••••••"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleRevealCode(method.id)}
                        className="p-1.5 text-[#64748B] hover:text-[#243746] rounded-lg hover:bg-[#F0F5F9] transition-colors cursor-pointer"
                        title={isRevealed ? "Hide Code" : "Reveal Code"}
                      >
                        {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyCode(method.id, method.code)}
                        className="p-1.5 text-[#64748B] hover:text-[#243746] rounded-lg hover:bg-[#F0F5F9] transition-colors cursor-pointer"
                        title="Copy Code"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Security note footer */}
      <div className="flex items-center gap-2 pt-2 text-xs text-[#64748B]">
        <ShieldCheck className="w-4 h-4 text-[#3F8F6B] shrink-0" />
        <span>
          Access codes are encrypted and selectively delivered to dispatched specialists on scheduled visit dates.
        </span>
      </div>

      {/* Add / Edit Modal */}
      <AccessMethodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        methodToEdit={editingMethod}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
