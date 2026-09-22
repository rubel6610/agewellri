import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, Shield, FileText } from "lucide-react";

interface LegalLayoutProps {
  children: React.ReactNode;
  activeDocument: "privacy" | "terms";
}

export function LegalLayout({ children, activeDocument }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F7FAFC] text-[#243746] flex flex-col selection:bg-[#EAF3F8] selection:text-[#294B68]">
      {/* Top Public Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D9E4EC] shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            href="/login"
            className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-[#5E8FB2] rounded-lg group"
            aria-label="AgeWellRI Home"
          >
            <Image
              src="/logo.png"
              alt="AgeWellRI"
              width={180}
              height={40}
              priority
              className="h-8 sm:h-10 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            />
          </Link>

          {/* Quick Actions & Contact */}
          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href="tel:(401) 212-3002"
              className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#294B68] bg-[#EAF3F8] hover:bg-[#D9E4EC] transition-colors"
              aria-label="Call AgeWellRI at (401) 212-3002"
            >
              <Phone className="w-3.5 h-3.5 text-[#5E8FB2]" />
              <span>(401) 212-3002</span>
            </a>

            <Link
              href="/login"
              className="px-3.5 py-2 text-xs sm:text-sm font-bold text-[#294B68] hover:bg-[#EAF3F8] rounded-xl transition-colors"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#294B68] hover:bg-[#1E374D] rounded-xl transition-colors shadow-2xs"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* Sub-navigation / Document Switcher Bar */}
      <nav
        aria-label="Legal Documents Navigation"
        className="bg-[#EAF3F8] border-b border-[#D9E4EC]/80 py-3 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#294B68] hover:text-[#1E374D] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Registration</span>
          </Link>

          {/* Document Toggle Tabs */}
          <div className="flex items-center bg-white/80 p-1 rounded-xl border border-[#D9E4EC] self-start sm:self-auto">
            <Link
              href="/privacy-policy"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeDocument === "privacy"
                  ? "bg-[#294B68] text-white shadow-2xs"
                  : "text-[#64748B] hover:text-[#243746]"
              }`}
              aria-current={activeDocument === "privacy" ? "page" : undefined}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Privacy Policy</span>
            </Link>
            <Link
              href="/terms-of-use"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeDocument === "terms"
                  ? "bg-[#294B68] text-white shadow-2xs"
                  : "text-[#64748B] hover:text-[#243746]"
              }`}
              aria-current={activeDocument === "terms" ? "page" : undefined}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Terms of Use</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Document Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] shadow-xs p-6 sm:p-10 lg:p-12">
          {children}
        </div>
      </main>

      {/* Public Footer */}
      <footer className="bg-white border-t border-[#D9E4EC] mt-auto py-8 sm:py-10 text-xs sm:text-sm text-[#64748B]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-center sm:text-left">
            <Image
              src="/logo.png"
              alt="AgeWellRI"
              width={140}
              height={32}
              className="h-7 w-auto object-contain opacity-90"
            />
            <p suppressHydrationWarning className="flex flex-wrap items-center justify-center sm:justify-start gap-1">
              <span suppressHydrationWarning>© {new Date().getFullYear()} AgeWellRI Services. All rights reserved</span>
              <span className="text-[#D9E4EC]" aria-hidden="true">•</span>
              <span suppressHydrationWarning>(401) 212-3002</span>
              <span className="text-[#D9E4EC]" aria-hidden="true">•</span>
              <a
                href="mailto:agewellri@gmail.com"
                className="hover:text-[#294B68] transition-colors"
                suppressHydrationWarning
              >
                agewellri@gmail.com
              </a>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-semibold">
            <Link
              href="/privacy-policy"
              className={`hover:text-[#294B68] transition-colors ${
                activeDocument === "privacy" ? "text-[#294B68] underline" : "text-[#64748B]"
              }`}
            >
              Privacy Policy
            </Link>
            <span className="text-[#D9E4EC]" aria-hidden="true">•</span>
            <Link
              href="/terms-of-use"
              className={`hover:text-[#294B68] transition-colors ${
                activeDocument === "terms" ? "text-[#294B68] underline" : "text-[#64748B]"
              }`}
            >
              Terms of Use
            </Link>
            {/* <span className="text-[#D9E4EC]" aria-hidden="true">•</span>
            <a
              href="mailto:agewellri@gmail.com"
              className="hover:text-[#294B68] transition-colors inline-flex items-center gap-1"
            >
              <Mail className="w-3.5 h-3.5 text-[#5E8FB2]" />
              <span>agewellri@gmail.com</span>
            </a>
            <span className="text-[#D9E4EC]" aria-hidden="true">•</span>
            <a
              href="tel:(401) 212-3002"
              className="hover:text-[#294B68] transition-colors inline-flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5 text-[#5E8FB2]" />
              <span>(401) 212-3002</span>
            </a> */}
          </div>
        </div>
      </footer>
    </div>
  );
}
