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
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { MasterClientRecord } from "@/redux/features/client/clientApi";
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

    const matchesStatus =
      statusFilter === "ALL" ||
      client.status === statusFilter ||
      (statusFilter === "agreement_pending" && client.agreementStatus !== "EXECUTED") ||
      (statusFilter === "agreement_executed" && client.agreementStatus === "EXECUTED") ||
      (statusFilter === "payment_pending" && client.paymentStatus !== "PAID");

    return matchesSearch && matchesState && matchesStatus;
  });

  const totalItems = filteredClients.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedClients = filteredClients.slice(startIndex, endIndex);

  // Generate visible page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (validCurrentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (validCurrentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", validCurrentPage - 1, validCurrentPage, validCurrentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-xs space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by client name, email, state, or AW-ID..."
            className="w-full h-11 pl-10 pr-4 text-sm text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] placeholder:text-[#94A3B8]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="h-11 px-3 text-xs font-bold text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] cursor-pointer"
          >
            <option value="ALL">All States (RI, CT, MA)</option>
            <option value="RI">Rhode Island (RI)</option>
            <option value="CT">Connecticut (CT)</option>
            <option value="MA">Massachusetts (MA)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-3 text-xs font-bold text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] cursor-pointer"
          >
            <option value="ALL">All Agreement Statuses</option>
            <option value="agreement_executed">Agreement Executed</option>
            <option value="agreement_pending">Pending Signature</option>
            <option value="payment_pending">Payment Pending</option>
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
              <th className="py-3.5 px-4">Client</th>
              <th className="py-3.5 px-4">State</th>
              <th className="py-3.5 px-4">Signer Role</th>
              <th className="py-3.5 px-4">Agreement Status</th>
              <th className="py-3.5 px-4">Billing &amp; Plan</th>
              <th className="py-3.5 px-4">Created</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9E4EC]/60 text-sm font-medium text-[#243746]">
            {paginatedClients.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#64748B]">
                  No clients match your filter criteria.
                </td>
              </tr>
            ) : (
              paginatedClients.map((c) => {
                const isExecuted =
                  c.agreementStatus === "EXECUTED" ||
                  c.agreementStatus === "SIGNED" ||
                  Boolean(c.agreementSignedDate) ||
                  c.timeline?.agreementSigned ||
                  c.onboardingStatus === "ACTIVE" ||
                  c.onboardingStatus === "COMPLETED";

                return (
                  <tr key={c.id} className="hover:bg-[#F7FAFC] transition-colors">
                    <td className="py-4 px-4">
                      <Link
                        href={`/admin/clients/${c.id}`}
                        className="font-bold text-[#243746] hover:text-[#294B68] hover:underline block"
                      >
                        {c.firstName} {c.lastName}
                      </Link>
                      <span className="block text-xs text-[#64748B] font-mono">
                        {c.id} • {c.email}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-extrabold bg-[#EAF3F8] text-[#294B68]">
                        {c.state || "RI"}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-xs">
                      <span className="font-semibold text-[#243746] block capitalize">
                        {c.signerRole.replace(/_/g, " ").toLowerCase()}
                      </span>
                      {c.legalAuthority && (
                        <span className="text-[11px] text-[#64748B] block">
                          {c.legalAuthority.replace(/_/g, " ")}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      {isExecuted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-[#EBF8F2] text-[#166534]">
                          <ShieldCheck className="w-3.5 h-3.5" /> Executed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-[#C28A3A]">
                          <AlertCircle className="w-3.5 h-3.5" /> Pending Signature
                        </span>
                      )}
                      {c.agreementSignedDate && (
                        <span className="block text-[11px] text-[#64748B] mt-0.5">
                          {c.agreementSignedDate}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-xs">
                      <strong className="text-[#243746] block">{c.planName}</strong>
                      <span className="text-[#64748B] capitalize">
                        {c.paymentStatus.replace(/_/g, " ").toLowerCase()}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-xs text-[#64748B]">
                      {c.createdAt}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/clients/${c.id}`}
                          className="px-3 py-1.5 bg-[#EAF3F8] hover:bg-[#D9E4EC] text-[#294B68] font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
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

      {/* Mobile Cards View */}
      <div className="md:hidden space-y-3">
        {paginatedClients.length === 0 ? (
          <div className="p-8 text-center text-[#64748B] bg-[#F7FAFC] rounded-2xl border border-[#D9E4EC]">
            No clients match your filter criteria.
          </div>
        ) : (
          paginatedClients.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-2xl border border-[#D9E4EC] bg-[#F7FAFC] space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#294B68]">
                  {c.id} ({c.state})
                </span>
                <ClientStatusBadge status={c.status} />
              </div>

              <div>
                <Link
                  href={`/admin/clients/${c.id}`}
                  className="font-bold text-[#243746] text-base hover:underline"
                >
                  {c.firstName} {c.lastName}
                </Link>
                <p className="text-xs text-[#64748B] mt-0.5">{c.planName} • {c.email}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#D9E4EC]/60 text-xs">
                <span className="text-[#64748B]">
                  Agreement: <strong>{c.agreementStatus}</strong>
                </span>
                <Link
                  href={`/admin/clients/${c.id}`}
                  className="font-bold text-[#294B68] flex items-center gap-1 hover:underline"
                >
                  <span>Manage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination & Limit Footer Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#D9E4EC] text-xs font-medium text-[#64748B]">
        {/* Left: Summary & Rows per page selector */}
        <div className="flex flex-wrap items-center gap-4">
          <span>
            Showing <strong className="text-[#243746]">{totalItems > 0 ? startIndex + 1 : 0}</strong> to{" "}
            <strong className="text-[#243746]">{endIndex}</strong> of{" "}
            <strong className="text-[#243746]">{totalItems}</strong> clients
          </span>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#64748B]">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="h-8 px-2.5 text-xs font-bold text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Right: Page Navigation Buttons */}
        <div className="flex items-center gap-1">
          {/* First Page */}
          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            disabled={validCurrentPage === 1}
            title="First Page"
            className="p-2 rounded-lg border border-[#D9E4EC] bg-white hover:bg-[#F0F5F9] text-[#243746] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Previous Page */}
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={validCurrentPage === 1}
            title="Previous Page"
            className="p-2 rounded-lg border border-[#D9E4EC] bg-white hover:bg-[#F0F5F9] text-[#243746] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1 px-1">
            {getPageNumbers().map((page, idx) =>
              typeof page === "number" ? (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    validCurrentPage === page
                      ? "bg-[#294B68] text-white shadow-2xs"
                      : "border border-[#D9E4EC] bg-white hover:bg-[#F0F5F9] text-[#243746]"
                  }`}
                >
                  {page}
                </button>
              ) : (
                <span key={idx} className="px-1 text-xs text-[#94A3B8]">
                  {page}
                </span>
              )
            )}
          </div>

          {/* Next Page */}
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={validCurrentPage === totalPages}
            title="Next Page"
            className="p-2 rounded-lg border border-[#D9E4EC] bg-white hover:bg-[#F0F5F9] text-[#243746] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Last Page */}
          <button
            type="button"
            onClick={() => setCurrentPage(totalPages)}
            disabled={validCurrentPage === totalPages}
            title="Last Page"
            className="p-2 rounded-lg border border-[#D9E4EC] bg-white hover:bg-[#F0F5F9] text-[#243746] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
