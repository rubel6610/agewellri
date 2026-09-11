import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format duration in minutes into hourly and minute representation.
 * Examples:
 * - 60 -> "1 hr"
 * - 120 -> "2 hrs"
 * - 90 -> "1 hr 30 min"
 * - 45 -> "45 min"
 */
export function formatDuration(durationMinutes?: number | null): string {
  if (!durationMinutes || durationMinutes <= 0) return "0 min";
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} ${hours === 1 ? "hr" : "hrs"} ${minutes} min`;
  }
  if (hours > 0) {
    return `${hours} ${hours === 1 ? "hr" : "hrs"}`;
  }
  return `${minutes} min`;
}

/**
 * Format timestamp into relative readable string
 * Examples: "Just now", "5m ago", "2h ago", "Yesterday", "Sep 11, 2026"
 */
export function formatTimeAgo(dateString?: string | Date | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}
