import React from "react";
import Image from "next/image";
import { ShieldCheck, HeartHandshake, Home, Clock } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex bg-[#F7FAFC] overflow-x-hidden">
      {/* Left side: Soft AgeWellRI branded visual panel (Desktop only) */}
      <aside className="hidden lg:flex lg:w-1/2 xl:w-[52%] relative bg-[#EAF3F8] flex-col justify-between p-12 lg:p-16 border-r border-[#D9E4EC]/60 overflow-hidden">
        {/* Soft background subtle decorative shapes */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#5E8FB2]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Logo on left side */}
        <div className="relative z-10">
          <Image
            src="/logo.png"
            alt="AgeWellRI"
            width={210}
            height={46}
            priority
            className="h-auto w-auto"
          />
        </div>

        {/* Center: Reassuring Quote & Abstract House Visual */}
        <div className="relative z-10 max-w-xl my-auto py-12 space-y-8">
          {/* Subtle house motif container */}


          <blockquote className="space-y-4">
            <p className="text-3xl xl:text-4xl font-bold text-[#243746] leading-12">
              Aging in place is possible. You just need the right support.
              <br />
              <span className="text-[#294B68]">Confidence that helps you age well.&rdquo;</span>
            </p>
            <p className="text-base text-[#64748B] leading-relaxed max-w-lg">
              AgeWellRI gives older adults the oversight they need to stay safely at home and gives families the peace of mind they deserve.
            </p>
          </blockquote>

          {/* Reassuring Trust Highlights */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#D9E4EC]/80">
            <div className="flex items-start gap-3 bg-white/60 p-3.5 rounded-xl border border-white/80">
              <ShieldCheck className="w-5 h-5 text-[#294B68] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-[#243746]">Private & Secure Portal</h4>
                <p className="text-xs text-[#64748B]">All your information is protected</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/60 p-3.5 rounded-xl border border-white/80">
              <HeartHandshake className="w-5 h-5 text-[#5E8FB2] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-[#243746]">Dedicated Care Support</h4>
                <p className="text-xs text-[#64748B]">24/7 peace of mind for families</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom footer text */}
        <div className="relative z-10 flex items-center justify-between text-xs font-medium text-[#64748B]">
          <p>© {new Date().getFullYear()} AgeWellRI Services. All rights reserved.</p>
          <div className="flex items-center gap-1 text-[#294B68]">
            <Clock className="w-3.5 h-3.5" />
            <span>24/7 Member Support</span>
          </div>
        </div>
      </aside>

      {/* Right side: Authentication Card container */}
      <main className="w-full lg:w-1/2 xl:w-[48%] flex items-center justify-center p-4 sm:p-8 lg:p-12 min-h-screen">
        {children}
      </main>
    </div>
  );
}
