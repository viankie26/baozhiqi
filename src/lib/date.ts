import type { Item } from "./types";

export type Urgency = "expired" | "soon" | "normal";

/** Days remaining until expiry. Negative = already expired. */
export function daysUntil(expiryDate: string, now: Date = new Date()): number {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const exp = new Date(expiryDate + "T00:00:00");
  return Math.round((exp.getTime() - today.getTime()) / 86_400_000);
}

export function urgencyOf(item: Item, now: Date = new Date()): Urgency {
  const d = daysUntil(item.expiryDate, now);
  if (d < 0) return "expired";
  if (d <= 7) return "soon";
  return "normal";
}

export function remainingLabel(item: Item, now: Date = new Date()): string {
  const d = daysUntil(item.expiryDate, now);
  if (d < 0) return `已过期 ${Math.abs(d)} 天`;
  if (d === 0) return "今天过期";
  if (d === 1) return "明天过期";
  return `剩 ${d} 天`;
}

/** 0..1 progress toward expiry from a 30-day window (clamped). */
export function progressOf(item: Item, now: Date = new Date()): number {
  const d = daysUntil(item.expiryDate, now);
  if (d <= 0) return 1;
  if (d >= 30) return 0.08;
  return 1 - d / 30;
}

const ZH_WEEK = ["日", "一", "二", "三", "四", "五", "六"];

export function formatDate(expiryDate: string): string {
  const d = new Date(expiryDate + "T00:00:00");
  return `${d.getMonth() + 1}月${d.getDate()}日 周${ZH_WEEK[d.getDay()]}`;
}

/** Device-local date as YYYY-MM-DD (no UTC conversion). */
export function localDateString(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Parse loose Chinese/numeric date strings from voice transcript into YYYY-MM-DD. */
export function parseLooseDate(input: string, now: Date = new Date()): string | null {
  if (!input) return null;
  const s = input.trim();

  // Already ISO
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso && iso[1] && iso[2] && iso[3]) return normalize(iso[1], iso[2], iso[3]);

  // "9月15号" / "9月15日" / "9-15" / "9/15"
  const m = s.match(/(\d{1,2})\s*[月\/\-]\s*(\d{1,2})\s*[日号]?/);
  if (m && m[1] && m[2]) {
    const year =
      Number(m[1]) < now.getMonth() + 1 ? now.getFullYear() + 1 : now.getFullYear();
    return normalize(String(year), m[1], m[2]);
  }

  // "后天" / "明天" / "后天"
  if (s.includes("后天")) {
    const d = new Date(now.getTime() + 2 * 86_400_000);
    return normalize(String(d.getFullYear()), String(d.getMonth() + 1), String(d.getDate()));
  }
  if (s.includes("明天")) {
    const d = new Date(now.getTime() + 86_400_000);
    return normalize(String(d.getFullYear()), String(d.getMonth() + 1), String(d.getDate()));
  }
  if (s.includes("今天")) {
    return normalize(String(now.getFullYear()), String(now.getMonth() + 1), String(now.getDate()));
  }
  return null;
}

function normalize(y: string, m: string, d: string): string {
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}
