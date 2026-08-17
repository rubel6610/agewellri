import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface StatKpiCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  href?: string;
  urgent?: boolean;
}

export function StatKpiCard({ title, value, subtitle, icon, href, urgent }: StatKpiCardProps) {
  const content = (
    <div
      className={`p-5 rounded-2xl border transition-all shadow-xs flex flex-col justify-between space-y-3 ${
        urgent
          ? "bg-amber-50/50 border-[#C28A3A]/40 hover:border-[#C28A3A]"
          : "bg-white border-[#D9E4EC] hover:border-[#5E8FB2]"
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
          {title}
        </span>
        <div className="p-2 bg-[#EAF3F8] rounded-xl text-[#294B68] shrink-0">
          {icon}
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
            {value}
          </span>
          {href && (
            <span className="text-xs font-bold text-[#5E8FB2] flex items-center gap-0.5 hover:underline">
              View <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
        <p
          className={`text-xs font-semibold mt-1 ${
            urgent ? "text-[#C28A3A]" : "text-[#64748B]"
          }`}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
