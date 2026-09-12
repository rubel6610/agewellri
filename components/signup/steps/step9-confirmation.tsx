"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Mail, ArrowRight } from "lucide-react";

interface Step9ConfirmationProps {
  planDetails: {
    planName: string;
    planPrice: number;
    billingInterval: string;
    totalVisits: number;
  };
  residentDetails: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
  };
  recipientCount: number;
  commencementDateFormatted: string;
  userEmail: string;
}

export function Step9Confirmation({
  planDetails,
  residentDetails,
  recipientCount,
  commencementDateFormatted,
  userEmail,
}: Step9ConfirmationProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Celebration Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase tracking-wider">
          Signup Complete &bull; Step 9 of 9
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-[#243746]">
          Welcome to AgeWellRI!
        </h2>
        <p className="text-sm text-[#5E8FB2] max-w-md mx-auto">
        Your account and service agreement have been successfully completed. We look forward to helping keep your home safe.
        </p>
      </div>

      {/* Confirmation Summary Card */}
      <div className="bg-white rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-md space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#D9E4EC]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Service Summary
          </span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Active Subscription
          </span>
        </div>

        {/* Detailed Agreement Signed Notice Box */}
        <div className="p-5 bg-[#F0F5F9] rounded-2xl border border-[#D9E4EC] space-y-4">
          <p className="text-sm font-bold text-[#243746]">
            Your service agreement is complete and your subscription is active.
          </p>

          <ul className="space-y-2 text-xs text-[#334155]">
            <li className="flex items-start gap-2">
              <span className="text-[#294B68] font-bold">&bull;</span>
              <span>
                <strong>Your plan:</strong> {planDetails.planName} &mdash; ${planDetails.planPrice}/month
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#294B68] font-bold">&bull;</span>
              <span>
                <strong>Service begins:</strong> {commencementDateFormatted}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#294B68] font-bold">&bull;</span>
              <span>
                <strong>First billing:</strong> {commencementDateFormatted} &mdash; <span className="text-emerald-700 font-bold">you won't be charged today</span>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#294B68] font-bold">&bull;</span>
              <span>
                A copy of your signed agreement has been emailed to <strong>{userEmail}</strong> for your records.
              </span>
            </li>
          </ul>

          <div className="pt-2 border-t border-[#D9E4EC] text-xs font-semibold text-[#294B68]">
            We'll be in touch shortly to schedule your first visit. Questions? Call us anytime at <strong>(401) 212-3002</strong>.
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Resident Address */}
          <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] space-y-1 sm:col-span-2">
            <span className="text-[11px] font-bold text-[#64748B] uppercase">Service Address</span>
            <div className="text-sm font-black text-[#243746]">
              {residentDetails.fullName}
            </div>
            <div className="text-xs text-[#64748B]">
              {residentDetails.address}, {residentDetails.city}, {residentDetails.state}{" "}
              {residentDetails.postalCode}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="w-full h-14 bg-[#294B68] hover:bg-[#1E374D] text-white font-extrabold text-base rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer group"
          >
            <span>Go to Member Dashboard</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
