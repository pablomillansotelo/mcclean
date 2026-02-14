import { ipcRenderer, contextBridge } from "electron";

contextBridge.exposeInMainWorld("electron", {
  startScan: (path: string) => ipcRenderer.invoke("scan-directory", path),
  scanApps: () => ipcRenderer.invoke("scan-apps"),
  scanBrew: () => ipcRenderer.invoke("scan-brew"),
  updateBrew: () => ipcRenderer.invoke("run-brew-update"),
  scanDevTools: () => ipcRenderer.invoke("scan-devtools"),
  uninstallBrew: (name: string) => ipcRenderer.invoke("run-brew-uninstall", name),
  findAssociatedFiles: (appName: string) => ipcRenderer.invoke("find-associated-files", appName),
  scanStartupItems: () => ipcRenderer.invoke("scan-startup-items"),
  getSystemStats: () => ipcRenderer.invoke("get-system-stats"),
  scanPrivacy: () => ipcRenderer.invoke("scan-privacy"),
  cleanPrivacy: (path: string) => ipcRenderer.invoke("clean-privacy", path),
  openSecuritySettings: () => ipcRenderer.invoke("open-security-settings"),
  scanSystem: () => ipcRenderer.invoke("scan-system"),
  scanSpaceLens: () => ipcRenderer.invoke("scan-space-lens"),
  getTrashSize: () => ipcRenderer.invoke("get-trash-size"),
  getStoreValue: (key: string) => ipcRenderer.invoke("get-store-value", key),
  setStoreValue: (key: string, value: unknown) => ipcRenderer.invoke("set-store-value", key, value),
  onProgress: (callback: (event: unknown, data: { scanId: string; progress: number; status: string }) => void) => {
    ipcRenderer.on("scan-progress", callback);
    return () => ipcRenderer.removeListener("scan-progress", callback);
  },
  ipcRenderer: {
    ...ipcRenderer,
    on: ipcRenderer.on.bind(ipcRenderer),
    removeListener: ipcRenderer.removeListener.bind(ipcRenderer),
  },
});
