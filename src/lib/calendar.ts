import { CATEGORY_LABEL, type Item } from "./types";

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

function ymd(dateStr: string, offsetDays = 0): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

function stamp(): string {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Builds an all-day .ics event on the expiry date with alarms 1 day before and on the day (9:00). */
export function buildIcs(item: Item): string {
  const desc = [`分类：${CATEGORY_LABEL[item.category]}`, item.note ? `备注：${item.note}` : ""]
    .filter(Boolean)
    .join("\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Expiry Ledger//CN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${item.id}@expiry-ledger`,
    `DTSTAMP:${stamp()}`,
    `DTSTART;VALUE=DATE:${ymd(item.expiryDate)}`,
    `DTEND;VALUE=DATE:${ymd(item.expiryDate, 1)}`,
    `SUMMARY:${esc(`[到期提醒] ${item.name}`)}`,
    `DESCRIPTION:${esc(desc)}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(`${item.name} 明天到期`)}`,
    "TRIGGER:-PT15H",
    "END:VALARM",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(`${item.name} 今天到期`)}`,
    "TRIGGER:PT9H",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function addToCalendar(item: Item) {
  // iOS 只对 http(s) 链接且 Content-Type 为 text/calendar 的内容弹「添加到日历」，
  // blob:/data: 链接一律被当成文件保存。因此跳转到服务器提供的日历链接。
  const params = new URLSearchParams({
    name: item.name,
    date: item.expiryDate,
    category: CATEGORY_LABEL[item.category],
  });
  if (item.note) params.set("note", item.note);
  window.location.href = `/api/calendar?${params.toString()}`;
}
