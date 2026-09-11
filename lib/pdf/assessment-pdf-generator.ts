import jsPDF from "jspdf";
import { ReportItem } from "@/redux/features/report/reportTypes";
import { showToast } from "@/lib/alerts/sweetalert";

/**
 * Generates an official vector-based Age Safe® Home Score™ Assessment PDF
 */
export function generateAssessmentPdf(report: ReportItem): boolean {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    let y = 14;

    // Palette tokens
    const navy: [number, number, number] = [36, 55, 70]; // #243746
    const primaryNavy: [number, number, number] = [41, 75, 104]; // #294B68
    const slateBlue: [number, number, number] = [94, 143, 178]; // #5E8FB2
    const paleBg: [number, number, number] = [247, 250, 252]; // #F7FAFC
    const borderColor: [number, number, number] = [217, 228, 236]; // #D9E4EC
    const greenText: [number, number, number] = [22, 101, 52]; // #166534
    const greenBg: [number, number, number] = [235, 248, 242]; // #EBF8F2
    const amberText: [number, number, number] = [194, 138, 58]; // #C28A3A
    const redText: [number, number, number] = [185, 28, 28]; // #B91C1C

    const score = report.score ?? 45;
    const maxScore = report.maxScore ?? 50;
    const percentage =
      report.percentage ?? Math.round((score / maxScore) * 100);

    // ==========================================
    // 1. HEADER BANNER
    // ==========================================
    doc.setFillColor(...primaryNavy);
    doc.roundedRect(margin, y, contentWidth, 24, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("AgeWellRI", margin + 6, y + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(215, 235, 250);
    doc.text(
      "Comprehensive Senior Home Safety & Care Coordination",
      margin + 6,
      y + 17,
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text("AGE SAFE® HOME SCORE™", pageWidth - margin - 6, y + 10, {
      align: "right",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(215, 235, 250);
    doc.text(
      `Report #${report.reportNumber || "RPT-1001"}`,
      pageWidth - margin - 6,
      y + 17,
      { align: "right" },
    );

    y += 30;

    // ==========================================
    // 2. CLIENT & RESIDENCE SUMMARY
    // ==========================================
    doc.setFillColor(...paleBg);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, 32, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...primaryNavy);
    doc.text("CLIENT & PROPERTY INFORMATION", margin + 6, y + 7);
    doc.text("ASSESSMENT DETAILS", margin + contentWidth / 2 + 6, y + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...navy);

    // Left column
    doc.text(
      `Member Name: ${report.clientName || "Valued Client"}`,
      margin + 6,
      y + 14,
    );
    doc.text(
      `Client ID: ${report.clientNumber || "AW-1001"}`,
      margin + 6,
      y + 20,
    );
    doc.text(
      `Residence: ${report.clientAddress || "Rhode Island"}`,
      margin + 6,
      y + 26,
    );

    // Right column
    doc.text(
      `Inspection Date: ${report.formattedVisitDate || "Recent Visit"}`,
      margin + contentWidth / 2 + 6,
      y + 14,
    );
    doc.text(
      `Care Specialist: ${report.specialistName || "Mark Johnson"}`,
      margin + contentWidth / 2 + 6,
      y + 20,
    );
    doc.text(
      `Service Type: ${report.serviceType || "Home Safety Oversight"}`,
      margin + contentWidth / 2 + 6,
      y + 26,
    );

    y += 38;

    // ==========================================
    // 3. OVERALL SCORE CARD
    // ==========================================
    const isExcellent = score >= 45;
    const isGood = score >= 38 && score < 45;
    const isModerate = score >= 30 && score < 38;

    const badgeBg: [number, number, number] = isExcellent
      ? greenBg
      : isGood
        ? [234, 243, 248]
        : [254, 243, 199];

    const badgeColor: [number, number, number] = isExcellent
      ? greenText
      : isGood
        ? primaryNavy
        : amberText;

    doc.setFillColor(...badgeBg);
    doc.setDrawColor(...borderColor);
    doc.roundedRect(margin, y, contentWidth, 30, 2, 2, "FD");

    // Big score
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...badgeColor);
    doc.text(`${score} / ${maxScore}`, margin + 10, y + 14);

    doc.setFontSize(10);
    doc.text(`${percentage}% Safety Rating`, margin + 10, y + 22);

    // Rating Tier Label
    const tierLabel = isExcellent
      ? "AGE SAFE CERTIFIED™ — EXCELLENT SAFETY RATING"
      : isGood
        ? "GOOD HOME SAFETY — MINOR RECOMMENDATIONS"
        : isModerate
          ? "MODERATE RISK — ACTION RECOMMENDED"
          : "ELEVATED RISK — IMMEDIATE ACTION REQUIRED";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...navy);
    doc.text(tierLabel, margin + 65, y + 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "Comprehensive evaluation of entrance/exit, corridors, bathroom grab bars, lighting, and fire alarms.",
      margin + 65,
      y + 19,
      { maxWidth: contentWidth - 70 },
    );

    y += 36;

    // ==========================================
    // 4. CATEGORY BREAKDOWN TABLE
    // ==========================================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...navy);
    doc.text("5-CATEGORY SAFETY INSPECTION BREAKDOWN", margin, y);
    y += 5;

    // Table Header
    doc.setFillColor(...primaryNavy);
    doc.rect(margin, y, contentWidth, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text("Inspection Area", margin + 4, y + 5.5);
    doc.text("Items Evaluated", margin + 80, y + 5.5);
    doc.text("Points Earned", margin + 125, y + 5.5);
    doc.text("Category Status", pageWidth - margin - 4, y + 5.5, {
      align: "right",
    });

    y += 8;

    const categories = [
      {
        key: "ENTRANCE_EXIT",
        label: "1. Entrance & Exit Walkways",
        defaultScore: 10,
      },
      {
        key: "HALLWAYS_WALKWAYS",
        label: "2. Hallways & Living Areas",
        defaultScore: 10,
      },
      {
        key: "BATHROOMS",
        label: "3. Bathroom Safety & Grab Bars",
        defaultScore: 8,
      },
      {
        key: "LIGHTING_VISIBILITY",
        label: "4. Lighting & Nighttime Visibility",
        defaultScore: 9,
      },
      {
        key: "FIRE_EMERGENCY",
        label: "5. Fire Safety & Emergency Plan",
        defaultScore: 9,
      },
    ];

    doc.setFontSize(8.5);
    categories.forEach((cat, idx) => {
      const catData = report.categoryScores?.[cat.key];
      const catScore = catData?.score ?? cat.defaultScore;
      const catMax = catData?.maxScore ?? 10;
      const isPass = catScore >= 8;

      if (idx % 2 === 0) {
        doc.setFillColor(250, 252, 254);
        doc.rect(margin, y, contentWidth, 8, "F");
      }

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...navy);
      doc.text(cat.label, margin + 4, y + 5.5);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("5 Checklist Standards", margin + 80, y + 5.5);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...navy);
      doc.text(`${catScore} / ${catMax} pts`, margin + 125, y + 5.5);

      doc.setTextColor(...(isPass ? greenText : amberText));
      doc.text(
        isPass ? "PASSED (Safe)" : "ATTENTION NEEDED",
        pageWidth - margin - 4,
        y + 5.5,
        {
          align: "right",
        },
      );

      // Bottom border
      doc.setDrawColor(...borderColor);
      doc.line(margin, y + 8, pageWidth - margin, y + 8);

      y += 8;
    });

    y += 6;

    // ==========================================
    // 5. SPECIALIST FINDINGS & OBSERVATIONS
    // ==========================================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...navy);
    doc.text("SPECIALIST ASSESSMENT SUMMARY & OBSERVATIONS", margin, y);
    y += 5;

    doc.setFillColor(...paleBg);
    doc.roundedRect(margin, y, contentWidth, 24, 2, 2, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...navy);

    const summaryText =
      report.summary ||
      `Comprehensive 50-point inspection completed by ${report.specialistName || "Care Specialist"}. Residence is well-maintained with clear hallways and active safety coverage.`;

    doc.text(summaryText, margin + 5, y + 6, {
      maxWidth: contentWidth - 10,
      lineHeightFactor: 1.4,
    });

    y += 30;

    // ==========================================
    // 6. PRIORITIZED RECOMMENDATIONS
    // ==========================================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...navy);
    doc.text("PRIORITIZED SAFETY RECOMMENDATIONS", margin, y);
    y += 5;

    doc.setFillColor(254, 252, 246);
    doc.setDrawColor(251, 191, 36);
    doc.roundedRect(margin, y, contentWidth, 26, 2, 2, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...navy);

    const recsText =
      report.recommendations ||
      "• Ensure nightlights remain plugged in between bedroom and bathroom.\n• Consider installing a second grab bar inside the main bathtub/shower enclosure.\n• Keep emergency contact sheet and updated physician list posted on refrigerator.";

    doc.text(recsText, margin + 5, y + 6, {
      maxWidth: contentWidth - 10,
      lineHeightFactor: 1.4,
    });

    y += 32;

    // ==========================================
    // 7. LEGAL & NON-MEDICAL DISCLAIMER FOOTER
    // ==========================================
    const footerY = pageHeight - 26;

    doc.setDrawColor(...borderColor);
    doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      "DISCLAIMER: AgeWellRI provides non-medical senior home safety checks, hazard mitigation, and safety oversight coordination. AgeWellRI is not a licensed medical provider or emergency 911 dispatch service. This assessment evaluates home environmental safety at the time of inspection.",
      margin,
      footerY,
      { maxWidth: contentWidth, align: "center", lineHeightFactor: 1.3 },
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...primaryNavy);
    doc.text(
      `AgeWellRI Safety Coordination • (401) 212-3002 • support@agewellri.com • Westerly, Rhode Island`,
      pageWidth / 2,
      footerY + 11,
      { align: "center" },
    );

    // Save & trigger download
    const cleanFilename = `AgeSafe_HomeScore_${(report.clientNumber || "AW-1001").replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(cleanFilename);
    showToast(`Downloaded ${cleanFilename}`);
    return true;
  } catch (err: any) {
    console.error("❌ Failed to generate assessment PDF:", err);
    showToast("Failed to generate PDF document.");
    return false;
  }
}
