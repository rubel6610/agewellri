"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  CalendarX,
  Plus,
  Search,
  RefreshCw,
  Edit3,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Loader2,
  X,
  CalendarDays,
  CalendarCheck,
} from "lucide-react";
import {
  useGetAdminOffDaysQuery,
  useCreateOffDayMutation,
  useUpdateOffDayMutation,
  useDeleteOffDayMutation,
  usePreviewOffDayConflictsMutation,
} from "@/redux/features/off-day/offDayApi";
import { OffDayItem, ConflictingAppointmentItem } from "@/redux/features/off-day/offDayTypes";
import {
  confirmDelete,
  showErrorAlert,
  showToast,
} from "@/lib/alerts/sweetalert";
import { TablePagination } from "@/components/ui/table-pagination";


export default function AdminOffDaysPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "UPCOMING" | "TODAY" | "PAST">("ALL");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: offDaysRes, isLoading, isFetching, refetch } = useGetAdminOffDaysQuery({
    search: search || undefined,
  });

  const [createOffDayMutation, { isLoading: isCreating }] = useCreateOffDayMutation();
  const [updateOffDayMutation, { isLoading: isUpdating }] = useUpdateOffDayMutation();
  const [deleteOffDayMutation, { isLoading: isDeleting }] = useDeleteOffDayMutation();
  const [previewConflictsMutation] = usePreviewOffDayConflictsMutation();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OffDayItem | null>(null);

  // Form State
  const [formDateMode, setFormDateMode] = useState<"SINGLE" | "RANGE">("SINGLE");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formConflicts, setFormConflicts] = useState<ConflictingAppointmentItem[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const allOffDays = useMemo(() => offDaysRes?.items || [], [offDaysRes?.items]);
  const metrics = offDaysRes?.metrics || {
    totalActive: 0,
    upcomingCount: 0,
    thisMonthCount: 0,
    recurringCount: 0,
  };

  const todayCount = useMemo(() => {
    return allOffDays.filter((o) => o.status === "TODAY").length;
  }, [allOffDays]);

  const pastCount = useMemo(() => {
    return allOffDays.filter((o) => o.status === "PAST").length;
  }, [allOffDays]);

  // Filter based on active tab and selected date
  const filteredOffDays = useMemo(() => {
    return allOffDays.filter((item) => {
      if (activeTab === "UPCOMING") {
        if (item.status !== "UPCOMING" && item.status !== "TODAY") return false;
      } else if (activeTab === "TODAY") {
        if (item.status !== "TODAY") return false;
      } else if (activeTab === "PAST") {
        if (item.status !== "PAST") return false;
      }

      if (selectedDate) {
        const isWithin = item.startDate <= selectedDate && item.endDate >= selectedDate;
        if (!isWithin) return false;
      }

      return true;
    });
  }, [allOffDays, activeTab, selectedDate]);

  const paginatedOffDays = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOffDays.slice(start, start + pageSize);
  }, [filteredOffDays, currentPage, pageSize]);

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    setEditingItem(null);
    setFormDateMode("SINGLE");
    setFormTitle("");
    setFormDescription("");
    setFormStartDate(tomorrowStr);
    setFormEndDate(tomorrowStr);
    setFormIsActive(true);
    setFormConflicts([]);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = async (item: OffDayItem) => {
    setEditingItem(item);
    setFormDateMode(item.isSingleDay ? "SINGLE" : "RANGE");
    setFormTitle(item.title);
    setFormDescription(item.description || "");
    setFormStartDate(item.startDate);
    setFormEndDate(item.endDate);
    setFormIsActive(item.isActive);
    setFormErrors({});

    try {
      const res = await previewConflictsMutation({
        startDate: item.startDate,
        endDate: item.endDate,
      }).unwrap();
      setFormConflicts(res.conflicts || []);
    } catch {
      setFormConflicts([]);
    }

    setIsModalOpen(true);
  };

  // Check conflicts whenever start/end dates change in modal
  useEffect(() => {
    if (!isModalOpen || !formStartDate) return;

    const check = async () => {
      try {
        const res = await previewConflictsMutation({
          startDate: formStartDate,
          endDate: formDateMode === "RANGE" && formEndDate ? formEndDate : formStartDate,
        }).unwrap();
        setFormConflicts(res.conflicts || []);
      } catch {
        setFormConflicts([]);
      }
    };

    const debounce = setTimeout(check, 300);
    return () => clearTimeout(debounce);
  }, [formStartDate, formEndDate, formDateMode, isModalOpen, previewConflictsMutation]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formTitle.trim()) {
      errors.title = "Off-day reason / title is required";
    }
    if (!formStartDate) {
      errors.startDate = "Start date is required";
    }
    if (formDateMode === "RANGE" && formEndDate && formEndDate < formStartDate) {
      errors.endDate = "End date cannot be before start date";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveOffDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const finalEndDate = formDateMode === "RANGE" && formEndDate ? formEndDate : formStartDate;

    try {
      if (editingItem) {
        const res = await updateOffDayMutation({
          id: editingItem.id,
          data: {
            title: formTitle.trim(),
            description: formDescription.trim() || undefined,
            startDate: formStartDate,
            endDate: finalEndDate,
            isActive: formIsActive,
          },
        }).unwrap();

        showToast(res.message || "Off-day updated successfully", "success");
      } else {
        const res = await createOffDayMutation({
          title: formTitle.trim(),
          description: formDescription.trim() || undefined,
          startDate: formStartDate,
          endDate: finalEndDate,
          isActive: formIsActive,
        }).unwrap();

        showToast(res.message || "Off-day created successfully", "success");
      }

      setIsModalOpen(false);
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to save off-day.";
      showErrorAlert("Save Failed", msg);
    }
  };

  const handleDeleteOffDay = async (item: OffDayItem) => {
    const confirmed = await confirmDelete({
      title: `Delete Off-Day: ${item.title}?`,
      text: `Are you sure you want to remove "${item.title}" (${item.formattedDateRange})? Client visit scheduling will be re-enabled for this date.`,
      confirmButtonText: "Yes, Delete Off-Day",
      cancelButtonText: "Cancel",
    });

    if (!confirmed) return;

    try {
      const res = await deleteOffDayMutation(item.id).unwrap();
      showToast(res.message || "Off-day deleted", "success");
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to delete off-day.";
      showErrorAlert("Delete Failed", msg);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9E4EC]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <CalendarX className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746] tracking-tight">
                Off Day Management
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B]">
                Configure company off-days. When active, all visit booking and rescheduling are automatically blocked.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 text-[#64748B] hover:text-[#243746] hover:bg-[#EAF3F8] rounded-xl border border-[#D9E4EC] transition-all cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Off Day</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-[#D9E4EC] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
              Active Off Days
            </span>
            <span className="text-2xl sm:text-3xl font-black text-[#243746] mt-1 block">
              {metrics.totalActive}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#EAF3F8] text-[#294B68] flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#D9E4EC] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
              Upcoming Off Days
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-700 mt-1 block">
              {metrics.upcomingCount}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#D9E4EC] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
              This Month
            </span>
            <span className="text-2xl sm:text-3xl font-black text-indigo-700 mt-1 block">
              {metrics.thisMonthCount}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Bar: Tabs, Search & Year Filter */}
      <div className="p-4 bg-white rounded-2xl border border-[#D9E4EC] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { key: "ALL", label: `All (${allOffDays.length})` },
            { key: "UPCOMING", label: `Upcoming (${metrics.upcomingCount})` },
            { key: "TODAY", label: `Today (${todayCount})` },
            { key: "PAST", label: `Past (${pastCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key as any);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === tab.key
                  ? "bg-[#294B68] text-white shadow-xs"
                  : "text-[#64748B] hover:bg-[#F0F5F9] hover:text-[#243746]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Date Filter */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search off-days..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl text-xs font-medium text-[#243746] focus:outline-none focus:ring-2 focus:ring-[#294B68]"
            />
          </div>

          <div className="relative flex items-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl text-xs font-bold text-[#243746] focus:outline-none focus:ring-2 focus:ring-[#294B68] cursor-pointer"
              title="Filter by specific date"
            />
            {selectedDate && (
              <button
                type="button"
                onClick={() => {
                  setSelectedDate("");
                  setCurrentPage(1);
                }}
                className="absolute -right-2 -top-2 w-5 h-5 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-full flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                title="Clear date filter"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-[#D9E4EC] space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#294B68] mx-auto" />
          <p className="font-bold text-sm text-[#243746]">Loading off-days...</p>
        </div>
      ) : filteredOffDays.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-[#D9E4EC] space-y-4">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <CalendarX className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-[#243746]">No Off-Days Found</h3>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              {search || selectedDate
                ? `No off-days matching your search/date filter. Try clearing filters.`
                : "No company off-days configured for this filter."}
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-sm rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Off Day</span>
          </button>
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-[#D9E4EC] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#D9E4EC] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3.5 px-6">Off Day Reason / Title</th>
                  <th className="py-3.5 px-6">Date / Range</th>
                  <th className="py-3.5 px-6 text-center">Duration</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E4EC]/60 text-sm">
                {paginatedOffDays.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                    {/* Title */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
                          <CalendarX className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-extrabold text-[#243746] block text-sm">
                            {item.title}
                          </span>
                          {item.description && (
                            <span className="text-xs text-[#64748B] line-clamp-1">
                              {item.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6">
                      <span className="font-bold text-[#243746] text-xs sm:text-sm block">
                        {item.formattedDateRange}
                      </span>
                      <span className="text-[11px] font-mono text-[#64748B]">
                        {item.startDate}{!item.isSingleDay && item.startDate !== item.endDate ? ` → ${item.endDate}` : ""}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAF3F8] text-[#294B68] border border-[#5E8FB2]/20">
                        {item.isSingleDay ? "1 day" : `${item.durationDays} days`}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          item.status === "TODAY"
                            ? "bg-rose-100 text-rose-900 border-rose-300 animate-pulse"
                            : item.status === "UPCOMING"
                            ? "bg-amber-50 text-amber-900 border-amber-200"
                            : item.status === "INACTIVE"
                            ? "bg-slate-100 text-slate-600 border-slate-200"
                            : "bg-slate-50 text-slate-500 border-slate-200"
                        }`}
                      >
                        {item.status === "TODAY" && <ShieldAlert className="w-3 h-3 text-rose-700" />}
                        {item.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-2 text-[#64748B] hover:text-[#294B68] hover:bg-[#EAF3F8] rounded-xl transition-all cursor-pointer"
                          title="Edit off-day"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOffDay(item)}
                          disabled={isDeleting}
                          className="p-2 text-[#64748B] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                          title="Delete off-day"
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

          {/* Pagination */}
          <div className="p-4 border-t border-[#D9E4EC]/60 bg-[#F8FAFC]">
            <TablePagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={filteredOffDays.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      )}

      {/* ADD / EDIT OFF-DAY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative bg-white rounded-3xl border border-[#D9E4EC] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-xs px-6 py-5 border-b border-[#D9E4EC] flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <CalendarX className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#243746]">
                    {editingItem ? "Edit Off Day" : "Add Off Day"}
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Blocks all appointment booking on these dates
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-[#64748B] hover:text-[#243746] rounded-xl hover:bg-[#F0F5F9] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveOffDay} className="p-6 space-y-5">
              {/* Conflict Alert Banner (If existing bookings intersect) */}
              {formConflicts.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      {formConflicts.length} scheduled visit(s) currently booked on this date!
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Saving this off-day will prevent any new bookings. You may want to review and reschedule these existing visits:
                  </p>
                  <div className="max-h-28 overflow-y-auto space-y-1 pt-1 pr-1 divide-y divide-amber-200/50">
                    {formConflicts.map((c) => (
                      <div key={c.id} className="pt-1 text-[11px] text-amber-950 flex items-center justify-between">
                        <span className="font-bold">{c.clientName} ({c.clientNumber})</span>
                        <span className="text-amber-800">{c.formattedDate} • {c.timeSlot}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Off-Day Duration Type: Single Date vs Date Range */}
              <div>
                <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-2">
                  Duration Type
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#F1F5F9] rounded-xl border border-[#D9E4EC]">
                  <button
                    type="button"
                    onClick={() => setFormDateMode("SINGLE")}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      formDateMode === "SINGLE"
                        ? "bg-white text-[#243746] shadow-2xs"
                        : "text-[#64748B] hover:text-[#243746]"
                    }`}
                  >
                    Single Date
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormDateMode("RANGE")}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      formDateMode === "RANGE"
                        ? "bg-white text-[#243746] shadow-2xs"
                        : "text-[#64748B] hover:text-[#243746]"
                    }`}
                  >
                    Date Range
                  </button>
                </div>
              </div>

              {/* Title / Reason */}
              <div>
                <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                  Off Day Reason / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Office Closed / Staff Training"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#243746] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#294B68] ${
                    formErrors.title ? "border-rose-400 bg-rose-50/20" : "border-[#D9E4EC]"
                  }`}
                />
                {formErrors.title && (
                  <p className="text-xs font-semibold text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {formErrors.title}
                  </p>
                )}

              </div>

              {/* Date Inputs */}
              <div className={`grid gap-4 ${formDateMode === "RANGE" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
                <div>
                  <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                    {formDateMode === "RANGE" ? "Start Date" : "Off Day Date"} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9E4EC] text-sm text-[#243746] focus:outline-none focus:ring-2 focus:ring-[#294B68]"
                  />
                  {formErrors.startDate && (
                    <p className="text-xs font-semibold text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {formErrors.startDate}
                    </p>
                  )}
                </div>

                {formDateMode === "RANGE" && (
                  <div>
                    <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                      End Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formEndDate}
                      min={formStartDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9E4EC] text-sm text-[#243746] focus:outline-none focus:ring-2 focus:ring-[#294B68]"
                    />
                    {formErrors.endDate && (
                      <p className="text-xs font-semibold text-rose-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {formErrors.endDate}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Description / Client Notes */}
              <div>
                <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider mb-1.5">
                  Description / Client Notice <span className="text-xs font-normal text-[#64748B]">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Offices will be closed. Emergency support remains active."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9E4EC] text-sm text-[#243746] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#294B68]"
                />
              </div>

              {/* Active Toggle */}
              <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC]">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#294B68] focus:ring-[#294B68]"
                  />
                  <div>
                    <span className="font-bold text-xs text-[#243746] block">
                      Active 
                    </span>
                    <span className="text-[11px] text-[#64748B]">
                      Uncheck to temporarily disable this off-day without deleting it
                    </span>
                  </div>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#D9E4EC] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isCreating || isUpdating}
                  className="px-5 py-2.5 rounded-xl border border-[#D9E4EC] text-sm font-bold text-[#64748B] hover:bg-[#F0F5F9] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-6 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white text-sm font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isCreating || isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editingItem ? "Update Off Day" : "Save Off Day"}</span>
                    </>
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
