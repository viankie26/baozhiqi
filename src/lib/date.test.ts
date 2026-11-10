import { describe, expect, it } from "vitest";
import { daysUntil, expiryStatus, urgencyOf } from "./date";
import type { Item } from "./types";

describe("device-local expiry calculations (existing behavior)", () => {
  it.each([
    ["2026-11-09", -1, "expired"],
    ["2026-11-10", 0, "soon"],
    ["2026-11-17", 7, "soon"],
    ["2026-11-18", 8, "normal"],
  ] as const)("calculates %s from the same local date", (expiryDate, days, urgency) => {
    const now = new Date(2026, 10, 10, 23, 59);
    expect(daysUntil(expiryDate, now)).toBe(days);
    expect(expiryStatus(expiryDate, now)).toEqual({ days, urgency });
    const item: Item = { id: "test", name: "test", category: "food", expiryDate, createdAt: 0 };
    expect(urgencyOf(item, now)).toBe(urgency);
  });
  it("uses local calendar dates across year boundaries", () => {
    expect(daysUntil("2027-01-01", new Date(2026, 11, 31, 23, 59))).toBe(1);
  });
});