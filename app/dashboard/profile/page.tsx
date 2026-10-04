"use client";

import React, { useState } from "react";
import { useGetMeQuery } from "@/redux/features/auth/authApi";
import {
  useGetFamilyMembersQuery,
  useDeleteFamilyMemberMutation,
} from "@/redux/features/family/familyApi";
import { FamilyMember } from "@/redux/features/family/familyTypes";
import { useAppSelector } from "@/redux/hooks";
import {
  Phone,
  Mail,
  MapPin,
  HeartHandshake,
  ShieldCheck,
  KeyRound,
  Loader2,
  Edit3,
  Trash2,
  UserPlus,
  FileCheck2,
  FileText,
  Scale,
  ExternalLink,
  Shield,
  AlertCircle,
  Download,
} from "lucide-react";
import { ChangePasswordModal } from "@/components/auth/change-password-modal";
import { EditProfileModal } from "@/components/auth/edit-profile-modal";
import { AccessMethodsCard } from "@/components/dashboard/access-methods-card";
import { AddFamilyMemberModal } from "@/components/dashboard/family-members/add-family-member-modal";
import { EditFamilyMemberModal } from "@/components/dashboard/family-members/edit-family-member-modal";
import { downloadAuthorityDocument } from "@/lib/utils/authority-document-download";
import {
  confirmDelete,
  showErrorAlert,
  showToast,
} from "@/lib/alerts/sweetalert";

export default function ProfilePage() {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  // Modal states for adding & editing contacts
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [addContactRole, setAddContactRole] = useState<"REPRESENTATIVE" | "RECIPIENT">("REPRESENTATIVE");
  const [editingContact, setEditingContact] = useState<FamilyMember | null>(null);
  const [editingContactRole, setEditingContactRole] = useState<"REPRESENTATIVE" | "RECIPIENT" | undefined>(undefined);

  const authUser = useAppSelector((state) => state.auth.user);
  const { data: meResponse, isLoading: isUserLoading } = useGetMeQuery();
  const { data: familyResponse, isLoading: isFamilyLoading } = useGetFamilyMembersQuery();
  const [deleteFamilyMember, { isLoading: isDeleting }] = useDeleteFamilyMemberMutation();

  const user = meResponse?.data || authUser;
  const familyMembers: FamilyMember[] = familyResponse?.data || [];

  // Categorize family members into Representatives vs Authorized Report Recipients
  const representatives = familyMembers.filter(
    (m) => Boolean(m.isEmergencyContact) || Boolean(m.portalAccess)
  );

  const authorizedReportRecipients = familyMembers.filter(
    (m) => Boolean(m.reportAccess) && !m.isEmergencyContact && !m.portalAccess
  );

  if (isUserLoading && !user) {
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
  const phone = user?.phone || "(401) 212-3002";
  const memberId =
    user?.client?.clientNumber ||
    (user?.id ? `MEM-${user.id.slice(-5).toUpperCase()}` : "MEM-94021");
  const address = user?.client
    ? `${user.client.address}, ${user.client.city}, ${user.client.state} ${user.client.postalCode}`
    : "148 Hope Street, Providence, RI 02906";

  const handleOpenAddRepresentative = () => {
    setAddContactRole("REPRESENTATIVE");
    setIsAddContactModalOpen(true);
  };

  const handleOpenAddRecipient = () => {
    setAddContactRole("RECIPIENT");
    setIsAddContactModalOpen(true);
  };

  const handleOpenEditContact = (member: FamilyMember, role: "REPRESENTATIVE" | "RECIPIENT") => {
    setEditingContact(member);
    setEditingContactRole(role);
  };

  const handleDeleteContact = async (member: FamilyMember, roleLabel: string) => {
    const confirmed = await confirmDelete({
      title: `Remove ${member.name}?`,
      text: `Are you sure you want to remove ${member.name} from your ${roleLabel.toLowerCase()} list? They will no longer receive notifications or safety reports.`,
      confirmButtonText: "Yes, Remove",
      cancelButtonText: "Cancel",
    });

    if (!confirmed) return;

    try {
      const res = await deleteFamilyMember(member.id).unwrap();
      if (res.success) {
        showToast(`${member.name} removed successfully`, "success");
      }
    } catch (err: any) {
      const message =
        err?.data?.message || err?.message || `Failed to remove ${member.name}.`;
      showErrorAlert("Error", message);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-[#D9E4EC]/60">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
          My Member Profile
        </h1>
        <p className="text-sm sm:text-base text-[#64748B] mt-1">
          Manage your personal contact info, credentials, representatives, and authorized report recipients.
        </p>
      </div>

      {/* Member Details Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-xs space-y-6">
        {/* Basic Info Header with Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D9E4EC]">
          <div className="flex items-center gap-4">
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

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsEditProfileModalOpen(true)}
              className="px-4 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-4 py-2.5 bg-[#EAF3F8] hover:bg-[#D9E4EC] text-[#294B68] font-bold text-sm rounded-xl transition-all border border-[#5E8FB2]/30 flex items-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Change Password</span>
            </button>
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
      </div>

      {/* SECTION 1: Representatives */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9E4EC]">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#243746] flex items-center gap-2.5">
              <HeartHandshake className="w-6 h-6 text-[#294B68]" />
              Representatives
            </h2>
          </div>

          <button
            onClick={handleOpenAddRepresentative}
            className="px-4 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Representative</span>
          </button>
        </div>

        {/* Representative List */}
        {isFamilyLoading ? (
          <div className="p-8 text-center text-[#64748B] flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#294B68]" />
            <span>Loading representatives...</span>
          </div>
        ) : representatives.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border-2 border-dashed border-[#D9E4EC] bg-[#F8FAFC] space-y-3">
            <HeartHandshake className="w-10 h-10 text-[#5E8FB2] mx-auto opacity-70" />
            <h3 className="text-base font-bold text-[#243746]">No Representatives Added</h3>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto">
              Add a family coordinator or representative to receive all visit updates and notifications.
            </p>
            <button
              onClick={handleOpenAddRepresentative}
              className="px-4 py-2 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs sm:text-sm rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add First Representative</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {representatives.map((rep) => (
              <div
                key={rep.id}
                className="p-5 rounded-2xl border border-[#D9E4EC] bg-[#F8FAFC] hover:bg-white hover:border-[#5E8FB2]/50 transition-all shadow-2xs flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#294B68] text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {rep.name ? rep.name.charAt(0).toUpperCase() : "R"}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#243746] text-base leading-tight">
                          {rep.name}
                        </h4>
                        <span className="text-xs text-[#64748B] font-medium">
                          {rep.relationship || "Representative"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEditContact(rep, "REPRESENTATIVE")}
                        className="p-2 text-[#64748B] hover:text-[#294B68] hover:bg-[#EAF3F8] rounded-lg transition-colors cursor-pointer"
                        title="Edit representative"
                        aria-label="Edit representative"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContact(rep, "Representative")}
                        disabled={isDeleting}
                        className="p-2 text-[#64748B] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        title="Remove representative"
                        aria-label="Remove representative"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Badges / Document Download */}
                  {rep.authorityDocumentUrl && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          downloadAuthorityDocument({
                            url: rep.authorityDocumentUrl,
                            fileName:
                              rep.authorityDocumentName ||
                              `${(rep.name || "Representative").replace(/[^a-zA-Z0-9.-]/g, "_")}_Authority_Document.pdf`,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-all cursor-pointer shadow-2xs group"
                        title="Download uploaded legal authority document"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                        <span>Authority Document</span>
                        <Download className="w-3 h-3 text-emerald-700 opacity-80" />
                      </button>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-1.5 pt-2 text-xs sm:text-sm text-[#243746]">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#5E8FB2] shrink-0" />
                      <a
                        href={`mailto:${rep.email}`}
                        className="hover:underline text-[#243746] font-semibold break-all"
                      >
                        {rep.email}
                      </a>
                    </div>
                    {rep.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#5E8FB2] shrink-0" />
                        <a
                          href={`tel:${rep.phone}`}
                          className="hover:underline text-[#64748B]"
                        >
                          {rep.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: Authorized Report Recipients */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9E4EC]">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#243746] flex items-center gap-2.5">
              <FileCheck2 className="w-6 h-6 text-[#294B68]" />
              Authorized Report Recipients
            </h2>
          </div>

          <button
            onClick={handleOpenAddRecipient}
            className="px-4 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Report Recipient</span>
          </button>
        </div>

        {/* Authorized Recipients List */}
        {isFamilyLoading ? (
          <div className="p-8 text-center text-[#64748B] flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#294B68]" />
            <span>Loading authorized report recipients...</span>
          </div>
        ) : authorizedReportRecipients.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border-2 border-dashed border-[#D9E4EC] bg-[#F8FAFC] space-y-3">
            <FileCheck2 className="w-10 h-10 text-[#5E8FB2] mx-auto opacity-70" />
            <h3 className="text-base font-bold text-[#243746]">No Report Recipients Added</h3>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto">
              Add trusted family members or caregivers who should receive a copy of each completed visit safety report.
            </p>
            <button
              onClick={handleOpenAddRecipient}
              className="px-4 py-2 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-xs sm:text-sm rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add First Report Recipient</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {authorizedReportRecipients.map((rec) => (
              <div
                key={rec.id}
                className="p-5 rounded-2xl border border-[#D9E4EC] bg-[#F8FAFC] hover:bg-white hover:border-[#5E8FB2]/50 transition-all shadow-2xs flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#5E8FB2] text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {rec.name ? rec.name.charAt(0).toUpperCase() : "R"}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#243746] text-base leading-tight">
                          {rec.name}
                        </h4>
                        <span className="text-xs text-[#64748B] font-medium">
                          {rec.relationship || "Report Recipient"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEditContact(rec, "RECIPIENT")}
                        className="p-2 text-[#64748B] hover:text-[#294B68] hover:bg-[#EAF3F8] rounded-lg transition-colors cursor-pointer"
                        title="Edit report recipient"
                        aria-label="Edit report recipient"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContact(rec, "Report Recipient")}
                        disabled={isDeleting}
                        className="p-2 text-[#64748B] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        title="Remove report recipient"
                        aria-label="Remove report recipient"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/*  Badges */}
                  {/* <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      <FileCheck2 className="w-3 h-3 text-[#294B68]" /> Visit Reports &amp; Photos Only
                    </span>
                  </div>  */}

                  {/* Contact Info */}
                  <div className="space-y-1.5 pt-2 text-xs sm:text-sm text-[#243746]">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#5E8FB2] shrink-0" />
                      <a
                        href={`mailto:${rec.email}`}
                        className="hover:underline text-[#243746] font-semibold break-all"
                      >
                        {rec.email}
                      </a>
                    </div>
                    {rec.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#5E8FB2] shrink-0" />
                        <a
                          href={`tel:${rec.phone}`}
                          className="hover:underline text-[#64748B]"
                        >
                          {rec.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Home Access Methods Card */}
      <AccessMethodsCard />

      {/* Add Contact Modal */}
      <AddFamilyMemberModal
        isOpen={isAddContactModalOpen}
        onClose={() => setIsAddContactModalOpen(false)}
        initialRole={addContactRole}
      />

      {/* Edit Contact Modal */}
      <EditFamilyMemberModal
        isOpen={Boolean(editingContact)}
        member={editingContact}
        onClose={() => {
          setEditingContact(null);
          setEditingContactRole(undefined);
        }}
        forcedRole={editingContactRole}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
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
