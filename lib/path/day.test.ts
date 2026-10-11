import { describe, expect, it } from "vitest";
import { localDay } from "./day";

describe("localDay", () => {
  it("zero-pads month and day from local parts", () => {
    expect(localDay(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });

  it("does not shift to UTC near midnight", () => {
    expect(localDay(new Date(2026, 9, 31, 0, 1))).toBe("2026-10-31");
  });
});
