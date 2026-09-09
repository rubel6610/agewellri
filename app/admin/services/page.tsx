"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import {
  useGetAllServicesQuery,
  useGetServiceStatsQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useChangeServiceStatusMutation,
  useDeleteServiceMutation,
} from "@/redux/features/plan/planApi";
import { ServiceItem } from "@/redux/features/plan/planTypes";
import {
  confirmEdit,
  confirmDelete,
  confirmCriticalAction,
  showSuccessAlert,
  showErrorAlert,
  showToast,
} from "@/lib/alerts/sweetalert";
import { TablePagination } from "@/components/ui/table-pagination";

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
};

export default function AdminServicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: services = [],
    isLoading,
    refetch,
    isFetching,
  } = useGetAllServicesQuery({ includeInactive: true });

  const {
    data: stats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useGetServiceStatsQuery();

  const [createService, { isLoading: isCreating }] = useCreateServiceMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();
  const [changeServiceStatus, { isLoading: isStatusChanging }] = useChangeServiceStatusMutation();
  const [deleteService, { isLoading: isDeleting }] = useDeleteServiceMutation();

  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "SAFETY_OVERSIGHT" as ServiceItem["category"],
    description: "",
    durationMinutes: 60,
    defaultPrice: 0,
    isActive: true,
  });

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.code && s.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === "ALL" || s.category === categoryFilter;

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && s.isActive) ||
      (statusFilter === "INACTIVE" && !s.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalItems = filteredServices.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  const activeServicesCount = services.filter((s) => s.isActive).length;

  const handleNameChange = (name: string) => {
    const autoCode = name
      .toUpperCase()
      .trim()
      .replace(/[^A-Z0-9\s_-]/g, "")
      .replace(/[\s-]+/g, "_");

    setFormData((prev) => ({
      ...prev,
      name,
      code: !editingService ? autoCode : prev.code,
    }));
  };

  const handleOpenCreate = () => {
    setFormData({
      name: "",
      code: "",
      category: "SAFETY_OVERSIGHT",
      description: "",
      durationMinutes: 60,
      defaultPrice: 0,
      isActive: true,
    });
    setEditingService(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (service: ServiceItem) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      code: service.code || "",
      category: service.category,
      description: service.description || "",
      durationMinutes: service.durationMinutes || 60,
      defaultPrice: service.defaultPrice || 0,
      isActive: service.isActive,
    });
    setIsCreateModalOpen(true);
  };

  const handleToggleStatus = async (service: ServiceItem) => {
    const nextStatus = !service.isActive;
    const actionLabel = nextStatus ? "Activate" : "Deactivate";

    const confirmed = await confirmCriticalAction({
      title: `${actionLabel} "${service.name}"?`,
      text: nextStatus
        ? `Activating will make this service selectable when constructing new Service Plans and assigning visits.`
        : `Deactivating will prevent this service from being added to new plans. Existing plans and appointments will retain their allocations.`,
      confirmButtonText: `Yes, ${actionLabel}`,
      isDestructive: !nextStatus,
    });

    if (!confirmed) return;

    try {
      await changeServiceStatus({ id: service.id, isActive: nextStatus }).unwrap();
      showToast(`Service "${service.name}" ${nextStatus ? "activated" : "deactivated"}.`, "success");
      refetch();
      refetchStats();
    } catch (err: any) {
      showErrorAlert("Status Update Failed", err?.data?.message || "Failed to update service status.");
    }
  };

  const handleDelete = async (service: ServiceItem) => {
    const confirmed = await confirmDelete({
      title: `Delete "${service.name}"?`,
      text: "If this service is referenced by active subscription plans or visits, it will be safely deactivated instead of deleted.",
      confirmButtonText: "Yes, Delete Service",
    });

    if (!confirmed) return;

    try {
      const res = await deleteService(service.id).unwrap();
      if (res.deactivated) {
        showSuccessAlert("Service Deactivated", res.message);
      } else {
        showSuccessAlert("Service Deleted", res.message);
      }
      refetch();
      refetchStats();
    } catch (err: any) {
      showErrorAlert("Delete Failed", err?.data?.message || "Failed to delete service.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showErrorAlert("Missing Name", "Please provide a valid service name.");
      return;
    }

    const isEdit = Boolean(editingService);
    const confirmed = await confirmEdit({
      title: `${isEdit ? "Update" : "Create"} Service "${formData.name}"?`,
      text: `${isEdit ? "Save changes to this" : "Add this new"} service deliverable in the master catalog?`,
      confirmButtonText: isEdit ? "Yes, Save Changes" : "Yes, Create Service",
    });

    if (!confirmed) return;

    try {
      if (isEdit && editingService) {
        await updateService({
          id: editingService.id,
          body: formData,
        }).unwrap();
        await showSuccessAlert("Service Updated", `"${formData.name}" updates have been saved.`);
      } else {
        await createService(formData).unwrap();
        await showSuccessAlert("Service Created", `"${formData.name}" is now available in the catalog.`);
      }
      setIsCreateModalOpen(false);
      setEditingService(null);
      refetch();
      refetchStats();
    } catch (err: any) {
      showErrorAlert("Operation Failed", err?.data?.message || "Failed to save service.");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D9E4EC] pb-5">
        <div>
          <h1 className="text-2xl font-black text-[#243746] tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-[#294B68]" />
            Services Catalog
          </h1>
          <p className="text-sm text-[#5E8FB2] mt-1 font-medium">
            Master library of individual services, visit durations, and assignable plan components.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              refetch();
              refetchStats();
            }}
            disabled={isFetching || isStatsLoading}
            className="p-2.5 bg-white border border-[#D9E4EC] text-[#243746] hover:bg-[#F0F5F9] rounded-xl text-sm font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            title="Refresh services catalog"
          >
            <RefreshCw className={`w-4 h-4 ${(isFetching || isStatsLoading) ? "animate-spin text-[#294B68]" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-[#294B68] hover:bg-[#1E364B] text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all hover:shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* Metrics Overview - Backend Sourced Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#D9E4EC] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#EAF3F8] text-[#294B68] flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#5E8FB2] uppercase tracking-wider">Total Services</div>
            <div className="text-2xl font-black text-[#243746]">
              {stats?.totalServices !== undefined
                ? `${stats.totalServices} Catalog Items`
                : `${services.length} Catalog Items`}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D9E4EC] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#5E8FB2] uppercase tracking-wider">Active Services</div>
            <div className="text-2xl font-black text-[#243746]">
              {stats?.activeServices !== undefined ? stats.activeServices : activeServicesCount}{" "}
              <span className="text-sm font-semibold text-[#64748B]">
                / {stats?.totalServices !== undefined ? stats.totalServices : services.length} Total
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D9E4EC] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#5E8FB2] uppercase tracking-wider">Service Categories</div>
            <div className="text-2xl font-black text-[#243746]">
              {stats?.totalCategories !== undefined
                ? `${stats.totalCategories} Categories`
                : `${new Set(services.map((s) => s.category)).size} Categories`}
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Category Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-[#D9E4EC] shadow-xs space-y-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCategoryFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              categoryFilter === "ALL"
                ? "bg-[#294B68] text-white shadow-xs"
                : "bg-[#F0F5F9] text-[#243746] hover:bg-[#EAF3F8]"
            }`}
          >
            All Categories ({stats ? stats.totalServices : services.length})
          </button>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
            const count = stats?.categoryBreakdown?.[key]?.total ?? services.filter((s) => s.category === key).length;
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => setCategoryFilter(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  categoryFilter === key
                    ? "bg-[#294B68] text-white shadow-xs"
                    : "bg-[#F0F5F9] text-[#243746] hover:bg-[#EAF3F8]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{config.label}</span>
                <span className="text-[10px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2 border-t border-[#D9E4EC]/60">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#5E8FB2]" />
            <input
              type="text"
              placeholder="Search catalog by service name, code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {["ALL", "ACTIVE", "INACTIVE"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === status
                    ? "bg-[#294B68] text-white"
                    : "bg-[#F0F5F9] text-[#243746] hover:bg-[#EAF3F8]"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-4 sm:p-6 shadow-xs overflow-hidden">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#D9E4EC] text-xs font-bold text-[#64748B] uppercase tracking-wider bg-[#F8FAFC]">
                <th className="py-3.5 px-4 rounded-l-xl">Service Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Baseline Price</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E4EC]/60 text-sm font-medium text-[#243746]">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#E2E8F0] shrink-0"></div>
                        <div className="space-y-1.5 flex-1">
                          <div className="h-4 bg-[#E2E8F0] rounded-md w-36"></div>
                          <div className="h-3 bg-[#F1F5F9] rounded-md w-56"></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 bg-[#E2E8F0] rounded-full w-24"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-[#E2E8F0] rounded-md w-16"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-[#E2E8F0] rounded-md w-20"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 bg-[#E2E8F0] rounded-full w-16"></div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-8 bg-[#E2E8F0] rounded-xl w-24 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#5E8FB2]">
                    <div className="flex flex-col items-center gap-2">
                      <Layers className="w-10 h-10 text-[#D9E4EC]" />
                      <div className="text-base font-bold text-[#243746]">No services found</div>
                      <p className="text-xs max-w-sm text-[#64748B]">
                        No catalog items matched your selected filters. Try changing your search or click &quot;Add Service&quot; to create a new one.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedServices.map((service) => {
                  const config = CATEGORY_CONFIG[service.category] || CATEGORY_CONFIG.SAFETY_OVERSIGHT;
                  const CategoryIcon = config.icon;

                  return (
                    <tr key={service.id} className="hover:bg-[#F8FAFC] transition-colors">
                      {/* Service Details */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${config.bgClass} ${config.colorClass} flex items-center justify-center font-bold shrink-0`}>
                            <CategoryIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-extrabold text-sm text-[#243746] flex items-center gap-2">
                              <span>{service.name}</span>
                              {service.code && (
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#EAF3F8] text-[#294B68] border border-[#D9E4EC]">
                                  {service.code}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#64748B] mt-0.5 line-clamp-1 max-w-md">
                              {service.description || "In-home safety oversight service component."}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md ${config.bgClass} ${config.colorClass}`}>
                          <CategoryIcon className="w-3.5 h-3.5" />
                          {config.label}
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="py-4 px-4 whitespace-nowrap font-semibold text-xs text-[#243746]">
                        <div className="flex items-center gap-1.5 text-[#5E8FB2]">
                          <Clock className="w-4 h-4" />
                          <span>{service.durationMinutes} mins / visit</span>
                        </div>
                      </td>

                      {/* Baseline Price */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs font-bold text-[#243746]">
                        {service.defaultPrice && service.defaultPrice > 0 ? (
                          <span className="text-[#243746]">${service.defaultPrice} / visit</span>
                        ) : (
                          <span className="text-[#64748B] font-semibold">Included in Plan</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(service)}
                          disabled={isStatusChanging}
                          className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md transition-colors cursor-pointer border ${
                            service.isActive
                              ? "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                              : "text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100"
                          }`}
                        >
                          {service.isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 text-amber-600" /> Inactive
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(service)}
                            className="px-2.5 py-1 bg-[#EAF3F8] hover:bg-[#D9E4EC] text-[#294B68] rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Edit Service Definition"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(service)}
                            disabled={isDeleting}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete or Deactivate Service"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && filteredServices.length > 0 && (
          <TablePagination
            currentPage={validCurrentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="services"
          />
        )}
      </div>

      {/* Create / Edit Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-[#D9E4EC] shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E4EC]">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#294B68]" />
                <h2 className="text-lg font-black text-[#243746]">
                  {editingService ? "Edit Catalog Service" : "Create New Catalog Service"}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingService(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#243746] uppercase mb-1">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Safety Oversight Visit"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-bold text-[#243746] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#243746] uppercase mb-1">
                    System Code / Slug
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SAFETY_OVERSIGHT"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-xs font-mono font-bold text-[#294B68]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#243746] uppercase mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e: any) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-bold text-[#243746]"
                  >
                    <option value="SAFETY_OVERSIGHT">Safety Oversight</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#243746] uppercase mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={15}
                    step={15}
                    value={formData.durationMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 60 })
                    }
                    className="w-full px-3 py-2 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#243746] uppercase mb-1">
                    Baseline Cost ($ Optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={formData.defaultPrice || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, defaultPrice: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#243746] uppercase mb-1">
                  Service Deliverables Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe standard protocol tasks, audits, and checklists executed during this service visit..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-medium focus:bg-white text-[#243746]"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-[#F0F5F9] rounded-xl">
                <div>
                  <div className="text-xs font-bold text-[#243746]">Service Active in Catalog</div>
                  <div className="text-[11px] text-[#64748B]">
                    Active services can be bundled into Service Plans and scheduled for visits.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 accent-[#294B68] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D9E4EC]">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingService(null);
                  }}
                  className="px-4 py-2 bg-white border border-[#D9E4EC] text-[#243746] rounded-xl text-xs font-bold hover:bg-[#F0F5F9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-5 py-2 bg-[#294B68] text-white rounded-xl text-xs font-bold hover:bg-[#1E364B] cursor-pointer disabled:opacity-50"
                >
                  {editingService ? "Save Changes" : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
