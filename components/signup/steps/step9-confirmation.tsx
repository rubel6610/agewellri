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
            Active Agreement
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Plan Card */}
          <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] space-y-1">
            <span className="text-[11px] font-bold text-[#64748B] uppercase">Plan</span>
            <div className="text-sm font-black text-[#243746]">{planDetails.planName}</div>
            <div className="text-xs text-[#294B68] font-bold">
              ${planDetails.planPrice}.00 / month &bull; {planDetails.totalVisits} visits/year
            </div>
          </div>

          {/* Service Commencement */}
          <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] space-y-1">
            <span className="text-[11px] font-bold text-[#64748B] uppercase">Service Commencement</span>
            <div className="text-sm font-black text-[#243746]">
              {commencementDateFormatted}
            </div>
            <div className="text-xs text-[#3F8F6B] font-semibold">
              First monthly billing on {commencementDateFormatted}
            </div>
          </div>

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

        {/* Email & Report Notice */}
        <div className="p-4 bg-[#F0F5F9] rounded-2xl border border-[#D9E4EC] space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#294B68]">
            <Mail className="w-4 h-4 text-[#294B68]" />
            <span>Executed Agreement Sent to {userEmail}</span>
          </div>
          <p className="text-xs text-[#475569] leading-relaxed">
            A copy of your signed service agreement and cancellation rights has been emailed to your account. {recipientCount > 0 ? `${recipientCount} authorized contact${recipientCount > 1 ? "s" : ""} will receive visit reports and photos.` : "You can add report recipients anytime in your dashboard."}
          </p>
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
