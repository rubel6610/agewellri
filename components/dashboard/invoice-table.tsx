"use client";

import React from "react";
import { Download, FileText, CheckCircle2, Clock, AlertTriangle, ExternalLink } from "lucide-react";
import { InvoiceItem } from "@/redux/features/payment/paymentTypes";

interface InvoiceTableProps {
  invoices: InvoiceItem[];
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
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

  const handleOpenPdf = (inv: InvoiceItem) => {
    if (inv.pdfUrl && inv.pdfUrl !== "#") {
      window.open(inv.pdfUrl, "_blank");
    } else {
      // Print/view invoice window
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>AgeWellRI Invoice ${inv.invoiceNumber}</title>
              <style>
                body { font-family: Inter, sans-serif; padding: 40px; color: #243746; }
                .header { border-bottom: 2px solid #294B68; padding-bottom: 20px; }
                .title { font-size: 24px; font-weight: bold; color: #294B68; }
                .meta { margin-top: 20px; font-size: 14px; line-height: 1.6; }
                .table { width: 100%; border-collapse: collapse; margin-top: 30px; }
                .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #D9E4EC; }
                .table th { background: #F8FAFC; font-weight: bold; }
                .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; color: #294B68; }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="title">AgeWellRI — Invoice Receipt</div>
                <div>Westerly, Rhode Island • (401) 712-3012</div>
              </div>
              <div class="meta">
                <div><strong>Invoice Number:</strong> ${inv.invoiceNumber}</div>
                <div><strong>Issue Date:</strong> ${inv.date}</div>
                <div><strong>Status:</strong> ${inv.status.toUpperCase()}</div>
              </div>
              <table class="table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th style="text-align: right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${inv.description}</td>
                    <td style="text-align: right;">${inv.amount}</td>
                  </tr>
                </tbody>
              </table>
              <div class="total">Total Paid: ${inv.amount}</div>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
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
                        onClick={() => handleOpenPdf(inv)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D9E4EC] text-xs font-bold text-[#294B68] hover:bg-[#EAF3F8] transition-colors cursor-pointer"
                        title="Download Invoice PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
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
                    onClick={() => handleOpenPdf(inv)}
                    className="text-xs font-bold text-[#294B68] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download PDF
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
