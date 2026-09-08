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
  status: ClientStatus | string;
}

export function ClientStatusBadge({ status }: ClientStatusBadgeProps) {
  const norm = (status || "").toLowerCase().replace(/_/g, "");

  if (norm === "active" || norm === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAF3F8] text-[#3F8F6B] border border-[#3F8F6B]/30">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Active
      </span>
    );
  }

  if (norm.includes("agreement")) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-[#C28A3A] border border-[#C28A3A]/30">
        <FileCheck className="w-3.5 h-3.5" />
        Agreement Pending
      </span>
    );
  }

  if (norm.includes("paymentpending") || norm === "openinvoice" || norm === "pendingpayment") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAF3F8] text-[#294B68] border border-[#5E8FB2]/30">
        <CreditCard className="w-3.5 h-3.5" />
        Payment Pending
      </span>
    );
  }

  if (norm.includes("fail") || norm.includes("pastdue")) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-[#C95C5C] border border-[#C95C5C]/30">
        <AlertTriangle className="w-3.5 h-3.5" />
        Payment Failed
      </span>
    );
  }

  if (norm.includes("onboard") || norm === "invited" || norm === "accountcreated") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-[#C28A3A] border border-amber-200">
        <Clock className="w-3.5 h-3.5" />
        Onboarding
      </span>
    );
  }

  if (norm === "paused") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-[#64748B] border border-[#D9E4EC]">
        <PauseCircle className="w-3.5 h-3.5" />
        Paused
      </span>
    );
  }

  if (norm === "cancelled" || norm === "expired") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-[#64748B] border border-[#D9E4EC]">
        <XCircle className="w-3.5 h-3.5" />
        Cancelled
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-[#64748B] capitalize">
      {status.replace(/_/g, " ")}
    </span>
  );
}
