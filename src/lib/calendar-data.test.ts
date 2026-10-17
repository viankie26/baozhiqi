import { describe, expect, test } from "vitest";
import { buildCalendar, calendarEntries, validCalendarDate } from "./calendar-data";
import type { Item } from "./types";

const items: Item[] = [
  { id: "00000000-0000-4000-8000-000000000001", name: "牛奶", category: "food", expiryDate: "2026-10-18", createdAt: 1 },
  { id: "00000000-0000-4000-8000-000000000002", name: "鸡蛋", category: "food", expiryDate: "2026-10-31", createdAt: 2 },
  { id: "00000000-0000-4000-8000-000000000003", name: "已用完", category: "food", expiryDate: "2026-10-17", createdAt: 3, usedUp: true },
];

describe("batch expiry reminders", () => {
  test("includes all in-stock records, excluding used-up records", () => {
    const entries = calendarEntries(items);
    expect(entries.map((entry) => entry.name)).toEqual(["牛奶", "鸡蛋"]);
    expect(buildCalendar(entries).match(/BEGIN:VEVENT/g)?.length).toBe(2);
  });
  test("uses literal expiry dates and exclusive next-day ends without timezone shifts", () => {
    const ics = buildCalendar(calendarEntries(items));
    expect(ics).toContain("DTSTART;VALUE=DATE:20261018\r\nDTEND;VALUE=DATE:20261019");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261031\r\nDTEND;VALUE=DATE:20261101");
  });
  test("preserves both reminder alarms for every item", () => {
    const ics = buildCalendar(calendarEntries(items));
    expect(ics.match(/TRIGGER:-PT15H/g)?.length).toBe(2);
    expect(ics.match(/TRIGGER:PT9H/g)?.length).toBe(2);
  });
  test("uses stable item identities across repeated exports", () => {
    const entries = calendarEntries(items);
    const first = buildCalendar(entries).match(/UID:[^\r]+/g);
    expect(first).toEqual(entries.map((entry) => `UID:${entry.id}@expiry-ledger`));
    expect(buildCalendar(entries).match(/UID:[^\r]+/g)).toEqual(first);
  });
  test("escapes event injection and folds Chinese text by UTF-8 bytes", () => {
    const ics = buildCalendar([{ name: "牛奶\r\nEND:VEVENT", date: "2026-10-18", note: "备注".repeat(100) }]);
    expect(ics.split("\r\n").filter((line) => line === "END:VEVENT")).toHaveLength(1);
    expect(ics).toContain("牛奶\\nEND:VEVENT");
    expect(ics.split("\r\n").every((line) => new TextEncoder().encode(line).length <= 75)).toBe(true);
  });
  test("rejects invalid calendar dates", () => {
    expect(validCalendarDate("2026-02-30")).toBe(false);
    expect(validCalendarDate("2028-02-29")).toBe(true);
    expect(() => buildCalendar([{ name: "牛奶", date: "2026-02-30" }])).toThrow();
  });
});