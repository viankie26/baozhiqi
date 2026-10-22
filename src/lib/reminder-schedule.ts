/** Public half of the push key pair (safe to ship to browsers). */
export const VAPID_PUBLIC_KEY =
  "BH8V0uwCDagyCH4RZsePvlmy_I2fFJjIgLmuEzhg0o4yk1EQQaxRNJbGXKuvwb1feYPumQQoYqeghm6T7e6bBuo";

export const DAYS_BEFORE_OPTIONS = [0, 1, 2, 3, 5, 7, 14] as const;

export interface ReminderSettings {
  enabled: boolean;
  daysBefore: number;
  remindHour: number;
  /** Minutes east of UTC, e.g. 480 for UTC+8. */
  tzOffsetMinutes: number;
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** The user's local wall-clock date and hour at the given instant. */
export function localClock(nowMs: number, tzOffsetMinutes: number) {
  const local = new Date(nowMs + tzOffsetMinutes * 60_000);
  return { today: iso(local), hour: local.getUTCHours() };
}

/** Date `days` after an ISO date (YYYY-MM-DD). */
export function addDaysIso(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return iso(d);
}

/**
 * Whether this user should be reminded now, and the expiry window:
 * items expiring from today through today + daysBefore (inclusive).
 */
export function reminderWindow(nowMs: number, s: ReminderSettings) {
  if (!s.enabled) return null;
  const { today, hour } = localClock(nowMs, s.tzOffsetMinutes);
  if (hour !== s.remindHour) return null;
  return { from: today, to: addDaysIso(today, s.daysBefore), today };
}

export function daysLabel(n: number): string {
  return n === 0 ? "当天" : `提前 ${n} 天`;
}
