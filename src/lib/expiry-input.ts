/** Helpers for the manual expiry-date input: two-digit year → full year. */

/** "26" → 2026, "9" → 2009, "2027" → 2027. Returns null if not a valid year. */
export function expandYear(input: string): number | null {
  const s = input.trim();
  if (!/^\d{1,4}$/.test(s)) return null;
  const full = s.length <= 2 ? 2000 + Number(s) : Number(s);
  if (full < 2000 || full > 2099) return null;
  return full;
}

/** Split a YYYY-MM-DD value into field strings ("9" not "09" for typing). */
export function splitExpiryDate(value: string): { year: string; month: string; day: string } {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return { year: "", month: "", day: "" };
  return { year: m[1] ?? "", month: String(Number(m[2])), day: String(Number(m[3])) };
}

/** Compose typed fields into YYYY-MM-DD. Two-digit year allowed; validates real calendar dates. */
export function composeExpiryDate(
  yearInput: string,
  monthInput: string,
  dayInput: string,
): string | null {
  const year = expandYear(yearInput);
  const month = Number(monthInput);
  const day = Number(dayInput);
  if (!year || monthInput.trim() === "" || dayInput.trim() === "") return null;
  if (!Number.isInteger(month) || !Number.isInteger(day)) return null;
  if (month < 1 || month > 12 || day < 1) return null;
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
