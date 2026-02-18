import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SyncRun, UsageSnapshot } from "@agent-battery/shared";
import { useAccounts } from "@renderer/hooks/useAccounts";

type Props = {
  accountId: string | null;
};

export function AccountsPage({ accountId }: Props) {
  const { data: accounts = [] } = useAccounts();
  const account = accounts.find((item) => item.id === accountId) ?? null;

  const { data: snapshots = [] } = useQuery({
    queryKey: ["snapshots", accountId],
    enabled: !!accountId,
    queryFn: async () => (await window.agentBattery.listSnapshots({ accountId })) as UsageSnapshot[]
  });

  const { data: syncRuns = [] } = useQuery({
    queryKey: ["sync-runs", accountId],
    enabled: !!accountId,
    queryFn: async () => (await window.agentBattery.listSyncRuns({ accountId })) as SyncRun[]
  });

  if (!accountId || !account) return <div>Select an account from the dashboard.</div>;

  const chartData = snapshots
    .slice()
    .reverse()
    .map((item) => ({ time: new Date(item.fetchedAt).toLocaleTimeString(), batteryPercent: item.batteryPercent }));

  return (
    <div>
      <h2>Account Detail</h2>
      <p>
        <strong>{account.displayName}</strong> ({account.provider}) - status: {account.status}
      </p>
      <p>Credential validity: {account.status === "invalid_credentials" ? "Invalid" : "Valid or Unknown"}</p>
      <h3>Recent snapshots</h3>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <XAxis dataKey="time" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="batteryPercent" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <h3>Error history</h3>
      <ul>
        {syncRuns
          .filter((run) => run.outcome === "failure")
          .map((run) => (
            <li key={run.id}>
              {new Date(run.startedAt).toLocaleString()} - {run.errorCode}: {run.errorMessage}
            </li>
          ))}
      </ul>
    </div>
  );
}
