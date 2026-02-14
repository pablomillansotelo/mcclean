"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electron", {
  startScan: (path) => electron.ipcRenderer.invoke("scan-directory", path),
  scanApps: () => electron.ipcRenderer.invoke("scan-apps"),
  scanBrew: () => electron.ipcRenderer.invoke("scan-brew"),
  updateBrew: () => electron.ipcRenderer.invoke("run-brew-update"),
  scanDevTools: () => electron.ipcRenderer.invoke("scan-devtools"),
  uninstallBrew: (name) => electron.ipcRenderer.invoke("run-brew-uninstall", name),
  findAssociatedFiles: (appName) => electron.ipcRenderer.invoke("find-associated-files", appName),
  scanStartupItems: () => electron.ipcRenderer.invoke("scan-startup-items"),
  getSystemStats: () => electron.ipcRenderer.invoke("get-system-stats"),
  scanPrivacy: () => electron.ipcRenderer.invoke("scan-privacy"),
  cleanPrivacy: (path) => electron.ipcRenderer.invoke("clean-privacy", path),
  openSecuritySettings: () => electron.ipcRenderer.invoke("open-security-settings"),
  scanSystem: () => electron.ipcRenderer.invoke("scan-system"),
  scanSpaceLens: () => electron.ipcRenderer.invoke("scan-space-lens"),
  getTrashSize: () => electron.ipcRenderer.invoke("get-trash-size"),
  getStoreValue: (key) => electron.ipcRenderer.invoke("get-store-value", key),
  setStoreValue: (key, value) => electron.ipcRenderer.invoke("set-store-value", key, value),
  onProgress: (callback) => {
    electron.ipcRenderer.on("scan-progress", callback);
    return () => electron.ipcRenderer.removeListener("scan-progress", callback);
  },
  ipcRenderer: {
    ...electron.ipcRenderer,
    on: electron.ipcRenderer.on.bind(electron.ipcRenderer),
    removeListener: electron.ipcRenderer.removeListener.bind(electron.ipcRenderer)
  }
});
