import React from "react";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  PauseCircle,
  FileCheck,
  CreditCard,
} from "lucide-react";
import { ClientStatus } from "@/lib/types/admin";

interface ClientStatusBadgeProps {
  status: ClientStatus;
}

export function ClientStatusBadge({ status }: ClientStatusBadgeProps) {
  switch (status) {
    case "active":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAF3F8] text-[#3F8F6B] border border-[#3F8F6B]/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Active
        </span>
      );
    case "agreement_pending":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-[#C28A3A] border border-[#C28A3A]/30">
          <FileCheck className="w-3.5 h-3.5" />
          Agreement Pending
        </span>
      );
    case "payment_pending":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAF3F8] text-[#294B68] border border-[#5E8FB2]/30">
          <CreditCard className="w-3.5 h-3.5" />
          Payment Pending
        </span>
      );
    case "payment_failed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-[#C95C5C] border border-[#C95C5C]/30">
          <AlertTriangle className="w-3.5 h-3.5" />
          Payment Failed
        </span>
      );
    case "invited":
    case "account_created":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-[#64748B] border border-[#D9E4EC]">
          <Clock className="w-3.5 h-3.5" />
          Onboarding
        </span>
      );
    case "paused":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-[#64748B] border border-[#D9E4EC]">
          <PauseCircle className="w-3.5 h-3.5" />
          Paused
        </span>
      );
    case "cancelled":
    case "expired":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-[#64748B] border border-[#D9E4EC]">
          <XCircle className="w-3.5 h-3.5" />
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-[#64748B]">
          {status}
        </span>
      );
  }
}
