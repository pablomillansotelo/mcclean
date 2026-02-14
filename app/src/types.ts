export interface ScanResult {
  name: string;
  path: string;
  size: number;
  isDirectory?: boolean;
  modified?: string;
  category?: string;
  type?: string;
  version?: string; // For Homebrew
  isLeaf?: boolean; // For Homebrew
}

export interface StartupItem {
  name: string;
  path: string;
  type: "LaunchAgent" | "LoginItem";
  enabled: boolean;
}

export interface SystemStats {
  memory: {
    free: number;
    total: number;
    used: number;
  };
  cpu: {
    load: number;
    cores: number;
    model: string;
  };
}
