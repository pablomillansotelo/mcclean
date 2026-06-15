import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { ScanResult, StartupItem, SystemStats, DuplicateGroup } from './types';

export const tauriElectronShim = {
  startScan: (path: string) => invoke<ScanResult[]>('start_scan', { path }),
  scanApps: () => invoke<ScanResult[]>('scan_apps'),
  scanBrew: () => invoke<ScanResult[]>('scan_brew'),
  updateBrew: () => invoke<boolean>('update_brew'),
  updateBrewPackage: (name: string) => invoke<boolean>('update_brew_package', { name }),
  scanDevTools: () => invoke<ScanResult[]>('scan_dev_tools'),
  uninstallBrew: (name: string) => invoke<boolean>('uninstall_brew', { name }),
  findAssociatedFiles: (appName: string) => invoke<string[]>('find_associated_files', { appName }),
  scanStartupItems: () => invoke<StartupItem[]>('scan_startup_items'),
  toggleStartupItem: (path: string, enable: boolean) => invoke<boolean>('toggle_startup_item', { path, enable }),
  getSystemStats: () => invoke<SystemStats>('get_system_stats'),
  scanPrivacy: () => invoke<ScanResult[]>('scan_privacy'),
  cleanPrivacy: (path: string) => invoke<boolean>('clean_privacy', { path }),
  openSecuritySettings: () => invoke<boolean>('open_security_settings'),
  scanSystem: () => invoke<ScanResult[]>('scan_system_cmd'),
  scanDuplicates: (path?: string) => invoke<DuplicateGroup[]>('scan_duplicates', { path }),
  scanSpaceLens: () => invoke<ScanResult[]>('scan_space_lens'),
  analyzeDirectory: (path: string) => invoke<ScanResult[]>('analyze_directory', { path }),
  getTrashSize: () => invoke<number>('get_trash_size'),
  moveToTrash: (path: string) => invoke<boolean>('move_to_trash', { path }),
  getStoreValue: (key: string) => invoke<unknown>('get_store_value', { key }),
  setStoreValue: (key: string, value: unknown) => invoke<void>('set_store_value', { key, value }),
  onProgress: (callback: (event: unknown, data: { scanId: string; progress: number; status: string }) => void) => {
    let unlisten: UnlistenFn | undefined;
    listen<{ scanId: string; progress: number; status: string }>('scan-progress', (event) => {
      callback(event, event.payload);
    }).then(fn => {
      unlisten = fn;
    });
    return () => {
      if (unlisten) unlisten();
    };
  },
  ipcRenderer: {
    on: () => {},
    send: () => {},
  }
};

(window as any).electron = tauriElectronShim;
(window as any).ipcRenderer = tauriElectronShim.ipcRenderer;
