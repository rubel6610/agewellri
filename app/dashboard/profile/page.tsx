"use client";

import React, { useEffect, useState } from "react";
import { getMemberProfile } from "@/lib/api/dashboard";
import { UserProfile } from "@/lib/types/dashboard";
import { User, Phone, Mail, MapPin, HeartHandshake, ShieldCheck, Edit3 } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    getMemberProfile().then(setUser);
  }, []);

  if (!user) {
    return (
      <div className="p-12 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC]">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9E4EC]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
            My Member Profile
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] mt-1">
            Keep your contact information and emergency coordination details updated.
          </p>
        </div>

        <button
          onClick={() => alert("Edit Profile modal functionality ready for API integration")}
          className="px-5 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-xs space-y-8">
        {/* Basic Info Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-[#D9E4EC]">
          <div className="w-16 h-16 rounded-2xl bg-[#294B68] text-white flex items-center justify-center font-extrabold text-2xl shrink-0">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#243746]">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-xs text-[#64748B] flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3F8F6B]" />
              AgeWellRI Active Member ID: <strong>MEM-94021</strong>
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
              {user.email}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#5E8FB2]" /> Phone Number
            </span>
            <p className="text-base font-bold text-[#243746] p-3.5 bg-[#F7FAFC] rounded-xl border border-[#D9E4EC]">
              {user.phone}
            </p>
          </div>

          <div className="sm:col-span-2 space-y-1">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#5E8FB2]" /> Home Service Address
            </span>
            <p className="text-base font-bold text-[#243746] p-3.5 bg-[#F7FAFC] rounded-xl border border-[#D9E4EC]">
              {user.address.street}, {user.address.city}, {user.address.state} {user.address.zip}
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
                {user.emergencyContact.name}
              </span>
              <span className="text-xs font-semibold text-[#294B68] bg-white px-2.5 py-1 rounded-full border border-[#5E8FB2]/20">
                Primary Contact
              </span>
            </div>
            <p className="text-xs text-[#64748B]">{user.emergencyContact.relationship}</p>
            <p className="text-sm font-bold text-[#243746] flex items-center gap-2 pt-1">
              <Phone className="w-4 h-4 text-[#5E8FB2]" />
              {user.emergencyContact.phone}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
