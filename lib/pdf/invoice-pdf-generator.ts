import jsPDF from "jspdf";
import { showToast } from "@/lib/alerts/sweetalert";

export interface InvoicePdfData {
  id?: string;
  invoiceNumber: string;
  clientName?: string;
  clientNumber?: string;
  clientId?: string;
  clientEmail?: string;
  planName?: string;
  description?: string;
  amount: string | number;
  billingFrequency?: string;
  paymentMethod?: string;
  status: string;
  date?: string;
  dueDate?: string;
  paidAt?: string | null;
  generatedDate?: string;
  billingMonth?: string;
  billingPeriod?: string;
  pdfUrl?: string;
}

/**
 * Safely parse any date representation (string, Date, timestamp)
 */
function parseDateSafe(dateInput?: string | Date | null): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    return dateInput;
  }
  if (typeof dateInput === "string") {
    const trimmed = dateInput.trim();
    if (
      !trimmed ||
      trimmed === "#" ||
      trimmed === "N/A" ||
      trimmed.toLowerCase() === "undefined" ||
      trimmed.toLowerCase() === "null"
    ) {
      return null;
    }
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
    const cleanStr = trimmed.replace(/,/g, "").replace(/\s+/g, " ");
    const parts = cleanStr.split(/[-/\s]/);
    if (parts.length >= 3) {
      const tryParsed = new Date(cleanStr);
      if (!isNaN(tryParsed.getTime())) return tryParsed;
    }
  }
  return null;
}

/**
 * Gets the ordinal suffix for a day number (e.g. 1st, 2nd, 14th)
 */
function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

/**
 * Generates an official, crisp vector-based PDF receipt/statement for an invoice
 * Clearly displaying the billing payment month and the exact day the invoice payment was generated.
 */
export function generateInvoicePdf(inv: InvoicePdfData): boolean {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    const margin = 14;
    const contentWidth = pageWidth - margin * 2; // 182mm
    let y = 14;

    // Color Palette matching AgeWellRI design tokens
    const navy: [number, number, number] = [36, 55, 70]; // #243746
    const primaryNavy: [number, number, number] = [41, 75, 104]; // #294B68
    const slateBlue: [number, number, number] = [94, 143, 178]; // #5E8FB2
    const paleBg: [number, number, number] = [247, 250, 252]; // #F7FAFC
    const borderColor: [number, number, number] = [217, 228, 236]; // #D9E4EC
    const greenText: [number, number, number] = [22, 101, 52]; // #166534
    const greenBg: [number, number, number] = [235, 248, 242]; // #EBF8F2
    const amberText: [number, number, number] = [194, 138, 58]; // #C28A3A
    const amberBg: [number, number, number] = [254, 243, 199]; // #FEF3C7
    const redText: [number, number, number] = [185, 28, 28]; // #B91C1C
    const redBg: [number, number, number] = [254, 242, 242]; // #FEF2F2

    const normalizedStatus = (inv.status || "paid").toUpperCase();
    const formattedAmount =
      typeof inv.amount === "number"
        ? `$${inv.amount.toFixed(2)}`
        : inv.amount.startsWith("$")
          ? inv.amount
          : `$${inv.amount}`;

    // ==========================================
    // DATE & MONTH COMPUTATION
    // ==========================================
    // 1. Generation / Payment Date (Exact day & date generated)
    const parsedGenDate =
      parseDateSafe(inv.generatedDate) ||
      parseDateSafe(inv.paidAt) ||
      parseDateSafe(inv.date) ||
      parseDateSafe(inv.dueDate) ||
      new Date();

    const formattedGeneratedDate = parsedGenDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }); // e.g. "Sep 14, 2026"

    const formattedGeneratedDateLong = parsedGenDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }); // e.g. "September 14, 2026"

    const generatedDayNum = parsedGenDate.getDate();
    const generatedDayOrdinal = getOrdinalSuffix(generatedDayNum); // e.g. "14th"
    const generatedWeekday = parsedGenDate.toLocaleDateString("en-US", {
      weekday: "long",
    }); // e.g. "Monday"
    const generatedWeekdayShort = parsedGenDate.toLocaleDateString("en-US", {
      weekday: "short",
    }); // e.g. "Mon"
    const generatedDaySubtitle = `Day ${generatedDayNum} (${generatedWeekdayShort})`;

    // 2. Billing Month & Service Period (Which month payment is for)
    let billingMonthName = inv.billingMonth?.trim();
    if (!billingMonthName) {
      billingMonthName = parsedGenDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }); // e.g. "September 2026"
    }

    let periodRangeText = inv.billingPeriod?.trim();
    if (!periodRangeText) {
      const genYear = parsedGenDate.getFullYear();
      const genMonth = parsedGenDate.getMonth();
      const startOfMonth = new Date(genYear, genMonth, 1);
      const endOfMonth = new Date(genYear, genMonth + 1, 0);
      const startFormatted = startOfMonth.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const endFormatted = endOfMonth.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      periodRangeText = `${startFormatted} – ${endFormatted}`; // e.g. "Sep 1 – Sep 30, 2026"
    }

    const rawPlanTitle = inv.planName || inv.description || "Membership Plan";
    const planTitle = rawPlanTitle
      .replace(/ (Membership Statement|Manual Invoice)$/i, "")
      .trim();
    const paymentChannel = inv.paymentMethod || "Credit Card (Auto-Pay)";

    // ==========================================
    // 1. DOCUMENT HEADER BANNER
    // ==========================================
    doc.setFillColor(...primaryNavy);
    doc.roundedRect(margin, y, contentWidth, 26, 2, 2, "F");

    // Brand Name & Subtitle
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("AgeWellRI", margin + 6, y + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(215, 235, 250);
    doc.text("Comprehensive Senior Home Safety Services", margin + 6, y + 17.5);

    // Document Title, Statement #, and Payment Month (Right aligned)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(255, 255, 255);
    doc.text("PAYMENT INVOICE RECEIPT", pageWidth - margin - 6, y + 9.5, {
      align: "right",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(215, 235, 250);
    doc.text(
      `Statement #${inv.invoiceNumber}`,
      pageWidth - margin - 6,
      y + 15.5,
      { align: "right" },
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(254, 240, 138); // Soft warm gold
    doc.text(
      `Payment Month: ${billingMonthName}`,
      pageWidth - margin - 6,
      y + 21.5,
      { align: "right" },
    );

    y += 32;

    // ==========================================
    // 2. BILLED BY & BILLED TO SECTIONS
    // ==========================================
    const colWidth = (contentWidth - 6) / 2; // 88mm
    const boxHeight = 46;

    // Left Box: Billed By (Service Provider)
    doc.setFillColor(...paleBg);
    doc.setDrawColor(...borderColor);
    doc.roundedRect(margin, y, colWidth, boxHeight, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...navy);
    doc.text("Service Provider:", margin + 5, y + 7);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...primaryNavy);
    doc.text("AgeWellRI LLC", margin + 5, y + 13.5, {
      maxWidth: colWidth - 10,
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(90, 110, 130);
    doc.text("Westerly, RI 02903", margin + 5, y + 19.5);
    doc.text("Phone: (401) 212-3002", margin + 5, y + 24.5);
    doc.text("Email: agewellri@gmail.com", margin + 5, y + 29.5);
    doc.text("Service Region: Rhode Island Statewide", margin + 5, y + 34.5);
    doc.text("Licensed Senior Home Safety Care", margin + 5, y + 39.5);

    // Right Box: Billed To (Client Member)
    const rightColX = margin + colWidth + 6;
    doc.setFillColor(...paleBg);
    doc.setDrawColor(...borderColor);
    doc.roundedRect(rightColX, y, colWidth, boxHeight, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...navy);
    doc.text("Billed To (Member):", rightColX + 5, y + 7);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...navy);
    const clientDisplayName = inv.clientName || "Valued Client";
    doc.text(clientDisplayName, rightColX + 5, y + 13.5, {
      maxWidth: colWidth - 10,
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(90, 110, 130);

    let rightY = y + 19.5;
    if (inv.clientNumber) {
      doc.text(`Member ID: ${inv.clientNumber}`, rightColX + 5, rightY, {
        maxWidth: colWidth - 10,
      });
      rightY += 5;
    }
    if (inv.clientEmail) {
      doc.text(`Email: ${inv.clientEmail}`, rightColX + 5, rightY, {
        maxWidth: colWidth - 10,
      });
      rightY += 5;
    } else if (inv.clientId && !inv.clientNumber) {
      doc.text(`Account ID: ${inv.clientId}`, rightColX + 5, rightY, {
        maxWidth: colWidth - 10,
      });
      rightY += 5;
    }
    doc.text(`Service Plan: ${planTitle}`, rightColX + 5, rightY, {
      maxWidth: colWidth - 10,
    });
    rightY += 5;

    // Highlight Payment Month and Generation Day
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryNavy);
    doc.text(`Payment Month: ${billingMonthName}`, rightColX + 5, rightY, {
      maxWidth: colWidth - 10,
    });
    rightY += 5;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(90, 110, 130);
    doc.text(`Generated On: ${formattedGeneratedDate} (${generatedWeekdayShort})`, rightColX + 5, rightY, {
      maxWidth: colWidth - 10,
    });

    y += 52;

    // ==========================================
    // 3. STATEMENT SUMMARY INFO BAR (4 Columns)
    // ==========================================
    const barHeight = 22;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...borderColor);
    doc.roundedRect(margin, y, contentWidth, barHeight, 2, 2, "FD");

    const sectionW = contentWidth / 4; // 45.5mm

    // Draw internal column dividers
    doc.setDrawColor(...borderColor);
    doc.line(margin + sectionW, y + 3, margin + sectionW, y + barHeight - 3);
    doc.line(margin + sectionW * 2, y + 3, margin + sectionW * 2, y + barHeight - 3);
    doc.line(margin + sectionW * 3, y + 3, margin + sectionW * 3, y + barHeight - 3);

    // Col 1: Invoice Number
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(110, 130, 150);
    doc.text("INVOICE NUMBER", margin + 4, y + 5.5);
    doc.setFontSize(8.5);
    doc.setTextColor(...navy);
    doc.text(inv.invoiceNumber, margin + 4, y + 11.5);
    doc.setFontSize(7);
    doc.setTextColor(130, 145, 160);
    doc.text("Official Statement", margin + 4, y + 16.5);

    // Col 2: Payment / Billing Month
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(110, 130, 150);
    doc.text("PAYMENT MONTH", margin + sectionW + 4, y + 5.5);
    doc.setFontSize(8.5);
    doc.setTextColor(...primaryNavy);
    doc.text(billingMonthName, margin + sectionW + 4, y + 11.5, {
      maxWidth: sectionW - 6,
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(130, 145, 160);
    doc.text(periodRangeText, margin + sectionW + 4, y + 16.5, {
      maxWidth: sectionW - 6,
    });

    // Col 3: Invoice Generated Date
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(110, 130, 150);
    doc.text("GENERATED DATE", margin + sectionW * 2 + 4, y + 5.5);
    doc.setFontSize(8.5);
    doc.setTextColor(...navy);
    doc.text(formattedGeneratedDate, margin + sectionW * 2 + 4, y + 11.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(130, 145, 160);
    doc.text(generatedDaySubtitle, margin + sectionW * 2 + 4, y + 16.5);

    // Col 4: Payment Status & Channel
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(110, 130, 150);
    doc.text("STATUS & METHOD", margin + sectionW * 3 + 4, y + 5.5);

    const statusX = margin + sectionW * 3 + 4;
    const statusY = y + 7.5;
    if (normalizedStatus === "PAID") {
      doc.setFillColor(...greenBg);
      doc.setDrawColor(134, 239, 172);
      doc.roundedRect(statusX, statusY, 22, 5.5, 1, 1, "FD");
      doc.setTextColor(...greenText);
      doc.setFontSize(7.5);
      doc.text("PAID ✓", statusX + 11, statusY + 3.8, { align: "center" });
    } else if (
      normalizedStatus === "OVERDUE" ||
      normalizedStatus === "FAILED"
    ) {
      doc.setFillColor(...redBg);
      doc.setDrawColor(254, 202, 202);
      doc.roundedRect(statusX, statusY, 24, 5.5, 1, 1, "FD");
      doc.setTextColor(...redText);
      doc.setFontSize(7.5);
      doc.text("OVERDUE", statusX + 12, statusY + 3.8, { align: "center" });
    } else {
      doc.setFillColor(...amberBg);
      doc.setDrawColor(253, 230, 138);
      doc.roundedRect(statusX, statusY, 22, 5.5, 1, 1, "FD");
      doc.setTextColor(...amberText);
      doc.setFontSize(7.5);
      doc.text("OPEN", statusX + 11, statusY + 3.8, { align: "center" });
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(110, 130, 150);
    doc.text(paymentChannel, statusX, y + 17, {
      maxWidth: sectionW - 8,
    });

    y += 28;

    // ==========================================
    // 4. ITEMIZED CHARGES TABLE
    // ==========================================
    // Table Header
    doc.setFillColor(...primaryNavy);
    doc.rect(margin, y, contentWidth, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("ITEM DESCRIPTION", margin + 4, y + 5.5);
    doc.text("BILLING / PAYMENT MONTH", margin + 90, y + 5.5);
    doc.text("STATUS", margin + 140, y + 5.5);
    doc.text("AMOUNT (USD)", pageWidth - margin - 4, y + 5.5, {
      align: "right",
    });

    y += 8;

    // Item Row
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...borderColor);
    doc.rect(margin, y, contentWidth, 18, "FD");

    // Item Description
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...navy);
    doc.text(planTitle, margin + 4, y + 6, { maxWidth: 82 });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(110, 125, 140);
    doc.text(
      inv.description ||
        "Scheduled monthly safety inspections, fall prevention audits & safety allocations",
      margin + 4,
      y + 11.5,
      { maxWidth: 82 },
    );

    // Billing / Payment Month in Table Row
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...primaryNavy);
    doc.text(billingMonthName, margin + 90, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(110, 125, 140);
    doc.text(periodRangeText, margin + 90, y + 11.5);

    // Status in Table Row
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    if (normalizedStatus === "PAID") {
      doc.setTextColor(...greenText);
      doc.text("PAID ✓", margin + 140, y + 8.5);
    } else if (normalizedStatus === "OVERDUE" || normalizedStatus === "FAILED") {
      doc.setTextColor(...redText);
      doc.text("OVERDUE", margin + 140, y + 8.5);
    } else {
      doc.setTextColor(...amberText);
      doc.text("OPEN", margin + 140, y + 8.5);
    }

    // Amount in Table Row
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...navy);
    doc.text(formattedAmount, pageWidth - margin - 4, y + 8.5, {
      align: "right",
    });

    y += 24;

    // ==========================================
    // 5. SUMMARY OVERVIEW & TOTALS DUAL BOXES
    // ==========================================
    const summaryBoxH = 38;
    const overviewBoxW = 90;
    const totalsBoxW = 86;
    const totalsBoxX = pageWidth - margin - totalsBoxW; // 110mm

    // Left Box: Billing & Service Cycle Overview
    doc.setFillColor(...paleBg);
    doc.setDrawColor(...borderColor);
    doc.roundedRect(margin, y, overviewBoxW, summaryBoxH, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...primaryNavy);
    doc.text("PAYMENT & SERVICE CYCLE OVERVIEW", margin + 4, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(90, 110, 130);

    doc.text("• Payment Month:", margin + 4, y + 12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...navy);
    doc.text(billingMonthName, margin + 31, y + 12);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(90, 110, 130);
    doc.text("• Coverage Period:", margin + 4, y + 17.5);
    doc.setTextColor(...navy);
    doc.text(periodRangeText, margin + 31, y + 17.5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(90, 110, 130);
    doc.text("• Generated Day:", margin + 4, y + 23);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...navy);
    doc.text(`${generatedWeekday}, ${formattedGeneratedDate}`, margin + 31, y + 23);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(90, 110, 130);
    doc.text("• Payment Method:", margin + 4, y + 28.5);
    doc.setTextColor(...navy);
    doc.text(paymentChannel, margin + 31, y + 28.5, { maxWidth: overviewBoxW - 35 });

    doc.setFont("helvetica", "normal");
    doc.setTextColor(90, 110, 130);
    doc.text("• Settlement:", margin + 4, y + 34);
    doc.setFont("helvetica", "bold");
    if (normalizedStatus === "PAID") {
      doc.setTextColor(...greenText);
      doc.text(`Paid & Settled (${generatedDayOrdinal})`, margin + 31, y + 34);
    } else {
      doc.setTextColor(...amberText);
      doc.text("Payment Open / Due", margin + 31, y + 34);
    }

    // Right Box: Totals Summary
    doc.setFillColor(...paleBg);
    doc.setDrawColor(...borderColor);
    doc.roundedRect(totalsBoxX, y, totalsBoxW, summaryBoxH, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(90, 110, 130);
    doc.text("Subtotal:", totalsBoxX + 4, y + 6);
    doc.text(formattedAmount, pageWidth - margin - 4, y + 6, {
      align: "right",
    });

    doc.text("State Sales Tax (0.0%):", totalsBoxX + 4, y + 11.5);
    doc.text("$0.00", pageWidth - margin - 4, y + 11.5, { align: "right" });

    doc.text("Payment Month:", totalsBoxX + 4, y + 17);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryNavy);
    doc.text(billingMonthName, pageWidth - margin - 4, y + 17, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setTextColor(90, 110, 130);
    doc.text("Generated Date:", totalsBoxX + 4, y + 22.5);
    doc.setTextColor(...navy);
    doc.text(formattedGeneratedDate, pageWidth - margin - 4, y + 22.5, { align: "right" });

    doc.setDrawColor(...borderColor);
    doc.line(totalsBoxX + 4, y + 25.5, pageWidth - margin - 4, y + 25.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...navy);
    doc.text(
      normalizedStatus === "PAID" ? "Total Paid (Settled):" : "Total Due:",
      totalsBoxX + 4,
      y + 32.5,
    );

    doc.setFontSize(10.5);
    if (normalizedStatus === "PAID") {
      doc.setTextColor(...greenText);
    } else {
      doc.setTextColor(...navy);
    }
    doc.text(formattedAmount, pageWidth - margin - 4, y + 32.5, {
      align: "right",
    });

    y += 44;

    // ==========================================
    // 6. LEGAL NOTICE & AUDIT FOOTER
    // ==========================================
    doc.setDrawColor(...borderColor);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...navy);
    doc.text("Official Statement & Payment Proof", margin, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(130, 145, 160);
    doc.text(
      `This electronic statement represents an official record of contracted services provided by  AgeWellRI LLCfor the month of ${billingMonthName} (${periodRangeText}).`,
      margin,
      y + 4.5,
    );
    doc.text(
      `Invoice generated on ${formattedGeneratedDateLong} (${generatedDaySubtitle}) for Statement #${inv.invoiceNumber}.`,
      margin,
      y + 8.5,
    );
    doc.text(
      "AgeWellRI provides senior safety oversight, non-medical home safety evaluations, and proactive hazard mitigation across Rhode Island.",
      margin,
      y + 12.5,
    );
    doc.text(
      "For questions regarding this statement, renewal dates, or payment methods, please email agewellri@gmail.com or call (401) 212-3002.",
      margin,
      y + 16.5,
    );

    // Save File with clean filename
    const safeInvoiceNum = inv.invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, "_");
    const safeMonth = billingMonthName.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `AgeWellRI_Invoice_${safeInvoiceNum}_${safeMonth}.pdf`;
    doc.save(filename);
    showToast(`Payment Invoice #${inv.invoiceNumber} (${billingMonthName}) downloaded.`);
    return true;
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    showToast("Failed to generate invoice PDF. Please try again.", "error");
    return false;
  }
}
