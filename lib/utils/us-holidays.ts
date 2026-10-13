/**
 * US Federal Holidays dynamic calculation utility for past, present, and future years (2026, 2027, 2028, 2029, 2030+)
 * Strictly complies with US Office of Personnel Management (OPM) federal holiday rules, including weekend observed dates.
 */

export interface USHoliday {
  name: string;
  date: string; // YYYY-MM-DD
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  description?: string;
  isFederalHoliday: boolean;
  isObserved?: boolean;
}

function getNthDayOfWeek(
  year: number,
  monthIndex: number,
  dayOfWeek: number,
  nth: number
): number {
  const firstDay = new Date(Date.UTC(year, monthIndex, 1));
  let dayOffset = dayOfWeek - firstDay.getUTCDay();
  if (dayOffset < 0) dayOffset += 7;
  return 1 + dayOffset + (nth - 1) * 7;
}

function getLastDayOfWeek(
  year: number,
  monthIndex: number,
  dayOfWeek: number
): number {
  const nextMonth = new Date(Date.UTC(year, monthIndex + 1, 0));
  const lastDay = nextMonth.getUTCDate();
  const lastDayOfWeek = nextMonth.getUTCDay();
  let diff = lastDayOfWeek - dayOfWeek;
  if (diff < 0) diff += 7;
  return lastDay - diff;
}

function formatDateStr(year: number, month: number, day: number): string {
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function addFixedHoliday(
  list: USHoliday[],
  name: string,
  year: number,
  month: number,
  day: number,
  description: string
) {
  const actualDateStr = formatDateStr(year, month, day);
  list.push({
    name,
    date: actualDateStr,
    year,
    month,
    day,
    description,
    isFederalHoliday: true,
  });

  const dObj = new Date(Date.UTC(year, month - 1, day));
  const dow = dObj.getUTCDay();

  if (dow === 6) {
    const obsDay = new Date(Date.UTC(year, month - 1, day - 1));
    const obsDateStr = formatDateStr(
      obsDay.getUTCFullYear(),
      obsDay.getUTCMonth() + 1,
      obsDay.getUTCDate()
    );
    list.push({
      name: `${name} (Observed)`,
      date: obsDateStr,
      year: obsDay.getUTCFullYear(),
      month: obsDay.getUTCMonth() + 1,
      day: obsDay.getUTCDate(),
      description: `Federal observance of ${name}`,
      isFederalHoliday: true,
      isObserved: true,
    });
  } else if (dow === 0) {
    const obsDay = new Date(Date.UTC(year, month - 1, day + 1));
    const obsDateStr = formatDateStr(
      obsDay.getUTCFullYear(),
      obsDay.getUTCMonth() + 1,
      obsDay.getUTCDate()
    );
    list.push({
      name: `${name} (Observed)`,
      date: obsDateStr,
      year: obsDay.getUTCFullYear(),
      month: obsDay.getUTCMonth() + 1,
      day: obsDay.getUTCDate(),
      description: `Federal observance of ${name}`,
      isFederalHoliday: true,
      isObserved: true,
    });
  }
}

const holidayCache = new Map<number, USHoliday[]>();

export function getUSHolidaysForYear(year: number): USHoliday[] {
  if (holidayCache.has(year)) {
    return holidayCache.get(year)!;
  }

  const holidays: USHoliday[] = [];

  // 1. New Year's Day — Jan 1
  addFixedHoliday(holidays, "New Year's Day", year, 1, 1, "First day of the new year");

  // 2. Martin Luther King Jr. Day — 3rd Monday in January
  const mlkDay = getNthDayOfWeek(year, 0, 1, 3);
  holidays.push({
    name: "Martin Luther King Jr. Day",
    date: formatDateStr(year, 1, mlkDay),
    year,
    month: 1,
    day: mlkDay,
    description: "Honoring Dr. Martin Luther King Jr.",
    isFederalHoliday: true,
  });

  // 3. Presidents' Day — 3rd Monday in February
  const presDay = getNthDayOfWeek(year, 1, 1, 3);
  holidays.push({
    name: "Presidents' Day",
    date: formatDateStr(year, 2, presDay),
    year,
    month: 2,
    day: presDay,
    description: "Honoring US Presidents",
    isFederalHoliday: true,
  });

  // 4. Memorial Day — Last Monday in May
  const memDay = getLastDayOfWeek(year, 4, 1);
  holidays.push({
    name: "Memorial Day",
    date: formatDateStr(year, 5, memDay),
    year,
    month: 5,
    day: memDay,
    description: "Honoring fallen military personnel",
    isFederalHoliday: true,
  });

  // 5. Juneteenth — June 19
  addFixedHoliday(
    holidays,
    "Juneteenth",
    year,
    6,
    19,
    "Commemorating the emancipation of enslaved African Americans"
  );

  // 6. Independence Day — July 4
  addFixedHoliday(
    holidays,
    "Independence Day",
    year,
    7,
    4,
    "Independence Day (4th of July)"
  );

  // 7. Labor Day — 1st Monday in September
  const laborDay = getNthDayOfWeek(year, 8, 1, 1);
  holidays.push({
    name: "Labor Day",
    date: formatDateStr(year, 9, laborDay),
    year,
    month: 9,
    day: laborDay,
    description: "American labor movement day",
    isFederalHoliday: true,
  });

  // 8. Indigenous Peoples' Day / Columbus Day — 2nd Monday in October
  const columbusDay = getNthDayOfWeek(year, 9, 1, 2);
  holidays.push({
    name: "Indigenous Peoples' Day / Columbus Day",
    date: formatDateStr(year, 10, columbusDay),
    year,
    month: 10,
    day: columbusDay,
    description: "Federal holiday in October",
    isFederalHoliday: true,
  });

  // 9. Veterans Day — November 11
  addFixedHoliday(
    holidays,
    "Veterans Day",
    year,
    11,
    11,
    "Honoring military veterans"
  );

  // 10. Thanksgiving Day — 4th Thursday in November
  const tgivingDay = getNthDayOfWeek(year, 10, 4, 4);
  holidays.push({
    name: "Thanksgiving Day",
    date: formatDateStr(year, 11, tgivingDay),
    year,
    month: 11,
    day: tgivingDay,
    description: "Traditional day of giving thanks",
    isFederalHoliday: true,
  });

  // 11. Christmas Day — December 25
  addFixedHoliday(holidays, "Christmas Day", year, 12, 25, "Celebration of Christmas");

  const sorted = holidays.sort((a, b) => a.date.localeCompare(b.date));
  holidayCache.set(year, sorted);
  return sorted;
}

export function getUSHolidayForDate(dateStr: string): USHoliday | null {
  if (!dateStr) return null;
  const parts = dateStr.split("T")[0].split("-");
  if (parts.length < 3) return null;
  const year = parseInt(parts[0], 10);
  if (isNaN(year)) return null;

  const targetFormatted = `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;

  const holidays = getUSHolidaysForYear(year);
  const found = holidays.find((h) => h.date === targetFormatted);
  if (found) return found;

  if (parts[1] === "12" && parts[2] === "31") {
    const nextYearHolidays = getUSHolidaysForYear(year + 1);
    const nextYearObserved = nextYearHolidays.find((h) => h.date === targetFormatted);
    if (nextYearObserved) return nextYearObserved;
  }

  if (parts[1] === "01" && (parts[2] === "01" || parts[2] === "02" || parts[2] === "03")) {
    const prevYearHolidays = getUSHolidaysForYear(year - 1);
    const prevYearObserved = prevYearHolidays.find((h) => h.date === targetFormatted);
    if (prevYearObserved) return prevYearObserved;
  }

  return null;
}
