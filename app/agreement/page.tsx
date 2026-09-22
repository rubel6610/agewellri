import React, { Suspense } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SignupWizard } from "@/components/signup/signup-wizard";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Complete Service Agreement | AgeWellRI",
  description: "Complete your AgeWellRI membership service agreement and payment authorization.",
};

export default function AgreementPage() {
  return (
    <AuthGuard allowedRoles={["CLIENT"]} allowPendingAgreement={true} requireAgreement={false}>
      <Suspense
        fallback={
          <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-slate-500 text-sm">
            <Loader2 className="w-8 h-8 animate-spin text-[#294B68]" />
            <span>Loading agreement wizard...</span>
          </div>
        }
      >
        <SignupWizard skipAccountStep={true} />
      </Suspense>
    </AuthGuard>
  );
}
