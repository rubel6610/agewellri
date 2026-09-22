"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Plus,
  Trash2,
  DollarSign,
  Layers,
  Clock,
  Sparkles,
  Check,
} from "lucide-react";
import { useCreatePlanMutation } from "@/redux/features/plan/planApi";
import { formatPlanDuration } from "@/redux/features/plan/planTypes";
import {
  confirmEdit,
  showSuccessAlert,
  showErrorAlert,
  showToast,
} from "@/lib/alerts/sweetalert";

export default function CreatePlanPage() {
  const router = useRouter();
  const [createPlan, { isLoading }] = useCreatePlanMutation();

  const [form, setForm] = useState({
    name: "",
    shortDescription: "",
    price: "" as string | number,
    currency: "USD",
    billingInterval: "MONTHLY" as const,
    totalVisits: "" as string | number,
    times: 2 as string | number,
    displayOrder: 1,
    supportsAutomaticBilling: true,
    supportsInvoiceBilling: true,
    autoRenewDefault: true,
    isActive: true,
  });

  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
      showToast("Feature bullet point added");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
    showToast("Feature removed", "info");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numericPrice = Number(form.price);
    const numericVisits = Number(form.totalVisits);

    if (
      !form.name.trim() ||
      form.price === "" ||
      isNaN(numericPrice) ||
      numericPrice <= 0 ||
      form.totalVisits === "" ||
      isNaN(numericVisits) ||
      numericVisits < 1
    ) {
      setErrorMsg("Please provide a plan name, valid price, and at least 1 included visit.");
      showErrorAlert(
        "Incomplete Information",
        "Please provide a plan name, valid price, and at least 1 included visit.",
      );
      return;
    }

    const confirmed = await confirmEdit({
      title: `Publish "${form.name}"?`,
      text: `Are you sure you want to create and publish this plan tier at $${numericPrice}/month with ${numericVisits} monthly visits?`,
      confirmButtonText: "Yes, Publish Plan",
    });

    if (!confirmed) return;

    try {
      await createPlan({
        ...form,
        price: numericPrice,
        totalVisits: numericVisits,
        times: formatPlanDuration(form.times),
        features,
      }).unwrap();

      await showSuccessAlert(
        "Plan Created",
        `"${form.name}" has been successfully added to service plans.`,
      );
      router.push("/admin/plans");
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to create service plan.";
      setErrorMsg(msg);
      showErrorAlert("Creation Failed", msg);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header & Back Link */}
      <div className="flex items-center justify-between gap-4 border-b border-[#D9E4EC] pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/plans"
            className="p-2 bg-white hover:bg-[#F0F5F9] border border-[#D9E4EC] rounded-xl text-[#5E8FB2] hover:text-[#243746] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-[#243746] tracking-tight">
              Create New Service Plan
            </h1>
            <p className="text-xs sm:text-sm text-[#5E8FB2] font-medium">
              Define pricing, visit quotas, times/frequency, and marketing feature bullet points
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-semibold flex items-center gap-2">
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="bg-white p-6 rounded-3xl border border-[#D9E4EC] shadow-xs space-y-5">
          <h2 className="text-base font-extrabold text-[#294B68] flex items-center gap-2">
            <Package className="w-5 h-5 text-[#5E8FB2]" />
            Plan Identification &amp; Pricing
          </h2>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5E8FB2] mb-1.5">
              Plan Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Independence & Upkeep"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5E8FB2] mb-1.5">
                Monthly Price ($ USD) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-3 text-[#5E8FB2]" />
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  placeholder="e.g. 995"
                  value={form.price}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      price: e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  className="w-full pl-9 pr-4 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5E8FB2] mb-1.5">
                Included Visits <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Layers className="w-4 h-4 absolute left-3 top-3 text-[#5E8FB2]" />
                <input
                  type="number"
                  min="1"
                  max="30"
                  required
                  placeholder="e.g. 2"
                  value={form.totalVisits}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      totalVisits: e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  className="w-full pl-9 pr-4 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                />
              </div>
              <p className="text-[11px] text-[#64748B] mt-1">Visits per month</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5E8FB2] mb-1.5">
                Time (Hours) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-3 text-[#5E8FB2]" />
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  required
                  placeholder="2"
                  value={form.times}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      times: e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  className="w-full pl-9 pr-4 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                />
              </div>
              <p className="text-[11px] text-[#64748B] mt-1">E.g. 1 for &quot;Up to an hour&quot;, 2 for &quot;Up to 2 hours&quot;</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5E8FB2] mb-1.5">
                Billing Frequency
              </label>
              <div className="w-full px-4 py-2.5 bg-[#F0F5F9]/80 border border-[#D9E4EC] rounded-xl text-sm font-bold text-[#102A43] flex items-center justify-between">
                <span>Monthly</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5E8FB2] mb-1.5">
              Plan Description
            </label>
            <input
              type="text"
              placeholder="e.g. Essential safety oversight and regular home upkeep visits for independent seniors"
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
            />
          </div>
        </div>

        {/* Section 2: Feature Bullet Points */}
        <div className="bg-white p-6 rounded-3xl border border-[#D9E4EC] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-extrabold text-[#294B68] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#5E8FB2]" />
                Service &amp; Marketing Feature Bullet Points
              </h2>
              <p className="text-xs text-[#5E8FB2]">
                These bullet points will appear on the client onboarding signup and agreements
              </p>
            </div>
            <span className="text-xs font-bold text-[#294B68] bg-[#EAF3F8] px-2.5 py-1 rounded-lg">
              {features.length} {features.length === 1 ? "feature" : "features"}
            </span>
          </div>

          {/* Add Feature input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a new feature bullet point..."
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddFeature();
                }
              }}
              className="flex-1 px-4 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
            />
            <button
              type="button"
              onClick={handleAddFeature}
              className="px-4 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          {/* List of features */}
          <div className="space-y-2 pt-2">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-3 bg-[#F0F5F9]/50 hover:bg-[#F0F5F9] border border-[#D9E4EC] rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                  <span className="text-sm font-semibold text-[#243746] truncate">{feat}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(idx)}
                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Remove feature"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Status & Activation */}
        <div className="bg-white p-6 rounded-3xl border border-[#D9E4EC] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-sm font-extrabold text-[#243746] block">
              Activate Plan Immediately
            </span>
            <span className="text-xs text-[#5E8FB2]">
              When active, this plan will be visible to new clients during registration.
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D9E4EC]">
          <Link
            href="/admin/plans"
            className="px-5 py-2.5 border border-[#D9E4EC] text-[#243746] hover:bg-[#F0F5F9] rounded-xl text-sm font-bold transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Publishing Plan...</span>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Publish Service Plan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
