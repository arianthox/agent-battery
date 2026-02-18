import { randomUUID } from "node:crypto";
import { ipcMain } from "electron";
import { prisma } from "@agent-battery/db";
import {
  CreateAccountRequestSchema,
  DeleteAccountRequestSchema,
  GetSettingsResponseSchema,
  IpcChannels,
  ListSnapshotsRequestSchema,
  ListSyncRunsRequestSchema,
  ManualSyncRequestSchema,
  SetCredentialRequestSchema,
  UpdateAccountRequestSchema,
  UpdateSettingsRequestSchema,
  ValidateCredentialRequestSchema
} from "@agent-battery/shared";
import type { Account } from "@agent-battery/shared";
import { toUsageSummary } from "@agent-battery/shared";
import { ClaudeAdapter } from "../providers/claude.adapter";
import { CursorAdapter } from "../providers/cursor.adapter";
import { OpenAIAdapter } from "../providers/openai.adapter";
import { CredentialService } from "../services/credentialService";
import { SyncService } from "../services/syncService";

const credentialService = new CredentialService();
const syncService = new SyncService();
const adapters = {
  openai: new OpenAIAdapter(),
  claude: new ClaudeAdapter(),
  cursor: new CursorAdapter()
};

function mapAccount(account: Awaited<ReturnType<typeof prisma.account.findUniqueOrThrow>>): Account {
  return {
    ...account,
    provider: account.provider as Account["provider"],
    authType: account.authType as Account["authType"],
    status: account.status as Account["status"],
    orgWorkspaceId: account.orgWorkspaceId ?? undefined,
    syncIntervalSeconds: account.syncIntervalSeconds ?? null,
    lastValidatedAt: account.lastValidatedAt?.toISOString() ?? null,
    expiresAt: account.expiresAt?.toISOString() ?? null,
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString()
  };
}

export function registerIpcHandlers(): SyncService {
  ipcMain.handle(IpcChannels.listAccounts, async () => {
    const accounts = await prisma.account.findMany({ orderBy: { createdAt: "desc" } });
    return accounts.map(mapAccount);
  });

  ipcMain.handle(IpcChannels.listBatteryStatus, async () => {
    const accounts = await prisma.account.findMany({ orderBy: { createdAt: "desc" } });
    const statuses = await Promise.all(
      accounts.map(async (account) => {
        const latest = await prisma.usageSnapshot.findFirst({
          where: { accountId: account.id },
          orderBy: { fetchedAt: "desc" }
        });
        if (!latest) {
          return {
            accountId: account.id,
            provider: account.provider,
            batteryPercent: 0,
            remainingValue: 0,
            usedSummary: "No usage data yet",
            lastSyncAt: account.lastValidatedAt?.toISOString() ?? null,
            health: account.status
          };
        }
        return {
          accountId: account.id,
          provider: account.provider,
          batteryPercent: latest.batteryPercent,
          remainingValue: latest.remainingValue,
          usedSummary: toUsageSummary({
            usedValue: latest.usedValue,
            usedUnit: latest.usedUnit,
            limitValue: latest.limitValue,
            limitUnit: latest.limitUnit
          }),
          lastSyncAt: latest.fetchedAt.toISOString(),
          health: account.status
        };
      })
    );
    return statuses;
  });

  ipcMain.handle(IpcChannels.createAccount, async (_event, payload: unknown) => {
    const input = CreateAccountRequestSchema.parse(payload);
    const id = randomUUID();
    const account = await prisma.account.create({
      data: {
        id,
        provider: input.provider,
        displayName: input.displayName,
        orgWorkspaceId: input.orgWorkspaceId,
        authType: input.authType,
        syncEnabled: input.syncEnabled,
        syncIntervalSeconds: input.syncIntervalSeconds,
        credentialRef: `${input.provider}:${id}`,
        status: input.status,
        lastError: input.lastError
      }
    });
    return mapAccount(account);
  });

  ipcMain.handle(IpcChannels.updateAccount, async (_event, payload: unknown) => {
    const input = UpdateAccountRequestSchema.parse(payload);
    const account = await prisma.account.update({
      where: { id: input.id },
      data: {
        ...input.patch,
        lastValidatedAt: input.patch.lastValidatedAt ? new Date(input.patch.lastValidatedAt) : undefined,
        expiresAt: input.patch.expiresAt ? new Date(input.patch.expiresAt) : undefined
      }
    });
    return mapAccount(account);
  });

  ipcMain.handle(IpcChannels.deleteAccount, async (_event, payload: unknown) => {
    const input = DeleteAccountRequestSchema.parse(payload);
    await credentialService.deleteCredential(input.id);
    await prisma.account.delete({ where: { id: input.id } });
    return { ok: true };
  });

  ipcMain.handle(IpcChannels.setCredential, async (_event, payload: unknown) => {
    const input = SetCredentialRequestSchema.parse(payload);
    await credentialService.setCredential(input.accountId, input.secret);
    return { ok: true };
  });

  ipcMain.handle(IpcChannels.validateCredential, async (_event, payload: unknown) => {
    const input = ValidateCredentialRequestSchema.parse(payload);
    const account = await prisma.account.findUniqueOrThrow({ where: { id: input.accountId } });
    const adapter = adapters[account.provider as "openai" | "claude" | "cursor"];
    const secret = await credentialService.getCredential(input.accountId);
    const validated = await adapter.validateCredentials(mapAccount(account), secret);
    await prisma.account.update({
      where: { id: input.accountId },
      data: {
        status: validated.valid ? "ok" : "invalid_credentials",
        lastValidatedAt: new Date(),
        expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null
      }
    });
    return validated;
  });

  ipcMain.handle(IpcChannels.listSnapshots, async (_event, payload: unknown) => {
    const input = ListSnapshotsRequestSchema.parse(payload);
    const snapshots = await prisma.usageSnapshot.findMany({
      where: { accountId: input.accountId },
      orderBy: { fetchedAt: "desc" },
      take: 100
    });
    return snapshots.map((item) => ({
      ...item,
      windowStart: item.windowStart.toISOString(),
      windowEnd: item.windowEnd.toISOString(),
      fetchedAt: item.fetchedAt.toISOString(),
      createdAt: item.createdAt.toISOString()
    }));
  });

  ipcMain.handle(IpcChannels.manualSync, async (_event, payload: unknown) => {
    const input = ManualSyncRequestSchema.parse(payload);
    await syncService.manualSync(input.accountId, input.window);
    return { ok: true };
  });

  ipcMain.handle(IpcChannels.listSyncRuns, async (_event, payload: unknown) => {
    const input = ListSyncRunsRequestSchema.parse(payload);
    const runs = await prisma.syncRun.findMany({
      where: { accountId: input.accountId },
      orderBy: { startedAt: "desc" },
      take: 50
    });
    return runs.map((item) => ({
      ...item,
      startedAt: item.startedAt.toISOString(),
      finishedAt: item.finishedAt?.toISOString() ?? null,
      nextRetryAt: item.nextRetryAt?.toISOString() ?? null,
      createdAt: item.createdAt.toISOString()
    }));
  });

  ipcMain.handle(IpcChannels.getSettings, async () => {
    const settings = await syncService.getSettings();
    return GetSettingsResponseSchema.parse(settings);
  });

  ipcMain.handle(IpcChannels.updateSettings, async (_event, payload: unknown) => {
    const input = UpdateSettingsRequestSchema.parse(payload);
    const updated = await prisma.appSettings.update({
      where: { id: "singleton" },
      data: input
    });
    return GetSettingsResponseSchema.parse(updated);
  });

  return syncService;
}
