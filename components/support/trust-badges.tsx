import React from "react";
import { ShieldCheck, Lock, Award, HeartHandshake } from "lucide-react";

interface TrustBadgesProps {
  className?: string;
}

export function TrustBadges({ className = "" }: TrustBadgesProps) {
  const badges = [
    {
      icon: ShieldCheck,
      title: "Licensed & Insured",
      subtitle: "Certified Rhode Island In-Home Safety Experts",
    },
    {
      icon: Lock,
      title: "256-Bit SSL Security",
      subtitle: "Encrypted & Compliant Health Information",
    },
    {
      icon: HeartHandshake,
      title: "Family First Care",
      subtitle: "Transparent Reports Sent Directly to Caregivers",
    },
  ];

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${className}`}>
      {badges.map((b, idx) => {
        const Icon = b.icon;
        return (
          <div
            key={idx}
            className="bg-[#F0F5F9]/60 border border-[#D9E4EC] rounded-2xl p-4 flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-white text-[#294B68] shadow-xs flex items-center justify-center shrink-0 border border-[#D9E4EC]">
              <Icon className="w-5 h-5 text-[#294B68]" />
            </div>
            <div>
              <div className="text-xs font-black text-[#243746] tracking-tight">{b.title}</div>
              <div className="text-[11px] text-[#5E8FB2] font-semibold leading-tight mt-0.5">
                {b.subtitle}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
