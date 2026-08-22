"use client";

import React, { useState } from "react";
import {
  useGetAllSpecialistsQuery,
  useCreateSpecialistMutation,
  useUpdateSpecialistMutation,
  useDeleteSpecialistMutation,
} from "@/redux/features/specialist/specialistApi";
import { SpecialistItem } from "@/redux/features/specialist/specialistTypes";
import {
  UserCheck,
  Plus,
  Search,
  Phone,
  Mail,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  LayoutList,
  LayoutGrid,
  CalendarCheck,
} from "lucide-react";
import {
  confirmDelete,
  confirmEdit,
  showSuccessAlert,
  showErrorAlert,
  showToast,
} from "@/lib/alerts/sweetalert";

const PRESET_SPECIALTIES = [
  "Home Safety Audits",
  "Fall Hazard Mitigation",
  "Grab Bar Positioning",
  "HEPA Allergen Cleaning",
  "Pathway Clearance & Sanitization",
  "Lighting & Rug Safety",
  "Bathroom Safety Assessments",
  "Wellness Check-ins",
];

const PRESET_COLORS = [
  { name: "Navy Blue", value: "#294B68" },
  { name: "Slate Teal", value: "#5E8FB2" },
  { name: "Emerald Green", value: "#3F8F6B" },
  { name: "Deep Amber", value: "#D97706" },
  { name: "Plum Purple", value: "#7C3AED" },
];

export default function SpecialistsPage() {
  const { data: specialists = [], isLoading, refetch } = useGetAllSpecialistsQuery();
  const [createSpecialist, { isLoading: isCreating }] = useCreateSpecialistMutation();
  const [updateSpecialist, { isLoading: isUpdating }] = useUpdateSpecialistMutation();
  const [deleteSpecialist, { isLoading: isDeleting }] = useDeleteSpecialistMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpecialist, setEditingSpecialist] = useState<SpecialistItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    title: "Senior Home Safety Specialist",
    email: "",
    phone: "",
    specialties: ["Home Safety Audits", "Fall Hazard Mitigation"] as string[],
    color: "#294B68",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    notes: "",
    displayOrder: 1,
  });

  const [formError, setFormError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingSpecialist(null);
    setFormData({
      name: "",
      title: "Senior Home Safety Specialist",
      email: "",
      phone: "",
      specialties: ["Home Safety Audits", "Fall Hazard Mitigation"],
      color: "#294B68",
      status: "ACTIVE",
      notes: "",
      displayOrder: specialists.length + 1,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (specialist: SpecialistItem) => {
    setEditingSpecialist(specialist);
    setFormData({
      name: specialist.name,
      title: specialist.title,
      email: specialist.email || "",
      phone: specialist.phone || "",
      specialties: specialist.specialties || [],
      color: specialist.color || "#294B68",
      status: specialist.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
      notes: specialist.notes || "",
      displayOrder: specialist.displayOrder || 1,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSpecialtyToggle = (spec: string) => {
    setFormData((prev) => {
      const exists = prev.specialties.includes(spec);
      return {
        ...prev,
        specialties: exists
          ? prev.specialties.filter((s) => s !== spec)
          : [...prev.specialties, spec],
      };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Specialist name is required.");
      return;
    }

    const confirmed = await confirmEdit({
      title: editingSpecialist ? `Update "${formData.name}"?` : `Add "${formData.name}"?`,
      text: editingSpecialist
        ? "Save changes to this specialist's directory profile?"
        : "Add this specialist to your internal team directory?",
      confirmButtonText: editingSpecialist ? "Yes, Update" : "Yes, Add Specialist",
    });

    if (!confirmed) return;

    try {
      setFormError(null);
      if (editingSpecialist) {
        await updateSpecialist({
          id: editingSpecialist.id,
          data: {
            name: formData.name.trim(),
            title: formData.title.trim(),
            email: formData.email.trim() || null,
            phone: formData.phone.trim() || null,
            specialties: formData.specialties,
            color: formData.color,
            status: formData.status,
            notes: formData.notes.trim() || null,
            displayOrder: Number(formData.displayOrder),
          },
        }).unwrap();
        await showSuccessAlert("Specialist Updated", `"${formData.name}" profile has been updated.`);
      } else {
        await createSpecialist({
          name: formData.name.trim(),
          title: formData.title.trim(),
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          specialties: formData.specialties,
          color: formData.color,
          status: formData.status,
          notes: formData.notes.trim() || null,
          displayOrder: Number(formData.displayOrder),
        }).unwrap();
        await showSuccessAlert("Specialist Added", `"${formData.name}" has been added to the specialist roster.`);
      }

      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to save specialist.";
      setFormError(msg);
      showErrorAlert("Save Failed", msg);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirmDelete({
      title: `Remove Specialist "${name}"?`,
      text: "Are you sure you want to remove this specialist? Any historical appointments assigned to them will preserve their record.",
      confirmButtonText: "Yes, Remove Specialist",
    });

    if (!confirmed) return;

    try {
      await deleteSpecialist(id).unwrap();
      await showSuccessAlert("Specialist Removed", `"${name}" has been removed from the active directory.`);
      refetch();
    } catch (err: any) {
      showErrorAlert("Deletion Failed", err?.data?.message || "Failed to delete specialist.");
    }
  };

  const filteredSpecialists = specialists.filter((s) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(term) ||
      s.title.toLowerCase().includes(term) ||
      (s.phone && s.phone.includes(term)) ||
      (s.email && s.email.toLowerCase().includes(term)) ||
      s.specialties.some((spec) => spec.toLowerCase().includes(term));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && s.status === "ACTIVE") ||
      (statusFilter === "inactive" && s.status === "INACTIVE");

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9E4EC]/60">
        <div>
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-7 h-7 text-[#294B68]" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
              Safety Specialists &amp; Technicians
            </h1>
          </div>
          <p className="text-sm text-[#64748B] mt-1">
            Manage your internal in-home safety specialists, qualifications, active assignments, and dispatch availability.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Specialist</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-xs space-y-6">
        {/* Search, Filter & View Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="search"
              placeholder="Search specialists by name, specialty, role, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 text-sm text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] placeholder:text-[#94A3B8]"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 px-3.5 text-xs font-bold text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive</option>
            </select>

            <div className="flex items-center p-1 bg-[#F7FAFC] rounded-xl border border-[#D9E4EC]">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white text-[#294B68] shadow-xs"
                    : "text-[#64748B] hover:text-[#243746]"
                }`}
                title="Table View"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white text-[#294B68] shadow-xs"
                    : "text-[#64748B] hover:text-[#243746]"
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="py-20 text-center text-[#5E8FB2] space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#294B68]" />
            <p className="text-sm font-bold">Loading specialist roster...</p>
          </div>
        ) : filteredSpecialists.length === 0 ? (
          <div className="p-12 text-center bg-[#F7FAFC] rounded-2xl border border-[#D9E4EC] space-y-3">
            <UserCheck className="w-12 h-12 text-[#5E8FB2] mx-auto opacity-50" />
            <h3 className="text-base font-bold text-[#243746]">No specialists found</h3>
            <p className="text-xs text-[#64748B]">Try adjusting your search query or status filter.</p>
          </div>
        ) : viewMode === "table" ? (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#D9E4EC] text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Specialist</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Specialties &amp; Capabilities</th>
                  <th className="py-3.5 px-4">Assignments</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E4EC]/60 text-sm font-medium text-[#243746]">
                {filteredSpecialists.map((specialist) => (
                  <tr key={specialist.id} className="hover:bg-[#F7FAFC] transition-colors">
                    {/* Specialist Name & Avatar */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-xs shrink-0 shadow-xs"
                          style={{ backgroundColor: specialist.color || "#294B68" }}
                        >
                          {specialist.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <span className="font-extrabold text-[#243746] block text-sm">
                            {specialist.name}
                          </span>
                          <span className="text-xs text-[#5E8FB2] font-semibold block">
                            {specialist.title}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact Details */}
                    <td className="py-4 px-4 text-xs space-y-1">
                      {specialist.phone && (
                        <div className="flex items-center gap-1.5 text-[#243746] font-semibold">
                          <Phone className="w-3.5 h-3.5 text-[#5E8FB2]" />
                          <span>{specialist.phone}</span>
                        </div>
                      )}
                      {specialist.email && (
                        <div className="flex items-center gap-1.5 text-[#64748B]">
                          <Mail className="w-3.5 h-3.5 text-[#5E8FB2]" />
                          <span>{specialist.email}</span>
                        </div>
                      )}
                    </td>

                    {/* Specialties Pill Badges */}
                    <td className="py-4 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1.5">
                        {specialist.specialties.slice(0, 3).map((spec, sidx) => (
                          <span
                            key={sidx}
                            className="px-2 py-0.5 bg-[#F0F5F9] text-[#294B68] rounded-md text-[11px] font-bold border border-[#D9E4EC]/70"
                          >
                            {spec}
                          </span>
                        ))}
                        {specialist.specialties.length > 3 && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[11px] font-bold">
                            +{specialist.specialties.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Assigned Visits Count */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAF3F8] text-[#294B68] border border-[#5E8FB2]/20">
                        <CalendarCheck className="w-3.5 h-3.5 text-[#5E8FB2]" />
                        <span>{specialist.activeAssignmentsCount} visits</span>
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                          specialist.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {specialist.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(specialist)}
                          className="p-2 rounded-xl text-[#294B68] hover:bg-[#EAF3F8] transition-colors cursor-pointer"
                          title="Edit Specialist"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(specialist.id, specialist.name)}
                          className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Archive Specialist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSpecialists.map((specialist) => (
              <div
                key={specialist.id}
                className="bg-[#F7FAFC] rounded-2xl border border-[#D9E4EC] p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-[#5E8FB2] transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-xs"
                        style={{ backgroundColor: specialist.color || "#294B68" }}
                      >
                        {specialist.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-[#243746]">
                          {specialist.name}
                        </h3>
                        <p className="text-xs text-[#5E8FB2] font-semibold">{specialist.title}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        specialist.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {specialist.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1 text-xs text-[#64748B]">
                    {specialist.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#5E8FB2]" />
                        <span className="font-medium text-[#243746]">{specialist.phone}</span>
                      </div>
                    )}
                    {specialist.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-[#5E8FB2]" />
                        <span className="font-medium">{specialist.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {specialist.specialties.map((spec, sidx) => (
                      <span
                        key={sidx}
                        className="px-2 py-0.5 bg-white text-[#294B68] rounded-md text-[11px] font-bold border border-[#D9E4EC]/70"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  {specialist.notes && (
                    <p className="text-[11px] text-[#64748B] italic pt-1 line-clamp-2">
                      &ldquo;{specialist.notes}&rdquo;
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#D9E4EC]/60 text-xs">
                  <span className="text-[11px] font-bold text-[#64748B]">
                    {specialist.activeAssignmentsCount} assigned visits
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(specialist)}
                      className="p-2 rounded-xl text-[#294B68] hover:bg-[#EAF3F8] transition-colors cursor-pointer"
                      title="Edit Specialist"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(specialist.id, specialist.name)}
                      className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Archive Specialist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#D9E4EC] max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#D9E4EC] pb-3">
              <h3 className="font-black text-lg text-[#243746] flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#294B68]" />
                <span>{editingSpecialist ? "Edit Specialist" : "Add New Specialist"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1">
                    Full Legal Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mark Johnson"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D9E4EC] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1">
                    Job Title / Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Safety Specialist"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D9E4EC] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1">
                    Mobile Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="(401) 555-0144"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D9E4EC] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="mark.johnson@agewellri.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D9E4EC] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                  />
                </div>
              </div>

              {/* Specialties Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-2">
                  Specialties &amp; Capabilities
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_SPECIALTIES.map((spec) => {
                    const isSelected = formData.specialties.includes(spec);
                    return (
                      <label
                        key={spec}
                        onClick={() => handleSpecialtyToggle(spec)}
                        className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
                          isSelected
                            ? "bg-[#294B68] text-white border-[#294B68]"
                            : "bg-[#F0F5F9] text-[#243746] border-[#D9E4EC] hover:bg-[#EAF3F8]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="hidden"
                        />
                        <span>{spec}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Color Theme Selector */}
              <div>
                <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-2">
                  Calendar Badge Color
                </label>
                <div className="flex items-center gap-3">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c.value })}
                      className={`w-8 h-8 rounded-full transition-transform cursor-pointer border-2 ${
                        formData.color === c.value
                          ? "scale-110 border-[#243746] shadow-md"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1">
                  Internal Administrative Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Primary territory: South County / Washington County..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#D9E4EC] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D9E4EC]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-5 py-2 bg-[#294B68] hover:bg-[#1E374D] text-white text-xs font-black rounded-xl shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isCreating || isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingSpecialist ? "Update Specialist" : "Create Specialist"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
