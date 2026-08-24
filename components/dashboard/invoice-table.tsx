"use client";

import React, { useState } from "react";
import { Download, FileText, CheckCircle2, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { InvoiceItem } from "@/redux/features/payment/paymentTypes";
import jsPDF from "jspdf";
import { showToast } from "@/lib/alerts/sweetalert";

interface InvoiceTableProps {
  invoices: InvoiceItem[];
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "paid") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EAF3F8] text-[#3F8F6B] border border-[#3F8F6B]/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Paid
        </span>
      );
    }
    if (s === "open" || s === "pending") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-[#C28A3A] border border-amber-200">
          <Clock className="w-3.5 h-3.5" />
          Open / Pending
        </span>
      );
    }
    if (s === "overdue" || s === "failed") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
          <AlertTriangle className="w-3.5 h-3.5" />
          Overdue
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
        {status}
      </span>
    );
  };

  const handleDownloadPdf = async (inv: InvoiceItem) => {
    setDownloadingId(inv.id);

    try {
      // 1. Create crisp vector-based A4 PDF (210mm x 297mm)
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;
      let y = 14;

      // Color Palette constants
      const navy: [number, number, number] = [36, 55, 70]; // #243746
      const darkNavy: [number, number, number] = [41, 75, 104]; // #294B68
      const paleBg: [number, number, number] = [247, 250, 252]; // #F7FAFC
      const borderColor: [number, number, number] = [217, 228, 236]; // #D9E4EC
      const greenText: [number, number, number] = [63, 143, 107]; // #3F8F6B

      // ==========================================
      // DOCUMENT HEADER BANNER
      // ==========================================
      doc.setFillColor(...navy);
      doc.roundedRect(margin, y, contentWidth, 22, 2, 2, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text("AgeWellRI", margin + 6, y + 9);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(190, 220, 240);
      doc.text("In-Home Senior Safety & Wellness Services", margin + 6, y + 16);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text("INVOICE RECEIPT", pageWidth - margin - 6, y + 10, { align: "right" });

      doc.setFontSize(8.5);
      doc.setTextColor(190, 220, 240);
      doc.text(`Statement #${inv.invoiceNumber}`, pageWidth - margin - 6, y + 16, { align: "right" });

      y += 28;

      // ==========================================
      // TWO-COLUMN META: PROVIDER & INVOICE INFO
      // ==========================================
      const colWidth = (contentWidth - 6) / 2;

      // Left Column: Provider Info Box
      doc.setFillColor(...paleBg);
      doc.setDrawColor(...borderColor);
      doc.roundedRect(margin, y, colWidth, 34, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...darkNavy);
      doc.text("SERVICE PROVIDER", margin + 4, y + 6);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...navy);
      doc.text("AgeWellRI LLC", margin + 4, y + 12);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text("84 High Street, Westerly, RI 02891", margin + 4, y + 17);
      doc.text("Phone: (401) 712-3012", margin + 4, y + 22);
      doc.text("Email: billing@agewellri.com", margin + 4, y + 27);
      doc.text("Web: www.agewellri.com", margin + 4, y + 31);

      // Right Column: Invoice Details Box
      doc.setFillColor(...paleBg);
      doc.setDrawColor(...borderColor);
      doc.roundedRect(margin + colWidth + 6, y, colWidth, 34, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...darkNavy);
      doc.text("INVOICE DETAILS", margin + colWidth + 10, y + 6);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text("Invoice Number:", margin + colWidth + 10, y + 12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...navy);
      doc.text(inv.invoiceNumber, margin + colWidth + 40, y + 12);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Issue Date:", margin + colWidth + 10, y + 17);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...navy);
      doc.text(inv.date, margin + colWidth + 40, y + 17);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      const isPaid = inv.status.toLowerCase() === "paid";
      doc.setFont("helvetica", "bold");
      if (isPaid) {
        doc.setTextColor(greenText[0], greenText[1], greenText[2]);
      } else {
        doc.setTextColor(194, 138, 58);
      }
      doc.text(inv.status.toUpperCase(), margin + colWidth + 40, y + 22);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Billing Interval:", margin + colWidth + 10, y + 27);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...navy);
      doc.text("Quarterly Membership", margin + colWidth + 40, y + 27);

      y += 40;

      // ==========================================
      // LINE ITEMS TABLE
      // ==========================================
      doc.setFillColor(...darkNavy);
      doc.roundedRect(margin, y, contentWidth, 8, 1, 1, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text("ITEM & SERVICE DESCRIPTION", margin + 4, y + 5.5);
      doc.text("CYCLE", margin + 120, y + 5.5);
      doc.text("AMOUNT", pageWidth - margin - 4, y + 5.5, { align: "right" });

      y += 8;

      // Table Row
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...borderColor);
      doc.rect(margin, y, contentWidth, 18, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...navy);
      doc.text(inv.description || "AgeWellRI Senior Safety & Wellness Membership", margin + 4, y + 6);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(
        "Includes scheduled safety oversight audits, hazard mitigation check-ins & digital wellness reports",
        margin + 4,
        y + 12
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...navy);
      doc.text("Quarterly", margin + 120, y + 8);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...navy);
      doc.text(inv.amount, pageWidth - margin - 4, y + 8, { align: "right" });

      y += 24;

      // ==========================================
      // FINANCIAL SUMMARY BOX
      // ==========================================
      const summaryWidth = 80;
      const summaryX = pageWidth - margin - summaryWidth;

      doc.setFillColor(...paleBg);
      doc.setDrawColor(...borderColor);
      doc.roundedRect(summaryX, y, summaryWidth, 28, 2, 2, "FD");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text("Subtotal:", summaryX + 4, y + 7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...navy);
      doc.text(inv.amount, pageWidth - margin - 4, y + 7, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Taxes & Surcharges:", summaryX + 4, y + 14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...navy);
      doc.text("$0.00", pageWidth - margin - 4, y + 14, { align: "right" });

      doc.setDrawColor(...borderColor);
      doc.line(summaryX + 4, y + 18, pageWidth - margin - 4, y + 18);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...darkNavy);
      doc.text(isPaid ? "Total Paid:" : "Total Due:", summaryX + 4, y + 24);
      doc.text(inv.amount, pageWidth - margin - 4, y + 24, { align: "right" });

      y += 36;

      // ==========================================
      // STATUTORY & LEGAL DISCLOSURES
      // ==========================================
      doc.setFillColor(...paleBg);
      doc.setDrawColor(...borderColor);
      doc.roundedRect(margin, y, contentWidth, 24, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...navy);
      doc.text("TERMS & NON-MEDICAL SAFETY NOTICE", margin + 4, y + 5.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(
        "AgeWellRI provides certified non-medical in-home safety oversight, hazard checks, and pathway sanitizations.",
        margin + 4,
        y + 11
      );
      doc.text(
        "AgeWellRI is NOT a licensed healthcare agency, skilled nursing facility, or emergency response service.",
        margin + 4,
        y + 16
      );
      doc.text(
        "For billing questions, contact billing@agewellri.com or call our local concierge at (401) 712-3012.",
        margin + 4,
        y + 21
      );

      // Document Footer
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(140, 155, 170);
      doc.text("Official electronic statement generated by AgeWellRI Billing System", pageWidth / 2, 285, {
        align: "center",
      });

      // Save PDF file directly to client's download folder
      const fileName = `AgeWellRI-Invoice-${inv.invoiceNumber}.pdf`;
      doc.save(fileName);

      showToast(`Invoice ${inv.invoiceNumber} downloaded successfully`, "success");
    } catch (err) {
      console.error("Failed to generate invoice PDF:", err);
      showToast("Could not generate PDF receipt", "error");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#243746]">Payment History &amp; Statements</h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Download PDF receipts and track past AgeWellRI quarterly billing statements
          </p>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="p-10 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] text-center space-y-2">
          <FileText className="w-8 h-8 text-[#94A3B8] mx-auto" />
          <p className="text-sm font-bold text-[#243746]">No statements or invoices yet</p>
          <p className="text-xs text-[#64748B]">
            Your quarterly statements and payment receipts will appear here automatically.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#D9E4EC] text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E4EC]/60 text-sm font-medium text-[#243746]">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#F7FAFC] transition-colors">
                    <td className="py-4 px-4">{inv.date}</td>
                    <td className="py-4 px-4 font-mono text-xs text-[#294B68] font-bold">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-4 px-4 text-[#64748B]">{inv.description}</td>
                    <td className="py-4 px-4 font-bold text-[#243746]">{inv.amount}</td>
                    <td className="py-4 px-4">{getStatusBadge(inv.status)}</td>
                    <td className="py-4 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(inv)}
                        disabled={downloadingId === inv.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D9E4EC] text-xs font-bold text-[#294B68] hover:bg-[#EAF3F8] transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                        title="Download Official Invoice PDF"
                      >
                        {downloadingId === inv.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        <span>{downloadingId === inv.id ? "Saving..." : "Download PDF"}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-3">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-4 rounded-2xl border border-[#D9E4EC] bg-[#F7FAFC] space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-[#294B68]">{inv.invoiceNumber}</span>
                  <span className="text-[#64748B]">{inv.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#243746] text-sm">{inv.description}</span>
                  <span className="font-extrabold text-[#243746] text-base">{inv.amount}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#D9E4EC]/60 text-xs">
                  {getStatusBadge(inv.status)}
                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(inv)}
                    disabled={downloadingId === inv.id}
                    className="text-xs font-bold text-[#294B68] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {downloadingId === inv.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>{downloadingId === inv.id ? "Generating PDF..." : "Download PDF"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
