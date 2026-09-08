"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("AgeWellRI Global Root Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F7FAFC] flex flex-col items-center justify-center p-4 sm:p-6 text-[#243746] font-sans antialiased">
        <main className="w-full max-w-lg bg-white rounded-3xl border border-[#D9E4EC] shadow-sm p-8 sm:p-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
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

          <div className="flex flex-col items-center space-y-3 pt-2">
            <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner border border-rose-200">
              <AlertTriangle className="w-10 h-10 text-rose-500 animate-bounce" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#243746]">
              System Error
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-sm mx-auto leading-relaxed">
              A critical application error occurred. Please click below to reload the application.
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="px-6 py-2.5 rounded-xl bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
