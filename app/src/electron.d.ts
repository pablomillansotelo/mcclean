import { ScanResult, StartupItem, SystemStats } from "./types";

export interface DuplicateGroup {
  hash: string;
  size: number;
  files: {
    path: string;
    name: string;
    modified: string;
  }[];
}

export interface ElectronAPI {
  startScan: (path: string) => Promise<ScanResult[]>;
  scanApps: () => Promise<ScanResult[]>;
  scanBrew: () => Promise<ScanResult[]>;
  updateBrew: () => Promise<boolean>;
  updateBrewPackage: (name: string) => Promise<boolean>;
  scanDevTools: () => Promise<ScanResult[]>;
  uninstallBrew: (name: string) => Promise<boolean>;
  findAssociatedFiles: (appName: string) => Promise<string[]>;
  scanStartupItems: () => Promise<StartupItem[]>;
  toggleStartupItem: (path: string, enable: boolean) => Promise<boolean>;
  getSystemStats: () => Promise<SystemStats>;
  scanPrivacy: () => Promise<ScanResult[]>;
  cleanPrivacy: (path: string) => Promise<boolean>;
  openSecuritySettings: () => Promise<boolean>;
  scanSystem: () => Promise<ScanResult[]>;
  scanDuplicates: (path?: string) => Promise<DuplicateGroup[]>;
  scanSpaceLens: () => Promise<ScanResult[]>;
  analyzeDirectory: (path: string) => Promise<ScanResult[]>;
  getTrashSize: () => Promise<number>;
  moveToTrash: (path: string) => Promise<boolean>;
  getStoreValue: (key: string) => Promise<unknown>;
  setStoreValue: (key: string, value: unknown) => Promise<void>;
  onProgress: (callback: (event: unknown, data: { scanId: string; progress: number; status: string }) => void) => () => void;
  ipcRenderer: unknown; // Simplified for now
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
