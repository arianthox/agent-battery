import type { Account, BatteryStatus } from "@agent-battery/shared";

type Props = {
  accounts: Account[];
  batteryStatus: BatteryStatus[];
  onSelect: (accountId: string) => void;
  onManualSync: (accountId: string) => void;
};

function healthBadge(status: Account["status"]): string {
  if (status === "ok") return "Healthy";
  if (status === "warning") return "Warning";
  if (status === "invalid_credentials") return "Invalid Credentials";
  return "Error";
}

export function DashboardTable({ accounts, batteryStatus, onSelect, onManualSync }: Props) {
  const statusMap = new Map(batteryStatus.map((item) => [item.accountId, item]));
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th>Provider</th>
          <th>Account</th>
          <th>Battery</th>
          <th>Usage</th>
          <th>Last Sync</th>
          <th>Health</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {accounts.map((account) => {
          const snapshot = statusMap.get(account.id);
          return (
            <tr key={account.id} onClick={() => onSelect(account.id)} style={{ cursor: "pointer" }}>
              <td>{account.provider}</td>
              <td>{account.displayName}</td>
              <td>{snapshot ? `${snapshot.batteryPercent.toFixed(0)}%` : "--"}</td>
              <td>{snapshot?.usedSummary ?? "No usage data yet"}</td>
              <td>{snapshot?.lastSyncAt ? new Date(snapshot.lastSyncAt).toLocaleString() : "Never"}</td>
              <td>{healthBadge(account.status)}</td>
              <td>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onManualSync(account.id);
                  }}
                >
                  Refresh
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
