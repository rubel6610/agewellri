import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getMemberProfile, getCurrentPlan, getNotifications } from "@/lib/api/dashboard";

export const metadata = {
  title: "AgeWellRI | Client Portal",
  description: "",
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getMemberProfile();
  const plan = await getCurrentPlan();
  const notifications = await getNotifications();

  return (
    <DashboardLayout user={user} plan={plan} notifications={notifications}>
      {children}
    </DashboardLayout>
  );
}
