"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, HelpCircle } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Log unexpected client error
    console.error("AgeWellRI Application Error:", error);
  }, [error]);

  const homeHref = !isAuthenticated
    ? "/login"
    : user?.role === "ADMIN"
    ? "/admin"
    : "/dashboard";

  return (
    <main className="min-h-screen bg-[#F7FAFC] flex flex-col items-center justify-center p-4 sm:p-6 text-[#243746]">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-rose-50/70 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#EAF3F8]/60 blur-3xl" />
      </div>

      <div className="w-full max-w-lg bg-white rounded-3xl border border-[#D9E4EC] shadow-sm p-8 sm:p-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Brand Logo */}
        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt="AgeWellRI"
            width={180}
            height={48}
            className="h-11 w-auto object-contain"
            priority
          />
        </div>

        {/* Error Visual Badge */}
        <div className="flex flex-col items-center space-y-3 pt-2">
          <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner border border-rose-200">
            <AlertTriangle className="w-10 h-10 text-rose-500 animate-bounce" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#243746]">
            Something Went Wrong
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-sm mx-auto leading-relaxed">
            An unexpected error occurred while loading this page. Our team has been notified and we are working to resolve it.
          </p>

          {process.env.NODE_ENV === "development" && error?.message && (
            <div className="w-full max-w-md p-3 bg-rose-50/60 border border-rose-200 rounded-xl text-left text-xs font-mono text-rose-800 overflow-x-auto max-h-32">
              {error.message}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href={homeHref}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#D9E4EC] bg-white hover:bg-[#F8FAFC] text-[#243746] font-bold text-xs transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4 text-[#64748B]" />
            <span>Return to Dashboard</span>
          </Link>
        </div>

        {/* Helpful Support Footer */}
        <div className="pt-4 border-t border-[#D9E4EC]/60 text-xs text-[#64748B] flex items-center justify-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-[#5E8FB2]" />
          <span>If this persists, please contact <strong className="text-[#243746]">support@agewellri.com</strong></span>
        </div>
      </div>
    </main>
  );
}
