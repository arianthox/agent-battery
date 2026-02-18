import { useEffect, useState } from "react";
import { useSettings, useUpdateSettings } from "@renderer/hooks/useSettings";

export function SettingsPage() {
  const { data } = useSettings();
  const mutation = useUpdateSettings();
  const [threshold, setThreshold] = useState<number>(data?.lowBatteryThresholdPercent ?? 20);
  const [interval, setIntervalSeconds] = useState<number>(data?.defaultPollingIntervalSeconds ?? 120);
  const [debugLogsEnabled, setDebugLogsEnabled] = useState<boolean>(data?.debugLogsEnabled ?? false);

  useEffect(() => {
    if (!data) return;
    setThreshold(data.lowBatteryThresholdPercent);
    setIntervalSeconds(data.defaultPollingIntervalSeconds);
    setDebugLogsEnabled(data.debugLogsEnabled);
  }, [data]);

  return (
    <div>
      <h2>Settings</h2>
      <label>
        Low Battery Threshold (%)
        <input type="number" value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} />
      </label>
      <br />
      <label>
        Polling Interval (seconds)
        <input type="number" value={interval} onChange={(event) => setIntervalSeconds(Number(event.target.value))} />
      </label>
      <br />
      <label>
        Debug Logs
        <input
          type="checkbox"
          checked={debugLogsEnabled}
          onChange={(event) => setDebugLogsEnabled(event.target.checked)}
        />
      </label>
      <br />
      <button
        onClick={() => {
          void mutation.mutateAsync({
            lowBatteryThresholdPercent: threshold,
            defaultPollingIntervalSeconds: interval,
            debugLogsEnabled
          });
        }}
      >
        Save Settings
      </button>
    </div>
  );
}
