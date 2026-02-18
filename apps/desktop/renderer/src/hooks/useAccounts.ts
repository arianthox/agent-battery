import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Account, BatteryStatus } from "@agent-battery/shared";

const key = ["accounts"];

export function useAccounts() {
  return useQuery({
    queryKey: key,
    queryFn: async () => (await window.agentBattery.listAccounts()) as Account[]
  });
}

export function useBatteryStatus() {
  return useQuery({
    queryKey: ["battery-status"],
    queryFn: async () => (await window.agentBattery.listBatteryStatus()) as BatteryStatus[]
  });
}

export function useManualSync() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (accountId: string) => window.agentBattery.manualSync({ accountId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: key });
      await queryClient.invalidateQueries({ queryKey: ["battery-status"] });
    }
  });
}
