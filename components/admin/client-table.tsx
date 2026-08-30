"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  Eye,
  Calendar,
  Plus,
  ShieldCheck,
  AlertCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { MasterClientRecord } from "@/redux/features/client/clientApi";
import { ClientStatusBadge } from "./client-status-badge";
import { TablePagination } from "@/components/ui/table-pagination";

interface ClientTableProps {
  clients: MasterClientRecord[];
  isLoading?: boolean;
  onOpenAddClientModal: () => void;
  onOpenScheduleModal: (clientId: string) => void;
}

export function ClientTable({
  clients,
  isLoading = false,
  onOpenAddClientModal,
  onOpenScheduleModal,
}: ClientTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Reset to page 1 on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, stateFilter, statusFilter, pageSize]);

  const filteredClients = clients.filter((client) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      client.firstName.toLowerCase().includes(term) ||
      client.lastName.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term) ||
      client.id.toLowerCase().includes(term) ||
      (client.state && client.state.toLowerCase().includes(term));

    const matchesState = stateFilter === "ALL" || client.state === stateFilter;

    const isExecuted = client.agreementStatus === "EXECUTED" || client.agreementStatus === "SIGNED";
    const isPaid = client.paymentStatus === "PAID";

    const matchesStatus =
      statusFilter === "ALL" ||
      client.status === statusFilter ||
      (statusFilter === "agreement_signed_payment_pending" && isExecuted && !isPaid) ||
      (statusFilter === "active" && isExecuted && isPaid) ||
      (statusFilter === "agreement_pending" && !isExecuted) ||
      (statusFilter === "agreement_executed" && isExecuted) ||
      (statusFilter === "payment_pending" && !isPaid);

    return matchesSearch && matchesState && matchesStatus;
  });

  // KPI Quick Filter Counters
  const totalCount = clients.length;
  const activeCount = clients.filter(
    (c) => (c.agreementStatus === "EXECUTED" || c.agreementStatus === "SIGNED") && c.paymentStatus === "PAID"
  ).length;
  const agreementSignedPaymentPendingCount = clients.filter(
    (c) => (c.agreementStatus === "EXECUTED" || c.agreementStatus === "SIGNED") && c.paymentStatus !== "PAID"
  ).length;
  const pendingAgreementCount = clients.filter(
    (c) => c.agreementStatus !== "EXECUTED" && c.agreementStatus !== "SIGNED"
  ).length;

  const totalItems = filteredClients.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedClients = filteredClients.slice(startIndex, endIndex);

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-xs space-y-6">
      {/* Quick Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-[#D9E4EC]/60">
        <button
          type="button"
          onClick={() => setStatusFilter("ALL")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            statusFilter === "ALL"
              ? "bg-[#294B68] text-white shadow-2xs"
              : "bg-[#F7FAFC] border border-[#D9E4EC] text-[#64748B] hover:text-[#243746]"
          }`}
        >
          <span>All Clients</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
            statusFilter === "ALL" ? "bg-white/20 text-white" : "bg-[#EAF3F8] text-[#294B68]"
          }`}>
            {totalCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("active")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            statusFilter === "active"
              ? "bg-[#166534] text-white shadow-2xs"
              : "bg-[#F7FAFC] border border-[#D9E4EC] text-[#64748B] hover:text-[#166534]"
          }`}
        >
          <span>Active Members</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
            statusFilter === "active" ? "bg-white/20 text-white" : "bg-[#EBF8F2] text-[#166534]"
          }`}>
            {activeCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("agreement_signed_payment_pending")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            statusFilter === "agreement_signed_payment_pending"
              ? "bg-[#C28A3A] text-white shadow-2xs"
              : "bg-amber-50/60 border border-amber-200 text-amber-800 hover:bg-amber-100/60"
          }`}
          title="Clients who signed the agreement but have not yet submitted payment or activated subscription"
        >
          <span>Agreement Signed (Payment Pending)</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
            statusFilter === "agreement_signed_payment_pending" ? "bg-white/20 text-white" : "bg-amber-200 text-amber-900"
          }`}>
            {agreementSignedPaymentPendingCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("agreement_pending")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            statusFilter === "agreement_pending"
              ? "bg-[#294B68] text-white shadow-2xs"
              : "bg-[#F7FAFC] border border-[#D9E4EC] text-[#64748B] hover:text-[#243746]"
          }`}
        >
          <span>Pending Signature</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
            statusFilter === "agreement_pending" ? "bg-white/20 text-white" : "bg-[#F0F5F9] text-[#64748B]"
          }`}>
            {pendingAgreementCount}
          </span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search clients by name, email, ID..."
              className="w-full h-11 pl-10 pr-4 text-sm text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="h-11 px-3.5 text-xs font-bold text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
            >
              <option value="ALL">Rhode Island (RI)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 px-3.5 text-xs font-bold text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
            >
              <option value="ALL">All Statuses</option>
              <option value="active">Active Members</option>
              <option value="agreement_signed_payment_pending">Agreement Signed (Payment Pending)</option>
              <option value="agreement_pending">Agreement Pending Signature</option>
              <option value="agreement_executed">Agreement Executed</option>
              <option value="payment_pending">Payment Pending</option>
            </select>
          </div>
        </div>

        <button
          onClick={onOpenAddClientModal}
          className="px-4 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#D9E4EC] text-xs font-bold text-[#64748B] uppercase tracking-wider">
              <th className="py-3.5 px-4">Client</th>
              <th className="py-3.5 px-4">State</th>
              <th className="py-3.5 px-4">Signer / Rep</th>
              <th className="py-3.5 px-4">Agreement</th>
              <th className="py-3.5 px-4">Payment</th>
              <th className="py-3.5 px-4">Visits</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9E4EC]/60 text-sm font-medium text-[#243746]">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-4 space-y-2">
                    <div className="h-4 bg-[#E2E8F0] rounded-md w-32"></div>
                    <div className="h-3 bg-[#F1F5F9] rounded-md w-44"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-5 bg-[#E2E8F0] rounded-md w-12"></div>
                  </td>
                  <td className="py-4 px-4 space-y-1.5">
                    <div className="h-4 bg-[#E2E8F0] rounded-md w-24"></div>
                    <div className="h-3 bg-[#F1F5F9] rounded-md w-16"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-5 bg-[#E2E8F0] rounded-full w-24"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-5 bg-[#E2E8F0] rounded-full w-20"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-[#E2E8F0] rounded-md w-14"></div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="h-8 bg-[#E2E8F0] rounded-xl w-24 ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : paginatedClients.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#64748B]">
                  No clients match your filter criteria.
                </td>
              </tr>
            ) : (
              paginatedClients.map((c) => {
                const isExecuted = c.agreementStatus === "EXECUTED" || c.agreementStatus === "SIGNED";
                const isEligibleToSchedule = isExecuted && c.paymentStatus === "PAID";

                return (
                  <tr key={c.id} className="hover:bg-[#F7FAFC] transition-colors">
                    {/* Client Name & ID */}
                    <td className="py-4 px-4 font-bold">
                      <Link
                        href={`/admin/clients/${c.id}`}
                        className="hover:underline text-[#243746] block text-sm"
                      >
                        {c.firstName} {c.lastName}
                      </Link>
                      <span className="block text-xs font-mono text-[#64748B] font-normal">
                        {c.id} • {c.email}
                      </span>
                    </td>

                    {/* State */}
                    <td className="py-4 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-bold bg-[#F0F5F9] text-[#294B68]">
                        {c.state || "RI"}
                      </span>
                    </td>

                    {/* Signer / Relationship */}
                    <td className="py-4 px-4 text-xs">
                      <div className="font-bold text-[#243746]">
                        {c.signerRole === "CLIENT" ? "Self (Client)" : "Representative"}
                      </div>
                      <div className="text-[#64748B] capitalize">
                        {c.legalAuthority ? c.legalAuthority.replace(/_/g, " ") : c.signerRole?.replace(/_/g, " ").toLowerCase() || "Self"}
                      </div>
                    </td>

                    {/* Agreement Status */}
                    <td className="py-4 px-4">
                      {isExecuted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EBF8F2] text-[#166534]">
                          <ShieldCheck className="w-3.5 h-3.5" /> Executed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-[#C28A3A]">
                          <AlertCircle className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </td>

                    {/* Payment Status */}
                    <td className="py-4 px-4">
                      {c.paymentStatus === "PAID" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAF3F8] text-[#3F8F6B]">
                          <ShieldCheck className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-[#C28A3A]">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </td>

                    {/* Visits Remaining */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#294B68]">
                        <span className={`w-2 h-2 rounded-full ${c.remainingVisitsCount > 0 ? "bg-[#5E8FB2]" : "bg-slate-300"}`}></span>
                        {c.remainingVisitsCount} / {c.totalVisitsAllowed} left
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isEligibleToSchedule ? (
                          <button
                            onClick={() => onOpenScheduleModal(c.id)}
                            className="p-2 text-[#294B68] hover:bg-[#EAF3F8] rounded-xl transition-colors cursor-pointer"
                            title="Schedule Visit"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            disabled
                            className="p-2 text-slate-300 rounded-xl cursor-not-allowed"
                            title="Scheduling unavailable: Agreement or payment pending"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                        )}
                        <Link
                          href={`/admin/clients/${c.id}`}
                          className="p-2 text-[#294B68] hover:bg-[#EAF3F8] rounded-xl transition-colors"
                          title="View Client Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-[#64748B]">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#294B68]" />
            Loading clients...
          </div>
        ) : paginatedClients.length === 0 ? (
          <div className="py-8 text-center text-[#64748B]">No clients found.</div>
        ) : (
          paginatedClients.map((c) => {
            const isExecuted = c.agreementStatus === "EXECUTED" || c.agreementStatus === "SIGNED";
            const isEligibleToSchedule = isExecuted && c.paymentStatus === "PAID";

            return (
              <div
                key={c.id}
                className="p-5 rounded-2xl border border-[#D9E4EC] bg-[#F7FAFC] space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-base text-[#243746]">
                      {c.firstName} {c.lastName}
                    </h4>
                    <p className="text-xs text-[#64748B] font-mono">{c.id} • {c.email}</p>
                  </div>
                  <ClientStatusBadge status={c.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#D9E4EC]/60">
                  <div>
                    <span className="text-[#64748B] block">State:</span>
                    <span className="font-bold text-[#243746]">{c.state}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Visits Left:</span>
                    <span className="font-bold text-[#294B68]">
                      {c.remainingVisitsCount} / {c.totalVisitsAllowed}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Agreement:</span>
                    <span className="font-bold text-[#243746]">{c.agreementStatus}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Payment:</span>
                    <span className="font-bold text-[#243746]">{c.paymentStatus}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#D9E4EC]/60 text-xs">
                  {isEligibleToSchedule ? (
                    <button
                      onClick={() => onOpenScheduleModal(c.id)}
                      className="font-bold text-[#294B68] flex items-center gap-1 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Schedule</span>
                    </button>
                  ) : (
                    <span
                      className="font-bold text-slate-400 flex items-center gap-1 cursor-not-allowed"
                      title="Agreement or payment pending"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Schedule (Locked)</span>
                    </span>
                  )}
                  <Link
                    href={`/admin/clients/${c.id}`}
                    className="font-bold text-[#294B68] flex items-center gap-1 hover:underline"
                  >
                    <span>Manage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      <TablePagination
        currentPage={validCurrentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        itemLabel="clients"
      />
    </div>
  );
}
