import { DashboardTable } from "@renderer/components/DashboardTable";
import { useAccounts, useBatteryStatus, useManualSync } from "@renderer/hooks/useAccounts";

type Props = {
  onSelectAccount: (id: string) => void;
};

export function DashboardPage({ onSelectAccount }: Props) {
  const { data: accounts = [], isLoading } = useAccounts();
  const { data: batteryStatus = [] } = useBatteryStatus();
  const manualSync = useManualSync();

  if (isLoading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h2>Dashboard</h2>
      <DashboardTable
        accounts={accounts}
        batteryStatus={batteryStatus}
        onSelect={onSelectAccount}
        onManualSync={(id) => {
          void manualSync.mutateAsync(id);
        }}
      />
    </div>
  );
}
