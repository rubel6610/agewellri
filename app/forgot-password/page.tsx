import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata = {
  title: "Reset Password | AgeWellRI",
  description: "Reset your AgeWellRI account password with OTP verification.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="p-8 text-center text-sm text-[#64748B]">Loading...</div>}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
