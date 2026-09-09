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
  CalendarCheck,
  Check,
  RefreshCw,
} from "lucide-react";
import {
  confirmDelete,
  confirmEdit,
  showSuccessAlert,
  showErrorAlert,
  showToast,
} from "@/lib/alerts/sweetalert";
import { TablePagination } from "@/components/ui/table-pagination";

const PRESET_SPECIALTIES = [
  "Senior Home Safety Specialist (SHSS) Certification",
  "Fall-Risk & Hazard Identification",
  "CPR & AED Certification",
  "Emergency Preparedness & Response Protocols",
  "Digital Reporting & Documentation",
  "Scam, Fraud & Financial-Exploitation Awareness",
  "Respectful Client Communication & Dignity-Centered Service",
  "Minor Non-Structural Safety Adjustments"
];

export default function SpecialistsPage() {
  const {
    data: specialists = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetAllSpecialistsQuery(undefined, { refetchOnMountOrArgChange: true });
  const [createSpecialist, { isLoading: isCreating }] = useCreateSpecialistMutation();
  const [updateSpecialist, { isLoading: isUpdating }] = useUpdateSpecialistMutation();
  const [deleteSpecialist, { isLoading: isDeleting }] = useDeleteSpecialistMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpecialist, setEditingSpecialist] = useState<SpecialistItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    specialties: [] as string[],
    color: "#294B68",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    notes: "",
  });

  const [formError, setFormError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingSpecialist(null);
    setFormData({
      name: "",
      title: "",
      email: "",
      phone: "",
      specialties: [],
      color: "#294B68",
      status: "ACTIVE",
      notes: ""
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

  const handleDeleteSpecialist = async (specialist: SpecialistItem) => {
    const confirmed = await confirmDelete({
      title: `Delete "${specialist.name}"?`,
      text: `Are you sure you want to delete ${specialist.name}? This specialist will be permanently removed from the active directory.`,
      confirmButtonText: "Yes, Delete Specialist",
    });

    if (!confirmed) return;

    try {
      await deleteSpecialist(specialist.id).unwrap();
      showToast(`"${specialist.name}" has been deleted.`, "success");
      await showSuccessAlert(
        "Specialist Deleted",
        `"${specialist.name}" has been removed from the directory.`
      );
      if (isModalOpen) {
        setIsModalOpen(false);
      }
      await refetch();
    } catch (err: any) {
      showErrorAlert(
        "Delete Failed",
        err?.data?.message || err?.message || "Failed to delete specialist."
      );
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

  const totalItems = filteredSpecialists.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedSpecialists = filteredSpecialists.slice(startIndex, endIndex);

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

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-3.5 py-2.5 bg-white border border-[#D9E4EC] text-[#243746] hover:bg-[#F0F5F9] rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh specialist roster"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#5E8FB2] ${isFetching ? "animate-spin" : ""}`} />
            <span>{isFetching ? "Refreshing..." : "Refresh"}</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Specialist</span>
          </button>
        </div>
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-11 pl-10 pr-4 text-sm text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] placeholder:text-[#94A3B8]"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 px-3.5 text-xs font-bold text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive</option>
            </select>
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
        ) : (
          /* Table View */
          <>
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
                  {paginatedSpecialists.map((specialist) => (
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
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(specialist)}
                            className="px-2.5 py-1.5 rounded-lg border border-[#D9E4EC] bg-white text-[#294B68] hover:bg-[#EAF3F8] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="Edit Specialist Profile"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleDeleteSpecialist(specialist)}
                            disabled={isDeleting}
                            className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 hover:border-rose-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs disabled:opacity-50"
                            title="Delete Specialist"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <TablePagination
              currentPage={validCurrentPage}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              itemLabel="specialists"
            />
          </>
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

              {/* Specialties Buttons */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider">
                    Specialties &amp; Capabilities
                  </label>
                  <span className="text-[11px] font-semibold text-[#5E8FB2]">
                    {formData.specialties.length} selected
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_SPECIALTIES.map((spec) => {
                    const isSelected = formData.specialties.includes(spec);
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleSpecialtyToggle(spec);
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left cursor-pointer transition-all flex items-center justify-between gap-2 select-none ${
                          isSelected
                            ? "bg-[#294B68] text-white border-[#294B68] shadow-xs"
                            : "bg-[#F0F5F9] text-[#243746] border-[#D9E4EC] hover:bg-[#EAF3F8]"
                        }`}
                      >
                        <span className="leading-snug">{spec}</span>
                        {isSelected ? (
                          <div className="w-4 h-4 rounded-md bg-white/20 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-md border border-[#CBD5E1] bg-white shrink-0" />
                        )}
                      </button>
                    );
                  })}
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

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#D9E4EC]">
                {editingSpecialist ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteSpecialist(editingSpecialist)}
                    disabled={isDeleting}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Delete Specialist</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
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
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
