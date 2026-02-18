import { contextBridge, ipcRenderer } from "electron";
import { IpcChannels } from "@agent-battery/shared";

const api = {
  listAccounts: () => ipcRenderer.invoke(IpcChannels.listAccounts),
  listBatteryStatus: () => ipcRenderer.invoke(IpcChannels.listBatteryStatus),
  createAccount: (payload: unknown) => ipcRenderer.invoke(IpcChannels.createAccount, payload),
  updateAccount: (payload: unknown) => ipcRenderer.invoke(IpcChannels.updateAccount, payload),
  deleteAccount: (payload: unknown) => ipcRenderer.invoke(IpcChannels.deleteAccount, payload),
  setCredential: (payload: unknown) => ipcRenderer.invoke(IpcChannels.setCredential, payload),
  validateCredential: (payload: unknown) => ipcRenderer.invoke(IpcChannels.validateCredential, payload),
  listSnapshots: (payload: unknown) => ipcRenderer.invoke(IpcChannels.listSnapshots, payload),
  manualSync: (payload: unknown) => ipcRenderer.invoke(IpcChannels.manualSync, payload),
  listSyncRuns: (payload: unknown) => ipcRenderer.invoke(IpcChannels.listSyncRuns, payload),
  getSettings: () => ipcRenderer.invoke(IpcChannels.getSettings),
  updateSettings: (payload: unknown) => ipcRenderer.invoke(IpcChannels.updateSettings, payload)
};

contextBridge.exposeInMainWorld("agentBattery", api);

export type AgentBatteryApi = typeof api;
