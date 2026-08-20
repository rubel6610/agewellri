"use client";

import React from "react";
import { useGetMyAgreementQuery } from "@/redux/features/auth/authApi";
import { useAppSelector } from "@/redux/hooks";
import { FullAgreementViewer } from "@/components/dashboard/full-agreement-viewer";
import { Loader2, FileCheck2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AgreementsPage() {
  const authUser = useAppSelector((state) => state.auth.user);
  const { data: agreementResponse, isLoading, isError, error } = useGetMyAgreementQuery();

  const agreementData = agreementResponse?.data;

  if (isLoading) {
    return (
      <div className="p-16 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#294B68]" />
        <p className="font-bold text-sm text-[#243746]">
          Loading your official Client Service Agreement...
        </p>
      </div>
    );
  }

  if (isError || !agreementData) {
    // If client hasn't completed agreement yet, show prompt with direct link
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="pb-4 border-b border-[#D9E4EC]/60">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
            My Agreement
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] mt-1">
            Review your official AgeWellRI Member Service Agreement and legal coverage terms.
          </p>
        </div>

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
              className="inline-flex items-center justify-center px-6 py-3 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
            >
              Sign Client Service Agreement
            </Link>
          </div>
        </div>
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

      <FullAgreementViewer agreement={agreementData} />
    </div>
  );
}

