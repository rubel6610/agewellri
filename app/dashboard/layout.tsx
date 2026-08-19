import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getMemberProfile, getCurrentPlan, getNotifications } from "@/lib/api/dashboard";
import { AuthGuard } from "@/components/auth/auth-guard";

export const metadata = {
  title: "AgeWellRI | Client Portal",
  description: "Member dashboard and care coordination portal.",
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getMemberProfile();
  const plan = await getCurrentPlan();
  const notifications = await getNotifications();

  return (
    <AuthGuard allowedRoles={["CLIENT"]} requireAgreement={true}>
      <DashboardLayout user={user} plan={plan} notifications={notifications}>
        {children}
      </DashboardLayout>
    </AuthGuard>
  );
}

