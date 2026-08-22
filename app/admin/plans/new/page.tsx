"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Layers,
  DollarSign,
  ShieldAlert,
} from "lucide-react";
import {
  useCreatePlanMutation,
  useGetAllServicesQuery,
} from "@/redux/features/plan/planApi";

export default function CreatePlanPage() {
  const router = useRouter();
  const [createPlan, { isLoading }] = useCreatePlanMutation();
  const { data: servicesList = [] } = useGetAllServicesQuery();

  const [form, setForm] = useState({
    name: "",
    code: "",
    shortDescription: "",
    fullDescription: "",
    price: 995,
    currency: "USD",
    billingInterval: "QUARTERLY" as "MONTHLY" | "QUARTERLY" | "ANNUAL" | "ONE_TIME",
    displayOrder: 1,
    supportsAutomaticBilling: true,
    supportsInvoiceBilling: true,
    autoRenewDefault: true,
    isActive: true,
  });

  const [features, setFeatures] = useState<string[]>([
    "Comprehensive Home Safety Oversight",
    "Digital Wellness & Safety Reports",
    "Dedicated Rhode Island Care Team",
  ]);
  const [newFeature, setNewFeature] = useState("");

  const [serviceAllocations, setServiceAllocations] = useState<
    { serviceTypeId: string; allocatedVisits: number; unit: string }[]
  >([]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleAddServiceAllocation = () => {
    if (servicesList.length > 0) {
      setServiceAllocations([
        ...serviceAllocations,
        { serviceTypeId: servicesList[0].id, allocatedVisits: 6, unit: "visits" },
      ]);
    }
  };

  const handleUpdateServiceAllocation = (
    index: number,
    field: "serviceTypeId" | "allocatedVisits" | "unit",
    value: any
  ) => {
    const updated = [...serviceAllocations];
    updated[index] = { ...updated[index], [field]: value };
    setServiceAllocations(updated);
  };

  const handleRemoveServiceAllocation = (index: number) => {
    setServiceAllocations(serviceAllocations.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!form.name || !form.code || form.price <= 0) {
      setErrorMsg("Please fill in the required plan name, unique code, and valid price.");
      return;
    }

    try {
      await createPlan({
        ...form,
        features,
        services: serviceAllocations,
      }).unwrap();

      router.push("/admin/plans");
    } catch (err: any) {
      setErrorMsg(err.data?.message || err.message || "Failed to create plan.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#5E8FB2] font-semibold">
        <Link href="/admin/plans" className="hover:text-[#294B68] flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Plans
        </Link>
      </div>

      <div className="border-b border-[#D9E4EC] pb-4">
        <h1 className="text-2xl font-black text-[#243746] tracking-tight flex items-center gap-2.5">
          <Package className="w-7 h-7 text-[#294B68]" />
          Create New Service Plan
        </h1>
        <p className="text-sm text-[#5E8FB2] mt-1 font-medium">
          Define dynamic commercial terms, interval pricing, included visit quotas, and customer features.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-2xl border border-[#D9E4EC] shadow-xs space-y-4">
          <h2 className="text-base font-extrabold text-[#243746] flex items-center gap-2 border-b border-[#D9E4EC]/60 pb-3">
            <Package className="w-5 h-5 text-[#294B68]" />
            Plan Identification & Catalog Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                Plan Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Guardian Plus"
                value={form.name}
                onChange={(e) => {
                  setForm({
                    ...form,
                    name: e.target.value,
                    code: form.code || e.target.value.toUpperCase().replace(/\s+/g, "_"),
                  });
                }}
                className="w-full px-3.5 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                System Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. GUARDIAN_PLUS"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "") })}
                className="w-full px-3.5 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
              Short Description (Client Card Subtitle)
            </label>
            <input
              type="text"
              placeholder="e.g. Complete dual-protection safety oversight and specialized home cleaning."
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
              Full Description / Agreement Terms
            </label>
            <textarea
              rows={2}
              placeholder="Detailed terms displayed in the legal service agreement and client portal."
              value={form.fullDescription}
              onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
            />
          </div>
        </div>

        {/* Pricing & Interval */}
        <div className="bg-white p-6 rounded-2xl border border-[#D9E4EC] shadow-xs space-y-4">
          <h2 className="text-base font-extrabold text-[#243746] flex items-center gap-2 border-b border-[#D9E4EC]/60 pb-3">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Pricing & Billing Intervals
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                Contracted Price (USD) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-[#5E8FB2] font-bold">$</span>
                <input
                  type="number"
                  required
                  min={1}
                  step="any"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-4 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-base font-black text-[#243746] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                Billing Frequency
              </label>
              <select
                value={form.billingInterval}
                onChange={(e: any) => setForm({ ...form, billingInterval: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-bold text-[#243746] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
              >
                <option value="QUARTERLY">Quarterly (Every 3 Months)</option>
                <option value="MONTHLY">Monthly (Every Month)</option>
                <option value="ANNUAL">Annual (Every Year)</option>
                <option value="ONE_TIME">One-Time Charge</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-[#D9E4EC] bg-[#F0F5F9]/40 cursor-pointer">
              <input
                type="checkbox"
                checked={form.supportsAutomaticBilling}
                onChange={(e) => setForm({ ...form, supportsAutomaticBilling: e.target.checked })}
                className="w-4 h-4 text-[#294B68] rounded"
              />
              <span className="text-xs font-bold text-[#243746]">Support Automatic Card Billing</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-[#D9E4EC] bg-[#F0F5F9]/40 cursor-pointer">
              <input
                type="checkbox"
                checked={form.supportsInvoiceBilling}
                onChange={(e) => setForm({ ...form, supportsInvoiceBilling: e.target.checked })}
                className="w-4 h-4 text-[#294B68] rounded"
              />
              <span className="text-xs font-bold text-[#243746]">Support Manual Invoice Billing</span>
            </label>
          </div>
        </div>

        {/* Included Services & Visit Allocations */}
        <div className="bg-white p-6 rounded-2xl border border-[#D9E4EC] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#D9E4EC]/60 pb-3">
            <h2 className="text-base font-extrabold text-[#243746] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#294B68]" />
              Included Services & Visit Quotas
            </h2>
            <button
              type="button"
              onClick={handleAddServiceAllocation}
              className="px-3 py-1.5 bg-[#EAF3F8] hover:bg-[#D9E4EC] text-[#294B68] rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Service
            </button>
          </div>

          {serviceAllocations.length === 0 ? (
            <div className="p-4 bg-[#F0F5F9] rounded-xl text-center text-xs text-[#5E8FB2] font-semibold">
              No services attached yet. Click &quot;Add Service&quot; to configure visit quotas per billing cycle.
            </div>
          ) : (
            <div className="space-y-3">
              {serviceAllocations.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-[#F0F5F9]/50 rounded-xl border border-[#D9E4EC]">
                  <div className="flex-1">
                    <select
                      value={item.serviceTypeId}
                      onChange={(e) => handleUpdateServiceAllocation(index, "serviceTypeId", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#D9E4EC] rounded-lg text-sm font-bold text-[#243746]"
                    >
                      {servicesList.map((srv) => (
                        <option key={srv.id} value={srv.id}>
                          {srv.name} ({srv.category.replace("_", " ")})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      min={1}
                      placeholder="Visits"
                      value={item.allocatedVisits}
                      onChange={(e) => handleUpdateServiceAllocation(index, "allocatedVisits", parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-[#D9E4EC] rounded-lg text-sm font-bold text-center"
                    />
                  </div>
                  <div className="text-xs font-bold text-[#5E8FB2]">visits / cycle</div>
                  <button
                    type="button"
                    onClick={() => handleRemoveServiceAllocation(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feature List */}
        <div className="bg-white p-6 rounded-2xl border border-[#D9E4EC] shadow-xs space-y-4">
          <h2 className="text-base font-extrabold text-[#243746] flex items-center gap-2 border-b border-[#D9E4EC]/60 pb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Marketing Bullet Points & Features
          </h2>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. HEPA Allergen Deep Vacuuming & Sanitization"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddFeature();
                }
              }}
              className="flex-1 px-3.5 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
            />
            <button
              type="button"
              onClick={handleAddFeature}
              className="px-4 py-2.5 bg-[#294B68] text-white rounded-xl text-sm font-bold hover:bg-[#1E364B] transition-colors cursor-pointer"
            >
              Add Bullet
            </button>
          </div>

          <div className="space-y-2">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-[#F0F5F9] rounded-xl text-sm font-semibold text-[#243746]">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {feature}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(i)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/admin/plans"
            className="px-5 py-2.5 bg-white border border-[#D9E4EC] text-[#243746] rounded-xl text-sm font-bold hover:bg-[#F0F5F9] transition-colors cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-[#294B68] hover:bg-[#1E364B] text-white rounded-xl text-sm font-bold shadow-sm transition-all hover:shadow-md cursor-pointer disabled:opacity-50"
          >
            {isLoading ? "Creating Plan..." : "Publish Service Plan"}
          </button>
        </div>
      </form>
    </div>
  );
}
