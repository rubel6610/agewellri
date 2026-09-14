import React from "react";
import { Phone, Mail, Clock, HelpCircle } from "lucide-react";

interface HelpSchedulingWidgetProps {
  className?: string;
}

export function HelpSchedulingWidget({
  className = "",
}: HelpSchedulingWidgetProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-[#D9E4EC] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-[#EAF3F8] text-[#294B68] flex items-center justify-center shrink-0 font-bold">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-extrabold text-[#243746] text-sm">
            Need help scheduling or have questions?
          </h4>
          <p className="text-xs text-[#5E8FB2] mt-0.5 leading-relaxed font-medium">
            Our local Rhode Island Safety Concierge team is here to assist you
            or your family member.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 shrink-0">
        <a
          href="tel:4017123012"
          className="px-3.5 py-2 rounded-xl bg-[#F0F5F9] hover:bg-[#EAF3F8] text-[#294B68] text-xs font-extrabold flex items-center gap-1.5 transition-colors border border-[#D9E4EC]"
        >
          <Phone className="w-3.5 h-3.5 text-[#5E8FB2]" />
          <span>(401) 712-3012</span>
        </a>
        <a
          href="mailto:agewellri@gmail.com"
          className="px-3.5 py-2 rounded-xl bg-[#294B68] hover:bg-[#1E374D] text-white text-xs font-extrabold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Email Support</span>
        </a>
      </div>
    </div>
  );
}
