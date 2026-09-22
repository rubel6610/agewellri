"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  Shield,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit3,
  HeartHandshake,
  KeyRound,
} from "lucide-react";
import {
  useGetFamilyMembersQuery,
  useDeleteFamilyMemberMutation,
  useInviteFamilyMemberMutation,
} from "@/redux/features/family/familyApi";
import { FamilyMember } from "@/redux/features/family/familyTypes";
import { AddFamilyMemberModal } from "@/components/dashboard/family-members/add-family-member-modal";
import { EditFamilyMemberModal } from "@/components/dashboard/family-members/edit-family-member-modal";
import {
  confirmDelete,
  showSuccessAlert,
  showErrorAlert,
  showToast,
} from "@/lib/alerts/sweetalert";

export default function FamilyMembersPage() {
  const { data: familyRes, isLoading, refetch } = useGetFamilyMembersQuery();
  const [deleteFamilyMember, { isLoading: isDeleting }] = useDeleteFamilyMemberMutation();
  const [inviteFamilyMember, { isLoading: isInviting }] = useInviteFamilyMemberMutation();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  const familyMembers = familyRes?.data || [];

  // Summary Metrics
  const totalCount = familyMembers.length;
  const reportRecipientsCount = familyMembers.filter((m: FamilyMember) => Boolean(m.reportAccess)).length;
  const portalUsersCount = familyMembers.filter((m: FamilyMember) => Boolean(m.portalAccess)).length;
  const emergencyCount = familyMembers.filter((m: FamilyMember) => Boolean(m.isEmergencyContact)).length;

  const handleDelete = async (member: FamilyMember) => {
    const confirmed = await confirmDelete({
      title: `Remove ${member.name}?`,
      text: `Are you sure you want to remove ${member.name} from your authorized family members? They will no longer receive safety reports or access your portal.`,
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
        err?.data?.message || err?.message || "Failed to remove family member.";
      showErrorAlert("Error", message);
    }
  };

  const handleSendCredentials = async (member: FamilyMember) => {
    try {
      const res = await inviteFamilyMember({ id: member.id }).unwrap();
      if (res.success) {
        const pass = res.data?.password || "";
        showSuccessAlert(
          "Login Credentials Emailed!",
          `Portal login credentials (email: ${member.email}, password: ${pass}) have been sent directly to ${member.email}. They can now sign in immediately at /login.`
        );
      }
    } catch (err: any) {
      const message =
        err?.data?.message || err?.message || "Failed to send credentials.";
      showErrorAlert("Error", message);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-[#243746]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9E4EC]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746] tracking-tight">
            Family Members &amp; Contacts
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Manage authorized report recipients, emergency contacts, and portal login access.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Family Member</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-[#D9E4EC] shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Total Family
            </span>
            <Users className="w-4 h-4 text-[#5E8FB2]" />
          </div>
          <p className="text-2xl font-black text-[#243746]">{totalCount}</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#D9E4EC] shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Report Recipients
            </span>
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-[#243746]">{reportRecipientsCount}</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#D9E4EC] shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Portal Access
            </span>
            <Shield className="w-4 h-4 text-[#294B68]" />
          </div>
          <p className="text-2xl font-black text-[#243746]">{portalUsersCount}</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#D9E4EC] shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Emergency
            </span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-[#243746]">{emergencyCount}</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-[#EAF3F8] rounded-2xl border border-[#5E8FB2]/20 flex items-start gap-3">
        <HeartHandshake className="w-5 h-5 text-[#294B68] shrink-0 mt-0.5" />
        <div className="text-xs text-[#243746] leading-relaxed">
          <span className="font-bold">Simple family access:</span> You can provide login credentials directly to any family member. When they sign in at the login page, they can view visits, review safety reports, and help coordinate safety.
        </div>
      </div>

      {/* Family Members Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 bg-white rounded-2xl border border-[#D9E4EC] animate-pulse flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-200" />
                <div className="space-y-2">
                  <div className="w-36 h-4 bg-slate-200 rounded-md" />
                  <div className="w-24 h-3 bg-slate-100 rounded-md" />
                </div>
              </div>
              <div className="w-24 h-8 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : familyMembers.length === 0 ? (
        /* Empty State */
        <div className="p-12 sm:p-16 bg-white rounded-3xl border border-[#D9E4EC] text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-[#EAF3F8] text-[#294B68] rounded-2xl flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[#243746]">No Family Members Added Yet</h3>
          <p className="text-sm text-[#64748B] max-w-md mx-auto">
            Add family contacts, share login credentials, and authorize automatic visit report delivery.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add First Family Member</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop & Tablet Table View */}
          <div className="hidden md:block bg-white rounded-2xl border border-[#D9E4EC] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D9E4EC] bg-[#F8FAFC] text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    <th className="py-3.5 px-5">Member &amp; Relationship</th>
                    <th className="py-3.5 px-5">Contact Details</th>
                    <th className="py-3.5 px-4 text-center">Reports</th>
                    <th className="py-3.5 px-4 text-center">Portal Access</th>
                    <th className="py-3.5 px-4 text-center">Emergency</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E4EC]/60 text-sm font-medium text-[#243746]">
                  {familyMembers.map((member: FamilyMember) => {
                    const isPortalActive = Boolean(member.portalAccess);

                    return (
                      <tr
                        key={member.id}
                        className="hover:bg-[#F8FAFC] transition-colors"
                      >
                        {/* Member & Relationship */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#294B68] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                              {member.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#243746] truncate">
                                {member.name}
                              </p>
                              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF3F8] text-[#294B68] border border-[#5E8FB2]/20">
                                {member.relationship}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Contact Details */}
                        <td className="py-4 px-5">
                          <div className="space-y-0.5">
                            <p className="text-xs text-[#64748B] flex items-center gap-1.5 truncate">
                              <Mail className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                              <a
                                href={`mailto:${member.email}`}
                                className="hover:text-[#294B68] hover:underline truncate"
                              >
                                {member.email}
                              </a>
                            </p>
                            {member.phone ? (
                              <p className="text-xs text-[#64748B] flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                                <a
                                  href={`tel:${member.phone}`}
                                  className="hover:text-[#294B68] hover:underline"
                                >
                                  {member.phone}
                                </a>
                              </p>
                            ) : (
                              <span className="text-[11px] text-[#94A3B8]">No phone added</span>
                            )}
                          </div>
                        </td>

                        {/* Reports */}
                        <td className="py-4 px-4 text-center">
                          {member.reportAccess ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <FileCheck2 className="w-3.5 h-3.5" />
                              <span>Reports</span>
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>

                        {/* Portal Access */}
                        <td className="py-4 px-4 text-center">
                          {isPortalActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>

                        {/* Emergency Contact */}
                        <td className="py-4 px-4 text-center">
                          {member.isEmergencyContact ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Emergency</span>
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingMember(member)}
                              className="px-2.5 py-1.5 rounded-lg border border-[#D9E4EC] font-bold text-xs text-[#243746] hover:bg-[#F0F5F9] transition-colors flex items-center gap-1 cursor-pointer"
                              title="Edit Member"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#5E8FB2]" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSendCredentials(member)}
                              disabled={isInviting}
                              className="px-2.5 py-1.5 rounded-lg bg-[#EAF3F8] text-[#294B68] font-bold text-xs hover:bg-[#D9E4EC] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              title="Email Login Credentials"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>Credentials</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(member)}
                              disabled={isDeleting}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Remove family member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List View (Phone Screens) */}
          <div className="md:hidden space-y-3">
            {familyMembers.map((member: FamilyMember) => {
              const isPortalActive = Boolean(member.portalAccess);

              return (
                <div
                  key={member.id}
                  className="p-4 bg-white rounded-2xl border border-[#D9E4EC] shadow-2xs space-y-3.5"
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#294B68] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-[#243746] truncate">
                            {member.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF3F8] text-[#294B68] border border-[#5E8FB2]/20">
                            {member.relationship}
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B] truncate mt-0.5">
                          {member.email}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isPortalActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Portal Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          Reports Only
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Phone & Status Badges */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#D9E4EC]/60">
                    <div className="text-xs text-[#64748B]">
                      {member.phone ? (
                        <a href={`tel:${member.phone}`} className="hover:underline flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#94A3B8]" />
                          <span>{member.phone}</span>
                        </a>
                      ) : (
                        <span className="text-[#94A3B8] text-[11px]">No phone</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {member.reportAccess && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Reports
                        </span>
                      )}
                      {member.isEmergencyContact && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                          Emergency
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mobile Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#D9E4EC] text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingMember(member)}
                        className="px-2.5 py-1.5 rounded-lg border border-[#D9E4EC] font-bold text-xs text-[#243746] hover:bg-[#F0F5F9] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3 text-[#5E8FB2]" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendCredentials(member)}
                        disabled={isInviting}
                        className="px-2.5 py-1.5 rounded-lg bg-[#EAF3F8] text-[#294B68] font-bold text-xs hover:bg-[#D9E4EC] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <KeyRound className="w-3 h-3" />
                        <span>Credentials</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(member)}
                      disabled={isDeleting}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove family member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add Family Member Modal */}
      <AddFamilyMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Edit Family Member Modal */}
      <EditFamilyMemberModal
        isOpen={!!editingMember}
        member={editingMember}
        onClose={() => setEditingMember(null)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
