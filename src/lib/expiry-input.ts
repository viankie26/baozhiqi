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

export type DatePresetId = "3d" | "1w" | "2w" | "1m" | "3m" | "6m" | "1y";

/** Quick-fill pills shown under the date fields, in tap order. */
export const DATE_PRESETS: { id: DatePresetId; label: string }[] = [
  { id: "3d", label: "3天后" },
  { id: "1w", label: "1周后" },
  { id: "2w", label: "半个月" },
  { id: "1m", label: "1个月" },
  { id: "3m", label: "3个月" },
  { id: "6m", label: "6个月" },
  { id: "1y", label: "1年" },
];

/** Expiry date a preset lands on, counted from today on the device (local time). */
export function offsetExpiryDate(id: DatePresetId, now: Date = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = id === "3d" ? 3 : id === "1w" ? 7 : id === "2w" ? 14 : null;
  if (days !== null) {
    d.setDate(d.getDate() + days);
    return isoOf(d);
  }
  const months = id === "1y" ? 12 : id === "6m" ? 6 : id === "3m" ? 3 : 1;
  const dayOfMonth = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(dayOfMonth, lastDay));
  return isoOf(d);
}

function isoOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

