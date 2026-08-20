import React from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ClientAgreementForm } from "@/components/agreement/client-agreement-form";

export const metadata = {
  title: "AgeWellRI | Client Service Agreement",
  description: "Review and complete the initial Client Service Agreement.",
};

export default function AgreementPage() {
  return (
    <AuthGuard allowedRoles={["CLIENT"]} allowPendingAgreement={true} requireAgreement={false}>
      <ClientAgreementForm />
    </AuthGuard>
  );
}
