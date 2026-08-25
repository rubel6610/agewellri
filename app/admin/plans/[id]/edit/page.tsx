"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  ShieldCheck,
  History,
  Users,
  RefreshCw,
} from "lucide-react";
import {
  useGetAdminPlanByIdQuery,
  useUpdatePlanMutation,
  useGetAllServicesQuery,
} from "@/redux/features/plan/planApi";
import {
  confirmEdit,
  confirmDelete,
  showSuccessAlert,
  showErrorAlert,
  showToast,
} from "@/lib/alerts/sweetalert";
import { ServiceItem } from "@/redux/features/plan/planTypes";

const DEFAULT_STANDARD_SERVICES: ServiceItem[] = [
  {
    id: "srv_safety",
    name: "Safety Oversight & Hazard Mitigation",
    category: "SAFETY_OVERSIGHT",
    description: "Home safety oversight visits and hazard audits",
    durationMinutes: 60,
    displayOrder: 1,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "srv_cleaning",
    name: "Specialized Environmental Cleaning",
    category: "CLEANING",
    description: "HEPA allergen vacuuming and sanitation",
    durationMinutes: 90,
    displayOrder: 2,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "srv_maintenance",
    name: "Preventative Home Maintenance",
    category: "MAINTENANCE",
    description: "Handyman and stability inspections",
    durationMinutes: 60,
    displayOrder: 3,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
];

export default function EditPlanPage() {
  const params = useParams();
  const planId = params?.id as string;
  const router = useRouter();

  const { data: plan, isLoading: isPlanLoading, refetch } = useGetAdminPlanByIdQuery(planId, {
    skip: !planId,
  });
  const { data: servicesList = [] } = useGetAllServicesQuery();
  const availableServices =
    servicesList && servicesList.length > 0
      ? servicesList
      : DEFAULT_STANDARD_SERVICES;

  const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation();

  const [form, setForm] = useState({
    name: "",
    shortDescription: "",
    fullDescription: "",
    price: 995,
    currency: "USD",
    billingInterval: "QUARTERLY" as "MONTHLY" | "QUARTERLY" | "ANNUAL" | "ONE_TIME",
    displayOrder: 1,
    supportsAutomaticBilling: true,
    supportsInvoiceBilling: false,
    autoRenewDefault: true,
    isActive: true,
  });

  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [serviceAllocations, setServiceAllocations] = useState<
    { serviceTypeId: string; allocatedVisits: number; unit: string }[]
  >([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (plan) {
      const latestVer = plan.versions?.[0];
      setForm({
        name: latestVer?.name || plan.name,
        shortDescription: plan.shortDescription || latestVer?.description || "",
        fullDescription: plan.fullDescription || "",
        price: latestVer?.price ?? plan.price,
        currency: latestVer?.currency || "USD",
        billingInterval: (latestVer?.billingInterval || plan.billingInterval || "QUARTERLY") as any,
        displayOrder: plan.displayOrder ?? 1,
        supportsAutomaticBilling: true,
        supportsInvoiceBilling: false,
        autoRenewDefault: plan.autoRenewDefault ?? true,
        isActive: plan.isActive ?? true,
      });

      const planFeats = (plan as any).features || latestVer?.features || [];
      setFeatures(planFeats);

      const rawServices =
        latestVer?.planServices && latestVer.planServices.length > 0
          ? latestVer.planServices
          : (plan as any).planServices || (plan as any).services || [];

      const services = rawServices.map((ps: any) => ({
        serviceTypeId: ps.serviceTypeId,
        allocatedVisits: ps.allocatedVisits || 6,
        unit: ps.unit || "visits",
      }));
      setServiceAllocations(services);
    }
  }, [plan]);

  const activeSubscribersCount = plan?.subscriptions?.length || 0;
  const latestVersion = plan?.versions?.[0];
  const isPriceChanged = latestVersion && form.price !== latestVersion.price;

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
      showToast("Bullet point added");
    }
  };

  const handleRemoveFeature = async (index: number) => {
    const confirmed = await confirmDelete({
      title: "Remove Bullet Point?",
      text: `Remove "${features[index]}" from marketing features?`,
      confirmButtonText: "Remove",
    });
    if (confirmed) {
      setFeatures(features.filter((_, i) => i !== index));
      showToast("Feature removed", "info");
    }
  };

  const handleAddServiceAllocation = () => {
    const defaultServiceId = availableServices[0]?.id || "srv_safety";
    setServiceAllocations((prev) => [
      ...prev,
      { serviceTypeId: defaultServiceId, allocatedVisits: 6, unit: "visits" },
    ]);
    showToast("Service allocation added");
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

  const handleRemoveServiceAllocation = async (index: number) => {
    const confirmed = await confirmDelete({
      title: "Remove Service Allocation?",
      text: "Remove this visit quota from the plan version?",
      confirmButtonText: "Remove Allocation",
    });
    if (confirmed) {
      setServiceAllocations(serviceAllocations.filter((_, i) => i !== index));
      showToast("Service quota removed", "info");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const confirmed = await confirmEdit({
      title: "Save Plan Changes?",
      text: isPriceChanged
        ? `Updating the price to $${form.price} will automatically create a new version (v${(latestVersion?.versionNumber || 1) + 1}.0) for new subscribers while protecting existing contracted terms.`
        : "Are you sure you want to save these plan updates?",
      confirmButtonText: "Yes, Save Plan",
    });

    if (!confirmed) return;

    try {
      await updatePlan({
        id: planId,
        body: {
          ...form,
          features,
          services: serviceAllocations,
        },
      }).unwrap();

      await showSuccessAlert(
        "Plan Updated Successfully",
        `Changes to "${form.name}" have been applied.`
      );
      refetch();
      router.push("/admin/plans");
    } catch (err: any) {
      const msg = err.data?.message || err.message || "Failed to update plan.";
      setErrorMsg(msg);
      showErrorAlert("Save Failed", msg);
    }
  };

  if (isPlanLoading) {
    return (
      <div className="py-24 text-center text-[#5E8FB2] flex flex-col items-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[#294B68]" />
        <span className="font-bold text-base">Loading plan details & versions...</span>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-[#D9E4EC]">
        <div className="text-lg font-bold text-[#243746]">Plan not found</div>
        <Link href="/admin/plans" className="text-sm text-[#294B68] underline font-bold mt-2 inline-block">
          Return to Plans
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#5E8FB2] font-semibold">
        <Link href="/admin/plans" className="hover:text-[#294B68] flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Plans
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D9E4EC] pb-4">
        <div>
          <h1 className="text-2xl font-black text-[#243746] tracking-tight flex items-center gap-2.5">
            <Package className="w-7 h-7 text-[#294B68]" />
            Edit Service Plan: {plan.name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono font-bold bg-[#EAF3F8] text-[#294B68] px-2 py-0.5 rounded-md">
              {plan.code}
            </span>
            <span className="text-xs font-extrabold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
              Current Version: v{latestVersion?.versionNumber || 1}.0
            </span>
          </div>
        </div>
      </div>

      {/* Historical Pricing Notice */}
      {activeSubscribersCount > 0 && isPriceChanged && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 text-sm space-y-1">
          <div className="font-extrabold flex items-center gap-1.5 text-[#294B68]">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Automatic Versioning & Historical Price Protection Active
          </div>
          <p className="text-xs text-blue-800 leading-relaxed font-medium">
            This plan currently has <strong>{activeSubscribersCount} active subscribers</strong>. Changing the price or visit quotas will automatically create <strong>Version {(latestVersion?.versionNumber || 1) + 1}.0</strong> for all incoming clients, while protecting existing subscribers at their contracted ${latestVersion?.price} rate.
          </p>
        </div>
      )}

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
            Plan Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                Plan Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                System Code (Immutable)
              </label>
              <input
                type="text"
                disabled
                value={plan.code}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-[#D9E4EC] rounded-xl text-sm font-mono font-bold text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
              Short Description (Client Card Subtitle)
            </label>
            <input
              type="text"
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
            Pricing & Intervals
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                Active Price (USD) <span className="text-red-500">*</span>
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

          <div className="space-y-3">
            {serviceAllocations.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-[#F0F5F9]/50 rounded-xl border border-[#D9E4EC]">
                <div className="flex-1">
                  <select
                    value={item.serviceTypeId}
                    onChange={(e) => handleUpdateServiceAllocation(index, "serviceTypeId", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D9E4EC] rounded-lg text-sm font-bold text-[#243746]"
                  >
                    {availableServices.map((srv) => (
                      <option key={srv.id} value={srv.id}>
                        {srv.name} ({srv.category ? srv.category.replace(/_/g, " ") : "Service"})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    min={1}
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
        </div>

        {/* Feature List */}
        <div className="bg-white p-6 rounded-2xl border border-[#D9E4EC] shadow-xs space-y-4">
          <h2 className="text-base font-extrabold text-[#243746] flex items-center gap-2 border-b border-[#D9E4EC]/60 pb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Marketing Features & Bullet Points
          </h2>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add bullet point..."
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

        {/* Version History Table */}
        <div className="bg-white p-6 rounded-2xl border border-[#D9E4EC] shadow-xs space-y-4">
          <h2 className="text-base font-extrabold text-[#243746] flex items-center gap-2 border-b border-[#D9E4EC]/60 pb-3">
            <History className="w-5 h-5 text-[#294B68]" />
            Commercial Version History ({plan.versions?.length || 1} versions)
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F0F5F9] text-[#294B68] font-bold">
                  <th className="p-2.5">Version</th>
                  <th className="p-2.5">Price</th>
                  <th className="p-2.5">Interval</th>
                  <th className="p-2.5">Effective From</th>
                  <th className="p-2.5">Effective To</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E4EC]">
                {(plan.versions || []).map((ver) => (
                  <tr key={ver.id} className="hover:bg-[#F0F5F9]/50">
                    <td className="p-2.5 font-mono font-bold">v{ver.versionNumber}.0</td>
                    <td className="p-2.5 font-black text-[#243746]">${ver.price}</td>
                    <td className="p-2.5 capitalize">{ver.billingInterval.toLowerCase()}</td>
                    <td className="p-2.5">{new Date(ver.effectiveFrom).toLocaleDateString()}</td>
                    <td className="p-2.5">{ver.effectiveTo ? new Date(ver.effectiveTo).toLocaleDateString() : "Current"}</td>
                    <td className="p-2.5 font-bold text-emerald-700">{ver.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            disabled={isUpdating}
            className="px-6 py-2.5 bg-[#294B68] hover:bg-[#1E364B] text-white rounded-xl text-sm font-bold shadow-sm transition-all hover:shadow-md cursor-pointer disabled:opacity-50"
          >
            {isUpdating ? "Saving Changes..." : "Save Plan Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
