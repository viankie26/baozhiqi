import { categoryLabel, type Item } from "./types";
import type { Lang } from "./i18n-dict";

export type CalendarEntry = { id?: string | undefined; name: string; date: string; category?: string | undefined; note?: string | undefined };

/** ICS text snippets per language — one serializer, bilingual output. */
const CAL_STRINGS = {
  zh: {
    summary: (name: string) => `[到期提醒] ${name}`,
    category: (cat: string) => `分类：${cat}`,
    note: (note: string) => `备注：${note}`,
    alarmTomorrow: (name: string) => `${name} 明天到期`,
    alarmToday: (name: string) => `${name} 今天到期`,
  },
  en: {
    summary: (name: string) => `[Expiry] ${name}`,
    category: (cat: string) => `Category: ${cat}`,
    note: (note: string) => `Note: ${note}`,
    alarmTomorrow: (name: string) => `${name} expires tomorrow`,
    alarmToday: (name: string) => `${name} expires today`,
  },
} as const;

export function calendarEntries(items: Item[], lang: Lang = "zh"): CalendarEntry[] {
  return items.filter((item) => !item.usedUp).map((item) => ({
    id: item.id,
    name: item.name,
    date: item.expiryDate,
    category: categoryLabel(item.category, lang),
    note: item.note,
  }));
}

function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r\n|\r|\n/g, "\\n");
}

export function validCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function calendarDate(value: string, offset = 0): string {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

// Fold at 75 UTF-8 bytes, without splitting Chinese characters.
function foldLine(line: string): string {
  const encoder = new TextEncoder();
  let result = "";
  let bytes = 0;
  for (const character of line) {
    const size = encoder.encode(character).length;
    if (bytes + size > 75) {
      result += "\r\n ";
      bytes = 1;
    }
    result += character;
    bytes += size;
  }
  return result;
}

export function buildCalendar(entries: CalendarEntry[], now = new Date(), lang: Lang = "zh"): string {
  const s = CAL_STRINGS[lang];
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Minipiry//CN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
  for (const entry of entries) {
    if (!validCalendarDate(entry.date)) throw new Error("Invalid expiry date");
    const description = [entry.category ? s.category(entry.category) : "", entry.note ? s.note(entry.note) : ""].filter(Boolean).join("\n");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${entry.id ?? crypto.randomUUID()}@expiry-ledger`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${calendarDate(entry.date)}`,
      `DTEND;VALUE=DATE:${calendarDate(entry.date, 1)}`,
      `SUMMARY:${escapeText(s.summary(entry.name))}`,
      `DESCRIPTION:${escapeText(description)}`,
      "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${escapeText(s.alarmTomorrow(entry.name))}`, "TRIGGER:-PT15H", "END:VALARM",
      "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${escapeText(s.alarmToday(entry.name))}`, "TRIGGER:PT9H", "END:VALARM",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
