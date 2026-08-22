"use client";

import React, { useState } from "react";
import { X, FileUp, Loader2, CheckCircle2 } from "lucide-react";
import { uploadVisitReport } from "@/lib/api/admin-api";
import { MOCK_ADMIN_CLIENTS } from "@/lib/api/admin-mock-data";
import {
  confirmCriticalAction,
  showSuccessAlert,
  showErrorAlert,
} from "@/lib/alerts/sweetalert";

interface ReportUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultVisitId?: string;
  defaultClientId?: string;
}

export function ReportUploadModal({
  isOpen,
  onClose,
  defaultVisitId = "vst_01",
  defaultClientId = "AW-1001",
}: ReportUploadModalProps) {
  const [clientId, setClientId] = useState(defaultClientId);
  const [score, setScore] = useState(94);
  const [summary, setSummary] = useState(
    "Completed Age Safe® Home Score™ assessment. Bathroom grab-bar installation recommended."
  );
  const [fileName, setFileName] = useState("AgeSafe_Assessment_AW1001.pdf");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const confirmed = await confirmCriticalAction({
      title: "Publish Assessment Report?",
      text: `Publish this Age Safe® Home Score™ report (${score}/100) to the client's member portal?`,
      confirmButtonText: "Yes, Publish Report",
      isDestructive: false,
    });

    if (!confirmed) return;

    setIsSubmitting(true);
    try {
      await uploadVisitReport({
        visitId: defaultVisitId,
        clientId,
        score,
        summary,
        pdfFileName: fileName,
      });
      setSuccess(true);
      await showSuccessAlert(
        "Report Published",
        `Age Safe® Home Score™ of ${score}/100 has been uploaded to the member portal.`
      );
    } catch {
      showErrorAlert("Upload Failed", "Failed to upload report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={handleReset} />

      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#D9E4EC] shadow-2xl p-6 sm:p-8 z-10">
        <div className="flex items-center justify-between pb-4 border-b border-[#D9E4EC]">
          <div className="flex items-center gap-2">
            <FileUp className="w-5 h-5 text-[#294B68]" />
            <h3 className="text-xl font-bold text-[#243746]">Upload Home Safety Report</h3>
          </div>
          <button onClick={handleReset} className="p-2 text-[#64748B] hover:text-[#243746] rounded-xl border border-[#D9E4EC] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-[#3F8F6B] text-white rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-[#243746]">Report Uploaded!</h4>
              <p className="text-sm text-[#64748B] mt-1">
                Age Safe® Home Score™ of <strong>{score}/100</strong> published for client portal access.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="w-full py-3 bg-[#294B68] text-white font-bold rounded-xl cursor-pointer"
            >
              Done &amp; Return to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
              <label className="block text-xs font-bold text-[#243746] mb-1">Select Client *</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full h-11 px-3.5 text-sm border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
              >
                {MOCK_ADMIN_CLIENTS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#243746] mb-1">
                Age Safe® Home Score™ (0 - 100) *
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full h-11 px-3.5 text-sm border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#243746] mb-1">Assessment Summary *</label>
              <textarea
                rows={3}
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full p-3 text-sm border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#243746] mb-1">Attach Report PDF File</label>
              <div className="p-4 border-2 border-dashed border-[#D9E4EC] rounded-xl text-center space-y-1 bg-[#F7FAFC]">
                <FileUp className="w-6 h-6 text-[#5E8FB2] mx-auto" />
                <p className="text-xs font-bold text-[#243746]">{fileName}</p>
                <p className="text-[11px] text-[#64748B]">Click to re-select document (PDF up to 10MB)</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-base rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Uploading Report...</span>
                  </>
                ) : (
                  <span>Publish Report to Client Portal</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
