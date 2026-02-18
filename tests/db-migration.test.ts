import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("db migration assets", () => {
  it("includes initial prisma migration and schema", () => {
    const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
    const schemaPath = path.join(repoRoot, "packages/db/prisma/schema.prisma");
    const migrationPath = path.join(repoRoot, "packages/db/prisma/migrations/20260218000100_init/migration.sql");
    expect(existsSync(schemaPath)).toBe(true);
    expect(existsSync(migrationPath)).toBe(true);
  });
});
