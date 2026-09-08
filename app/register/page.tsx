import React, { Suspense } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Create Member Account | AgeWellRI",
  description: "Register for your AgeWellRI member portal account.",
};

export default function RegisterPage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500 text-sm">
            <Loader2 className="w-6 h-6 animate-spin text-[#294B68]" />
            <span>Loading registration form...</span>
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </AuthLayout>
  );
}
