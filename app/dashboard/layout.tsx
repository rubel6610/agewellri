import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getMemberProfile, getCurrentPlan, getNotifications } from "@/lib/api/dashboard";
import { AuthGuard } from "@/components/auth/auth-guard";

export const metadata = {
  title: "AgeWellRI | Client Portal",
  description: "Member dashboard and safety oversight portal.",
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const [user, plan, notifications] = await Promise.all([
    getMemberProfile(),
    getCurrentPlan(),
    getNotifications(),
  ]);

  return (
    <AuthGuard allowedRoles={["CLIENT"]} requireAgreement={true}>
      <DashboardLayout user={user} plan={plan} notifications={notifications}>
        {children}
      </DashboardLayout>
    </AuthGuard>
  );
}

