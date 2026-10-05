export interface OffDayItem {
  id: string;
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  formattedStartDate: string;
  formattedEndDate: string;
  formattedDateRange: string;
  isSingleDay: boolean;
  durationDays: number;
  isRecurring: boolean;
  isActive: boolean;
  status: "UPCOMING" | "TODAY" | "PAST" | "INACTIVE";
  createdByUserId?: string | null;
  createdByName?: string | null;
  createdAt?: string;
  updatedAt?: string;
  conflicts?: ConflictingAppointmentItem[];
  conflictCount?: number;
}

export interface ConflictingAppointmentItem {
  id: string;
  clientId: string;
  clientNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceName: string;
  startAt: string;
  date: string;
  formattedDate: string;
  timeSlot: string;
  technicianName: string;
  status: string;
}

export interface OffDayMetrics {
  totalActive: number;
  upcomingCount: number;
  thisMonthCount: number;
  recurringCount: number;
}

export interface AdminOffDaysResponse {
  items: OffDayItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  metrics: OffDayMetrics;
}

export interface CreateOffDayPayload {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  isRecurring?: boolean;
  isActive?: boolean;
}

export interface UpdateOffDayPayload {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isRecurring?: boolean;
  isActive?: boolean;
}

export interface PreviewConflictsPayload {
  startDate: string;
  endDate?: string;
}

export interface PreviewConflictsResponse {
  conflicts: ConflictingAppointmentItem[];
  conflictCount: number;
}

/**
 * Checks if a given Date or YYYY-MM-DD date string falls within any active off-day.
 * Supports single-day, multi-day ranges, and recurring yearly off-days.
 */
export function findMatchingOffDay(
  dateOrStr: Date | string | null | undefined,
  offDays: OffDayItem[] | undefined | null
): OffDayItem | undefined {
  if (!dateOrStr || !offDays || offDays.length === 0) return undefined;

  let y: number;
  let m: number; // 1-12
  let d: number; // 1-31
  let targetMidnight: number;

  if (typeof dateOrStr === "string") {
    const parts = dateOrStr.split("T")[0].split("-");
    if (parts.length < 3) return undefined;
    y = parseInt(parts[0], 10);
    m = parseInt(parts[1], 10);
    d = parseInt(parts[2], 10);
    targetMidnight = new Date(y, m - 1, d).getTime();
  } else {
    y = dateOrStr.getFullYear();
    m = dateOrStr.getMonth() + 1;
    d = dateOrStr.getDate();
    targetMidnight = new Date(y, m - 1, d).getTime();
  }

  return offDays.find((off) => {
    if (!off.isActive) return false;

    // Parse start and end date
    const sParts = (off.startDate || "").split("T")[0].split("-");
    const eParts = (off.endDate || off.startDate || "").split("T")[0].split("-");
    if (sParts.length < 3 || eParts.length < 3) return false;

    const sY = parseInt(sParts[0], 10);
    const sM = parseInt(sParts[1], 10);
    const sD = parseInt(sParts[2], 10);

    const eY = parseInt(eParts[0], 10);
    const eM = parseInt(eParts[1], 10);
    const eD = parseInt(eParts[2], 10);

    if (off.isRecurring) {
      // Compare month and day (recurring annually)
      const targetMMDD = m * 100 + d;
      const startMMDD = sM * 100 + sD;
      const endMMDD = eM * 100 + eD;

      if (startMMDD <= endMMDD) {
        return targetMMDD >= startMMDD && targetMMDD <= endMMDD;
      } else {
        // Wraps over New Year (e.g. Dec 25 to Jan 2)
        return targetMMDD >= startMMDD || targetMMDD <= endMMDD;
      }
    } else {
      const sMidnight = new Date(sY, sM - 1, sD).getTime();
      const eMidnight = new Date(eY, eM - 1, eD).getTime();
      return targetMidnight >= sMidnight && targetMidnight <= eMidnight;
    }
  });
}
