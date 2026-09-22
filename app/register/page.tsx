import React, { Suspense } from "react";
import { SignupWizard } from "@/components/signup/signup-wizard";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Complete Membership Signup | AgeWellRI",
  description: "Sign up for your AgeWellRI home maintenance membership and execute your service agreement.",
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-slate-500 text-sm">
          <Loader2 className="w-8 h-8 animate-spin text-[#294B68]" />
          <span>Loading membership registration...</span>
        </div>
      }
    >
      <SignupWizard />
    </Suspense>
  );
}
