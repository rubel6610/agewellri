"use client";

import React, { useState, useRef } from "react";
import {
  X,
  FileUp,
  FileText,
  Loader2,
  CheckCircle2,
  Calendar,
  User,
  ShieldCheck,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useUploadReportMutation } from "@/redux/features/report/reportApi";
import { AppointmentItem } from "@/redux/features/appointment/appointmentTypes";
import {
  confirmCriticalAction,
  showSuccessAlert,
  showErrorAlert,
} from "@/lib/alerts/sweetalert";

interface ReportUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: AppointmentItem | any | null;
  onSuccess?: () => void;
}

export function ReportUploadModal({
  isOpen,
  onClose,
  appointment,
  onSuccess,
}: ReportUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadReportMutation, { isLoading: isUploading }] = useUploadReportMutation();

  if (!isOpen || !appointment) return null;

  const defaultTitle = `${appointment.serviceType || "Visit"} Report — ${appointment.date || "Completed"}`;
  const displayTitle = title || defaultTitle;

  const handleFileSelection = (selectedFile: File | null) => {
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith(".pdf") && selectedFile.type !== "application/pdf") {
      showErrorAlert("Invalid File Format", "Only PDF documents (.pdf) can be uploaded as visit reports.");
      return;
    }

    if (selectedFile.size > 15 * 1024 * 1024) {
      showErrorAlert("File Too Large", "Maximum allowed PDF file size is 15MB.");
      return;
    }

    setFile(selectedFile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleReset = () => {
    setFile(null);
    setTitle("");
    setSummary("");
    setNotes("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      showErrorAlert("Missing File", "Please select a PDF visit report file to upload.");
      return;
    }

    const isReplacing = Boolean(appointment.hasReport || appointment.reportStatus === "uploaded");
    const confirmTitle = isReplacing ? "Replace Existing Report?" : "Upload Visit Report?";
    const confirmText = isReplacing
      ? `Replace the existing report for ${appointment.clientName}'s ${appointment.serviceType} with "${file.name}"?`
      : `Publish this PDF report for ${appointment.clientName}'s ${appointment.serviceType} to the client member portal?`;

    const confirmed = await confirmCriticalAction({
      title: confirmTitle,
      text: confirmText,
      confirmButtonText: isReplacing ? "Yes, Replace Report" : "Yes, Upload Report",
      isDestructive: false,
    });

    if (!confirmed) return;

    try {
      const formData = new FormData();
      formData.append("appointmentId", appointment.id);
      formData.append("file", file);
      formData.append("title", displayTitle);
      if (summary) formData.append("summary", summary);
      if (notes) formData.append("notes", notes);

      await uploadReportMutation(formData).unwrap();

      await showSuccessAlert(
        "Report Published",
        `The visit report PDF has been linked to ${appointment.clientName}'s completed visit and is now available in their portal.`
      );

      handleReset();
      onSuccess?.();
    } catch (err: any) {
      showErrorAlert(
        "Upload Failed",
        err?.data?.message || err?.message || "Failed to upload visit report PDF."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={handleReset} />

      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-[#D9E4EC] shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D9E4EC]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#EAF3F8] text-[#294B68] rounded-xl">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#243746]">
                {appointment.hasReport || appointment.reportStatus === "uploaded"
                  ? "Replace Visit Report"
                  : "Upload Visit Report"}
              </h3>
              <p className="text-xs text-[#64748B]">Attach technician PDF report to completed visit</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-2 text-[#64748B] hover:text-[#243746] rounded-xl border border-[#D9E4EC] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visit Details Card */}
        <div className="mt-4 p-4 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] space-y-2 text-xs">
          <div className="flex items-center justify-between font-bold text-[#243746] pb-2 border-b border-[#D9E4EC]/60">
            <span className="flex items-center gap-1.5 text-sm text-[#294B68]">
              <User className="w-4 h-4" /> {appointment.clientName}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase">
              {appointment.status || "Completed"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[#475569]">
            <div>
              <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">Service</span>
              <strong className="text-[#243746]">{appointment.serviceType}</strong>
            </div>
            <div>
              <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">Specialist</span>
              <strong className="text-[#243746]">{appointment.technicianName}</strong>
            </div>
            <div>
              <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">Visit Date &amp; Time</span>
              <strong className="text-[#243746]">{appointment.date} • {appointment.timeSlot}</strong>
            </div>
            <div>
              <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">Current Report Status</span>
              <span className={`font-bold ${appointment.hasReport || appointment.reportStatus === "uploaded" ? "text-emerald-700" : "text-amber-600"}`}>
                {appointment.hasReport || appointment.reportStatus === "uploaded" ? "Report Uploaded" : "Not Uploaded"}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Report Title */}
          <div>
            <label className="block text-xs font-bold text-[#243746] mb-1">
              Report Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={defaultTitle}
              className="w-full h-11 px-3.5 text-sm bg-white border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#294B68]"
            />
          </div>

          {/* PDF File Dropzone */}
          <div>
            <label className="block text-xs font-bold text-[#243746] mb-1">
              Technician PDF Document * <span className="text-[#64748B] font-normal">(Max 15MB)</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelection(e.target.files[0]);
                }
              }}
            />

            {!file ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-2xl text-center space-y-2 cursor-pointer transition-all ${
                  dragActive
                    ? "border-[#294B68] bg-[#EAF3F8]"
                    : "border-[#D9E4EC] bg-[#F8FAFC] hover:border-[#5E8FB2] hover:bg-white"
                }`}
              >
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-[#D9E4EC]">
                  <FileUp className="w-6 h-6 text-[#294B68]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#243746]">
                    Click to select PDF or drag &amp; drop file here
                  </p>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Official inspection or summary report received from specialist
                  </p>
                </div>
                <span className="inline-block text-[11px] font-bold text-[#5E8FB2] bg-[#EAF3F8] px-3 py-1 rounded-full border border-[#5E8FB2]/20">
                  PDF format only (Up to 15MB)
                </span>
              </div>
            ) : (
              <div className="p-4 bg-[#EAF3F8]/50 border border-[#5E8FB2]/40 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-[#294B68] text-white rounded-xl shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#243746] truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {formatFileSize(file.size)} • Ready to upload
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-[#294B68] hover:underline px-2 py-1 cursor-pointer"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Assessment Summary / Observations */}
          <div>
            <label className="block text-xs font-bold text-[#243746] mb-1">
              Visit Summary / Notes for Member <span className="text-[#94A3B8] font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g. Home safety inspection completed. All primary safety checkpoints evaluated and recommendations detailed in the attached report."
              className="w-full p-3 text-sm bg-white border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#294B68]"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#D9E4EC]">
            <button
              type="button"
              onClick={handleReset}
              disabled={isUploading}
              className="px-4 py-2.5 text-xs font-bold text-[#64748B] hover:text-[#243746] border border-[#D9E4EC] rounded-xl hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isUploading || !file}
              className="px-6 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading PDF Report...</span>
                </>
              ) : (
                <>
                  <FileUp className="w-4 h-4" />
                  <span>Publish Report to Client</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
