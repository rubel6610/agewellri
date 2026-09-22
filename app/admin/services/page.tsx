"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminServicesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/plans");
  }, [router]);

  return (
    <div className="py-20 text-center text-[#5E8FB2] font-medium text-sm">
      Redirecting to Service Plans...
    </div>
  );
}
