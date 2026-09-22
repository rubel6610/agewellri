"use client";

import React, { useState } from "react";
import {
  User,
  Phone,
  Mail,
  ShieldCheck,
  KeyRound,
  Loader2,
  Edit3,
  Lock,
  Award,
} from "lucide-react";
import { useGetMeQuery } from "@/redux/features/auth/authApi";
import { useAppSelector } from "@/redux/hooks";
import { ChangePasswordModal } from "@/components/auth/change-password-modal";
import { AdminEditProfileModal } from "@/components/admin/admin-edit-profile-modal";

export default function AdminProfilePage() {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  const authUser = useAppSelector((state) => state.auth.user);
  const { data: meResponse, isLoading } = useGetMeQuery();

  const user = meResponse?.data || authUser;

  if (isLoading && !user) {
    return (
      <div className="p-16 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-9 h-9 animate-spin text-[#294B68]" />
        <span className="font-bold text-sm">Loading administrator profile...</span>
      </div>
    );
  }

  const firstName = user?.firstName || "System";
  const lastName = user?.lastName || "Admin";
  const email = user?.email || "agewellri@gmail.com";
  const phone = user?.phone || "(401) 212-3000";
  const role = user?.role || "ADMIN";

  const adminInitials = `${(firstName[0] || "A").toUpperCase()}${(lastName[0] || "D").toUpperCase()}`;

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9E4EC]/60">
        <div>
        
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746] tracking-tight">
            Administrator Account 
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Manage your personal administrative contact information and change account password.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditProfileModalOpen(true)}
            className="px-4 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="px-4 py-2.5 bg-white hover:bg-[#F0F5F9] text-[#294B68] font-bold text-sm rounded-xl transition-all border border-[#5E8FB2]/30 flex items-center gap-2 shrink-0 shadow-2xs cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-[#5E8FB2]" />
            <span>Change Password</span>
          </button>
        </div>
      </div>

      {/* Hero Overview Card - Full Width */}
      <div className="bg-gradient-to-br from-white via-[#F8FAFC] to-[#F0F5F9] rounded-2xl sm:rounded-3xl border-2 border-[#5E8FB2]/40 p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-[#294B68] text-white flex items-center justify-center font-black text-3xl sm:text-4xl shadow-md border-2 border-white shrink-0">
              {adminInitials}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl sm:text-3xl font-black text-[#243746]">
                  {firstName} {lastName}
                </h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#EAF3F8] text-[#294B68] border border-[#5E8FB2]/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#294B68]" />
                  {role === "ADMIN" ? "System Administrator" : role}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active Account
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#64748B] flex items-center gap-2 font-medium">
                <Mail className="w-3.5 h-3.5 text-[#5E8FB2]" />
                <span>{email}</span>
                <span className="text-[#CBD5E1]">·</span>
                <Phone className="w-3.5 h-3.5 text-[#5E8FB2]" />
                <span>{phone}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width Profile Details Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#D9E4EC] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#EAF3F8] text-[#294B68] rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#243746]">
                Administrative Profile Details
              </h3>
              <p className="text-xs text-[#64748B]">
                Primary contact channels used for dispatch &amp; operations
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditProfileModalOpen(true)}
            className="px-3.5 py-1.5 bg-[#EAF3F8] hover:bg-[#D9E4EC] text-[#294B68] text-xs font-extrabold rounded-lg border border-[#5E8FB2]/30 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#5E8FB2]" /> First Name
            </span>
            <p className="text-base font-bold text-[#243746] p-4 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC]">
              {firstName}
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#5E8FB2]" /> Last Name
            </span>
            <p className="text-base font-bold text-[#243746] p-4 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC]">
              {lastName}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#5E8FB2]" /> Administrative Email Address
              </span>
              <span className="text-[11px] font-semibold text-[#64748B] flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#64748B]" />
                Read-only
              </span>
            </div>
            <div className="p-4 bg-[#F1F5F9] rounded-2xl border border-[#D9E4EC] flex items-center justify-between">
              <span className="text-base font-bold text-[#243746]">{email}</span>
              <span className="text-xs font-black uppercase px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                Verified
              </span>
            </div>
            <p className="text-[11px] text-[#64748B]">
              Primary administrative account email used for authentication and system alerts.
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#5E8FB2]" /> Direct Phone Number
            </span>
            <p className="text-base font-bold text-[#243746] p-4 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC]">
              {phone}
            </p>
            <p className="text-[11px] text-[#64748B]">
              Direct line used for specialist coordination and high-priority member dispatch.
            </p>
          </div>
        </div>
      </div>

      {/* Full-Width Security Credentials & Password Card */}
      {/* <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#D9E4EC] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#EAF3F8] text-[#294B68] rounded-xl">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#243746]">
                Security Credentials &amp; Password
              </h3>
              <p className="text-xs text-[#64748B]">
                Manage your administrator login credentials and security policies
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[#243746]">Account Password</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                Protected
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Change your password periodically to maintain strong system protection and role integrity.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(true)}
            className="px-5 py-3 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Change Password</span>
          </button>
        </div>

        <div className="space-y-2 pt-2 text-xs text-[#64748B]">
          <div className="flex items-center gap-2 text-[#243746] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#3F8F6B]" />
            <span>Password Security Requirements:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-1 text-xs">
            <li>Minimum 6 characters (8+ characters recommended with mixed case and numbers).</li>
            <li>Requires verification of current password before update.</li>
            <li>Session authentication tokens are securely refreshed upon password change.</li>
          </ul>
        </div>
      </div> */}

      {/* Edit Profile Modal */}
      <AdminEditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        user={user}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}
