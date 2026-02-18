-- CreateTable
CREATE TABLE "Account" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "provider" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "orgWorkspaceId" TEXT,
  "authType" TEXT NOT NULL,
  "syncEnabled" BOOLEAN NOT NULL DEFAULT true,
  "syncIntervalSeconds" INTEGER,
  "credentialRef" TEXT NOT NULL,
  "lastValidatedAt" DATETIME,
  "expiresAt" DATETIME,
  "status" TEXT NOT NULL DEFAULT 'ok',
  "lastError" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UsageSnapshot" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "accountId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "windowType" TEXT NOT NULL,
  "windowStart" DATETIME NOT NULL,
  "windowEnd" DATETIME NOT NULL,
  "usedValue" REAL NOT NULL,
  "usedUnit" TEXT NOT NULL,
  "limitValue" REAL NOT NULL,
  "limitUnit" TEXT NOT NULL,
  "remainingValue" REAL NOT NULL,
  "batteryPercent" REAL NOT NULL,
  "confidence" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "fetchedAt" DATETIME NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UsageSnapshot_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SyncRun" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "accountId" TEXT NOT NULL,
  "startedAt" DATETIME NOT NULL,
  "finishedAt" DATETIME,
  "outcome" TEXT NOT NULL,
  "errorCode" TEXT,
  "errorMessage" TEXT,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "nextRetryAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SyncRun_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppSettings" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
  "lowBatteryThresholdPercent" INTEGER NOT NULL DEFAULT 20,
  "persistentFailureThreshold" INTEGER NOT NULL DEFAULT 3,
  "defaultPollingIntervalSeconds" INTEGER NOT NULL DEFAULT 120,
  "debugLogsEnabled" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "NotificationState" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "accountId" TEXT NOT NULL,
  "notificationKey" TEXT NOT NULL,
  "lastSentAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "UsageSnapshot_accountId_fetchedAt_idx" ON "UsageSnapshot"("accountId", "fetchedAt");

-- CreateIndex
CREATE INDEX "SyncRun_accountId_startedAt_idx" ON "SyncRun"("accountId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationState_accountId_notificationKey_key" ON "NotificationState"("accountId", "notificationKey");
