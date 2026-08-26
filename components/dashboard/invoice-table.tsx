"use client";

import React, { useState } from "react";
import { Download, FileText, CheckCircle2, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { InvoiceItem } from "@/redux/features/payment/paymentTypes";
import { TablePagination } from "@/components/ui/table-pagination";
import { generateInvoicePdf } from "@/lib/pdf/invoice-pdf-generator";

interface InvoiceTableProps {
  invoices: InvoiceItem[];
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalItems = invoices.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedInvoices = invoices.slice(startIndex, endIndex);

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
      generateInvoicePdf({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        description: inv.description,
        amount: inv.amount,
        date: inv.date,
        status: inv.status,
        pdfUrl: inv.pdfUrl,
      });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {invoices.length === 0 ? (
        <div className="p-8 text-center bg-[#F7FAFC] rounded-2xl border border-[#D9E4EC] space-y-2">
          <FileText className="w-8 h-8 text-[#5E8FB2] mx-auto opacity-50" />
          <p className="text-sm font-bold text-[#243746]">No statements or invoices yet</p>
          <p className="text-xs text-[#64748B]">
            Your quarterly statements and payment receipts will appear here automatically.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-2xl border border-[#D9E4EC] shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#D9E4EC] text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E4EC]/60 text-sm font-medium text-[#243746]">
                {paginatedInvoices.map((inv) => (
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
            {paginatedInvoices.map((inv) => (
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

          <TablePagination
            currentPage={validCurrentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="invoices"
          />
        </>
      )}
    </div>
  );
}
