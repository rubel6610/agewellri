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
  ShieldCheck,
  HeartPulse,
  Zap,
  Languages,
  Award,
  Calendar,
  Sparkles,
  Eye,
} from "lucide-react";
import {
  confirmDelete,
  confirmEdit,
  showSuccessAlert,
  showErrorAlert,
  showToast,
} from "@/lib/alerts/sweetalert";
import { TablePagination } from "@/components/ui/table-pagination";

// Standard Core Competencies automatically held by all specialists (no check off needed)
const CORE_AUTOMATIC_COMPETENCIES = [
  {
    title: "Fall-Risk & Hazard Identification",
    desc: "Comprehensive environmental auditing, walkway clearance, lighting safety, and slip/trip hazard mitigation.",
  },
  {
    title: "Scam & Financial-Exploitation Awareness",
    desc: "Elder fraud prevention, contractor scam vigilance, and vulnerable resident financial protection.",
  },
  {
    title: "Emergency Response Preparedness",
    desc: "Emergency ingress protocols, 911 dispatch coordination, first responder assistance, and family escalation.",
  },
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
  const [viewingSpecialist, setViewingSpecialist] = useState<SpecialistItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    shssCertified: false,
    shssRenewalDate: "",
    cprCertified: false,
    aedCertified: false,
    backgroundChecked: true,
    bilingualSpanish: false,
    color: "#294B68",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    notes: "",
  });

  const [formError, setFormError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingSpecialist(null);
    setFormData({
      name: "",
      title: "Home Safety Specialist",
      email: "",
      phone: "",
      shssCertified: false,
      shssRenewalDate: "",
      cprCertified: false,
      aedCertified: false,
      backgroundChecked: true,
      bilingualSpanish: false,
      color: "#294B68",
      status: "ACTIVE",
      notes: "",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (specialist: SpecialistItem) => {
    setEditingSpecialist(specialist);

    // Fallback checks from legacy specialties string arrays if boolean flags not yet stored
    const legacySpecs = (specialist.specialties || []).map((s) => s.toLowerCase());
    const hasShss =
      specialist.shssCertified ??
      legacySpecs.some((s) => s.includes("shss") || s.includes("senior home safety"));
    const hasCpr =
      specialist.cprCertified ?? legacySpecs.some((s) => s.includes("cpr"));
    const hasAed =
      specialist.aedCertified ?? legacySpecs.some((s) => s.includes("aed"));
    const hasBg =
      specialist.backgroundChecked ??
      (legacySpecs.some((s) => s.includes("background")) || true);
    const hasBilingual =
      specialist.bilingualSpanish ??
      legacySpecs.some((s) => s.includes("bilingual") || s.includes("spanish"));

    let renewalDateStr = "";
    if (specialist.shssRenewalDate) {
      try {
        renewalDateStr = new Date(specialist.shssRenewalDate)
          .toISOString()
          .split("T")[0];
      } catch {
        renewalDateStr = String(specialist.shssRenewalDate);
      }
    }

    setFormData({
      name: specialist.name,
      title: specialist.title || "Home Safety Specialist",
      email: specialist.email || "",
      phone: specialist.phone || "",
      shssCertified: Boolean(hasShss),
      shssRenewalDate: renewalDateStr,
      cprCertified: Boolean(hasCpr),
      aedCertified: Boolean(hasAed),
      backgroundChecked: Boolean(hasBg),
      bilingualSpanish: Boolean(hasBilingual),
      color: specialist.color || "#294B68",
      status: specialist.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
      notes: specialist.notes || "",
    });
    setFormError(null);
    setIsModalOpen(true);
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
        ? "Save changes to this specialist's qualifications & directory profile?"
        : "Add this specialist to your active team directory?",
      confirmButtonText: editingSpecialist ? "Yes, Update" : "Yes, Add Specialist",
    });

    if (!confirmed) return;

    try {
      setFormError(null);

      // Build unified array of capabilities including core + selected
      const capabilitiesList: string[] = [
        "Fall-Risk & Hazard Identification",
        "Scam & Financial-Exploitation Awareness",
        "Emergency Response Preparedness",
      ];
      if (formData.shssCertified) {
        capabilitiesList.push("Senior Home Safety Specialist (SHSS)");
      }
      if (formData.cprCertified) capabilitiesList.push("CPR Certified");
      if (formData.aedCertified) capabilitiesList.push("AED Certified");
      if (formData.backgroundChecked) capabilitiesList.push("Background-Checked");
      if (formData.bilingualSpanish) capabilitiesList.push("Bilingual (English & Spanish)");

      const payload = {
        name: formData.name.trim(),
        title: formData.title.trim() || "Home Safety Specialist",
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        specialties: capabilitiesList,
        shssCertified: formData.shssCertified,
        shssRenewalDate:
          formData.shssCertified && formData.shssRenewalDate
            ? formData.shssRenewalDate
            : null,
        cprCertified: formData.cprCertified,
        aedCertified: formData.aedCertified,
        backgroundChecked: formData.backgroundChecked,
        bilingualSpanish: formData.bilingualSpanish,
        color: formData.color,
        status: formData.status,
        notes: formData.notes.trim() || null,
      };

      if (editingSpecialist) {
        await updateSpecialist({
          id: editingSpecialist.id,
          data: payload,
        }).unwrap();
        await showSuccessAlert(
          "Specialist Updated",
          `"${formData.name}" profile & credentials have been updated.`
        );
      } else {
        await createSpecialist(payload).unwrap();
        await showSuccessAlert(
          "Specialist Added",
          `"${formData.name}" has been added to the specialist roster.`
        );
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
      (s.shssCertified && (term.includes("shss") || term.includes("safety specialist"))) ||
      (s.cprCertified && term.includes("cpr")) ||
      (s.aedCertified && term.includes("aed")) ||
      (s.bilingualSpanish && (term.includes("bilingual") || term.includes("spanish"))) ||
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
            Manage certified field technicians, track qualifications (SHSS, CPR, AED, Background-Checked, Bilingual), and monitor renewal cycles.
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
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#5E8FB2] ${isFetching ? "animate-spin" : ""}`}
            />
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
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="search"
              placeholder="Search by name, certification (SHSS, CPR, AED), role, or phone..."
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
                    <th className="py-3.5 px-4"> Specific Qualifications & Certifications</th>
                    <th className="py-3.5 px-4">Assignments</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E4EC]/60 text-sm font-medium text-[#243746]">
                  {paginatedSpecialists.map((specialist) => {
                    const legacySpecs = (specialist.specialties || []).map((s) => s.toLowerCase());
                    const isShss =
                      specialist.shssCertified ??
                      legacySpecs.some((s) => s.includes("shss") || s.includes("senior home safety"));
                    const isCpr =
                      specialist.cprCertified ?? legacySpecs.some((s) => s.includes("cpr"));
                    const isAed =
                      specialist.aedCertified ?? legacySpecs.some((s) => s.includes("aed"));
                    const isBg =
                      specialist.backgroundChecked ??
                      (legacySpecs.some((s) => s.includes("background")) || true);
                    const isBilingual =
                      specialist.bilingualSpanish ??
                      legacySpecs.some((s) => s.includes("bilingual") || s.includes("spanish"));

                    return (
                      <tr key={specialist.id} className="hover:bg-[#F7FAFC] transition-colors">
                        {/* Specialist Name & Avatar */}
                        <td className="py-4 px-4">
                          <button
                            type="button"
                            onClick={() => setViewingSpecialist(specialist)}
                            className="flex items-center gap-3 text-left group cursor-pointer"
                          >
                            <div
                              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-xs shrink-0 shadow-xs group-hover:scale-105 transition-transform"
                              style={{ backgroundColor: specialist.color || "#294B68" }}
                            >
                              {specialist.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <div>
                              <span className="font-extrabold text-[#243746] block text-sm group-hover:text-[#5E8FB2] transition-colors">
                                {specialist.name}
                              </span>
                              <span className="text-xs text-[#5E8FB2] font-semibold block">
                                {specialist.title}
                              </span>
                            </div>
                          </button>
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

                        {/* Qualifications & Certifications Badges */}
                        <td className="py-4 px-4 max-w-sm">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {/* SHSS Badge */}
                            {isShss ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-[#EAF3F8] text-[#294B68] border border-[#5E8FB2]/30 shadow-2xs">
                                <Award className="w-3 h-3 text-[#294B68]" />
                                <span>SHSS Certified</span>
                                {specialist.shssRenewalDate && (
                                   <span className="text-[10px] text-[#5E8FB2] ml-0.5 font-semibold">
                                    (Renews:{" "}
                                    {new Date(specialist.shssRenewalDate).toLocaleDateString("en-US", {
                                      month: "short",
                                      year: "numeric",
                                    })}
                                    )
                                  </span>
                                )}
                              </span>
                            ) : null}

                            {/* CPR Badge */}
                            {isCpr ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200 shadow-2xs">
                                <HeartPulse className="w-3 h-3 text-rose-600" />
                                <span>CPR</span>
                              </span>
                            ) : null}

                            {/* AED Badge */}
                            {isAed ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs">
                                <Zap className="w-3 h-3 text-amber-600" />
                                <span>AED</span>
                              </span>
                            ) : null}

                            {/* Background-Checked */}
                            {isBg ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                <span>Background-Checked</span>
                              </span>
                            ) : null}

                            {/* Bilingual */}
                            {isBilingual ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200 shadow-2xs">
                                <Languages className="w-3 h-3 text-purple-600" />
                                <span>Bilingual (EN/ES)</span>
                              </span>
                            ) : null}

                            {/* Core Standards Pill */}
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-[#F8FAFC] text-[#64748B] border border-[#D9E4EC]"
                              title="Core competencies: Fall-Risk & Hazard ID, Scam & Exploitation Awareness, Emergency Response Preparedness"
                            >
                              <Sparkles className="w-2.5 h-2.5 text-[#5E8FB2]" />
                              <span>Core Standards Verified</span>
                            </span>
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
                              onClick={() => setViewingSpecialist(specialist)}
                              className="px-2.5 py-1.5 rounded-lg border border-[#D9E4EC] bg-white text-[#294B68] hover:bg-[#EAF3F8] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                              title="View Specialist Details"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#5E8FB2]" />
                              <span>View</span>
                            </button>

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
                    );
                  })}
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
          <div className="bg-white rounded-3xl border border-[#D9E4EC] max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Title */}
            <div className="flex items-center justify-between border-b border-[#D9E4EC] pb-3.5">
              <div>
                <h3 className="font-black text-lg text-[#243746] flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#294B68]" />
                  <span>{editingSpecialist ? "Edit Specialist Profile" : "Add New Specialist"}</span>
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Configure qualifications, certified skills, and SHSS renewal tracking.
                </p>
              </div>
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

            <form onSubmit={handleSave} className="space-y-5">
              {/* Section 1: Basic Information */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#294B68] flex items-center gap-1.5">
                  <span>1. Contact &amp; Role Details</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D9E4EC] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1">
                      Job Title / Role
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Home Safety Specialist"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D9E4EC] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1">
                      Mobile Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="(401) 555-0144"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D9E4EC] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
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
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D9E4EC] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1">
                      Roster Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as "ACTIVE" | "INACTIVE",
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D9E4EC] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                    >
                      <option value="ACTIVE">Active (Available for Visits)</option>
                      <option value="INACTIVE">Inactive (Off-Duty / Archived)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1">
                      Badge Color Identifier
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-10 h-10 p-0.5 rounded-xl border border-[#D9E4EC] cursor-pointer bg-white"
                      />
                      <span className="text-xs font-mono text-[#64748B]">
                        {formData.color}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Specific Check-Off Certifications */}
              <div className="space-y-3 pt-2 border-t border-[#D9E4EC]">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#294B68] flex items-center gap-1.5">
                    <span>2. Specific Qualifications &amp; Certifications</span>
                  </h4>
                  <span className="text-[11px] font-semibold text-[#5E8FB2]">
                    Check off only for those who hold them
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* 1. Senior Home Safety Specialist (SHSS) */}
                  <div
                    className={`p-3.5 rounded-2xl border transition-all ${
                      formData.shssCertified
                        ? "bg-[#F0F5F9] border-[#294B68] shadow-xs"
                        : "bg-[#F8FAFC] border-[#D9E4EC]"
                    }`}
                  >
                    <label className="flex items-start justify-between gap-3 cursor-pointer">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={formData.shssCertified}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              shssCertified: e.target.checked,
                            })
                          }
                          className="w-4 h-4 mt-0.5 text-[#294B68] rounded-md cursor-pointer shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 font-extrabold text-[#243746] text-xs">
                            <Award className="w-4 h-4 text-[#294B68]" />
                            <span>Senior Home Safety Specialist (SHSS)</span>
                          </div>
                          <p className="text-[11px] text-[#64748B] mt-0.5">
                            National certification for comprehensive aging-in-place and home hazard auditing.
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0 ${
                          formData.shssCertified
                            ? "bg-[#294B68] text-white"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {formData.shssCertified ? "Certified" : "Not Held"}
                      </span>
                    </label>

                    {/* SHSS Renewal Date Tracking Field (shown when checked) */}
                    {formData.shssCertified && (
                      <div className="mt-3 pt-3 border-t border-[#D9E4EC] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#243746]">
                          <Calendar className="w-3.5 h-3.5 text-[#5E8FB2]" />
                          <span>SHSS Certificate Renewal Date:</span>
                        </div>
                        <input
                          type="date"
                          value={formData.shssRenewalDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              shssRenewalDate: e.target.value,
                            })
                          }
                          className="px-3 py-1.5 bg-white border border-[#D9E4EC] rounded-xl text-xs font-semibold text-[#243746] focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                        />
                      </div>
                    )}
                  </div>

                  {/* 2. CPR Certified */}
                  <label
                    className={`flex items-start justify-between gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      formData.cprCertified
                        ? "bg-rose-50/60 border-rose-300 shadow-xs"
                        : "bg-[#F8FAFC] border-[#D9E4EC]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={formData.cprCertified}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cprCertified: e.target.checked,
                          })
                        }
                        className="w-4 h-4 mt-0.5 text-rose-600 rounded-md cursor-pointer shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 font-extrabold text-[#243746] text-xs">
                          <HeartPulse className="w-4 h-4 text-rose-600" />
                          <span>CPR Certified</span>
                        </div>
                        <p className="text-[11px] text-[#64748B] mt-0.5">
                          Active Cardiopulmonary Resuscitation certified credential.
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0 ${
                        formData.cprCertified
                          ? "bg-rose-600 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {formData.cprCertified ? "Certified" : "Not Held"}
                    </span>
                  </label>

                  {/* 3. AED Certified */}
                  <label
                    className={`flex items-start justify-between gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      formData.aedCertified
                        ? "bg-amber-50/60 border-amber-300 shadow-xs"
                        : "bg-[#F8FAFC] border-[#D9E4EC]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={formData.aedCertified}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            aedCertified: e.target.checked,
                          })
                        }
                        className="w-4 h-4 mt-0.5 text-amber-600 rounded-md cursor-pointer shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 font-extrabold text-[#243746] text-xs">
                          <Zap className="w-4 h-4 text-amber-600" />
                          <span>AED Certified</span>
                        </div>
                        <p className="text-[11px] text-[#64748B] mt-0.5">
                          Automated External Defibrillator operation certified.
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0 ${
                        formData.aedCertified
                          ? "bg-amber-600 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {formData.aedCertified ? "Certified" : "Not Held"}
                    </span>
                  </label>

                  {/* 4. Background-Checked */}
                  <label
                    className={`flex items-start justify-between gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      formData.backgroundChecked
                        ? "bg-emerald-50/60 border-emerald-300 shadow-xs"
                        : "bg-[#F8FAFC] border-[#D9E4EC]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={formData.backgroundChecked}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            backgroundChecked: e.target.checked,
                          })
                        }
                        className="w-4 h-4 mt-0.5 text-emerald-600 rounded-md cursor-pointer shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 font-extrabold text-[#243746] text-xs">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Background-Checked</span>
                        </div>
                        <p className="text-[11px] text-[#64748B] mt-0.5">
                          Multi-state criminal history and vulnerable elder registry verified.
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0 ${
                        formData.backgroundChecked
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {formData.backgroundChecked ? "Verified" : "Pending"}
                    </span>
                  </label>

                  {/* 5. Bilingual — English & Spanish */}
                  <label
                    className={`flex items-start justify-between gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      formData.bilingualSpanish
                        ? "bg-purple-50/60 border-purple-300 shadow-xs"
                        : "bg-[#F8FAFC] border-[#D9E4EC]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={formData.bilingualSpanish}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bilingualSpanish: e.target.checked,
                          })
                        }
                        className="w-4 h-4 mt-0.5 text-purple-600 rounded-md cursor-pointer shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 font-extrabold text-[#243746] text-xs">
                          <Languages className="w-4 h-4 text-purple-600" />
                          <span>Bilingual — English &amp; Spanish</span>
                        </div>
                        <p className="text-[11px] text-[#64748B] mt-0.5">
                          Fluent in English and Spanish for native Spanish-speaking clients.
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0 ${
                        formData.bilingualSpanish
                          ? "bg-purple-600 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {formData.bilingualSpanish ? "Bilingual" : "No"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Section 3: Automatic Core Competencies (No need to check off) */}
              <div className="p-4 bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-black text-[#243746] uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-[#5E8FB2]" />
                  <span>Core Standard Competencies (Included for All Specialists)</span>
                </div>
                <p className="text-[11px] text-[#64748B]">
                  All AgeWellRI specialists are standard-trained and verified across these 3 foundational pillars:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {CORE_AUTOMATIC_COMPETENCIES.map((core, cidx) => (
                    <div
                      key={cidx}
                      className="p-2.5 bg-white rounded-xl border border-[#D9E4EC] text-xs space-y-0.5"
                    >
                      <div className="flex items-center gap-1 font-bold text-[#243746] text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{core.title}</span>
                      </div>
                      <p className="text-[10px] text-[#64748B] leading-tight">
                        {core.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Internal Administrative Notes */}
              <div>
                <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1">
                  Internal Administrative Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Primary territory: South County / Washington County..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D9E4EC] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#D9E4EC]">
                {editingSpecialist ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteSpecialist(editingSpecialist)}
                    disabled={isDeleting}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-50"
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
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#64748B] hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="px-6 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white text-xs font-black rounded-xl shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-50"
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

      {/* View Specialist Details Modal */}
      {viewingSpecialist && (() => {
        const vLegacySpecs = (viewingSpecialist.specialties || []).map((s) => s.toLowerCase());
        const vIsShss =
          viewingSpecialist.shssCertified ??
          vLegacySpecs.some((s) => s.includes("shss") || s.includes("senior home safety"));
        const vIsCpr =
          viewingSpecialist.cprCertified ?? vLegacySpecs.some((s) => s.includes("cpr"));
        const vIsAed =
          viewingSpecialist.aedCertified ?? vLegacySpecs.some((s) => s.includes("aed"));
        const vIsBg =
          viewingSpecialist.backgroundChecked ??
          (vLegacySpecs.some((s) => s.includes("background")) || true);
        const vIsBilingual =
          viewingSpecialist.bilingualSpanish ??
          vLegacySpecs.some((s) => s.includes("bilingual") || s.includes("spanish"));

        let shssRenewalFormatted = null;
        if (viewingSpecialist.shssRenewalDate) {
          try {
            shssRenewalFormatted = new Date(viewingSpecialist.shssRenewalDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            });
          } catch {
            shssRenewalFormatted = String(viewingSpecialist.shssRenewalDate);
          }
        }

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-[#D9E4EC] max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[#D9E4EC] pb-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg shrink-0 shadow-md"
                    style={{ backgroundColor: viewingSpecialist.color || "#294B68" }}
                  >
                    {viewingSpecialist.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-xl text-[#243746]">
                        {viewingSpecialist.name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          viewingSpecialist.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {viewingSpecialist.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#5E8FB2] font-bold mt-0.5">
                      {viewingSpecialist.title || "Home Safety Specialist"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingSpecialist(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF3F8] text-[#294B68] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                      Phone Number
                    </span>
                    {viewingSpecialist.phone ? (
                      <a
                        href={`tel:${viewingSpecialist.phone}`}
                        className="text-xs font-bold text-[#243746] hover:text-[#5E8FB2] transition-colors truncate block"
                      >
                        {viewingSpecialist.phone}
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Not provided</span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF3F8] text-[#294B68] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                      Email Address
                    </span>
                    {viewingSpecialist.email ? (
                      <a
                        href={`mailto:${viewingSpecialist.email}`}
                        className="text-xs font-bold text-[#243746] hover:text-[#5E8FB2] transition-colors truncate block"
                      >
                        {viewingSpecialist.email}
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Not provided</span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF3F8] text-[#294B68] flex items-center justify-center shrink-0">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                      Active Assignments
                    </span>
                    <span className="text-xs font-bold text-[#243746] block">
                      {viewingSpecialist.activeAssignmentsCount} visits assigned
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 1: Specific Qualifications & Certifications */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#294B68] flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#294B68]" />
                    <span>Specific Qualifications &amp; Certifications</span>
                  </h4>
                  <span className="text-[11px] font-semibold text-[#5E8FB2]">
                    Verified Credentials
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* SHSS */}
                  <div
                    className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 ${
                      vIsShss
                        ? "bg-[#F0F5F9] border-[#294B68]"
                        : "bg-slate-50 border-slate-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <Award className={`w-4 h-4 mt-0.5 shrink-0 ${vIsShss ? "text-[#294B68]" : "text-slate-400"}`} />
                      <div>
                        <span className="font-extrabold text-xs text-[#243746] block">
                          Senior Home Safety Specialist (SHSS)
                        </span>
                        {vIsShss && shssRenewalFormatted ? (
                          <span className="text-[11px] font-semibold text-[#5E8FB2] flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />
                            <span>Renewal Date: {shssRenewalFormatted}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#64748B] mt-0.5 block">
                            {vIsShss ? "Certification Active" : "Not Held"}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0 ${
                        vIsShss ? "bg-[#294B68] text-white" : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {vIsShss ? "Certified" : "No"}
                    </span>
                  </div>

                  {/* CPR */}
                  <div
                    className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 ${
                      vIsCpr
                        ? "bg-rose-50 border-rose-200"
                        : "bg-slate-50 border-slate-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <HeartPulse className={`w-4 h-4 mt-0.5 shrink-0 ${vIsCpr ? "text-rose-600" : "text-slate-400"}`} />
                      <div>
                        <span className="font-extrabold text-xs text-[#243746] block">
                          CPR Certified
                        </span>
                        <span className="text-[10px] text-[#64748B] mt-0.5 block">
                          {vIsCpr ? "Cardiopulmonary Resuscitation" : "Not Held"}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0 ${
                        vIsCpr ? "bg-rose-600 text-white" : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {vIsCpr ? "Certified" : "No"}
                    </span>
                  </div>

                  {/* AED */}
                  <div
                    className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 ${
                      vIsAed
                        ? "bg-amber-50 border-amber-200"
                        : "bg-slate-50 border-slate-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <Zap className={`w-4 h-4 mt-0.5 shrink-0 ${vIsAed ? "text-amber-600" : "text-slate-400"}`} />
                      <div>
                        <span className="font-extrabold text-xs text-[#243746] block">
                          AED Certified
                        </span>
                        <span className="text-[10px] text-[#64748B] mt-0.5 block">
                          {vIsAed ? "Defibrillator Operation" : "Not Held"}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0 ${
                        vIsAed ? "bg-amber-600 text-white" : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {vIsAed ? "Certified" : "No"}
                    </span>
                  </div>

                  {/* Background-Checked */}
                  <div
                    className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 ${
                      vIsBg
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-slate-50 border-slate-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <ShieldCheck className={`w-4 h-4 mt-0.5 shrink-0 ${vIsBg ? "text-emerald-600" : "text-slate-400"}`} />
                      <div>
                        <span className="font-extrabold text-xs text-[#243746] block">
                          Background-Checked
                        </span>
                        <span className="text-[10px] text-[#64748B] mt-0.5 block">
                          {vIsBg ? "Multi-State & Elder Registry Verified" : "Pending"}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0 ${
                        vIsBg ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {vIsBg ? "Verified" : "Pending"}
                    </span>
                  </div>

                  {/* Bilingual */}
                  <div
                    className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 sm:col-span-2 ${
                      vIsBilingual
                        ? "bg-purple-50 border-purple-200"
                        : "bg-slate-50 border-slate-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <Languages className={`w-4 h-4 mt-0.5 shrink-0 ${vIsBilingual ? "text-purple-600" : "text-slate-400"}`} />
                      <div>
                        <span className="font-extrabold text-xs text-[#243746] block">
                          Bilingual — English &amp; Spanish
                        </span>
                        <span className="text-[10px] text-[#64748B] mt-0.5 block">
                          {vIsBilingual ? "Fluent in English and Spanish for native Spanish-speaking clients" : "English Only"}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0 ${
                        vIsBilingual ? "bg-purple-600 text-white" : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {vIsBilingual ? "Bilingual (EN/ES)" : "English Only"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Core Standard Competencies (Automatic) */}
              <div className="p-4 bg-[#F8FAFC] border border-[#D9E4EC] rounded-2xl space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-black text-[#243746] uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-[#5E8FB2]" />
                  <span>Core Standard Competencies (Included for All Specialists)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {CORE_AUTOMATIC_COMPETENCIES.map((core, cidx) => (
                    <div
                      key={cidx}
                      className="p-2.5 bg-white rounded-xl border border-[#D9E4EC] text-xs space-y-0.5"
                    >
                      <div className="flex items-center gap-1 font-bold text-[#243746] text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{core.title}</span>
                      </div>
                      <p className="text-[10px] text-[#64748B] leading-tight">
                        {core.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Notes & Metadata */}
              {viewingSpecialist.notes && (
                <div className="p-3.5 bg-amber-50/50 border border-amber-200/60 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-[#243746] uppercase tracking-wider block">
                    Internal Administrative Notes
                  </span>
                  <p className="text-xs text-[#64748B] font-medium leading-relaxed">
                    {viewingSpecialist.notes}
                  </p>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#D9E4EC]">
                <button
                  type="button"
                  onClick={() => {
                    const target = viewingSpecialist;
                    setViewingSpecialist(null);
                    handleDeleteSpecialist(target);
                  }}
                  disabled={isDeleting}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Delete Specialist</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setViewingSpecialist(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#64748B] hover:bg-slate-100 cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const target = viewingSpecialist;
                      setViewingSpecialist(null);
                      openEditModal(target);
                    }}
                    className="px-5 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white text-xs font-black rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
