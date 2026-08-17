"use client";

import React from "react";
import { Download, FileText, CheckCircle2 } from "lucide-react";
import { Invoice } from "@/lib/types/dashboard";

interface InvoiceTableProps {
  invoices: Invoice[];
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#243746]">Payment History &amp; Invoices</h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Download receipts and view past AgeWellRI statements
          </p>
        </div>
      </div>

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
              <th className="py-3 px-4 text-right">Action</th>
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
                <td className="py-4 px-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAF3F8] text-[#3F8F6B]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Paid
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <button
                    onClick={() => alert(`Downloading invoice ${inv.invoiceNumber}`)}
                    className="p-2 text-[#294B68] hover:bg-[#EAF3F8] rounded-lg transition-colors cursor-pointer"
                    title="Download Invoice PDF"
                  >
                    <Download className="w-4 h-4" />
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
            className="p-4 rounded-xl border border-[#D9E4EC] bg-[#F7FAFC] space-y-2"
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
              <span className="inline-flex items-center gap-1 font-bold text-[#3F8F6B]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Paid
              </span>
              <button
                onClick={() => alert(`Downloading invoice ${inv.invoiceNumber}`)}
                className="text-xs font-bold text-[#294B68] flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
