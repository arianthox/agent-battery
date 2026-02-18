import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppSettings } from "@agent-battery/shared";

const key = ["settings"];

export function useSettings() {
  return useQuery({
    queryKey: key,
    queryFn: async () => (await window.agentBattery.getSettings()) as AppSettings
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<AppSettings>) => window.agentBattery.updateSettings(patch),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: key });
    }
  });
}
