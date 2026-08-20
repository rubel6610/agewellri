"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminAgreements } from "@/lib/api/admin-api";
import { AdminAgreement } from "@/lib/types/admin";
import { FileText, ShieldCheck, AlertCircle, Send, Download } from "lucide-react";

export default function AgreementsAdminPage() {
  const [agreements, setAgreements] = useState<AdminAgreement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminAgreements().then((data) => {
      setAgreements(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC]">
        Loading service agreements...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#D9E4EC]/60">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
          Service Agreements Lifecycle
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          Monitor AgeWellRI Member Service Agreements, e-signature status, and send signature reminders.
        </p>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#D9E4EC] text-xs font-bold text-[#64748B] uppercase tracking-wider">
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Agreement Document</th>
                <th className="py-3.5 px-4">Version</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Signed Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E4EC]/60 text-sm font-medium text-[#243746]">
              {agreements.map((agr) => {
                const isExecuted = agr.status === "executed" || agr.status === "signed";

                return (
                  <tr key={agr.id} className="hover:bg-[#F7FAFC]">
                    <td className="py-4 px-4 font-bold">
                      <Link href={`/admin/clients/${agr.clientId}`} className="hover:underline">
                        {agr.clientName}
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-[#294B68] font-bold">{agr.title}</td>
                    <td className="py-4 px-4 text-xs font-mono">{agr.version}</td>
                    <td className="py-4 px-4">
                      {isExecuted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAF3F8] text-[#3F8F6B]">
                          <ShieldCheck className="w-3.5 h-3.5" /> Executed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-[#C28A3A]">
                          <AlertCircle className="w-3.5 h-3.5" /> Pending Signature
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-xs text-[#64748B]">
                      {agr.signedDate || "Awaiting Signature"}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {isExecuted ? (
                        <button
                          onClick={() => alert(`Downloading agreement for ${agr.clientName}`)}
                          className="p-2 text-[#294B68] hover:bg-[#EAF3F8] rounded-lg transition-colors cursor-pointer"
                          title="Download Agreement PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => alert(`Signature reminder sent to ${agr.clientName}`)}
                          className="px-3 py-1.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" /> Send Reminder
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
