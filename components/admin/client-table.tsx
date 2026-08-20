"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, Eye, Calendar, Plus } from "lucide-react";
import { MasterClientRecord } from "@/lib/types/admin";
import { ClientStatusBadge } from "./client-status-badge";

interface ClientTableProps {
  clients: MasterClientRecord[];
  onOpenAddClientModal: () => void;
  onOpenScheduleModal: (clientId: string) => void;
}

export function ClientTable({
  clients,
  onOpenAddClientModal,
  onOpenScheduleModal,
}: ClientTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      client.status === statusFilter ||
      (statusFilter === "onboarding" &&
        (client.status === "agreement_pending" ||
          client.status === "payment_pending" ||
          client.status === "invited"));

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-xs space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by client name, email, or AW-ID..."
            className="w-full h-11 pl-10 pr-4 text-sm text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] placeholder:text-[#94A3B8]"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-3.5 text-xs font-bold text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
          >
            <option value="all">All Client Statuses</option>
            <option value="active">Active</option>
            <option value="onboarding">Need Attention / Onboarding</option>
            <option value="agreement_pending">Agreement Pending</option>
            <option value="payment_failed">Payment Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={onOpenAddClientModal}
            className="h-11 px-4 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#D9E4EC] text-xs font-bold text-[#64748B] uppercase tracking-wider">
              <th className="py-3.5 px-4">Client ID</th>
              <th className="py-3.5 px-4">Client Name</th>
              <th className="py-3.5 px-4">Plan</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Next Visit</th>
              <th className="py-3.5 px-4">Renewal</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9E4EC]/60 text-sm font-medium text-[#243746]">
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#64748B]">
                  No clients match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredClients.map((c) => (
                <tr key={c.id} className="hover:bg-[#F7FAFC] transition-colors">
                  <td className="py-4 px-4 font-mono text-xs font-bold text-[#294B68]">
                    {c.id}
                  </td>
                  <td className="py-4 px-4">
                    <Link
                      href={`/admin/clients/${c.id}`}
                      className="font-bold text-[#243746] hover:text-[#294B68] hover:underline"
                    >
                      {c.firstName} {c.lastName}
                    </Link>
                    <span className="block text-xs text-[#64748B] font-normal">{c.phone}</span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-[#243746]">{c.planName}</td>
                  <td className="py-4 px-4">
                    <ClientStatusBadge status={c.status} />
                  </td>
                  <td className="py-4 px-4 text-xs font-medium text-[#64748B]">
                    {c.nextVisitDate || "Not Scheduled"}
                  </td>
                  <td className="py-4 px-4 text-xs font-medium text-[#64748B]">
                    {c.renewalDate}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onOpenScheduleModal(c.id)}
                        className="p-2 text-[#5E8FB2] hover:bg-[#EAF3F8] rounded-lg transition-colors cursor-pointer"
                        title="Schedule Visit for Client"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/admin/clients/${c.id}`}
                        className="p-2 text-[#294B68] hover:bg-[#EAF3F8] rounded-lg transition-colors"
                        title="View Client Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View */}
      <div className="md:hidden space-y-3">
        {filteredClients.map((c) => (
          <div
            key={c.id}
            className="p-4 rounded-2xl border border-[#D9E4EC] bg-[#F7FAFC] space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#294B68]">{c.id}</span>
              <ClientStatusBadge status={c.status} />
            </div>

            <div>
              <Link
                href={`/admin/clients/${c.id}`}
                className="font-bold text-[#243746] text-base hover:underline"
              >
                {c.firstName} {c.lastName}
              </Link>
              <p className="text-xs text-[#64748B] mt-0.5">{c.planName} • {c.phone}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#D9E4EC]/60 text-xs">
              <span className="text-[#64748B]">Next Visit: <strong>{c.nextVisitDate || "None"}</strong></span>
              <Link
                href={`/admin/clients/${c.id}`}
                className="font-bold text-[#294B68] flex items-center gap-1 hover:underline"
              >
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
