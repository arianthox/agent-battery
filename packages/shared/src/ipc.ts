import { z } from "zod";
import {
  AccountSchema,
  AppSettingsSchema,
  BatteryStatusSchema,
  SyncRunSchema,
  UsageSnapshotSchema,
  UsageWindowSchema
} from "./domain";

export const IpcChannels = {
  listAccounts: "accounts:list",
  listBatteryStatus: "accounts:battery-status:list",
  createAccount: "accounts:create",
  updateAccount: "accounts:update",
  deleteAccount: "accounts:delete",
  setCredential: "credentials:set",
  validateCredential: "credentials:validate",
  listSnapshots: "usage:snapshots:list",
  manualSync: "sync:manual",
  listSyncRuns: "sync:runs:list",
  getSettings: "settings:get",
  updateSettings: "settings:update"
} as const;

export const ListAccountsResponseSchema = z.array(AccountSchema);
export const ListBatteryStatusResponseSchema = z.array(BatteryStatusSchema);
export const CreateAccountRequestSchema = AccountSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  credentialRef: true
}).extend({
  credentialLabel: z.string().min(1)
});

export const UpdateAccountRequestSchema = z.object({
  id: z.string().uuid(),
  patch: AccountSchema.partial()
});

export const DeleteAccountRequestSchema = z.object({
  id: z.string().uuid()
});

export const SetCredentialRequestSchema = z.object({
  accountId: z.string().uuid(),
  secret: z.string().min(1)
});

export const ValidateCredentialRequestSchema = z.object({
  accountId: z.string().uuid()
});

export const ListSnapshotsRequestSchema = z.object({
  accountId: z.string().uuid()
});
export const ListSnapshotsResponseSchema = z.array(UsageSnapshotSchema);

export const ManualSyncRequestSchema = z.object({
  accountId: z.string().uuid(),
  window: UsageWindowSchema.optional()
});

export const ListSyncRunsRequestSchema = z.object({
  accountId: z.string().uuid()
});
export const ListSyncRunsResponseSchema = z.array(SyncRunSchema);

export const GetSettingsResponseSchema = AppSettingsSchema;
export const UpdateSettingsRequestSchema = AppSettingsSchema.partial();
