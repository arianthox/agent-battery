import { describe, expect, it } from "vitest";
import {
  CreateAccountRequestSchema,
  ListBatteryStatusResponseSchema,
  UpdateSettingsRequestSchema
} from "../packages/shared/src/ipc";

describe("ipc contracts", () => {
  it("validates create account payload", () => {
    const parsed = CreateAccountRequestSchema.parse({
      provider: "openai",
      displayName: "Main account",
      authType: "apiKey",
      syncEnabled: true,
      syncIntervalSeconds: null,
      status: "ok",
      lastError: null,
      credentialLabel: "OpenAI key"
    });
    expect(parsed.provider).toBe("openai");
  });

  it("validates battery status response shape", () => {
    const parsed = ListBatteryStatusResponseSchema.parse([
      {
        accountId: "11111111-1111-1111-1111-111111111111",
        provider: "claude",
        batteryPercent: 90,
        remainingValue: 90,
        usedSummary: "10 messages / 100 messages",
        lastSyncAt: "2026-02-18T00:00:00.000Z",
        health: "ok"
      }
    ]);
    expect(parsed[0].provider).toBe("claude");
  });

  it("accepts partial settings updates", () => {
    const parsed = UpdateSettingsRequestSchema.parse({ debugLogsEnabled: true });
    expect(parsed.debugLogsEnabled).toBe(true);
  });
});
