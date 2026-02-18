import { describe, expect, it } from "vitest";
import { ClaudeAdapter } from "../apps/desktop/electron/providers/claude.adapter";
import { CursorAdapter } from "../apps/desktop/electron/providers/cursor.adapter";
import { OpenAIAdapter } from "../apps/desktop/electron/providers/openai.adapter";

const window = {
  type: "month" as const,
  start: "2026-02-01T00:00:00.000Z",
  end: "2026-02-18T00:00:00.000Z"
};

function mockAccount(provider: "openai" | "claude" | "cursor", authType: "apiKey" | "session" | "manual") {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    provider,
    displayName: `${provider} account`,
    authType,
    syncEnabled: true,
    syncIntervalSeconds: null,
    credentialRef: `${provider}:111`,
    status: "ok",
    lastValidatedAt: null,
    expiresAt: null,
    lastError: null,
    createdAt: "2026-02-18T00:00:00.000Z",
    updatedAt: "2026-02-18T00:00:00.000Z"
  };
}

describe("provider adapter integration (mocked)", () => {
  it("supports manual fallback mode", async () => {
    const adapters = [new OpenAIAdapter(), new ClaudeAdapter(), new CursorAdapter()];
    for (const adapter of adapters) {
      const account = mockAccount(adapter.provider, "manual");
      const usage = await adapter.fetchUsage(account, window, null);
      expect(usage.source).toBe("manual");
      expect(usage.confidence).toBe("manual");
    }
  });

  it("rejects invalid auth for official mode", async () => {
    await expect(new OpenAIAdapter().fetchUsage(mockAccount("openai", "apiKey"), window, "not-a-key")).rejects.toThrow();
    await expect(new ClaudeAdapter().fetchUsage(mockAccount("claude", "apiKey"), window, "not-a-key")).rejects.toThrow();
    await expect(new CursorAdapter().fetchUsage(mockAccount("cursor", "session"), window, null)).rejects.toThrow();
  });
});
