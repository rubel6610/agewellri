"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { UserRole } from "@/redux/features/auth/authTypes";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAgreement?: boolean;
  allowPendingAgreement?: boolean;
}

export function AuthGuard({
  children,
  allowedRoles,
  requireAgreement = true,
  allowPendingAgreement = false,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isInitialized, user } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (!isInitialized) return;

    // 1. Unauthenticated -> Redirect to login with returnUrl
    if (!isAuthenticated || !user) {
      const fullPath =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : pathname;

      if (pathname === "/login" || pathname === "/register") return;

      router.replace(`/login?redirect=${encodeURIComponent(fullPath)}`);
      return;
    }

    // 2. Role Authorization Check
    if (
      allowedRoles &&
      allowedRoles.length > 0 &&
      !allowedRoles.includes(user.role)
    ) {
      if (user.role === "ADMIN") {
        router.replace("/admin");
      } else if (user.role === "CLIENT") {
        if (!user.isFamilyMember && (user?.requiresAgreement || !user?.hasCompletedAgreement)) {
          router.replace("/agreement");
        } else {
          router.replace("/dashboard");
        }
      }
      return;
    }

    // 3. Client Service Agreement Check (For CLIENT users)
    if (user.role === "CLIENT") {
      // Family members are authorized observers and never require agreement signing
      if (user.isFamilyMember) {
        if (allowPendingAgreement) {
          router.replace("/dashboard");
          return;
        }
        return;
      }

      const isAgreementPending =
        user.requiresAgreement === true || !user.hasCompletedAgreement;

      // If user is on agreement page but already completed it -> go to dashboard
      if (allowPendingAgreement && !isAgreementPending) {
        router.replace("/dashboard");
        return;
      }

      // If user is on dashboard/protected client route but has NOT signed agreement -> go to agreement
      if (requireAgreement && isAgreementPending && !allowPendingAgreement) {
        router.replace("/agreement");
        return;
      }
    }
  }, [
    isInitialized,
    isAuthenticated,
    user,
    allowedRoles,
    requireAgreement,
    allowPendingAgreement,
    pathname,
    router,
  ]);

  // Loading Screen while verifying authentication
  if (!isInitialized || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="p-4 bg-white rounded-2xl shadow-sm border border-[#D9E4EC] flex flex-col items-center gap-3">
          <Image
            src="/logo.png"
            alt="AgeWellRI Logo"
            width={180}
            height={48}
            priority
            className="h-auto w-auto max-h-11 object-contain"
          />
          <div className="flex items-center gap-2 text-sm font-semibold text-[#294B68] pt-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#5E8FB2]" />
            <span>Loading ......</span>
          </div>
        </div>
      </div>
    );
  }

  // Role validation fallback check
  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 bg-white rounded-3xl shadow-sm border border-[#D9E4EC] space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#243746]">Redirecting...</h2>
          <p className="text-sm text-[#64748B]">
            You do not have permission to access this area. Taking you to your
            designated portal.
          </p>
          <div className="flex justify-center pt-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#294B68]" />
          </div>
        </div>
      </div>
    );
  }

  // Client Agreement fallback check
  if (
    user.role === "CLIENT" &&
    requireAgreement &&
    !allowPendingAgreement &&
    (user.requiresAgreement || !user.hasCompletedAgreement)
  ) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 bg-white rounded-3xl shadow-sm border border-[#D9E4EC] space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF3F8] text-[#294B68] flex items-center justify-center mx-auto border border-[#5E8FB2]/30">
            <Loader2 className="w-6 h-6 animate-spin text-[#294B68]" />
          </div>
          <h2 className="text-xl font-bold text-[#243746]">
            Agreement Required
          </h2>
          <p className="text-sm text-[#64748B]">
            Please review and sign your Client Service Agreement before
            accessing the dashboard.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
