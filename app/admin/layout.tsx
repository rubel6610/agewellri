import { AdminLayout } from "@/components/admin/admin-layout";

export const metadata = {
  title: "AgeWellRI | Admin Control Center",
  description: "Operations dashboard for AgeWellRI staff and care managers.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
