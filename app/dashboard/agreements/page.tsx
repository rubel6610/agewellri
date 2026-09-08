"use client";

import React from "react";
import { useGetMyAgreementQuery } from "@/redux/features/auth/authApi";
import { useAppSelector } from "@/redux/hooks";
import { FullAgreementViewer } from "@/components/dashboard/full-agreement-viewer";
import { FileCheck2 } from "lucide-react";
import Link from "next/link";

export default function AgreementsPage() {
  const authUser = useAppSelector((state) => state.auth.user);
  const { data: agreementResponse, isLoading, isError } = useGetMyAgreementQuery();

  const agreementData = agreementResponse?.data;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header - ALWAYS VISIBLE IMMEDIATELY */}
      <div className="pb-4 border-b border-[#D9E4EC]/60">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
          My Agreement
        </h1>
        <p className="text-sm sm:text-base text-[#64748B] mt-1">
          Review your official AgeWellRI Member Service Agreement and legal coverage terms.
        </p>
      </div>

      {isLoading ? (
        <div className="p-8 bg-white rounded-3xl border border-[#D9E4EC] space-y-6 shadow-xs animate-pulse">
          <div className="flex justify-between items-center pb-4 border-b border-[#D9E4EC]/60">
            <div className="space-y-2">
              <div className="h-5 bg-[#E2E8F0] rounded-md w-48"></div>
              <div className="h-3 bg-[#F1F5F9] rounded-md w-36"></div>
            </div>
            <div className="h-6 bg-[#E2E8F0] rounded-full w-24"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-[#F1F5F9] rounded-md w-full"></div>
            <div className="h-4 bg-[#F1F5F9] rounded-md w-5/6"></div>
            <div className="h-4 bg-[#F1F5F9] rounded-md w-4/5"></div>
          </div>
          <div className="p-4 bg-[#F8FAFC] rounded-2xl space-y-2">
            <div className="h-3 bg-[#E2E8F0] rounded-md w-32"></div>
            <div className="h-4 bg-[#E2E8F0] rounded-md w-64"></div>
          </div>
          <div className="pt-4 flex justify-between items-center">
            <div className="h-4 bg-[#E2E8F0] rounded-md w-28"></div>
            <div className="h-9 bg-[#E2E8F0] rounded-xl w-32"></div>
          </div>
        </div>
      ) : isError || !agreementData ? (
        <div className="p-8 sm:p-12 bg-white rounded-3xl border border-[#D9E4EC] text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-[#EAF3F8] text-[#294B68] rounded-2xl flex items-center justify-center mx-auto">
            <FileCheck2 className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-[#243746]">No Signed Agreement Found</h3>
          <p className="text-sm text-[#64748B] max-w-md mx-auto">
            It looks like your initial Client Service Agreement has not been executed yet. Please review and sign your agreement to activate your safety coverage.
          </p>
          <div className="pt-2">
            <Link
              href="/agreement"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Sign Client Service Agreement
            </Link>
          </div>
        </div>
      ) : (
        <FullAgreementViewer agreement={agreementData} />
      )}
    </div>
  );
}
