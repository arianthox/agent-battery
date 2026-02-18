import { prisma } from "@agent-battery/db";
import type { UsageWindow } from "@agent-battery/shared";
import { ClaudeAdapter } from "../providers/claude.adapter";
import { CursorAdapter } from "../providers/cursor.adapter";
import { OpenAIAdapter } from "../providers/openai.adapter";
import { toProviderError } from "../providers/errors";
import type { ProviderAdapter } from "../providers/adapter";
import { CredentialService } from "./credentialService";
import { NotificationService } from "./notificationService";
import { createLogger } from "./logger";

type BackoffState = { failures: number; nextRetryAt: number | null };

const DEFAULT_INTERVAL_MS = 120_000;
const MAX_BACKOFF_MS = 10 * 60_000;

function withJitter(ms: number): number {
  const jitter = Math.floor(Math.random() * 10_000);
  return ms + jitter;
}

export function computeBackoffDelayMs(failures: number): number {
  return Math.min(2 ** failures * 1000, MAX_BACKOFF_MS);
}

function defaultWindow(): UsageWindow {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 30);
  return {
    type: "month",
    start: start.toISOString(),
    end: end.toISOString()
  };
}

export class SyncService {
  private readonly adapters: Record<string, ProviderAdapter>;
  private readonly backoff = new Map<string, BackoffState>();
  private readonly credentialService = new CredentialService();
  private readonly notificationService = new NotificationService();
  private readonly logger = createLogger(false);
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    this.adapters = {
      openai: new OpenAIAdapter(),
      claude: new ClaudeAdapter(),
      cursor: new CursorAdapter()
    };
  }

  async start(): Promise<void> {
    await this.ensureSettings();
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      void this.tick();
    }, withJitter(DEFAULT_INTERVAL_MS));
    await this.tick();
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async manualSync(accountId: string, window = defaultWindow()): Promise<void> {
    await this.syncAccount(accountId, window);
  }

  async tick(window = defaultWindow()): Promise<void> {
    const accounts = await prisma.account.findMany({ where: { syncEnabled: true } });
    await Promise.all(accounts.map((account) => this.syncAccount(account.id, window)));
  }

  private getBackoff(accountId: string): BackoffState {
    return this.backoff.get(accountId) ?? { failures: 0, nextRetryAt: null };
  }

  private setBackoff(accountId: string, state: BackoffState): void {
    this.backoff.set(accountId, state);
  }

  private async syncAccount(accountId: string, window: UsageWindow): Promise<void> {
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account || !account.syncEnabled) return;
    const adapter = this.adapters[account.provider];
    if (!adapter) return;

    const backoff = this.getBackoff(accountId);
    if (backoff.nextRetryAt && Date.now() < backoff.nextRetryAt) return;

    const syncRun = await prisma.syncRun.create({
      data: {
        accountId,
        startedAt: new Date(),
        outcome: "failure",
        attempts: backoff.failures + 1
      }
    });

    try {
      const secret = await this.credentialService.getCredential(accountId);
      const validated = await adapter.validateCredentials(this.mapAccount(account), secret);
      if (!validated.valid) {
        throw new Error("Credential validation failed");
      }
      const raw = await adapter.fetchUsage(this.mapAccount(account), window, secret);
      const normalized = adapter.normalize(this.mapAccount(account), raw, window);

      await prisma.usageSnapshot.create({
        data: {
          accountId: normalized.accountId,
          provider: normalized.provider,
          windowType: normalized.windowType,
          windowStart: new Date(normalized.windowStart),
          windowEnd: new Date(normalized.windowEnd),
          usedValue: normalized.usedValue,
          usedUnit: normalized.usedUnit,
          limitValue: normalized.limitValue,
          limitUnit: normalized.limitUnit,
          remainingValue: normalized.remainingValue,
          batteryPercent: normalized.batteryPercent,
          confidence: normalized.confidence,
          source: normalized.source,
          fetchedAt: new Date(normalized.fetchedAt)
        }
      });

      await prisma.syncRun.update({
        where: { id: syncRun.id },
        data: { outcome: "success", finishedAt: new Date(), errorCode: null, errorMessage: null, nextRetryAt: null }
      });

      await prisma.account.update({
        where: { id: accountId },
        data: { status: "ok", lastError: null, lastValidatedAt: new Date() }
      });

      this.setBackoff(accountId, { failures: 0, nextRetryAt: null });

      const settings = await this.getSettings();
      if (normalized.batteryPercent <= settings.lowBatteryThresholdPercent) {
        await this.notificationService.notifyLowBattery(
          accountId,
          "Agent Battery low",
          `${account.displayName} is at ${normalized.batteryPercent.toFixed(0)}%`
        );
      }
    } catch (error) {
      const mappedError = toProviderError(error);
      const failures = backoff.failures + 1;
      const delay = computeBackoffDelayMs(failures);
      const nextRetryAt = Date.now() + delay;
      this.setBackoff(accountId, { failures, nextRetryAt });

      await prisma.syncRun.update({
        where: { id: syncRun.id },
        data: {
          finishedAt: new Date(),
          outcome: "failure",
          errorCode: mappedError.code,
          errorMessage: mappedError.message,
          nextRetryAt: new Date(nextRetryAt)
        }
      });

      await prisma.account.update({
        where: { id: accountId },
        data: { status: "error", lastError: mappedError.message }
      });

      const settings = await this.getSettings();
      if (failures >= settings.persistentFailureThreshold) {
        await this.notificationService.notifyPersistentFailure(
          accountId,
          "Agent Battery sync warning",
          `${account.displayName} has failed to sync ${failures} times`
        );
      }
      this.logger.warn("sync_failure", { accountId, code: mappedError.code, message: mappedError.message, failures });
    }
  }

  private async ensureSettings(): Promise<void> {
    const existing = await prisma.appSettings.findUnique({ where: { id: "singleton" } });
    if (!existing) {
      await prisma.appSettings.create({
        data: {
          id: "singleton",
          lowBatteryThresholdPercent: 20,
          persistentFailureThreshold: 3,
          defaultPollingIntervalSeconds: 120,
          debugLogsEnabled: false
        }
      });
    }
  }

  async getSettings() {
    await this.ensureSettings();
    const settings = await prisma.appSettings.findUniqueOrThrow({ where: { id: "singleton" } });
    return settings;
  }

  private mapAccount(account: Awaited<ReturnType<typeof prisma.account.findUniqueOrThrow>>) {
    return {
      id: account.id,
      provider: account.provider as "openai" | "claude" | "cursor",
      displayName: account.displayName,
      orgWorkspaceId: account.orgWorkspaceId ?? undefined,
      authType: account.authType as "apiKey" | "session" | "manual",
      syncEnabled: account.syncEnabled,
      syncIntervalSeconds: account.syncIntervalSeconds,
      credentialRef: account.credentialRef,
      lastValidatedAt: account.lastValidatedAt?.toISOString() ?? null,
      expiresAt: account.expiresAt?.toISOString() ?? null,
      status: account.status as "ok" | "warning" | "error" | "invalid_credentials",
      lastError: account.lastError,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString()
    };
  }
}
