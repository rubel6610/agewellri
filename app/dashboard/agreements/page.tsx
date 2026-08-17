"use client";

import React, { useEffect, useState } from "react";
import { getAgreement } from "@/lib/api/dashboard";
import { Agreement } from "@/lib/types/dashboard";
import { AgreementCard } from "@/components/dashboard/agreement-card";

export default function AgreementsPage() {
  const [agreement, setAgreement] = useState<Agreement | null>(null);

  useEffect(() => {
    getAgreement().then(setAgreement);
  }, []);

  if (!agreement) {
    return (
      <div className="p-12 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC]">
        Loading agreement...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-[#D9E4EC]/60">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
          My Agreement
        </h1>
        <p className="text-sm sm:text-base text-[#64748B] mt-1">
          Review your official AgeWellRI Member Service Agreement and legal coverage terms.
        </p>
      </div>

      <AgreementCard agreement={agreement} />
    </div>
  );
}
