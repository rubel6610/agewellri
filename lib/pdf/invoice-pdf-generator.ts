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
 * Generates an official, crisp vector-based PDF receipt/statement matching the exact AgeWellRI format.
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

    // Color Palette matching design
    const navy: [number, number, number] = [27, 54, 93]; // #1B365D Dark Navy
    const greenText: [number, number, number] = [46, 125, 50]; // #2E7D32 Green Tagline
    const darkBody: [number, number, number] = [51, 65, 85]; // #334155 Dark Text
    const mutedText: [number, number, number] = [100, 116, 139]; // #64748B Muted
    const cardBg: [number, number, number] = [234, 243, 248]; // #EAF3F8 Grid Fill
    const borderColor: [number, number, number] = [217, 228, 236]; // #D9E4EC Border

    const rawStatus = (inv.status || "OPEN").toUpperCase();
    const normalizedStatus = rawStatus === "DRAFT" ? "OPEN" : rawStatus;

    const rawAmountNum =
      typeof inv.amount === "number"
        ? inv.amount
        : parseFloat(String(inv.amount).replace(/[^0-9.]/g, "")) || 0;

    const formattedAmount = `$${rawAmountNum.toFixed(2)}`;

    // Determine the target service date for Billing Month & Service Period.
    // In AgeWellRI, service commences on the 1st of the billing month of service (represented by inv.dueDate).
    // If inv.dueDate is not provided, or an invoice is issued/paid prior to the 1st of the upcoming service month (e.g. Sept 28 for Oct 1),
    // the service commencement date is the 1st of the next calendar month.
    const parsedDueDate = parseDateSafe(inv.dueDate);
    const parsedIssueDate =
      parseDateSafe(inv.generatedDate) ||
      parseDateSafe(inv.paidAt) ||
      parseDateSafe(inv.date) ||
      new Date();

    let targetServiceDate: Date;
    if (parsedDueDate) {
      targetServiceDate = parsedDueDate;
    } else if (parsedIssueDate) {
      // If issue/payment date is after the 1st of the month, service starts on the 1st of the next month
      if (parsedIssueDate.getDate() > 1) {
        targetServiceDate = new Date(
          parsedIssueDate.getFullYear(),
          parsedIssueDate.getMonth() + 1,
          1
        );
      } else {
        targetServiceDate = parsedIssueDate;
      }
    } else {
      targetServiceDate = new Date();
    }

    let billingMonthName = inv.billingMonth?.trim();
    if (!billingMonthName) {
      billingMonthName = targetServiceDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }); // e.g. "October 2026"
    }

    let periodRangeText = inv.billingPeriod?.trim();
    if (!periodRangeText) {
      const genYear = targetServiceDate.getFullYear();
      const genMonth = targetServiceDate.getMonth();
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
      periodRangeText = `${startFormatted} – ${endFormatted}`; // e.g. "Oct 1 – Oct 31, 2026"
    }

    // Format Plan Name & Plan Number
    const rawPlanTitle = inv.planName || "Premium Safety Safeguard (Plan 1)";
    const isPlan2 =
      rawPlanTitle.toLowerCase().includes("plan 2") ||
      rawPlanTitle.toLowerCase().includes("independence") ||
      rawAmountNum >= 400;

    let planDisplayTitle = rawPlanTitle;
    if (isPlan2 && !planDisplayTitle.includes("Plan 2")) {
      planDisplayTitle = "Independence & Upkeep (Plan 2)";
    } else if (!isPlan2 && !planDisplayTitle.includes("Plan 1")) {
      planDisplayTitle = "Premium Safety Safeguard (Plan 1)";
    }

    const defaultScopeDesc = isPlan2
      ? "Comprehensive home safety oversight, proactive hazard mitigation, and environmental adjustments"
      : "Scheduled monthly safety inspections, fall-prevention assessments, and minor safety adjustments";

    const itemDescriptionText = inv.description?.trim() || defaultScopeDesc;
    const paymentChannel = inv.paymentMethod || "Credit Card (Auto)";

    // ==========================================
    // 1. TOP HEADER BRANDING
    // ==========================================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...navy);
    doc.text("AgeWellRI", margin, y + 6);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...greenText);
    doc.text("Comprehensive Senior Home Safety Services", margin, y + 12.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...navy);
    doc.text("PAYMENT INVOICE / RECEIPT", margin, y + 21);

    y += 29;

    // ==========================================
    // 2. SERVICE PROVIDER & BILLED TO (2 COLUMNS)
    // ==========================================
    const colWidth = (contentWidth - 10) / 2; // ~86mm
    const rightColX = margin + colWidth + 10;

    // Left Column: Service Provider
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...navy);
    doc.text("Service Provider", margin, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...darkBody);
    doc.text("AgeWellRI LLC", margin, y + 5);
    doc.text("Westerly, RI 02891", margin, y + 9.5);
    doc.text("(401) 212-3002", margin, y + 14);
    doc.text("agewellri@gmail.com", margin, y + 18.5);
    doc.text("Serving Rhode Island Statewide", margin, y + 23);
    doc.text("Certified Senior Home Safety Specialists", margin, y + 27.5);

    // Right Column: Billed To
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...navy);
    doc.text("Billed To", rightColX, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...darkBody);

    const clientDisplayName = inv.clientName || "Valued Member";
    doc.text(clientDisplayName, rightColX, y + 5);
    doc.text(`Member ID: ${inv.clientNumber || "AW-1001"}`, rightColX, y + 9.5);
    doc.text(`Plan: ${planDisplayTitle}`, rightColX, y + 14, {
      maxWidth: colWidth,
    });

    y += 35;

    // ==========================================
    // 3. METADATA 4-COLUMN BOX GRID
    // ==========================================
    const gridHeight = 18;
    doc.setFillColor(...cardBg);
    doc.setDrawColor(...borderColor);
    doc.roundedRect(margin, y, contentWidth, gridHeight, 1.5, 1.5, "FD");

    const col4W = contentWidth / 4; // ~45.5mm

    // Faint Vertical Dividers
    doc.setDrawColor(...borderColor);
    doc.line(margin + col4W, y + 2, margin + col4W, y + gridHeight - 2);
    doc.line(margin + col4W * 2, y + 2, margin + col4W * 2, y + gridHeight - 2);
    doc.line(margin + col4W * 3, y + 2, margin + col4W * 3, y + gridHeight - 2);

    // Col 1: INVOICE
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...mutedText);
    doc.text("INVOICE", margin + 4, y + 5.5);
    doc.setFontSize(9.5);
    doc.setTextColor(...navy);
    doc.text(inv.invoiceNumber, margin + 4, y + 12);

    // Col 2: PAYMENT MONTH
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...mutedText);
    doc.text("PAYMENT MONTH", margin + col4W + 4, y + 5.5);
    doc.setFontSize(9.5);
    doc.setTextColor(...navy);
    doc.text(billingMonthName, margin + col4W + 4, y + 12);

    // Col 3: SERVICE PERIOD
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...mutedText);
    doc.text("SERVICE PERIOD", margin + col4W * 2 + 4, y + 5.5);
    doc.setFontSize(9.5);
    doc.setTextColor(...navy);
    doc.text(periodRangeText, margin + col4W * 2 + 4, y + 12, {
      maxWidth: col4W - 6,
    });

    // Col 4: STATUS & Method
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...mutedText);
    doc.text("STATUS", margin + col4W * 3 + 4, y + 5.5);
    doc.setFontSize(9.5);
    doc.setTextColor(...navy);
    doc.text(normalizedStatus, margin + col4W * 3 + 4, y + 11.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...mutedText);
    doc.text(paymentChannel, margin + col4W * 3 + 4, y + 15.5, {
      maxWidth: col4W - 6,
    });

    y += gridHeight + 7;

    // ==========================================
    // 4. ITEM DESCRIPTION TABLE HEADER BAR
    // ==========================================
    const tableHeaderH = 9;
    doc.setFillColor(...navy);
    doc.rect(margin, y, contentWidth, tableHeaderH, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text("ITEM DESCRIPTION", margin + 4, y + 6);
    doc.text("AMOUNT (USD)", pageWidth - margin - 4, y + 6, {
      align: "right",
    });

    y += tableHeaderH;

    // ==========================================
    // 5. TABLE CONTENT ROW
    // ==========================================
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(36, 55, 70);
    doc.text(planDisplayTitle, margin + 4, y + 4);

    doc.setFontSize(9);
    doc.text(formattedAmount, pageWidth - margin - 4, y + 4, {
      align: "right",
    });

    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...mutedText);
    const itemDescLines = doc.splitTextToSize(
      itemDescriptionText,
      contentWidth - 40,
    );
    doc.text(itemDescLines, margin + 4, y + 3);

    y += itemDescLines.length * 4 + 6;

    // Line divider below item row
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);

    y += 7;

    // ==========================================
    // 6. TOTALS SECTION (Right-aligned)
    // ==========================================
    const totalsXLabel = pageWidth - margin - 50;
    const totalsXValue = pageWidth - margin - 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...darkBody);
    doc.text("Subtotal:", totalsXLabel, y, { align: "right" });
    doc.text(formattedAmount, totalsXValue, y, { align: "right" });

    y += 5.5;
    doc.text("State Sales Tax (0.0%):", totalsXLabel, y, { align: "right" });
    doc.text("$0.00", totalsXValue, y, { align: "right" });

    y += 3.5;
    doc.setDrawColor(226, 232, 240);
    doc.line(totalsXLabel - 25, y, pageWidth - margin, y);

    y += 5.5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...navy);
    const totalLabel = normalizedStatus === "PAID" ? "Total Paid:" : "Total Due:";
    doc.text(totalLabel, totalsXLabel, y, { align: "right" });
    doc.text(formattedAmount, totalsXValue, y, { align: "right" });

    y += 16;

    // ==========================================
    // 7. OFFICIAL STATEMENT FOOTER
    // ==========================================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...navy);
    doc.text("Official Statement", margin, y);

    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);

    const stmtText1 =
      "This electronic statement is an official record of contracted services provided by AgeWellRI LLC. AgeWellRI provides senior home safety oversight, non-medical home safety evaluations, and proactive hazard mitigation across Rhode Island. We are not a medical provider, home health agency, or cleaning service.";
    const stmtLines1 = doc.splitTextToSize(stmtText1, contentWidth);
    doc.text(stmtLines1, margin, y);
    y += stmtLines1.length * 3.8 + 3.5;

    const stmtText2 =
      "Questions about this statement, renewal dates, or payment methods? Email agewellri@gmail.com or call (401) 212-3002.";
    const stmtLines2 = doc.splitTextToSize(stmtText2, contentWidth);
    doc.text(stmtLines2, margin, y);
    y += stmtLines2.length * 3.8 + 6;

    // ==========================================
    // 8. COPYRIGHT FOOTER
    // ==========================================
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "© 2026 AgeWellRI LLC • (401) 212-3002 • agewellri@gmail.com",
      margin,
      y
    );

    // Save PDF
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
