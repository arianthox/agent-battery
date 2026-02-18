import type { Account, Provider, UsageSnapshot, UsageWindow } from "@agent-battery/shared";

export type RawUsageRecord = {
  used: number;
  limit: number;
  unit: string;
  fetchedAt: string;
  source: "official_api" | "official_export" | "manual";
  confidence: "exact" | "estimated" | "manual";
};

export interface ProviderAdapter {
  provider: Provider;
  validateCredentials(account: Account, secret: string | null): Promise<{ valid: boolean; expiresAt?: string }>;
  fetchUsage(account: Account, window: UsageWindow, secret: string | null): Promise<RawUsageRecord>;
  normalize(account: Account, raw: RawUsageRecord, window: UsageWindow): UsageSnapshot;
}
