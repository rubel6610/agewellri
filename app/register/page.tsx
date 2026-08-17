import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Create Member Account | AgeWellRI",
  description: "Register for your AgeWellRI member portal account.",
};

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
