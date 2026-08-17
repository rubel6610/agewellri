import React from "react";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-[480px] bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC]",
        "shadow-[0_12px_45px_-12px_rgba(41,75,104,0.09)] p-6 sm:p-10 transition-all duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}
