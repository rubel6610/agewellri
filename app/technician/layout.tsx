import { AuthGuard } from "@/components/auth/auth-guard";

export const metadata = {
  title: "AgeWellRI | Field Technician Portal",
  description: "Field technician portal for visit management and safety audits.",
};

export default function TechnicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["TECHNICIAN"]}>
      <div className="min-h-screen bg-[#F7FAFC] text-[#243746]">
        {children}
      </div>
    </AuthGuard>
  );
}
