import React from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionText,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="p-8 sm:p-12 text-center bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] space-y-4">
      <div className="w-14 h-14 bg-[#EAF3F8] text-[#294B68] rounded-2xl flex items-center justify-center mx-auto">
        {icon || <FolderOpen className="w-7 h-7" />}
      </div>
      <div className="space-y-1 max-w-sm mx-auto">
        <h4 className="text-lg font-bold text-[#243746]">{title}</h4>
        <p className="text-xs sm:text-sm text-[#64748B]">{description}</p>
      </div>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-5 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-sm rounded-xl transition-all shadow-xs cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
