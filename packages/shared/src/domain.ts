import { z } from "zod";

export const ProviderSchema = z.enum(["openai", "claude", "cursor"]);
export type Provider = z.infer<typeof ProviderSchema>;

export const AuthTypeSchema = z.enum(["apiKey", "session", "manual"]);
export type AuthType = z.infer<typeof AuthTypeSchema>;

export const AccountStatusSchema = z.enum(["ok", "warning", "error", "invalid_credentials"]);
export type AccountStatus = z.infer<typeof AccountStatusSchema>;

export const ConfidenceSchema = z.enum(["exact", "estimated", "manual"]);
export const SourceSchema = z.enum(["official_api", "official_export", "manual"]);
export type Confidence = z.infer<typeof ConfidenceSchema>;
export type Source = z.infer<typeof SourceSchema>;

export const UsageWindowTypeSchema = z.enum(["hour", "day", "week", "month", "custom"]);
export type UsageWindowType = z.infer<typeof UsageWindowTypeSchema>;

export const UsageWindowSchema = z.object({
  type: UsageWindowTypeSchema,
  start: z.string().datetime(),
  end: z.string().datetime()
});
export type UsageWindow = z.infer<typeof UsageWindowSchema>;

export const AccountSchema = z.object({
  id: z.string().uuid(),
  provider: ProviderSchema,
  displayName: z.string().min(1),
  orgWorkspaceId: z.string().optional(),
  authType: AuthTypeSchema,
  syncEnabled: z.boolean().default(true),
  syncIntervalSeconds: z.number().int().positive().nullable().default(null),
  credentialRef: z.string().min(1),
  lastValidatedAt: z.string().datetime().nullable().default(null),
  expiresAt: z.string().datetime().nullable().default(null),
  status: AccountStatusSchema.default("ok"),
  lastError: z.string().nullable().default(null),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});
export type Account = z.infer<typeof AccountSchema>;

export const UsageSnapshotSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
  provider: ProviderSchema,
  windowType: UsageWindowTypeSchema,
  windowStart: z.string().datetime(),
  windowEnd: z.string().datetime(),
  usedValue: z.number().nonnegative(),
  usedUnit: z.string().min(1),
  limitValue: z.number().positive(),
  limitUnit: z.string().min(1),
  remainingValue: z.number(),
  batteryPercent: z.number().min(0).max(100),
  confidence: ConfidenceSchema,
  source: SourceSchema,
  fetchedAt: z.string().datetime(),
  createdAt: z.string().datetime()
});
export type UsageSnapshot = z.infer<typeof UsageSnapshotSchema>;

export const BatteryStatusSchema = z.object({
  accountId: z.string().uuid(),
  provider: ProviderSchema,
  batteryPercent: z.number().min(0).max(100),
  remainingValue: z.number(),
  usedSummary: z.string(),
  lastSyncAt: z.string().datetime().nullable(),
  health: AccountStatusSchema
});
export type BatteryStatus = z.infer<typeof BatteryStatusSchema>;

export const SyncRunSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
  startedAt: z.string().datetime(),
  finishedAt: z.string().datetime().nullable(),
  outcome: z.enum(["success", "failure"]),
  errorCode: z.string().nullable(),
  errorMessage: z.string().nullable(),
  attempts: z.number().int().nonnegative(),
  nextRetryAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime()
});
export type SyncRun = z.infer<typeof SyncRunSchema>;

export const AppSettingsSchema = z.object({
  lowBatteryThresholdPercent: z.number().int().min(1).max(99).default(20),
  persistentFailureThreshold: z.number().int().min(1).default(3),
  defaultPollingIntervalSeconds: z.number().int().min(30).default(120),
  debugLogsEnabled: z.boolean().default(false)
});
export type AppSettings = z.infer<typeof AppSettingsSchema>;
