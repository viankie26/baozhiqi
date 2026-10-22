import { describe, expect, it } from "vitest";
import { addDaysIso, localClock, reminderWindow } from "./reminder-schedule";

const base = { enabled: true, daysBefore: 3, remindHour: 9, tzOffsetMinutes: 480 };

describe("reminderWindow", () => {
  it("fires at the user's chosen local hour (9:00 Shanghai = 01:00 UTC)", () => {
    const now = Date.UTC(2026, 9, 22, 1, 5);
    expect(reminderWindow(now, base)).toEqual({ from: "2026-10-22", to: "2026-10-25", today: "2026-10-22" });
  });
  it("does not fire at other hours", () => {
    expect(reminderWindow(Date.UTC(2026, 9, 22, 2, 0), base)).toBeNull();
  });
  it("does not fire when disabled", () => {
    expect(reminderWindow(Date.UTC(2026, 9, 22, 1, 0), { ...base, enabled: false })).toBeNull();
  });
  it("uses the user's local date, not UTC, near midnight", () => {
    // 23:30 UTC Oct 21 is 07:30 Oct 22 in Shanghai
    expect(localClock(Date.UTC(2026, 9, 21, 23, 30), 480)).toEqual({ today: "2026-10-22", hour: 7 });
  });
  it("respects the chosen days in advance", () => {
    const w = reminderWindow(Date.UTC(2026, 9, 22, 1, 0), { ...base, daysBefore: 7 });
    expect(w?.to).toBe("2026-10-29");
  });
  it("adds days across month ends", () => {
    expect(addDaysIso("2026-12-30", 3)).toBe("2027-01-02");
  });
});
