import { AdminLayout } from "@/components/admin/admin-layout";
import { AuthGuard } from "@/components/auth/auth-guard";

export const metadata = {
  title: "AgeWellRI | Admin Control Center",
  description: "Operations dashboard for AgeWellRI staff and care managers.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <AdminLayout>{children}</AdminLayout>
    </AuthGuard>
  );
}

