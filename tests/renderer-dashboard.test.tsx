import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import { DashboardTable } from "../apps/desktop/renderer/src/components/DashboardTable";

describe("DashboardTable", () => {
  it("builds a dashboard table element for key view", () => {
    const onSelect = vi.fn();
    const onManualSync = vi.fn();
    const element = DashboardTable({
      accounts: [
        {
          id: "11111111-1111-1111-1111-111111111111",
          provider: "openai",
          displayName: "OpenAI Main",
          authType: "apiKey",
          syncEnabled: true,
          syncIntervalSeconds: null,
          credentialRef: "openai:111",
          status: "ok",
          lastValidatedAt: "2026-02-18T00:00:00.000Z",
          expiresAt: null,
          lastError: null,
          createdAt: "2026-02-18T00:00:00.000Z",
          updatedAt: "2026-02-18T00:00:00.000Z"
        }
      ],
      batteryStatus: [
        {
          accountId: "11111111-1111-1111-1111-111111111111",
          provider: "openai",
          batteryPercent: 88,
          remainingValue: 88,
          usedSummary: "12 credits / 100 credits",
          lastSyncAt: "2026-02-18T00:00:00.000Z",
          health: "ok"
        }
      ],
      onSelect,
      onManualSync
    });
    expect(element).toBeTruthy();
  });
});
