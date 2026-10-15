import { TimeWindow } from "@/redux/features/schedule/scheduleTypes";

/**
 * Convert time string ("09:00", "09:00 AM", "9:00 AM", "13:00", "1:00 PM") into minutes from midnight (0-1440)
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  // Match 12-hour format e.g. "09:00 AM" or "9:30 PM"
  const match12 = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (match12) {
    let hour = parseInt(match12[1], 10);
    const min = parseInt(match12[2], 10);
    const ampm = match12[3].toUpperCase();
    if (ampm === "PM" && hour < 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    return hour * 60 + min;
  }

  // Match 24-hour format e.g. "09:00" or "13:30"
  const parts = timeStr.split(":");
  if (parts.length >= 2) {
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    return h * 60 + m;
  }
  return 0;
}

/**
 * Format total minutes from midnight into 12-hour AM/PM string (e.g. 540 -> "09:00 AM", 780 -> "01:00 PM")
 */
export function formatMinutesToTimeString(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinute = String(minutes).padStart(2, "0");
  return `${String(displayHour).padStart(2, "0")}:${displayMinute} ${ampm}`;
}

/**
 * Convert 24-hour time string ("09:00", "13:00") into 12-hour AM/PM string ("09:00 AM", "01:00 PM")
 */
export function format24hTo12h(time24: string): string {
  if (!time24) return "";
  const parts = time24.split(":");
  if (parts.length < 2) return time24;
  let h = parseInt(parts[0], 10);
  const m = parts[1];
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${String(displayH).padStart(2, "0")}:${m} ${ampm}`;
}

/**
 * Parse a time slot string (e.g. "09:00 AM – 11:00 AM") into start and end minutes
 */
export function parseTimeSlotToMinutes(
  timeSlot: string
): { startMin: number; endMin: number } | null {
  if (!timeSlot) return null;
  const parts = timeSlot.split(/\s*(?:–|—|-|to)\s*/i);
  if (parts.length < 2) return null;
  const startMin = timeToMinutes(parts[0]);
  const endMin = timeToMinutes(parts[1]);
  if (endMin <= startMin) return null;
  return { startMin, endMin };
}

/**
 * Check if two time slot ranges overlap
 */
export function isTimeOverlapping(
  slot1: { startMin: number; endMin: number },
  slot2: { startMin: number; endMin: number }
): boolean {
  return Math.max(slot1.startMin, slot2.startMin) < Math.min(slot1.endMin, slot2.endMin);
}

/**
 * Generate standard preset time slots that strictly fall within the provided operational time windows.
 * e.g., if windows is [{ start: "09:00", end: "13:00" }] and durationHours = 2:
 * returns ["09:00 AM – 11:00 AM", "10:00 AM – 12:00 PM", "11:00 AM – 01:00 PM"]
 */
export function generateStandardTimeSlotsForWindows(
  windows: TimeWindow[],
  durationHours: number
): string[] {
  if (!windows || windows.length === 0) return [];

  const durationMin = Math.max(1, durationHours) * 60;
  const slots: string[] = [];

  // 1. Try session-duration stepped windows first (e.g. discrete 2-hour blocks)
  for (const win of windows) {
    const wStartMin = timeToMinutes(win.start);
    const wEndMin = timeToMinutes(win.end);
    const stepMin = durationMin;

    for (let m = wStartMin; m + durationMin <= wEndMin; m += stepMin) {
      const slotStr = `${formatMinutesToTimeString(m)} – ${formatMinutesToTimeString(m + durationMin)}`;
      if (!slots.includes(slotStr)) {
        slots.push(slotStr);
      }
    }
  }

  // 2. If session-stepped produced <= 1 slot, or if the window allows hourly options (e.g. 9-1: 9-11, 10-12, 11-1)
  const hourlySlots: string[] = [];
  for (const win of windows) {
    const wStartMin = timeToMinutes(win.start);
    const wEndMin = timeToMinutes(win.end);
    const stepMin = 60; // 1-hour step for convenient scheduling choices

    for (let m = wStartMin; m + durationMin <= wEndMin; m += stepMin) {
      const slotStr = `${formatMinutesToTimeString(m)} – ${formatMinutesToTimeString(m + durationMin)}`;
      if (!hourlySlots.includes(slotStr)) {
        hourlySlots.push(slotStr);
      }
    }
  }

  if (hourlySlots.length > slots.length) {
    return hourlySlots;
  }

  return slots.length > 0 ? slots : hourlySlots;
}

/**
 * Generate available start times for custom time mode that strictly fall within operational time windows
 * such that startMin >= window.start AND (startMin + durationHours * 60) <= window.end
 */
export function getAvailableStartTimesForWindows(
  windows: TimeWindow[],
  durationHours: number
): string[] {
  if (!windows || windows.length === 0) return [];

  const durationMin = Math.max(1, durationHours) * 60;
  const startTimes: string[] = [];

  for (const win of windows) {
    const wStartMin = timeToMinutes(win.start);
    const wEndMin = timeToMinutes(win.end);
    const maxStartMin = wEndMin - durationMin;

    for (let m = wStartMin; m <= maxStartMin; m += 30) {
      const timeStr = formatMinutesToTimeString(m);
      if (!startTimes.includes(timeStr)) {
        startTimes.push(timeStr);
      }
    }
  }

  return startTimes.sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
}

/**
 * Calculate the end time given a start time and visit duration in hours.
 */
export function calculateEndTime(
  startStr: string,
  durationHours: number
): string {
  const startMin = timeToMinutes(startStr);
  const endMin = startMin + Math.max(1, durationHours) * 60;
  return formatMinutesToTimeString(endMin);
}

/**
 * Verify whether a chosen time slot string completely falls within any open operational window.
 */
export function isSlotWithinTimeWindows(
  timeSlotStr: string,
  windows: TimeWindow[]
): boolean {
  if (!windows || windows.length === 0) return false;
  const range = parseTimeSlotToMinutes(timeSlotStr);
  if (!range) return false;

  return windows.some((win) => {
    const wStart = timeToMinutes(win.start);
    const wEnd = timeToMinutes(win.end);
    return range.startMin >= wStart && range.endMin <= wEnd;
  });
}

/**
 * Format a list of operational time windows into a human-friendly string summary.
 * e.g. [{ start: "09:00", end: "13:00" }] -> "09:00 AM – 01:00 PM"
 */
export function formatTimeWindowsSummary(windows: TimeWindow[]): string {
  if (!windows || windows.length === 0) return "Closed (No operational hours)";
  return windows
    .map((w) => `${format24hTo12h(w.start)} – ${format24hTo12h(w.end)}`)
    .join(", ");
}

/**
 * Checks whether the time windows correspond to the standard default 8 AM - 6 PM shift.
 * Standard default shift is 1 window from 08:00 to 18:00 (480 min to 1080 min).
 */
export function isDefaultShift(
  windows?: { start: string; end: string }[] | null
): boolean {
  if (!windows || windows.length !== 1) return false;
  const w = windows[0];
  const startMin = timeToMinutes(w.start);
  const endMin = timeToMinutes(w.end);
  return startMin === 480 && endMin === 1080;
}

/**
 * Returns the label for a day or override opened by custom open:
 * If the time window is 8 AM to 6 PM, returns "Open",
 * otherwise returns "Custom Open".
 */
export function getCustomOpenLabel(
  windows?: { start: string; end: string }[] | null
): "Open" | "Custom Open" {
  return isDefaultShift(windows) ? "Open" : "Custom Open";
}

/**
 * Formats an override title: replaces legacy "Custom Hours" or "Default Shift Open" with "Open" or "Custom Open"
 * based on whether the time windows match 8 AM - 6 PM.
 */
export function formatOverrideTitle(
  title?: string | null,
  windows?: { start: string; end: string }[] | null
): string {
  if (!title) return "";
  if (title.startsWith("Custom Hours") || title.startsWith("Default Shift Open")) {
    const isDef = isDefaultShift(windows);
    return title
      .replace(/^Custom Hours/, isDef ? "Open" : "Custom Open")
      .replace(/^Default Shift Open/, isDef ? "Open" : "Custom Open");
  }
  return title;
}

/**
 * Checks whether an override title is an auto-generated title (e.g. "Custom Open (2026-10-14)", "Office Closed (...)")
 * rather than an admin-entered title.
 */
export function isAutoTitle(t?: string | null): boolean {
  if (!t) return false;
  return (
    t.startsWith("Office Closed") ||
    t.startsWith("Custom Hours") ||
    t.startsWith("Custom Open") ||
    t.startsWith("Default Shift Open") ||
    t.startsWith("Open (") ||
    t === "Open"
  );
}


