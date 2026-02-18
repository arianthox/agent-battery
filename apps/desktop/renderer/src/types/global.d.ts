import type { AgentBatteryApi } from "../../../electron/preload";

declare global {
  interface Window {
    agentBattery: AgentBatteryApi;
  }
}

export {};
