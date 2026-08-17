import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, helperText, icon, id, className, required, ...props }, ref) => {
    const inputId = id || props.name;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    return (
      <div className="w-full space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-[#243746] tracking-wide"
          >
            {label}
            {required && <span className="text-[#C95C5C] ml-1" aria-hidden="true">*</span>}
          </label>
        </div>

        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
              {icon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId || helperId}
            className={cn(
              "w-full h-12 px-4 text-base text-[#243746] bg-white border border-[#D9E4EC] rounded-xl transition-all duration-200 placeholder:text-[#94A3B8]",
              "focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] focus:border-[#294B68] focus:bg-white",
              "hover:border-[#B0C4DE]",
              icon && "pl-11",
              error && "border-[#C95C5C] focus:ring-[#C95C5C] focus:border-[#C95C5C] bg-red-50/20",
              className
            )}
            {...props}
          />
        </div>

        {error && (
          <p id={errorId} className="text-sm font-medium text-[#C95C5C] flex items-center gap-1 mt-1">
            <svg
              className="w-4 h-4 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </p>
        )}

        {helperText && !error && (
          <p id={helperId} className="text-xs text-[#64748B] mt-1">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
