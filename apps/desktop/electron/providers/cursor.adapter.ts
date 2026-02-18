import { randomUUID } from "node:crypto";
import { calculateBatteryPercent, type Account, type UsageSnapshot, type UsageWindow } from "@agent-battery/shared";
import { ProviderError } from "./errors";
import type { ProviderAdapter, RawUsageRecord } from "./adapter";

export class CursorAdapter implements ProviderAdapter {
  provider = "cursor" as const;

  async validateCredentials(account: Account, secret: string | null): Promise<{ valid: boolean; expiresAt?: string }> {
    if (account.authType === "manual") return { valid: true };
    return { valid: !!secret && secret.length > 10 };
  }

  async fetchUsage(account: Account, _window: UsageWindow, secret: string | null): Promise<RawUsageRecord> {
    if (account.authType === "manual") {
      return {
        used: 0,
        limit: 1,
        unit: "requests",
        fetchedAt: new Date().toISOString(),
        source: "manual",
        confidence: "manual"
      };
    }
    if (!secret) throw new ProviderError("auth", "Missing Cursor credential", false);
    // Placeholder for official endpoint integration.
    return {
      used: 80,
      limit: 500,
      unit: "requests",
      fetchedAt: new Date().toISOString(),
      source: "official_api",
      confidence: "estimated"
    };
  }

  normalize(account: Account, raw: RawUsageRecord, window: UsageWindow): UsageSnapshot {
    const remainingValue = Math.max(0, raw.limit - raw.used);
    return {
      id: randomUUID(),
      accountId: account.id,
      provider: this.provider,
      windowType: window.type,
      windowStart: window.start,
      windowEnd: window.end,
      usedValue: raw.used,
      usedUnit: raw.unit,
      limitValue: raw.limit,
      limitUnit: raw.unit,
      remainingValue,
      batteryPercent: calculateBatteryPercent(raw.used, raw.limit),
      confidence: raw.confidence,
      source: raw.source,
      fetchedAt: raw.fetchedAt,
      createdAt: new Date().toISOString()
    };
  }
}
