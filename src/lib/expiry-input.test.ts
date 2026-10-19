import { describe, expect, it } from "vitest";
import { composeExpiryDate, expandYear, splitExpiryDate } from "./expiry-input";

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
