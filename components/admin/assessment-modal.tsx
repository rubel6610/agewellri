"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Loader2,
  Check,
  UserCheck,
  Calendar,
  Sparkles,
} from "lucide-react";
import {
  useGetAssessmentTemplateQuery,
  useSubmitAssessmentMutation,
  useGetReportByAppointmentIdQuery,
} from "@/redux/features/report/reportApi";
import { AssessmentResponseSubmission } from "@/redux/features/report/reportTypes";
import { generateAssessmentPdf } from "@/lib/pdf/assessment-pdf-generator";
import {
  confirmCriticalAction,
  showSuccessAlert,
  showErrorAlert,
} from "@/lib/alerts/sweetalert";

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
    id: string;
    clientName: string;
    clientId: string;
    clientNumber?: string;
    serviceType: string;
    date: string;
    timeSlot: string;
    technicianName: string;
    status: string;
  } | null;
}

const CATEGORY_NAMES: Record<string, string> = {
  ENTRANCE_EXIT: "1. Entrance & Exit",
  HALLWAYS_WALKWAYS: "2. Hallways & Living Areas",
  BATHROOMS: "3. Bathroom Safety",
  LIGHTING_VISIBILITY: "4. Lighting & Visibility",
  FIRE_EMERGENCY: "5. Fire & Emergency Safety",
};

export function AssessmentModal({ isOpen, onClose, appointment }: AssessmentModalProps) {
  const { data: templateRes, isLoading: isTemplateLoading } = useGetAssessmentTemplateQuery(
    undefined,
    { skip: !isOpen }
  );

  const { data: existingReportRes, isLoading: isReportLoading } =
    useGetReportByAppointmentIdQuery(appointment?.id || "", {
      skip: !isOpen || !appointment?.id,
    });

  const [submitAssessmentMutation, { isLoading: isSubmitting }] = useSubmitAssessmentMutation();

  const questions = templateRes?.data?.questions || [];
  const existingReport = existingReportRes?.data;

  const [activeCategory, setActiveCategory] = useState<string>("ENTRANCE_EXIT");
  const [responses, setResponses] = useState<Record<string, { scoreValue: number; notes: string; flaggedRisk: boolean }>>({});
  const [summary, setSummary] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [savedReport, setSavedReport] = useState<any>(null);

  // Initialize questions and answers
  useEffect(() => {
    if (questions.length > 0) {
      const initial: Record<string, { scoreValue: number; notes: string; flaggedRisk: boolean }> = {};

      questions.forEach((q) => {
        // If existing report responses exist, pre-fill them
        const existingResp = existingReport?.responses?.find((r) => r.questionId === q.id);
        initial[q.id] = {
          scoreValue: existingResp ? existingResp.scoreValue : 2, // Default 2 = Safe
          notes: existingResp?.notes || "",
          flaggedRisk: existingResp ? existingResp.flaggedRisk : false,
        };
      });

      setResponses(initial);

      if (existingReport) {
        setSummary(existingReport.summary || "");
        setRecommendations(existingReport.recommendations || "");
        setSavedReport(existingReport);
      } else {
        setSummary(
          `Comprehensive 50-point home safety assessment completed for ${appointment?.clientName || "resident"}. Residence is well-maintained with clear hallways and active safety oversight.`
        );
        setRecommendations(
          "• Keep emergency contact numbers and medication list visibly posted near refrigerator.\n• Ensure nighttime nightlights remain plugged in along the bedroom-to-bathroom path.\n• Maintain clear, trip-free walkways across all primary living areas."
        );
        setSavedReport(null);
      }
    }
  }, [questions, existingReport, appointment]);

  if (!isOpen || !appointment) return null;

  // Calculate live authoritative score preview
  let liveScore = 0;
  const categoryScores: Record<string, { score: number; max: number }> = {
    ENTRANCE_EXIT: { score: 0, max: 10 },
    HALLWAYS_WALKWAYS: { score: 0, max: 10 },
    BATHROOMS: { score: 0, max: 10 },
    LIGHTING_VISIBILITY: { score: 0, max: 10 },
    FIRE_EMERGENCY: { score: 0, max: 10 },
  };

  questions.forEach((q) => {
    const val = responses[q.id]?.scoreValue ?? 2;
    liveScore += val;
    if (categoryScores[q.category]) {
      categoryScores[q.category].score += val;
    }
  });

  const percentage = Math.round((liveScore / 50) * 100);

  const getRatingBadge = (score: number) => {
    if (score >= 45) {
      return {
        label: "Age Safe Certified™ — Excellent",
        bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
      };
    }
    if (score >= 38) {
      return {
        label: "Good Home Safety — Minor Items",
        bg: "bg-[#EAF3F8] text-[#294B68] border-[#5E8FB2]/30",
      };
    }
    if (score >= 30) {
      return {
        label: "Moderate Risk — Action Needed",
        bg: "bg-amber-50 text-amber-800 border-amber-200",
      };
    }
    return {
      label: "Elevated Hazard — Urgent Review",
      bg: "bg-rose-50 text-rose-800 border-rose-200",
    };
  };

  const badge = getRatingBadge(liveScore);

  const handleScoreChange = (questionId: string, scoreValue: number) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        scoreValue,
        flaggedRisk: scoreValue === 0,
      },
    }));
  };

  const handleNotesChange = (questionId: string, notes: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        notes,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const confirmed = await confirmCriticalAction({
      title: "Publish Home Safety Assessment?",
      text: `Submit this 50-point assessment (${liveScore}/50 • ${percentage}%) and publish the official report for ${appointment.clientName}?`,
      confirmButtonText: "Yes, Publish Report",
      isDestructive: false,
    });

    if (!confirmed) return;

    try {
      const submissionResponses: AssessmentResponseSubmission[] = questions.map((q) => ({
        questionId: q.id,
        category: q.category,
        questionText: q.questionText,
        scoreValue: responses[q.id]?.scoreValue ?? 2,
        notes: responses[q.id]?.notes || undefined,
        flaggedRisk: responses[q.id]?.flaggedRisk ?? false,
      }));

      const res = await submitAssessmentMutation({
        appointmentId: appointment.id,
        responses: submissionResponses,
        summary,
        recommendations,
      }).unwrap();

      setSavedReport(res.data);

      await showSuccessAlert(
        "Assessment Report Generated",
        `Age Safe® Home Score™ of ${liveScore}/50 (${percentage}%) published to client portal successfully.`
      );
    } catch (err: any) {
      showErrorAlert(
        "Submission Failed",
        err?.data?.message || err?.message || "Failed to submit assessment."
      );
    }
  };

  const currentCategoryQuestions = questions.filter((q) => q.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-[#D9E4EC] shadow-2xl z-10 my-8 overflow-hidden flex flex-col max-h-[92vh] text-[#243746]">
        {/* Modal Header */}
        <div className="p-6 sm:p-8 bg-[#243746] text-white flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#5E8FB2] text-white flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Age Safe® Home Score™
              </span>
              <span className="text-xs text-[#94A3B8]">50-Point Standard Assessment</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Home Safety Assessment &amp; Inspection
            </h2>
            <p className="text-xs sm:text-sm text-[#D9E4EC]/80 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>Client: <strong>{appointment.clientName}</strong></span>
              <span>•</span>
              <span>Visit Date: <strong>{appointment.date}</strong></span>
              <span>•</span>
              <span>Specialist: <strong>{appointment.technicianName}</strong></span>
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Score Summary Banner */}
        <div className="p-4 sm:p-6 bg-[#F7FAFC] border-b border-[#D9E4EC] flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="p-3 bg-white rounded-2xl border border-[#D9E4EC] shadow-xs text-center min-w-[100px]">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#294B68] block">
                {liveScore}
                <span className="text-sm font-semibold text-[#64748B]">/50</span>
              </span>
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                {percentage}% Score
              </span>
            </div>

            <div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {badge.label}
              </span>
              <p className="text-xs text-[#64748B] mt-1 hidden md:block">
                Evaluates 25 standardized safety standards (0–2 pts each) across 5 home categories.
              </p>
            </div>
          </div>

          {/* Category Progress Pills */}
          <div className="flex flex-wrap gap-1.5 justify-end">
            {Object.keys(CATEGORY_NAMES).map((catKey) => {
              const cs = categoryScores[catKey] || { score: 10, max: 10 };
              const isActive = activeCategory === catKey;

              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setActiveCategory(catKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isActive
                      ? "bg-[#294B68] text-white border-[#294B68] shadow-xs"
                      : "bg-white text-[#64748B] border-[#D9E4EC] hover:border-[#5E8FB2]"
                  }`}
                >
                  <span>{catKey.split("_")[0]}</span>
                  <span className="ml-1.5 text-[11px] font-extrabold opacity-90">
                    {cs.score}/{cs.max}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Checklist Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {isTemplateLoading || isReportLoading ? (
            <div className="p-16 text-center text-[#64748B] flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#294B68]" />
              <p className="font-bold text-sm text-[#243746]">Loading 50-point checklist...</p>
            </div>
          ) : (
            <form id="assessment-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Category Title */}
              <div className="flex items-center justify-between pb-3 border-b border-[#D9E4EC]">
                <h3 className="text-lg font-extrabold text-[#243746] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#5E8FB2]" />
                  {CATEGORY_NAMES[activeCategory] || activeCategory}
                </h3>
                <span className="text-xs font-bold text-[#64748B]">
                  Category Sub-Score: <strong>{categoryScores[activeCategory]?.score || 0}/10 pts</strong>
                </span>
              </div>

              {/* Questions List for Active Category */}
              <div className="space-y-4">
                {currentCategoryQuestions.map((q, idx) => {
                  const currentScore = responses[q.id]?.scoreValue ?? 2;
                  const currentNotes = responses[q.id]?.notes || "";

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                        currentScore === 2
                          ? "bg-white border-[#D9E4EC]"
                          : currentScore === 1
                          ? "bg-amber-50/40 border-amber-200"
                          : "bg-rose-50/40 border-rose-200"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1 pr-2">
                          <span className="text-xs font-extrabold text-[#5E8FB2] uppercase tracking-wider">
                            Item {q.order} of 25
                          </span>
                          <p className="text-sm font-bold text-[#243746] leading-snug">
                            {q.questionText}
                          </p>
                        </div>

                        {/* 3-State Score Button Pill Selector */}
                        <div className="flex items-center gap-1.5 shrink-0 bg-[#F7FAFC] p-1 rounded-xl border border-[#D9E4EC]">
                          <button
                            type="button"
                            onClick={() => handleScoreChange(q.id, 2)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentScore === 2
                                ? "bg-emerald-600 text-white shadow-2xs"
                                : "text-[#64748B] hover:text-[#243746]"
                            }`}
                          >
                            Safe (2 pts)
                          </button>

                          <button
                            type="button"
                            onClick={() => handleScoreChange(q.id, 1)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentScore === 1
                                ? "bg-amber-600 text-white shadow-2xs"
                                : "text-[#64748B] hover:text-[#243746]"
                            }`}
                          >
                            Concern (1 pt)
                          </button>

                          <button
                            type="button"
                            onClick={() => handleScoreChange(q.id, 0)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentScore === 0
                                ? "bg-rose-600 text-white shadow-2xs"
                                : "text-[#64748B] hover:text-[#243746]"
                            }`}
                          >
                            Hazard (0 pts)
                          </button>
                        </div>
                      </div>

                      {/* Optional Notes Input if flagged or attention needed */}
                      {(currentScore < 2 || currentNotes) && (
                        <div className="pt-2">
                          <input
                            type="text"
                            placeholder="Add specific finding or observation note for this item..."
                            value={currentNotes}
                            onChange={(e) => handleNotesChange(q.id, e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Navigation Between Categories */}
              <div className="flex items-center justify-between pt-4 border-t border-[#D9E4EC]/60">
                <div className="flex items-center gap-2">
                  {Object.keys(CATEGORY_NAMES).map((catKey) => (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setActiveCategory(catKey)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        activeCategory === catKey ? "bg-[#294B68] scale-125" : "bg-[#D9E4EC]"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {activeCategory !== "FIRE_EMERGENCY" ? (
                    <button
                      type="button"
                      onClick={() => {
                        const keys = Object.keys(CATEGORY_NAMES);
                        const nextIdx = keys.indexOf(activeCategory) + 1;
                        if (nextIdx < keys.length) setActiveCategory(keys[nextIdx]);
                      }}
                      className="px-4 py-2 bg-[#EAF3F8] hover:bg-[#D9E4EC] text-[#294B68] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Next Category →
                    </button>
                  ) : (
                    <span className="text-xs text-[#3F8F6B] font-bold">All 5 Categories Reviewed ✓</span>
                  )}
                </div>
              </div>

              {/* Overall Findings & Prioritized Recommendations */}
              <div className="space-y-4 pt-4 border-t border-[#D9E4EC]">
                <div>
                  <label className="block text-xs font-bold text-[#243746] mb-1">
                    Specialist Assessment Summary &amp; General Findings *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full p-3 text-xs sm:text-sm bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#243746] mb-1">
                    Prioritized Safety Recommendations for Resident &amp; Family *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={recommendations}
                    onChange={(e) => setRecommendations(e.target.value)}
                    className="w-full p-3 text-xs sm:text-sm bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] leading-relaxed"
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 bg-[#F7FAFC] border-t border-[#D9E4EC] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div>
            {savedReport && (
              <button
                type="button"
                onClick={() => generateAssessmentPdf(savedReport)}
                className="px-4 py-2.5 bg-white border border-[#D9E4EC] hover:border-[#5E8FB2] text-[#294B68] text-xs font-bold rounded-xl flex items-center gap-2 shadow-2xs cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#5E8FB2]" />
                <span>Download Age Safe® PDF</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-[#64748B] hover:text-[#243746] hover:bg-[#EAF3F8] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="assessment-form"
              disabled={isSubmitting || isTemplateLoading}
              className="px-6 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing Report...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Submit Assessment ({liveScore}/50)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
