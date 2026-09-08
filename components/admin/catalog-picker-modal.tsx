"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  Search,
  Check,
  Plus,
  X,
  Clock,
  Sparkles,
  ShieldCheck,
  ClipboardCheck,
  HeartPulse,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { ServiceItem } from "@/redux/features/plan/planTypes";
import { useGetAllServicesQuery } from "@/redux/features/plan/planApi";

interface CatalogPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableServices?: ServiceItem[];
  currentAllocations: { serviceTypeId: string; allocatedVisits: number; unit?: string }[];
  onAddOrUpdateService: (serviceTypeId: string, allocatedVisits: number) => void;
}

const CATEGORY_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; colorClass: string; bgClass: string }
> = {
  SAFETY_OVERSIGHT: {
    label: "Safety Oversight",
    icon: ShieldCheck,
    colorClass: "text-[#294B68]",
    bgClass: "bg-[#EAF3F8]",
  },
  CLEANING: {
    label: "Cleaning",
    icon: Sparkles,
    colorClass: "text-amber-700",
    bgClass: "bg-amber-50",
  },
  ASSESSMENT: {
    label: "Assessment",
    icon: ClipboardCheck,
    colorClass: "text-purple-700",
    bgClass: "bg-purple-50",
  },
  WELLNESS: {
    label: "Wellness",
    icon: HeartPulse,
    colorClass: "text-emerald-700",
    bgClass: "bg-emerald-50",
  },
  OTHER: {
    label: "Other Support",
    icon: Layers,
    colorClass: "text-slate-700",
    bgClass: "bg-slate-100",
  },
};

export function CatalogPickerModal({
  isOpen,
  onClose,
  availableServices: propServices,
  currentAllocations,
  onAddOrUpdateService,
}: CatalogPickerModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [quotaInputs, setQuotaInputs] = useState<Record<string, number>>({});

  const {
    data: fetchedServices = [],
    isLoading: isFetchingServices,
    isFetching,
    refetch,
  } = useGetAllServicesQuery({ includeInactive: true }, { skip: !isOpen });

  if (!isOpen) return null;

  const availableServices =
    propServices && propServices.length > 0 ? propServices : fetchedServices;

  const allocatedMap = new Map(currentAllocations.map((a) => [a.serviceTypeId, a.allocatedVisits]));

  const filteredServices = availableServices.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.code && service.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === "ALL" || service.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleQuotaChange = (serviceId: string, visits: number) => {
    setQuotaInputs((prev) => ({
      ...prev,
      [serviceId]: Math.max(1, visits),
    }));
  };

  const handleSelectService = (service: ServiceItem) => {
    const defaultVisits = quotaInputs[service.id] ?? allocatedMap.get(service.id) ?? 6;
    onAddOrUpdateService(service.id, defaultVisits);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl border border-[#D9E4EC] shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#D9E4EC] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#294B68] text-white flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#243746]">Service Catalog Selector</h2>
              <p className="text-xs text-[#5E8FB2] mt-0.5">
                Select individual services from the master catalog to attach to this plan.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh services from database"
              className="p-2 text-[#5E8FB2] hover:text-[#294B68] hover:bg-[#F0F5F9] rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-[#294B68]" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#64748B] hover:text-[#243746] hover:bg-[#F0F5F9] rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 bg-[#F7FAFC] border-b border-[#D9E4EC] space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#5E8FB2]" />
              <input
                type="text"
                placeholder="Search catalog services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#D9E4EC] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
              />
            </div>

            <Link
              href="/admin/services"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#294B68] hover:text-[#1E364B] bg-white px-3 py-2 rounded-xl border border-[#D9E4EC] hover:bg-[#F0F5F9] transition-colors shadow-2xs shrink-0"
            >
              <span>Manage / Create Catalog Items</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setCategoryFilter("ALL")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === "ALL"
                  ? "bg-[#294B68] text-white shadow-xs"
                  : "bg-white text-[#243746] border border-[#D9E4EC] hover:bg-[#EAF3F8]"
              }`}
            >
              All Categories ({availableServices.length})
            </button>
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
              const count = availableServices.filter((s) => s.category === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setCategoryFilter(key)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    categoryFilter === key
                      ? "bg-[#294B68] text-white shadow-xs"
                      : "bg-white text-[#243746] border border-[#D9E4EC] hover:bg-[#EAF3F8]"
                  }`}
                >
                  {config.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Catalog Items List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {filteredServices.length === 0 ? (
            <div className="py-12 text-center text-[#64748B] flex flex-col items-center gap-2">
              <Layers className="w-8 h-8 text-[#D9E4EC]" />
              <p className="font-bold text-sm text-[#243746]">No matching services found</p>
              <p className="text-xs">Try searching for a different keyword or create a new service in the catalog.</p>
            </div>
          ) : (
            filteredServices.map((service) => {
              const isAllocated = allocatedMap.has(service.id);
              const currentQuota = allocatedMap.get(service.id);
              const inputQuota = quotaInputs[service.id] ?? currentQuota ?? 6;
              const config = CATEGORY_CONFIG[service.category] || CATEGORY_CONFIG.OTHER;
              const CategoryIcon = config.icon;

              return (
                <div
                  key={service.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isAllocated
                      ? "bg-[#EAF3F8]/40 border-[#5E8FB2] shadow-xs"
                      : "bg-white border-[#D9E4EC] hover:border-[#5E8FB2]/60"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl ${config.bgClass} ${config.colorClass} flex items-center justify-center font-bold shrink-0 mt-0.5`}
                    >
                      <CategoryIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-[#243746] text-sm">
                          {service.name}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {config.label}
                        </span>
                        {service.code && (
                          <span className="text-[10px] font-mono font-bold text-[#5E8FB2]">
                            {service.code}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#64748B] mt-1 line-clamp-1">
                        {service.description || "Comprehensive in-home care delivery service."}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] font-bold text-[#5E8FB2] mt-1.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {service.durationMinutes} mins
                        </span>
                        {service.defaultPrice ? (
                          <span>${service.defaultPrice} baseline</span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Quota input */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-[#D9E4EC]">
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={inputQuota}
                        onChange={(e) => handleQuotaChange(service.id, parseInt(e.target.value) || 1)}
                        className="w-12 text-center text-sm font-black text-[#243746] focus:outline-none"
                      />
                      <span className="text-[11px] font-bold text-[#64748B]">visits</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectService(service)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                        isAllocated
                          ? "bg-[#3F8F6B] hover:bg-[#347657] text-white"
                          : "bg-[#294B68] hover:bg-[#1E364B] text-white"
                      }`}
                    >
                      {isAllocated ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Updated ({currentQuota})</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Plan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F7FAFC] border-t border-[#D9E4EC] flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-[#243746]">
            Currently Included: <strong>{currentAllocations.length} Services</strong> (
            {currentAllocations.reduce((sum, s) => sum + (Number(s.allocatedVisits) || 0), 0)} Total Visits / Cycle)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#294B68] hover:bg-[#1E364B] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Done Selecting
          </button>
        </div>
      </div>
    </div>
  );
}
