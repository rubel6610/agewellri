"use client";

import React, { useState } from "react";
import {
  Layers,
  Plus,
  Edit,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  useGetAllServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
} from "@/redux/features/plan/planApi";
import {
  confirmEdit,
  showSuccessAlert,
  showErrorAlert,
  showToast,
} from "@/lib/alerts/sweetalert";

export default function AdminServicesPage() {
  const { data: services = [], isLoading, refetch, isFetching } = useGetAllServicesQuery();
  const [createService, { isLoading: isCreating }] = useCreateServiceMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [editingService, setEditingService] = useState<any | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "SAFETY_OVERSIGHT" as any,
    description: "",
    durationMinutes: 60,
    defaultPrice: 0,
    isActive: true,
  });

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (service: any) => {
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
  };

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const confirmed = await confirmEdit({
      title: `Create Service "${formData.name}"?`,
      text: "Add this service component to the catalog?",
      confirmButtonText: "Yes, Create",
    });
    if (!confirmed) return;

    try {
      await createService(formData).unwrap();
      setIsCreateModalOpen(false);
      await showSuccessAlert("Service Created", `"${formData.name}" is now available in the catalog.`);
      refetch();
    } catch (err: any) {
      showErrorAlert("Creation Failed", err?.data?.message || "Failed to create service.");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    const confirmed = await confirmEdit({
      title: `Update Service "${formData.name}"?`,
      text: "Save updates to this service definition?",
      confirmButtonText: "Yes, Save",
    });
    if (!confirmed) return;

    try {
      await updateService({
        id: editingService.id,
        body: formData,
      }).unwrap();
      setEditingService(null);
      await showSuccessAlert("Service Updated", `"${formData.name}" updates have been saved.`);
      refetch();
    } catch (err: any) {
      showErrorAlert("Update Failed", err?.data?.message || "Failed to update service.");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D9E4EC] pb-5">
        <div>
          <h1 className="text-2xl font-black text-[#243746] tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-[#294B68]" />
            Services Catalog
          </h1>
          <p className="text-sm text-[#5E8FB2] mt-1 font-medium">
            Manage individual visit services, durations, and assignable plan components.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 bg-white border border-[#D9E4EC] text-[#243746] hover:bg-[#F0F5F9] rounded-xl text-sm font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            title="Refresh services catalog"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-[#294B68]" : ""}`} />
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

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#D9E4EC] shadow-xs flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#5E8FB2]" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
          />
        </div>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-[#5E8FB2] flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#294B68]" />
          Loading services catalog...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white p-5 rounded-2xl border border-[#D9E4EC] shadow-xs flex flex-col justify-between hover:border-[#5E8FB2] transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF3F8] text-[#294B68] flex items-center justify-center font-bold">
                    {service.category === "CLEANING" ? (
                      <Sparkles className="w-5 h-5" />
                    ) : (
                      <ShieldCheck className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                    {service.category.replace("_", " ")}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-[#243746] text-base">{service.name}</h3>
                  <p className="text-xs text-[#5E8FB2] mt-1 leading-relaxed line-clamp-2">
                    {service.description || "Comprehensive in-home care delivery service."}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold text-[#243746] pt-2 border-t border-[#D9E4EC]/60">
                  <div className="flex items-center gap-1 text-[#5E8FB2]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{service.durationMinutes} mins</span>
                  </div>
                  {service.defaultPrice && service.defaultPrice > 0 ? (
                    <div>${service.defaultPrice} baseline</div>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#D9E4EC] flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
                <button
                  onClick={() => handleOpenEdit(service)}
                  className="px-3 py-1 bg-[#EAF3F8] hover:bg-[#D9E4EC] text-[#294B68] rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {(isCreateModalOpen || editingService) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-[#D9E4EC] shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-lg font-black text-[#243746]">
              {editingService ? "Edit Service" : "Create New Service"}
            </h2>

            <form
              onSubmit={editingService ? handleSaveEdit : handleSaveCreate}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-[#243746] uppercase mb-1">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#243746] uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e: any) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-bold text-[#243746]"
                  >
                    <option value="SAFETY_OVERSIGHT">Safety Oversight</option>
                    <option value="CLEANING">Cleaning</option>
                    <option value="ASSESSMENT">Assessment</option>
                    <option value="WELLNESS">Wellness</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#243746] uppercase mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={15}
                    step={15}
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 60 })}
                    className="w-full px-3 py-2 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#243746] uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#F0F5F9]/50 border border-[#D9E4EC] rounded-xl text-sm font-medium focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
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
                  {editingService ? "Save Service" : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
