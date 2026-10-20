import { describe, expect, it } from "vitest";
import {
  DATE_PRESETS,
  composeExpiryDate,
  expandYear,
  offsetExpiryDate,
  splitExpiryDate,
} from "./expiry-input";

describe("expandYear", () => {
  it("expands two-digit years into 20xx", () => {
    expect(expandYear("26")).toBe(2026);
    expect(expandYear("27")).toBe(2027);
    expect(expandYear("31")).toBe(2031);
  });

  it("expands single-digit and four-digit years", () => {
    expect(expandYear("9")).toBe(2009);
    expect(expandYear("2026")).toBe(2026);
  });

  it("rejects invalid years", () => {
    expect(expandYear("")).toBeNull();
    expect(expandYear("abc")).toBeNull();
    expect(expandYear("1899")).toBeNull();
    expect(expandYear("2100")).toBeNull();
  });
});

describe("composeExpiryDate", () => {
  it("composes with two-digit year and no leading zeros", () => {
    expect(composeExpiryDate("26", "9", "15")).toBe("2026-09-15");
    expect(composeExpiryDate("31", "1", "3")).toBe("2031-01-03");
  });

  it("accepts full year and padded inputs too", () => {
    expect(composeExpiryDate("2026", "09", "15")).toBe("2026-09-15");
  });

  it("rejects impossible dates", () => {
    expect(composeExpiryDate("26", "2", "30")).toBeNull();
    expect(composeExpiryDate("26", "13", "1")).toBeNull();
    expect(composeExpiryDate("26", "0", "5")).toBeNull();
    expect(composeExpiryDate("26", "9", "")).toBeNull();
    expect(composeExpiryDate("26", "", "15")).toBeNull();
    expect(composeExpiryDate("", "9", "15")).toBeNull();
  });

  it("allows real leap days", () => {
    expect(composeExpiryDate("24", "2", "29")).toBe("2024-02-29");
    expect(composeExpiryDate("26", "2", "29")).toBeNull();
  });
});

describe("splitExpiryDate", () => {
  it("splits a stored date into typable fields", () => {
    expect(splitExpiryDate("2026-09-15")).toEqual({ year: "2026", month: "9", day: "15" });
  });

  it("returns empty fields for invalid values", () => {
    expect(splitExpiryDate("")).toEqual({ year: "", month: "", day: "" });
    expect(splitExpiryDate("garbage")).toEqual({ year: "", month: "", day: "" });
  });
});

describe("offsetExpiryDate", () => {
  const now = new Date(2026, 9, 20); // 2026-10-20, device-local

  it("adds the day-based presets", () => {
    expect(offsetExpiryDate("3d", now)).toBe("2026-10-23");
    expect(offsetExpiryDate("1w", now)).toBe("2026-10-27");
    expect(offsetExpiryDate("2w", now)).toBe("2026-11-03");
  });

  it("adds the month-based presets and crosses the year", () => {
    expect(offsetExpiryDate("1m", now)).toBe("2026-11-20");
    expect(offsetExpiryDate("3m", now)).toBe("2027-01-20");
    expect(offsetExpiryDate("6m", now)).toBe("2027-04-20");
    expect(offsetExpiryDate("1y", now)).toBe("2027-10-20");
  });

  it("clamps month ends instead of overflowing into the next month", () => {
    expect(offsetExpiryDate("1m", new Date(2026, 9, 31))).toBe("2026-11-30");
    expect(offsetExpiryDate("1y", new Date(2024, 1, 29))).toBe("2025-02-28");
    expect(offsetExpiryDate("6m", new Date(2026, 7, 31))).toBe("2027-02-28");
  });
});

describe("DATE_PRESETS", () => {
  it("offers exactly the seven quick-fill options, in tap order", () => {
    expect(DATE_PRESETS.map((p) => p.id)).toEqual(["3d", "1w", "2w", "1m", "3m", "6m", "1y"]);
    expect(DATE_PRESETS.map((p) => p.label)).toEqual([
      "3天后",
      "1周后",
      "半个月",
      "1个月",
      "3个月",
      "6个月",
      "1年",
    ]);
  });
});
