import { USHoliday } from "@/lib/utils/us-holidays";

export interface TimeWindow {
  start: string; // "HH:MM" 24h format e.g. "09:00"
  end: string;   // "HH:MM" 24h format e.g. "17:00"
}

export interface DaySchedule {
  dayOfWeek: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  dayName: string;   // "Sunday", "Monday", etc.
  isOpen: boolean;
  timeWindows: TimeWindow[];
}

export interface WeeklySchedule {
  id: string;
  name: string;
  isDefault: boolean;
  days: DaySchedule[];
  slotDuration: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleOverrideItem {
  id: string;
  title: string;
  description?: string;
  overrideType: "DATE" | "WEEK";
  status: "CLOSED" | "CUSTOM_HOURS" | "OPEN";
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  formattedStartDate: string;
  formattedEndDate: string;
  formattedDateRange: string;
  isSingleDay: boolean;
  isRecurring: boolean;
  isActive: boolean;
  timeWindows: TimeWindow[];
  offDayId?: string | null;
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

export interface AvailableSlotItem {
  slot: string; // "09:00 AM – 10:00 AM"
  startTime: string; // "09:00 AM"
  endTime: string; // "10:00 AM"
  startMinutes: number;
  endMinutes: number;
  windowIndex: number;
}

export interface BookedSlotItem {
  id: string;
  appointmentId: string;
  clientId: string;
  clientName: string;
  serviceName: string;
  startAt: string;
  endAt: string;
  startMinutes: number;
  endMinutes: number;
  timeSlot: string;
  startTime: string;
  endTime: string;
  technicianName: string;
  status: string;
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  formattedDate: string;
  dayOfWeek: number;
  dayName: string;
  isOpen: boolean;
  isClosed: boolean;
  source: "DEFAULT_WEEKLY" | "DATE_OVERRIDE" | "WEEK_OVERRIDE" | "OFF_DAY";
  overrideTitle?: string;
  overrideDescription?: string;
  overrideStatus?: "CLOSED" | "CUSTOM_HOURS" | "OPEN";
  overrideItem?: ScheduleOverrideItem | null;
  timeWindows: TimeWindow[];
  holiday: USHoliday | null;
  isHoliday: boolean;
  isPastDate: boolean;
  isToday: boolean;
  availableSlots: AvailableSlotItem[];
  bookedSlots: BookedSlotItem[];
  allPossibleSlots?: AvailableSlotItem[];
  metrics: {
    totalPossibleSlots?: number;
    availableCount: number;
    bookedCount: number;
  };
}

export interface CalendarRangeResponse {
  startDate: string;
  endDate: string;
  days: DayAvailability[];
  summary: {
    totalDays: number;
    openDaysCount: number;
    closedDaysCount: number;
    totalBookingsCount: number;
    totalAvailableSlotsCount: number;
  };
}

export interface OverridesListResponse {
  items: ScheduleOverrideItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  metrics: {
    totalActive: number;
    closedCount: number;
    customCount: number;
    weekOverrideCount: number;
  };
}

export interface CreateOverridePayload {
  title: string;
  description?: string;
  overrideType?: "DATE" | "WEEK";
  status?: "CLOSED" | "CUSTOM_HOURS" | "OPEN";
  startDate: string;
  endDate?: string;
  isRecurring?: boolean;
  isActive?: boolean;
  timeWindows?: TimeWindow[];
}

export interface UpdateOverridePayload {
  title?: string;
  description?: string;
  overrideType?: "DATE" | "WEEK";
  status?: "CLOSED" | "CUSTOM_HOURS" | "OPEN";
  startDate?: string;
  endDate?: string;
  isRecurring?: boolean;
  isActive?: boolean;
  timeWindows?: TimeWindow[];
}

export interface UpdateWeeklySchedulePayload {
  name?: string;
  days: DaySchedule[];
  slotDuration?: number;
}
