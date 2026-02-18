import { describe, expect, it } from "vitest";
import { calculateBatteryPercent } from "../packages/shared/src/battery";
import { OpenAIAdapter } from "../apps/desktop/electron/providers/openai.adapter";

describe("battery math", () => {
  it("calculates remaining battery percent", () => {
    expect(calculateBatteryPercent(20, 100)).toBe(80);
    expect(calculateBatteryPercent(110, 100)).toBe(0);
  });
});

describe("usage normalization", () => {
  it("normalizes provider payload into snapshot", () => {
    const adapter = new OpenAIAdapter();
    const account = {
      id: "11111111-1111-1111-1111-111111111111",
      provider: "openai",
      displayName: "test",
      authType: "apiKey",
      syncEnabled: true,
      syncIntervalSeconds: null,
      credentialRef: "openai:1",
      status: "ok",
      lastValidatedAt: null,
      expiresAt: null,
      lastError: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as const;
    const snapshot = adapter.normalize(
      account,
      {
        used: 25,
        limit: 100,
        unit: "credits",
        fetchedAt: "2026-02-18T00:00:00.000Z",
        source: "official_api",
        confidence: "exact"
      },
      {
        type: "month",
        start: "2026-02-01T00:00:00.000Z",
        end: "2026-02-18T00:00:00.000Z"
      }
    );
    expect(snapshot.batteryPercent).toBe(75);
    expect(snapshot.remainingValue).toBe(75);
  });
});
