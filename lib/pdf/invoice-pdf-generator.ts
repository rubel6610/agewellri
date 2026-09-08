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
  pdfUrl?: string;
}

/**
 * Generates an official, crisp vector-based PDF receipt/statement for an invoice
 */
export function generateInvoicePdf(inv: InvoicePdfData): boolean {
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

    // Color Palette matching AgeWellRI design tokens
    const navy: [number, number, number] = [36, 55, 70]; // #243746
    const primaryNavy: [number, number, number] = [41, 75, 104]; // #294B68
    const slateBlue: [number, number, number] = [94, 143, 178]; // #5E8FB2
    const paleBg: [number, number, number] = [247, 250, 252]; // #F7FAFC
    const borderColor: [number, number, number] = [217, 228, 236]; // #D9E4EC
    const greenText: [number, number, number] = [22, 101, 52]; // #166534
    const greenBg: [number, number, number] = [235, 248, 242]; // #EBF8F2
    const amberText: [number, number, number] = [194, 138, 58]; // #C28A3A
    const redText: [number, number, number] = [185, 28, 28]; // #B91C1C

    const normalizedStatus = (inv.status || "paid").toUpperCase();
    const formattedAmount =
      typeof inv.amount === "number"
        ? `$${inv.amount.toFixed(2)}`
        : inv.amount.startsWith("$")
        ? inv.amount
        : `$${inv.amount}`;

    const invoiceDate = inv.date || inv.paidAt || inv.dueDate || new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const planTitle = inv.planName || inv.description || "Guardian Plus Plan";
    const paymentChannel = inv.paymentMethod || "Credit Card (Auto-Pay)";

    // ==========================================
    // 1. DOCUMENT HEADER BANNER
    // ==========================================
    doc.setFillColor(...primaryNavy);
    doc.roundedRect(margin, y, contentWidth, 24, 2, 2, "F");

    // Brand Name & Subtitle
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("AgeWellRI", margin + 6, y + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(215, 235, 250);
    doc.text("Comprehensive Senior Safety & Home Wellness Services", margin + 6, y + 17);

    // Document Title & Number (Right aligned)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text("PAYMENT INVOICE RECEIPT", pageWidth - margin - 6, y + 10, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(215, 235, 250);
    doc.text(`Statement #${inv.invoiceNumber}`, pageWidth - margin - 6, y + 17, { align: "right" });

    y += 30;

    // ==========================================
    // 2. BILLED BY & BILLED TO SECTIONS
    // ==========================================
    const colWidth = (contentWidth - 6) / 2;

    // Left Box: Billed By (Service Provider)
    doc.setFillColor(...paleBg);
    doc.setDrawColor(...borderColor);
    doc.roundedRect(margin, y, colWidth, 42, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...navy);
    doc.text("Service Provider:", margin + 5, y + 7);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...primaryNavy);
    doc.text("AgeWellRI Care Management LLC", margin + 5, y + 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(90, 110, 130);
    doc.text("100 Westminster Street, Suite 400", margin + 5, y + 20);
    doc.text("Providence, RI 02903", margin + 5, y + 25);
    doc.text("Phone: (401) 555-0199", margin + 5, y + 30);
    doc.text("Email: billing@agewellri.com", margin + 5, y + 35);

    // Right Box: Billed To (Client Member)
    const rightColX = margin + colWidth + 6;
    doc.setFillColor(...paleBg);
    doc.setDrawColor(...borderColor);
    doc.roundedRect(rightColX, y, colWidth, 42, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...navy);
    doc.text("Billed To (Member):", rightColX + 5, y + 7);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...navy);
    doc.text(inv.clientName || "Valued Client", rightColX + 5, y + 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(90, 110, 130);
    if (inv.clientNumber) {
      doc.text(`Member ID: ${inv.clientNumber}`, rightColX + 5, y + 20);
    }
    if (inv.clientEmail) {
      doc.text(`Email: ${inv.clientEmail}`, rightColX + 5, y + 25);
    }
    if (inv.clientId && !inv.clientNumber) {
      doc.text(`Account ID: ${inv.clientId}`, rightColX + 5, y + 25);
    }
    doc.text(`Service Region: Rhode Island / Connecticut`, rightColX + 5, y + 30);
    doc.text(`Service Plan: ${planTitle}`, rightColX + 5, y + 35);

    y += 48;

    // ==========================================
    // 3. STATEMENT SUMMARY INFO BAR
    // ==========================================
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...borderColor);
    doc.roundedRect(margin, y, contentWidth, 18, 2, 2, "FD");

    const sectionW = contentWidth / 4;

    // Col 1: Invoice Number
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(110, 130, 150);
    doc.text("INVOICE NUMBER", margin + 4, y + 6);
    doc.setFontSize(8.5);
    doc.setTextColor(...navy);
    doc.text(inv.invoiceNumber, margin + 4, y + 12);

    // Col 2: Issue Date
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(110, 130, 150);
    doc.text("ISSUE DATE", margin + sectionW + 4, y + 6);
    doc.setFontSize(8.5);
    doc.setTextColor(...navy);
    doc.text(invoiceDate, margin + sectionW + 4, y + 12);

    // Col 3: Payment Method
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(110, 130, 150);
    doc.text("PAYMENT CHANNEL", margin + sectionW * 2 + 4, y + 6);
    doc.setFontSize(8.5);
    doc.setTextColor(...navy);
    doc.text(paymentChannel, margin + sectionW * 2 + 4, y + 12);

    // Col 4: Status Badge
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(110, 130, 150);
    doc.text("STATUS", margin + sectionW * 3 + 4, y + 6);

    const statusX = margin + sectionW * 3 + 4;
    const statusY = y + 8;
    if (normalizedStatus === "PAID") {
      doc.setFillColor(...greenBg);
      doc.setDrawColor(134, 239, 172);
      doc.roundedRect(statusX, statusY, 24, 6, 1, 1, "FD");
      doc.setTextColor(...greenText);
      doc.setFontSize(8);
      doc.text("PAID ✓", statusX + 12, statusY + 4.2, { align: "center" });
    } else if (normalizedStatus === "OVERDUE" || normalizedStatus === "FAILED") {
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(254, 202, 202);
      doc.roundedRect(statusX, statusY, 24, 6, 1, 1, "FD");
      doc.setTextColor(...redText);
      doc.setFontSize(8);
      doc.text("OVERDUE", statusX + 12, statusY + 4.2, { align: "center" });
    } else {
      doc.setFillColor(254, 243, 199);
      doc.setDrawColor(253, 230, 138);
      doc.roundedRect(statusX, statusY, 24, 6, 1, 1, "FD");
      doc.setTextColor(...amberText);
      doc.setFontSize(8);
      doc.text("OPEN", statusX + 12, statusY + 4.2, { align: "center" });
    }

    y += 24;

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
    doc.text("CYCLE / PERIOD", margin + 95, y + 5.5);
    doc.text("STATUS", margin + 140, y + 5.5);
    doc.text("AMOUNT (USD)", pageWidth - margin - 4, y + 5.5, { align: "right" });

    y += 8;

    // Item Row
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...borderColor);
    doc.rect(margin, y, contentWidth, 16, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...navy);
    doc.text(planTitle, margin + 4, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(110, 125, 140);
    doc.text(
      inv.description || "Scheduled safety inspections, fall prevention audits & wellness allocations",
      margin + 4,
      y + 11.5
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(90, 110, 130);
    doc.text(inv.billingFrequency || "Quarterly Care Cycle", margin + 95, y + 9);
    doc.text(normalizedStatus, margin + 140, y + 9);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...navy);
    doc.text(formattedAmount, pageWidth - margin - 4, y + 9, { align: "right" });

    y += 22;

    // ==========================================
    // 5. TOTALS SUMMARY BOX
    // ==========================================
    const summaryW = 80;
    const summaryX = pageWidth - margin - summaryW;

    doc.setFillColor(...paleBg);
    doc.setDrawColor(...borderColor);
    doc.roundedRect(summaryX, y, summaryW, 28, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(90, 110, 130);
    doc.text("Subtotal:", summaryX + 4, y + 6.5);
    doc.text(formattedAmount, pageWidth - margin - 4, y + 6.5, { align: "right" });

    doc.text("State Sales Tax (0.0%):", summaryX + 4, y + 12.5);
    doc.text("$0.00", pageWidth - margin - 4, y + 12.5, { align: "right" });

    doc.setDrawColor(...borderColor);
    doc.line(summaryX + 4, y + 16, pageWidth - margin - 4, y + 16);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...navy);
    doc.text(normalizedStatus === "PAID" ? "Total Paid (Settled):" : "Total Due:", summaryX + 4, y + 23);

    doc.setFontSize(10);
    if (normalizedStatus === "PAID") {
      doc.setTextColor(...greenText);
    } else {
      doc.setTextColor(...navy);
    }
    doc.text(formattedAmount, pageWidth - margin - 4, y + 23, { align: "right" });

    y += 38;

    // ==========================================
    // 6. LEGAL NOTICE & AUDIT FOOTER
    // ==========================================
    doc.setDrawColor(...borderColor);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...navy);
    doc.text("Official Statement & Payment Proof", margin, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(130, 145, 160);
    doc.text(
      "This electronic statement represents an official record of contracted services provided by AgeWellRI Care Management LLC.",
      margin,
      y + 4.5
    );
    doc.text(
      "AgeWellRI provides senior safety oversight, non-medical home evaluations, and preventative maintenance support.",
      margin,
      y + 8.5
    );
    doc.text(
      "For questions regarding this statement, renewal dates, or payment methods, please email billing@agewellri.com or call (401) 555-0199.",
      margin,
      y + 12.5
    );

    // Save File with clean filename
    const safeInvoiceNum = inv.invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, "_");
    const filename = `AgeWellRI_Invoice_${safeInvoiceNum}.pdf`;
    doc.save(filename);
    showToast(`Payment Invoice #${inv.invoiceNumber} downloaded.`);
    return true;
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    showToast("Failed to generate invoice PDF. Please try again.", "error");
    return false;
  }
}
