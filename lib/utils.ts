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
