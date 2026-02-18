import type { UsageSnapshot } from "./domain";

export function calculateBatteryPercent(usedValue: number, limitValue: number): number {
  if (limitValue <= 0) return 0;
  const remaining = Math.max(0, limitValue - usedValue);
  return Math.max(0, Math.min(100, (remaining / limitValue) * 100));
}

export function toUsageSummary(snapshot: Pick<UsageSnapshot, "usedValue" | "usedUnit" | "limitValue" | "limitUnit">): string {
  return `${snapshot.usedValue} ${snapshot.usedUnit} / ${snapshot.limitValue} ${snapshot.limitUnit}`;
}
