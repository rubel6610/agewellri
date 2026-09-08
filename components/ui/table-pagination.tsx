"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export interface TablePaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
  minItemsToPaginate?: number;
}

export function TablePagination({
  currentPage,
  totalItems,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  itemLabel = "items",
  className = "",
  minItemsToPaginate = 10,
}: TablePaginationProps) {
  // If data count is <= 10 (or minItemsToPaginate), do not show pagination
  if (totalItems <= minItemsToPaginate && currentPage === 1) {
    return null;
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (validCurrentPage > 3) pages.push("...");

      const start = Math.max(2, validCurrentPage - 1);
      const end = Math.min(totalPages - 1, validCurrentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (validCurrentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#D9E4EC] text-xs font-medium text-[#64748B] ${className}`}
    >
      {/* Left: Summary & Rows per page selector */}
      <div className="flex flex-wrap items-center gap-4">
        <span>
          Showing <strong className="text-[#243746]">{totalItems > 0 ? startIndex + 1 : 0}</strong> to{" "}
          <strong className="text-[#243746]">{endIndex}</strong> of{" "}
          <strong className="text-[#243746]">{totalItems}</strong> {itemLabel}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#64748B]">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="h-8 px-2.5 text-xs font-bold text-[#243746] bg-[#F7FAFC] border border-[#D9E4EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Buttons */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={validCurrentPage === 1}
          title="First Page"
          className="p-2 rounded-lg border border-[#D9E4EC] bg-white hover:bg-[#F0F5F9] text-[#243746] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, validCurrentPage - 1))}
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
                onClick={() => onPageChange(page)}
                className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  page === validCurrentPage
                    ? "bg-[#294B68] text-white shadow-xs"
                    : "bg-white border border-[#D9E4EC] text-[#243746] hover:bg-[#F0F5F9]"
                }`}
              >
                {page}
              </button>
            ) : (
              <span key={idx} className="px-1 text-[#64748B] font-bold">
                {page}
              </span>
            )
          )}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, validCurrentPage + 1))}
          disabled={validCurrentPage === totalPages}
          title="Next Page"
          className="p-2 rounded-lg border border-[#D9E4EC] bg-white hover:bg-[#F0F5F9] text-[#243746] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={validCurrentPage === totalPages}
          title="Last Page"
          className="p-2 rounded-lg border border-[#D9E4EC] bg-white hover:bg-[#F0F5F9] text-[#243746] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
