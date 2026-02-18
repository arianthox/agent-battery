import { describe, expect, it } from "vitest";
import { computeBackoffDelayMs } from "../apps/desktop/electron/services/syncService";

describe("sync backoff policy", () => {
  it("increases exponentially and caps at max", () => {
    expect(computeBackoffDelayMs(1)).toBe(2000);
    expect(computeBackoffDelayMs(2)).toBe(4000);
    expect(computeBackoffDelayMs(15)).toBe(600000);
  });
});
