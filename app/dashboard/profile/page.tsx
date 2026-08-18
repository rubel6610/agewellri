"use client";

import React, { useState } from "react";
import { useGetMeQuery } from "@/lib/redux/features/auth/authApi";
import { useAppSelector } from "@/lib/redux/hooks";
import {
  User,
  Phone,
  Mail,
  MapPin,
  HeartHandshake,
  ShieldCheck,
  KeyRound,
  Loader2,
  Calendar,
} from "lucide-react";
import { ChangePasswordModal } from "@/components/auth/change-password-modal";

export default function ProfilePage() {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const authUser = useAppSelector((state) => state.auth.user);
  const { data: meResponse, isLoading } = useGetMeQuery();

  const user = meResponse?.data || authUser;

  if (isLoading && !user) {
    return (
      <div className="p-12 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#294B68]" />
        <span>Loading member profile...</span>
      </div>
    );
  }

  const firstName = user?.firstName || "Valued";
  const lastName = user?.lastName || "Member";
  const email = user?.email || "member@agewellri.com";
  const phone = user?.phone || "(401) 555-0199";
  const memberId = user?.client?.clientNumber || (user?.id ? `MEM-${user.id.slice(-5).toUpperCase()}` : "MEM-94021");
  const address = user?.client
    ? `${user.client.address}, ${user.client.city}, ${user.client.state} ${user.client.postalCode}`
    : "148 Hope Street, Providence, RI 02906";
  const emergencyName = user?.client?.emergencyContactName || "Sarah Jenkins";
  const emergencyPhone = user?.client?.emergencyContactPhone || "(401) 555-0182";
  const emergencyRel = user?.client?.emergencyContactRelation || "Daughter";

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9E4EC]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
            My Member Profile
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] mt-1">
            Manage your personal contact info, credentials, and care coordination details.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="px-4 py-2.5 bg-[#EAF3F8] hover:bg-[#D9E4EC] text-[#294B68] font-bold text-sm rounded-xl transition-all border border-[#5E8FB2]/30 flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Change Password</span>
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-xs space-y-8">
        {/* Basic Info Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-[#D9E4EC]">
          <div className="w-16 h-16 rounded-2xl bg-[#294B68] text-white flex items-center justify-center font-extrabold text-2xl shrink-0 shadow-xs">
            {firstName[0]}
            {lastName[0]}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-bold text-[#243746]">
                {firstName} {lastName}
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-full bg-[#EAF3F8] text-[#294B68]">
                {user?.role || "CLIENT"}
              </span>
            </div>
            <p className="text-xs text-[#64748B] flex items-center gap-1.5 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3F8F6B]" />
              AgeWellRI Active Member ID: <strong>{memberId}</strong>
            </p>
          </div>
        </div>

        {/* Contact Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#5E8FB2]" /> Email Address
            </span>
            <p className="text-base font-bold text-[#243746] p-3.5 bg-[#F7FAFC] rounded-xl border border-[#D9E4EC]">
              {email}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#5E8FB2]" /> Phone Number
            </span>
            <p className="text-base font-bold text-[#243746] p-3.5 bg-[#F7FAFC] rounded-xl border border-[#D9E4EC]">
              {phone}
            </p>
          </div>

          <div className="sm:col-span-2 space-y-1">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#5E8FB2]" /> Home Service Address
            </span>
            <p className="text-base font-bold text-[#243746] p-3.5 bg-[#F7FAFC] rounded-xl border border-[#D9E4EC]">
              {address}
            </p>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="space-y-3 pt-4 border-t border-[#D9E4EC]">
          <h3 className="text-lg font-bold text-[#243746] flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-[#294B68]" />
            Emergency &amp; Family Coordinator
          </h3>

          <div className="p-4 bg-[#EAF3F8]/60 rounded-2xl border border-[#5E8FB2]/30 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#243746] text-base">
                {emergencyName}
              </span>
              <span className="text-xs font-semibold text-[#294B68] bg-white px-2.5 py-1 rounded-full border border-[#5E8FB2]/20">
                Primary Contact
              </span>
            </div>
            <p className="text-xs text-[#64748B]">{emergencyRel}</p>
            <p className="text-sm font-bold text-[#243746] flex items-center gap-2 pt-1">
              <Phone className="w-4 h-4 text-[#5E8FB2]" />
              {emergencyPhone}
            </p>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}
