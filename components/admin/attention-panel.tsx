"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, FileCheck, CreditCard, FileText, ArrowRight, UserPlus } from "lucide-react";

interface AttentionItem {
  id: string;
  title: string;
  count: number;
  description: string;
  href: string;
  type: "onboarding" | "payment" | "agreement" | "report" | "renewal";
}

export function AttentionPanel() {
  const items: AttentionItem[] = [
    {
      id: "att_1",
      title: "Clients Pending Onboarding",
      count: 7,
      description: "Require agreement signature or payment setup",
      href: "/admin/clients?status=agreement_pending",
      type: "onboarding",
    },
    {
      id: "att_2",
      title: "Failed Quarterly Payments",
      count: 4,
      description: "Auto-charge declined — follow up with client",
      href: "/admin/billing?status=failed",
      type: "payment",
    },
    {
      id: "att_3",
      title: "Agreements Awaiting Signature",
      count: 3,
      description: "Sent to client — signature required",
      href: "/admin/agreements?status=pending_signature",
      type: "agreement",
    },
    {
      id: "att_4",
      title: "Completed Visits Needing Report Upload",
      count: 5,
      description: "Age Safe® Home Score™ report upload pending",
      href: "/admin/reports?status=pending",
      type: "report",
    },
  ];

  const getIcon = (type: AttentionItem["type"]) => {
    switch (type) {
      case "onboarding":
        return <UserPlus className="w-5 h-5 text-[#C28A3A]" />;
      case "payment":
        return <CreditCard className="w-5 h-5 text-[#C95C5C]" />;
      case "agreement":
        return <FileCheck className="w-5 h-5 text-[#294B68]" />;
      case "report":
        return <FileText className="w-5 h-5 text-[#5E8FB2]" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#C28A3A]" />
          <h3 className="text-xl font-extrabold text-[#243746]">
            Attention Required
          </h3>
        </div>
        <span className="px-3 py-1 bg-amber-50 text-[#C28A3A] border border-[#C28A3A]/30 rounded-full text-xs font-bold">
          Operational Priority
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="p-4 rounded-xl border border-[#D9E4EC] hover:border-[#5E8FB2] hover:bg-[#F7FAFC] transition-all flex items-start justify-between gap-3 group cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-[#EAF3F8] rounded-xl shrink-0 mt-0.5">
                {getIcon(item.type)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#243746] text-sm group-hover:text-[#294B68]">
                    {item.title}
                  </span>
                  <span className="px-2 py-0.5 bg-[#294B68] text-white text-xs font-bold rounded-full">
                    {item.count}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">{item.description}</p>
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-[#64748B] group-hover:text-[#294B68] shrink-0 mt-1" />
          </Link>
        ))}
      </div>
    </div>
  );
}
