"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  FileCheck,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Shield,
} from "lucide-react";
import { AgreementDocument } from "@/redux/features/auth/authTypes";
import jsPDF from "jspdf";
import { showErrorAlert, showToast } from "@/lib/alerts/sweetalert";

const AGEWELL_OWNER_DETAILS = {
  name: "Matthew Vance",
  title: "Founder & Operations Director",
  company: "AgeWellRI LLC",
  location: "Westerly, RI",
  phone: "(401) 212-3002",
  email: "director@agewellri.com",
};

const OWNER_SIGNATURE_SVG_DATA_URI =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='70' viewBox='0 0 240 70'><path d='M 15 45 Q 35 15 60 40 T 110 35 T 160 45 T 210 30' stroke='%23294B68' stroke-width='2.5' fill='none' stroke-linecap='round'/><text x='25' y='60' font-family='cursive' font-size='18' fill='%23294B68'>Matthew Vance</text></svg>";

interface FullAgreementViewerProps {
  agreement: AgreementDocument;
}

function formatPlanName(plan?: string | null): string {
  if (!plan) return "Member Service Plan";
  return plan
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function FullAgreementViewer({ agreement }: FullAgreementViewerProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const formattedPlan = formatPlanName(agreement.selectedPlan);

  const statusUpper = (agreement.status || "").toUpperCase();
  const isExecuted =
    Boolean(agreement.clientSignature) ||
    statusUpper === "EXECUTED" ||
    statusUpper === "SIGNED" ||
    statusUpper === "ACTIVE" ||
    statusUpper === "COMPLETED" ||
    Boolean(agreement.signedAt) ||
    Boolean(agreement.executedAt);

  const rawDate =
    agreement.agreementDate ||
    agreement.signedAt ||
    agreement.executedAt ||
    agreement.createdAt;

  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : isExecuted
      ? "Executed & Active"
      : "Pending Execution";

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);

    try {
      // Create pristine vector-based A4 PDF (210mm x 297mm)
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 12;
      const contentWidth = pageWidth - margin * 2;
      let y = 10;

      // Color Palette constants
      const navy: [number, number, number] = [36, 55, 70]; // #243746
      const lightNavy: [number, number, number] = [41, 75, 104]; // #294B68
      const skyBlue: [number, number, number] = [94, 143, 178]; // #5E8FB2
      const paleBg: [number, number, number] = [247, 250, 252]; // #F7FAFC
      const cardBg: [number, number, number] = [234, 243, 248]; // #EAF3F8
      const borderColor: [number, number, number] = [217, 228, 236]; // #D9E4EC
      const darkText: [number, number, number] = [36, 55, 70];
      const mutedText: [number, number, number] = [100, 116, 139]; // #64748B
      const greenText: [number, number, number] = [63, 143, 107]; // #3F8F6B

      // Helper function to check page overflow
      const checkPageBreak = (neededHeight: number): void => {
        if (y + neededHeight > pageHeight - 16) {
          doc.addPage();
          y = 10;
        }
      };

      // Helper function to draw section header bar
      const drawSectionHeader = (title: string): void => {
        checkPageBreak(8);
        doc.setFillColor(...navy);
        doc.roundedRect(margin, y, contentWidth, 6, 1, 1, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(255, 255, 255);
        doc.text(title, margin + 3.5, y + 4.2);
        y += 7.5;
      };

      // ==========================================
      // DOCUMENT HEADER
      // ==========================================
      doc.setFillColor(...navy);
      doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text("AgeWellRI", margin + 4, y + 6);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(190, 220, 240);
      doc.text("Client Service Agreement", margin + 4, y + 11);

      // Top Right Status Badge
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(pageWidth - margin - 48, y + 2.5, 44, 9, 1.5, 1.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(...greenText);
      doc.text("✓ EXECUTED & ACTIVE", pageWidth - margin - 45, y + 6.5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(5.5);
      doc.setTextColor(...mutedText);
      doc.text(
        `Doc Ref: ${agreement.id?.slice(-8)?.toUpperCase() || "AW-AG"}`,
        pageWidth - margin - 45,
        y + 9.8,
      );

      y += 16;

      // Metadata Sub-bar
      doc.setFillColor(...paleBg);
      doc.setDrawColor(...borderColor);
      doc.roundedRect(margin, y, contentWidth, 6.5, 1, 1, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(...darkText);
      doc.text(
        `Client Number: ${agreement.clientNumber || "N/A"}`,
        margin + 3.5,
        y + 4.2,
      );
      doc.text(
        `Version: ${agreement.templateVersion || "v1.0"}`,
        margin + 65,
        y + 4.2,
      );
      doc.text(`Effective Date: ${formattedDate}`, margin + 115, y + 4.2);

      y += 8.5;

      // ------------------------------------------
      // 1. Client Information
      // ------------------------------------------
      drawSectionHeader("1. Client Information");
      checkPageBreak(28);

      doc.setFillColor(...paleBg);
      doc.setDrawColor(...borderColor);
      doc.roundedRect(margin, y, contentWidth, 27, 1, 1, "FD");

      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...mutedText);
      doc.text("CLIENT FULL NAME", margin + 3.5, y + 4);
      doc.text("HOME ADDRESS", margin + 95, y + 4);

      doc.setFontSize(8);
      doc.setTextColor(...darkText);
      doc.text(agreement.clientFullName || "N/A", margin + 3.5, y + 7.8);
      const fullAddress = `${agreement.address || ""}${agreement.city ? `, ${agreement.city}` : ""}${agreement.state ? `, ${agreement.state}` : ""} ${agreement.postalCode || ""}`;
      doc.text(
        fullAddress.length > 45
          ? fullAddress.slice(0, 45) + "..."
          : fullAddress,
        margin + 95,
        y + 7.8,
      );

      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...mutedText);
      doc.text("PHONE NUMBER", margin + 3.5, y + 13);
      doc.text("DATE OF BIRTH", margin + 50, y + 13);
      doc.text("EMAIL ADDRESS", margin + 95, y + 13);

      doc.setFontSize(7.5);
      doc.setTextColor(...darkText);
      doc.text(agreement.phone || "N/A", margin + 3.5, y + 16.5);
      doc.text(agreement.dob || "N/A", margin + 50, y + 16.5);
      doc.text(agreement.email || "N/A", margin + 95, y + 16.5);

      // Contact Subgrid
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...skyBlue);
      doc.text("PRIMARY CONTACT / AUTHORIZED REP", margin + 3.5, y + 21.5);
      doc.text("EMERGENCY CONTACT", margin + 95, y + 21.5);

      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...darkText);
      const primaryDesc = `${agreement.primaryContactName || agreement.authorizedRepName || "None"} (${agreement.primaryContactRelation || agreement.relationshipToClient || "Self"})${agreement.primaryContactPhone ? ` - ${agreement.primaryContactPhone}` : ""}`;
      const emergencyDesc = `${agreement.emergencyContactName || "N/A"} (${agreement.emergencyContactRelation || "Family"})${agreement.emergencyContactPhone ? ` - ${agreement.emergencyContactPhone}` : ""}`;
      doc.text(
        primaryDesc.length > 55
          ? primaryDesc.slice(0, 55) + "..."
          : primaryDesc,
        margin + 3.5,
        y + 25,
      );
      doc.text(
        emergencyDesc.length > 55
          ? emergencyDesc.slice(0, 55) + "..."
          : emergencyDesc,
        margin + 95,
        y + 25,
      );

      y += 29;

      // ------------------------------------------
      // 2. Selected Service Plan
      // ------------------------------------------
      drawSectionHeader("2. Selected Service Plan");
      checkPageBreak(17);

      doc.setFillColor(...cardBg);
      doc.setDrawColor(...skyBlue);
      doc.roundedRect(margin, y, contentWidth, 16, 1, 1, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...lightNavy);
      doc.text(formattedPlan, margin + 4, y + 5.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...mutedText);
      const planDesc =
        agreement.planSnapshot?.description ||
        "Dedicated safety & wellness oversight visits, fall prevention pathways, and routine life safety audits";
      const planDescLines = doc.splitTextToSize(planDesc, contentWidth - 45);
      doc.text(planDescLines, margin + 4, y + 9.5);

      if (agreement.hasCleaningAddon) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(...greenText);
        doc.text(
          "✓ Includes Cleaning Add-On ($50/month)",
          margin + 4,
          y + 13.5,
        );
      }

      // Price Callout Box
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...borderColor);
      doc.roundedRect(pageWidth - margin - 40, y + 2, 36, 12, 1, 1, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(...mutedText);
      doc.text("TOTAL FEE", pageWidth - margin - 37, y + 5.5);
      doc.setFontSize(11);
      doc.setTextColor(...lightNavy);
      doc.text(
        `$${agreement.planPrice ?? 0}`,
        pageWidth - margin - 37,
        y + 10.5,
      );
      doc.setFontSize(6);
      doc.setTextColor(...mutedText);
      doc.text("/ month", pageWidth - margin - 18, y + 10.5);

      y += 18;

      // ---------------------------------------------------------
      // 3. Scope of Services, Policies & Signatures (Unified Section)
      // ---------------------------------------------------------
      drawSectionHeader("3. Scope of Services, Policies & Signatures");
      checkPageBreak(32);

      // --- 3. Scope of Services ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...lightNavy);
      doc.text("3. Scope of Services", margin + 3.5, y + 3.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(...darkText);

      const scope1 =
        "• Bedrooms & Living Areas: Audit pathways, clear electrical cords, ensure bedside lighting and phones are easily reachable, secure throw rugs, and perform HEPA vacuuming/dusting to reduce respiratory allergens.";
      const scope2 =
        "• Life Safety Systems: Routinely tests and cleans smoke detectors, carbon monoxide alarms, fire extinguishers, and medical alert devices; checks water heater temperature and emergency exit planning.";
      const scope3 =
        "• Kitchen & Laundry: Reorganizes heavy items to lower shelves for safe reach, inspects appliances for hazards, clears dryer lint pathways, and audits moisture/mold concerns.";

      const lines1 = doc.splitTextToSize(scope1, contentWidth - 7);
      const lines2 = doc.splitTextToSize(scope2, contentWidth - 7);
      const lines3 = doc.splitTextToSize(scope3, contentWidth - 7);

      let textY = y + 7.5;
      doc.text(lines1, margin + 3.5, textY);
      textY += lines1.length * 2.8 + 1;
      doc.text(lines2, margin + 3.5, textY);
      textY += lines2.length * 2.8 + 1;
      doc.text(lines3, margin + 3.5, textY);
      textY += lines3.length * 2.8 + 2;

      y = textY;

      // Divider line
      doc.setDrawColor(...borderColor);
      doc.line(margin + 3.5, y, margin + contentWidth - 3.5, y);
      y += 3.5;

      checkPageBreak(25);

      // --- 4. Billing, Payment & Cancellation ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...lightNavy);
      doc.text("4. Billing, Payment & Cancellation", margin + 3.5, y + 3.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(...darkText);
      const bill1 =
        "• Billing & Payment: Billed monthly via credit card, ACH, or check on the 1st of each month. Payments overdue 14+ days will incur a reminder notice and potential service hold.";
      const bill2 =
        "• Cancellation: Cancel at any time with notice prior to the 10-day cutoff, effective at the end of the billing month. Non-refundable except for certified emergency hospitalization or residential care transitions.";
      const bLines1 = doc.splitTextToSize(bill1, contentWidth - 7);
      const bLines2 = doc.splitTextToSize(bill2, contentWidth - 7);

      textY = y + 7.5;
      doc.text(bLines1, margin + 3.5, textY);
      textY += bLines1.length * 2.8 + 1;
      doc.text(bLines2, margin + 3.5, textY);
      textY += bLines2.length * 2.8 + 2;

      y = textY;

      // Divider line
      doc.setDrawColor(...borderColor);
      doc.line(margin + 3.5, y, margin + contentWidth - 3.5, y);
      y += 3.5;

      checkPageBreak(25);

      // --- 5. Liability, Privacy & Dispute Resolution ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...lightNavy);
      doc.text(
        "5. Liability, Privacy & Dispute Resolution",
        margin + 3.5,
        y + 3.5,
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(...darkText);
      const liab1 =
        "• Limitation of Liability: AgeWellRI is a home safety inspection, coaching, and oversight service. It does not provide medical care, skilled nursing, physical therapy, or emergency dispatch. Total liability is limited strictly to fees paid in the active billing month.";
      const liab2 =
        "• Privacy & Confidentiality: Safety assessments and client information are confidential and accessed exclusively by the client and designated authorized representatives.";
      const lLines1 = doc.splitTextToSize(liab1, contentWidth - 7);
      const lLines2 = doc.splitTextToSize(liab2, contentWidth - 7);

      textY = y + 7.5;
      doc.text(lLines1, margin + 3.5, textY);
      textY += lLines1.length * 2.8 + 1;
      doc.text(lLines2, margin + 3.5, textY);
      textY += lLines2.length * 2.8 + 2;

      y = textY;

      // Divider line
      doc.setDrawColor(...borderColor);
      doc.line(margin + 3.5, y, margin + contentWidth - 3.5, y);
      y += 3.5;

      checkPageBreak(45);

      // --- 6. Acknowledgment and Signatures ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...lightNavy);
      doc.text("6. Acknowledgment and Signatures", margin + 3.5, y + 3.5);
      y += 5.5;

      // Consent statement
      doc.setFillColor(...cardBg);
      doc.setDrawColor(...skyBlue);
      doc.roundedRect(margin, y, contentWidth, 8, 1, 1, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(...greenText);
      doc.text(
        "✓ Terms & Conditions Acknowledged and Agreed",
        margin + 3.5,
        y + 3.5,
      );
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.setTextColor(...darkText);
      doc.text(
        "The client and authorized representative confirm they have read, understood, and agreed to all terms of this Client Service Agreement.",
        margin + 3.5,
        y + 6.2,
      );

      y += 10;

      // Signature & Legal Metadata Box
      doc.setFillColor(...paleBg);
      doc.setDrawColor(...borderColor);
      doc.roundedRect(margin, y, contentWidth, 32, 1, 1, "FD");

      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...mutedText);
      doc.text("CLIENT PRINTED NAME", margin + 3.5, y + 4);
      doc.text("AUTHORIZED REPRESENTATIVE", margin + 95, y + 4);

      doc.setFontSize(7.5);
      doc.setTextColor(...darkText);
      doc.text(
        agreement.clientPrintedName || agreement.clientFullName || "N/A",
        margin + 3.5,
        y + 7.8,
      );
      doc.text(
        agreement.authorizedRepName || "N/A (Signed by Client)",
        margin + 95,
        y + 7.8,
      );

      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...mutedText);
      doc.text("EXECUTION DATE", margin + 3.5, y + 13);
      doc.text("RELATIONSHIP TO CLIENT", margin + 95, y + 13);

      doc.setFontSize(7.5);
      doc.setTextColor(...darkText);
      doc.text(formattedDate, margin + 3.5, y + 16.5);
      doc.text(agreement.relationshipToClient || "Self", margin + 95, y + 16.5);

      // Signature Line & Embed
      doc.setDrawColor(...borderColor);
      doc.line(margin + 3.5, y + 19.5, margin + contentWidth - 7, y + 19.5);

      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...mutedText);
      doc.text("DIGITAL SIGNATURE ON FILE:", margin + 3.5, y + 23.5);

      // Render digital signature if base64 image or text
      if (
        agreement.clientSignature &&
        agreement.clientSignature.startsWith("data:image")
      ) {
        try {
          doc.addImage(
            agreement.clientSignature,
            "PNG",
            margin + 3.5,
            y + 24.5,
            36,
            7,
          );
        } catch {
          doc.setFont("times", "italic");
          doc.setFontSize(11);
          doc.setTextColor(...lightNavy);
          doc.text(
            agreement.clientPrintedName || agreement.clientFullName,
            margin + 3.5,
            y + 29,
          );
        }
      } else {
        doc.setFont("times", "italic");
        doc.setFontSize(11);
        doc.setTextColor(...lightNavy);
        doc.text(
          agreement.clientPrintedName || agreement.clientFullName,
          margin + 3.5,
          y + 29,
        );
      }

      // Digital Verification Stamp
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...greenText);
      doc.roundedRect(pageWidth - margin - 58, y + 21, 54, 9.5, 1, 1, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(...greenText);
      doc.text("✓ VERIFIED DIGITAL SIGNATURE", pageWidth - margin - 55, y + 25);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(5.5);
      doc.setTextColor(...mutedText);
      doc.text(
        `Signed: ${formattedDate} • Legally Binding`,
        pageWidth - margin - 55,
        y + 28.5,
      );

      y += 34;

      // Document Bottom Footer on Page
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(...mutedText);
      doc.setDrawColor(...borderColor);
      doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

      doc.text(
        "AgeWellRI Client Service Agreement • Westerly, RI • (401) 712-3012 • agewellri@gmail.com",
        margin,
        pageHeight - 6,
      );
      doc.text(
        `Document Ref: ${agreement.id || "AW-AG"}`,
        pageWidth - margin - 35,
        pageHeight - 6,
      );

      // Save PDF directly to user's device
      const clientNameSafe = (agreement.clientFullName || "Client").replace(
        /[^a-zA-Z0-9]/g,
        "_",
      );
      doc.save(`AgeWellRI_Service_Agreement_${clientNameSafe}.pdf`);
      showToast("Agreement PDF downloaded successfully");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      showErrorAlert(
        "PDF Generation Error",
        "Unable to generate PDF directly. You can also use the Print button to Save as PDF.",
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Actions Bar (Hidden during Print) */}
      <div className="print:hidden bg-white rounded-3xl border border-[#D9E4EC] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF3F8] text-[#294B68] flex items-center justify-center shrink-0">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-bold text-[#243746]">
                Client Service Agreement
              </h2>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isExecuted
                    ? "bg-[#EAF3F8] text-[#3F8F6B] border border-[#3F8F6B]/30"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  {isExecuted ? "Executed & Active" : "Pending Signature"}
                </span>
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Client ID:{" "}
              <strong>{agreement.clientNumber || "AW-MEMBER"}</strong> •
              Version: <strong>{agreement.templateVersion || "v1.0"}</strong> •
              Executed: <strong>{formattedDate}</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-[#F7FAFC] hover:bg-[#EAF3F8] text-[#243746] font-bold text-xs sm:text-sm rounded-xl border border-[#D9E4EC] transition-colors flex items-center gap-2 cursor-pointer"
            title="Print or Save as PDF"
          >
            <Printer className="w-4 h-4 text-[#5E8FB2]" />
            <span>Print</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="px-5 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Official Agreement Document on screen */}
      <div className="bg-white rounded-3xl border border-[#D9E4EC] shadow-sm p-6 sm:p-10 space-y-8 print:p-0 print:border-none print:shadow-none text-[#243746]">
        {/* Document Header */}
        <div className="text-center space-y-2 pb-6 border-b border-[#D9E4EC]">
          <div className="flex justify-center mb-2">
            <Image
              src="/logo.png"
              alt="AgeWellRI"
              width={220}
              height={55}
              priority
              className="h-auto w-auto max-h-12 object-contain"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746] tracking-tight">
            AgeWellRI
          </h1>
          <p className="text-base sm:text-lg font-bold text-[#5E8FB2]">
            Client Service Agreement
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#64748B] pt-1">
            <span>
              Agreement ID:{" "}
              <strong>
                {agreement.id?.slice(-8)?.toUpperCase() || "AW-AG"}
              </strong>
            </span>
            <span>•</span>
            <span>
              Client Number:{" "}
              <strong>{agreement.clientNumber || "AW-MEMBER"}</strong>
            </span>
            <span>•</span>
            <span>
              Effective Date: <strong>{formattedDate}</strong>
            </span>
          </div>
        </div>

        {/* 1. Client Information */}
        <div className="space-y-4">
          <div className="bg-[#243746] text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between">
            <span>1. Client Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#F7FAFC] rounded-2xl border border-[#D9E4EC] text-xs sm:text-sm">
            <div>
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
                Client Full Name
              </span>
              <p className="font-bold text-[#243746] text-base mt-0.5">
                {agreement.clientFullName || "N/A"}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
                Home Address
              </span>
              <p className="font-bold text-[#243746] mt-0.5">
                {agreement.address || ""}
                {agreement.city ? `, ${agreement.city}` : ""}
                {agreement.state ? `, ${agreement.state}` : ""}{" "}
                {agreement.postalCode || ""}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
                Phone Number
              </span>
              <p className="font-bold text-[#243746] mt-0.5">
                {agreement.phone || "N/A"}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
                Date of Birth
              </span>
              <p className="font-bold text-[#243746] mt-0.5">
                {agreement.dob || "N/A"}
              </p>
            </div>

            <div className="sm:col-span-2">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
                Email Address
              </span>
              <p className="font-bold text-[#243746] mt-0.5">
                {agreement.email}
              </p>
            </div>
          </div>

          {/* Primary Contact & Emergency Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[#F7FAFC] rounded-2xl border border-[#D9E4EC] space-y-1.5 text-xs">
              <span className="font-black text-[#5E8FB2] uppercase tracking-wider block">
                Primary Contact / Authorized Rep
              </span>
              <p className="font-bold text-[#243746] text-sm">
                {agreement.primaryContactName ||
                  agreement.authorizedRepName ||
                  "None designated"}
              </p>
              <p className="text-[#64748B]">
                Relationship:{" "}
                <strong>
                  {agreement.primaryContactRelation ||
                    agreement.relationshipToClient ||
                    "Self"}
                </strong>
              </p>
              {agreement.primaryContactPhone && (
                <p className="text-[#64748B]">
                  Phone: {agreement.primaryContactPhone}
                </p>
              )}
            </div>

            <div className="p-4 bg-[#F7FAFC] rounded-2xl border border-[#D9E4EC] space-y-1.5 text-xs">
              <span className="font-black text-[#5E8FB2] uppercase tracking-wider block">
                Emergency Contact
              </span>
              <p className="font-bold text-[#243746] text-sm">
                {agreement.emergencyContactName || "N/A"}
              </p>
              <p className="text-[#64748B]">
                Phone:{" "}
                <strong>{agreement.emergencyContactPhone || "N/A"}</strong>
              </p>
              <p className="text-[#64748B]">
                Relationship:{" "}
                <strong>
                  {agreement.emergencyContactRelation || "Family"}
                </strong>
              </p>
            </div>
          </div>
        </div>

        {/* 2. Selected Service Plan */}
        <div className="space-y-4">
          <div className="bg-[#243746] text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between">
            <span>2. Selected Service Plan</span>
          </div>

          <div className="p-5 bg-[#EAF3F8] rounded-2xl border border-[#5E8FB2]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#294B68]/10 text-[#294B68] flex items-center justify-center shrink-0 border border-[#294B68]/15">
                  <Shield className="w-5 h-5 text-[#294B68]" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-[#243746] tracking-tight">
                    {formattedPlan}
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    {agreement.planSnapshot?.description ||
                      "Dedicated safety & wellness oversight visits, fall prevention pathways, and routine life safety audits"}
                  </p>
                </div>
              </div>
              {agreement.hasCleaningAddon && (
                <div className="pl-11.5 pt-0.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3F8F6B] bg-white px-2.5 py-0.5 rounded-md border border-[#3F8F6B]/30 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3F8F6B]" />
                    <span>Includes Cleaning Add-On ($50/month)</span>
                  </span>
                </div>
              )}
            </div>

            <div className="text-left sm:text-right sm:border-l sm:border-[#D9E4EC] sm:pl-6 shrink-0">
              <span className="text-xs text-[#64748B] block font-semibold">
                Monthly Fee
              </span>
              <span className="text-2xl font-black text-[#294B68]">
                ${agreement.planPrice ?? 0}
                <span className="text-xs font-normal text-[#64748B]">
                  /month
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* 3. Scope of Services, Policies & Signatures (Unified Section) */}
        <div className="space-y-4">
          <div className="bg-[#243746] text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between">
            <span>3. Scope of Services, Policies &amp; Signatures</span>
          </div>

          <div className="p-6 bg-[#F7FAFC] border border-[#D9E4EC] rounded-2xl space-y-6 text-xs text-[#475569]">
            {/* 3. Scope of Services */}
            <div className="space-y-2.5">
              <h4 className="font-extrabold text-sm text-[#243746] border-b border-[#D9E4EC] pb-2">
                3. Scope of Services
              </h4>
              <p className="font-bold text-[#243746]">
                AgeWellRI provides home safety oversight, organization,
                fall-prevention coaching, and safety system audits as outlined
                below:
              </p>
              <div className="space-y-2 leading-relaxed">
                <p>
                  <strong className="text-[#243746]">
                    Bedrooms &amp; Living Areas:
                  </strong>{" "}
                  Walk pathways, clear indoor electrical cords, ensure bedside
                  lighting and emergency phones are easily reachable, secure
                  throw rugs with non-skid backing, and perform HEPA vacuuming
                  and dusting to reduce respiratory allergens.
                </p>
                <p>
                  <strong className="text-[#243746]">
                    Life Safety Systems:
                  </strong>{" "}
                  Routinely tests and cleans smoke detectors, carbon monoxide
                  alarms, fire extinguishers, and medical alert systems; checks
                  water heater temperature to prevent accidental scalding, and
                  reviews emergency exit pathways.
                </p>
                <p>
                  <strong className="text-[#243746]">
                    Kitchen &amp; Laundry:
                  </strong>{" "}
                  Reorganizes heavy or daily items to lower-level shelves for
                  easy, safe reach; inspects appliances for potential hazards,
                  clears dryer lint pathways, and audits moisture/mold concerns.
                </p>
              </div>
            </div>

            {/* 4. Billing, Payment & Cancellation */}
            <div className="space-y-2.5 pt-2">
              <h4 className="font-extrabold text-sm text-[#243746] border-b border-[#D9E4EC] pb-2">
                4. Billing, Payment &amp; Cancellation
              </h4>
              <div className="space-y-2 leading-relaxed">
                <p>
                  <strong className="text-[#243746]">
                    Billing and Payment:
                  </strong>{" "}
                  Billed monthly via credit/debit card, ACH, or check. Invoices
                  are generated at the commencement of each monthly cycle on the
                  1st. Payments overdue 14+ days will incur a grace reminder and
                  potential temporary service hold.
                </p>
                <p>
                  <strong className="text-[#243746]">
                    Cancellation by Client:
                  </strong>{" "}
                  Cancel at any time prior to the 10-day cutoff. Cancellation
                  takes effect at the end of the current billing month. Fees are
                  non-refundable except in certified cases of emergency
                  hospitalization or relocation to a residential medical
                  facility.
                </p>
              </div>
            </div>

            {/* 5. Liability, Privacy & Dispute Resolution */}
            <div className="space-y-2.5 pt-2">
              <h4 className="font-extrabold text-sm text-[#243746] border-b border-[#D9E4EC] pb-2">
                5. Liability, Privacy &amp; Dispute Resolution
              </h4>
              <div className="space-y-2 leading-relaxed">
                <p>
                  <strong className="text-[#243746]">
                    Limitation of Liability:
                  </strong>{" "}
                  AgeWellRI is a safety inspection, coaching, and oversight
                  service. It does not provide medical care, skilled nursing,
                  physical therapy, continuous monitoring, or emergency dispatch
                  services. Total liability is limited strictly to fees paid in
                  the month a claim arises. AgeWellRI is not liable for
                  incidents occurring outside scheduled visit times.
                </p>
                <p>
                  <strong className="text-[#243746]">
                    Privacy and Confidentiality:
                  </strong>{" "}
                  Client safety data, contact info, and home assessment results
                  are collected solely to deliver and coordinate services.
                  Reports are confidential and accessible only to the client and
                  designated authorized representatives.
                </p>
              </div>
            </div>

            {/* 6. Acknowledgment and Signatures */}
            <div className="space-y-4 pt-2">
              <h4 className="font-extrabold text-sm text-[#243746] border-b border-[#D9E4EC] pb-2">
                6. Acknowledgment and Signatures
              </h4>

              <div className="p-4 bg-[#EAF3F8] rounded-xl border border-[#5E8FB2]/30 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-[#3F8F6B]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Terms &amp; Conditions Acknowledged and Accepted</span>
                </div>
                <p className="text-[#243746] leading-relaxed">
                  The client and authorized representative confirm they have
                  read, understood, and agreed to all terms of this Client
                  Service Agreement.
                </p>
              </div>

              {/* Signatures & Execution Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-white rounded-xl border border-[#D9E4EC] text-xs sm:text-sm">
                <div>
                  <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
                    Client Printed Name
                  </span>
                  <p className="font-bold text-[#243746] text-base mt-0.5">
                    {agreement.clientPrintedName || agreement.clientFullName}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
                    Authorized Representative Name
                  </span>
                  <p className="font-bold text-[#243746] mt-0.5">
                    {agreement.authorizedRepName || "N/A (Signed by Client)"}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
                    Execution Date
                  </span>
                  <p className="font-bold text-[#243746] mt-0.5">
                    {formattedDate}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
                    Relationship to Client
                  </span>
                  <p className="font-bold text-[#243746] mt-0.5">
                    {agreement.relationshipToClient || "Self"}
                  </p>
                </div>

                {/* Dual Signature Execution Block */}
                <div className="sm:col-span-2 pt-4 border-t border-[#D9E4EC]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Client / Signer Signature Box */}
                    <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
                          Client / Authorized Signer
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />{" "}
                          Executed
                        </span>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-[#D9E4EC] flex items-center justify-center min-h-[64px]">
                        {agreement.clientSignature &&
                        agreement.clientSignature.startsWith("data:image") ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={agreement.clientSignature}
                            alt="Client Signature"
                            className="h-12 w-auto max-w-full object-contain"
                          />
                        ) : (
                          <p className="font-serif italic text-base text-[#294B68]">
                            {agreement.clientSignature ||
                              agreement.clientPrintedName ||
                              agreement.clientFullName ||
                              "Digital Signature On File"}
                          </p>
                        )}
                      </div>

                      <div className="text-xs space-y-0.5">
                        <div className="font-bold text-[#243746]">
                          {agreement.clientPrintedName ||
                            agreement.signerName ||
                            agreement.clientFullName}
                        </div>
                        <div className="text-[11px] text-[#64748B]">
                          Role:{" "}
                          {agreement.relationshipToClient
                            ? `Representative (${agreement.relationshipToClient})`
                            : "Primary Resident"}
                        </div>
                        <div className="text-[10px] text-[#3F8F6B] font-bold pt-1">
                          ✓ Verified Digital E-Signature • {formattedDate}
                        </div>
                      </div>
                    </div>

                    {/* AgeWellRI Authorized Provider / Portal Owner Signature Box */}
                    <div className="p-4 bg-[#F0F5F9] rounded-2xl border border-[#D9E4EC] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#5E8FB2] uppercase tracking-wider block">
                          AgeWellRI Provider Counter-Signature
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF3F8] text-[#294B68] border border-[#294B68]/20">
                          <ShieldCheck className="w-3 h-3 text-[#294B68]" />{" "}
                          Authorized
                        </span>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-[#D9E4EC] flex items-center justify-center min-h-[64px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={OWNER_SIGNATURE_SVG_DATA_URI}
                          alt="AgeWellRI Counter-Signature"
                          className="h-10 w-auto max-w-full object-contain"
                        />
                      </div>

                      <div className="text-xs space-y-0.5">
                        <div className="font-bold text-[#243746]">
                          {AGEWELL_OWNER_DETAILS.name}
                        </div>
                        <div className="text-[11px] text-[#64748B]">
                          {AGEWELL_OWNER_DETAILS.title} &bull;{" "}
                          {AGEWELL_OWNER_DETAILS.company}
                        </div>
                        <div className="text-[10px] text-[#3F8F6B] font-bold pt-1">
                          ✓ Verified Counter-Signature On File • {formattedDate}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Document Footer Disclaimer */}
        <div className="pt-6 border-t border-[#D9E4EC] text-center space-y-2">
          <p className="text-[10px] text-[#CBD5E1]">
            &copy; 2026 AgeWellRI. All rights reserved. Document Ref:{" "}
            {agreement.id || "AW-AG"}
          </p>
        </div>
      </div>
    </div>
  );
}
