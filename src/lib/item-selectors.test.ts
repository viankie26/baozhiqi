import { describe, expect, it } from "vitest";
import { selectArchivedItems, selectHomeItems } from "./item-selectors";
import type { Item } from "./types";

const now = new Date(2026, 10, 10, 9, 39);
const items: Item[] = [
  { id: "normal", name: "Milk", category: "food", expiryDate: "2026-11-18", createdAt: 4 },
  { id: "expired", name: "Bread", category: "food", expiryDate: "2026-11-09", createdAt: 3 },
  { id: "soon", name: "Vitamins", category: "medicine", note: "MILK supplement", expiryDate: "2026-11-17", createdAt: 2 },
  { id: "today", name: "牛奶", category: "food", expiryDate: "2026-11-10", createdAt: 1 },
  { id: "archive", name: "Milk", category: "food", expiryDate: "2026-11-09", usedUp: true, createdAt: 0 },
];
const ids = (values: Item[]) => values.map((item) => item.id);

describe("portable item selection (existing behavior)", () => {
  it("excludes used-up records and preserves input order without mutation", () => {
    const frozen = Object.freeze(items.map((item) => Object.freeze({ ...item })));
    const result = selectHomeItems(frozen, {}, now);
    expect(ids(result.allActive)).toEqual(["normal", "expired", "soon", "today"]);
    expect(ids(result.active)).toEqual(["normal", "expired", "soon", "today"]);
    expect(ids(selectArchivedItems(frozen))).toEqual(["archive"]);
  });
  it("groups overdue, today through seven days, and eight days onward", () => {
    const result = selectHomeItems(items, {}, now);
    expect(ids(result.expired)).toEqual(["expired"]);
    expect(ids(result.soon)).toEqual(["soon", "today"]);
    expect(ids(result.normal)).toEqual(["normal"]);
    expect(result.alertCount).toBe(3);
  });
  it("searches names and notes case-insensitively, trimming the query", () => {
    expect(ids(selectHomeItems(items, { query: " MILK " }, now).active)).toEqual(["normal", "soon"]);
    expect(ids(selectHomeItems(items, { query: "牛奶" }, now).active)).toEqual(["today"]);
  });
  it("combines category and search while counts reflect matching records", () => {
    const result = selectHomeItems(items, { query: "milk", category: "medicine" }, now);
    expect(ids(result.active)).toEqual(["soon"]);
    expect(result.allActive).toHaveLength(4);
    expect(result.alertCount).toBe(1);
    expect(selectHomeItems(items, { query: "no match" }, now).active).toEqual([]);
  });
  it.each([
    ["all", true, true, true],
    ["soon", false, true, false],
    ["expired", true, false, false],
  ] as const)("retains section visibility for %s", (filter, expired, soon, normal) => {
    const result = selectHomeItems(items, { filter }, now);
    expect([result.showExpired, result.showSoon, result.showNormal]).toEqual([expired, soon, normal]);
    expect(result.active).toHaveLength(4);
  });
});