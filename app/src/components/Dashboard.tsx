import { LayoutDashboard, Package, Coffee, Code2, HardDrive } from "lucide-react";
import { useState, useEffect } from "react";
import { ScanResult } from "../types";

interface DashboardProps {
  scanning: boolean;
  hasScanned: boolean;
  results: ScanResult[];
  apps: ScanResult[];
  brew: ScanResult[];
  devItems: ScanResult[];
  onScan: () => void;
}

import { ProgressBar } from "./ProgressBar";
import { SmartAssistant } from "./SmartAssistant";

// ...

export function Dashboard({ scanning, hasScanned, results, apps, brew, devItems, onScan }: DashboardProps) {
  const totalSize = results.reduce((acc, item) => acc + item.size, 0);
  const devSize = devItems.reduce((acc, item) => acc + item.size, 0);
  const appSize = apps.reduce((acc, item) => acc + item.size, 0);

  // Derived stats
  const largestFile = results.reduce<ScanResult | null>((max, item) => (item.size > (max?.size || 0) ? item : max), null);
  const downloadsItems = results.filter((item) => item.path.includes("/Downloads/"));
  const downloadsSize = downloadsItems.reduce((acc, item) => acc + item.size, 0);

  const [lastScan, setLastScan] = useState<string | null>(null);
  const [progress, setProgress] = useState({
    system: { progress: 0, status: "Waiting..." },
    apps: { progress: 0, status: "Waiting..." },
    brew: { progress: 0, status: "Waiting..." },
    devtools: { progress: 0, status: "Waiting..." },
  });

  useEffect(() => {
    window.electron.getStoreValue("lastScanDate").then((date) => {
      if (typeof date === "string") setLastScan(date);
    });

    const removeListener = window.electron.onProgress((_event, data) => {
      setProgress((prev) => ({
        ...prev,
        [data.scanId]: { progress: data.progress, status: data.status },
      }));
    });

    return () => removeListener();
  }, []);

  const handleScanClick = async () => {
    // Reset progress
    setProgress({
      system: { progress: 0, status: "Starting..." },
      apps: { progress: 0, status: "Starting..." },
      brew: { progress: 0, status: "Starting..." },
      devtools: { progress: 0, status: "Starting..." },
    });

    onScan();
    const now = new Date().toLocaleString();
    setLastScan(now);
    await window.electron.setStoreValue("lastScanDate", now);
  };

  return (
    <div className="content-view">
      <h1>System Overview</h1>
      <div style={{ marginBottom: "20px" }}>
        <SmartAssistant />
      </div>

      {!hasScanned && (
        <div className="scan-card" style={{ marginTop: "80px" }}>
          {scanning ? (
            <div style={{ width: "100%", maxWidth: "400px", textAlign: "left" }}>
              <ProgressBar progress={progress.system.progress} label={`System: ${progress.system.status}`} color="#3b82f6" />
              <ProgressBar progress={progress.apps.progress} label={`Apps: ${progress.apps.status}`} color="#10b981" />
              <ProgressBar progress={progress.brew.progress} label={`Homebrew: ${progress.brew.status}`} color="#f59e0b" />
              <ProgressBar progress={progress.devtools.progress} label={`Developer: ${progress.devtools.status}`} color="#8b5cf6" />
            </div>
          ) : (
            <>
              <div className="scan-circle">
                <LayoutDashboard size={48} />
              </div>
              <h2>Ready to Scan</h2>
              <p>Scan your Mac to reclaim space.</p>
              {lastScan && <p style={{ fontSize: "12px", opacity: 0.5, marginTop: "-10px" }}>Last scan: {lastScan}</p>}
              <button className="primary-button" onClick={handleScanClick}>
                Start Deep Scan
              </button>
            </>
          )}
        </div>
      )}

      {hasScanned && (
        <>
          <div className="dashboard-stats" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "40px" }}>
            {/* System Junk */}
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", opacity: 0.7 }}>
                <HardDrive size={18} />
                <div style={{ fontSize: "14px" }}>System Junk</div>
              </div>
              <div style={{ fontSize: "24px", fontWeight: 600 }}>{(totalSize / 1024 / 1024).toFixed(1)} MB</div>
              <div style={{ fontSize: "13px", opacity: 0.5, marginTop: "4px" }}>{results.length} items found</div>
            </div>

            {/* Applications */}
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", opacity: 0.7 }}>
                <Package size={18} />
                <div style={{ fontSize: "14px" }}>Applications</div>
              </div>
              <div style={{ fontSize: "24px", fontWeight: 600 }}>{apps.length}</div>
              <div style={{ fontSize: "13px", opacity: 0.5, marginTop: "4px" }}>{(appSize / 1024 / 1024).toFixed(1)} MB total</div>
            </div>

            {/* Homebrew */}
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", opacity: 0.7 }}>
                <Coffee size={18} />
                <div style={{ fontSize: "14px" }}>Homebrew</div>
              </div>
              <div style={{ fontSize: "24px", fontWeight: 600 }}>{brew.length}</div>
              <div style={{ fontSize: "13px", opacity: 0.5, marginTop: "4px" }}>Packages installed</div>
            </div>

            {/* Developer */}
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", opacity: 0.7 }}>
                <Code2 size={18} />
                <div style={{ fontSize: "14px" }}>Developer Junk</div>
              </div>
              <div style={{ fontSize: "24px", fontWeight: 600 }}>{(devSize / 1024 / 1024).toFixed(1)} MB</div>
              <div style={{ fontSize: "13px", opacity: 0.5, marginTop: "4px" }}>{devItems.length} items found</div>
            </div>

            {/* Downloads Highlight */}
            <div style={{ background: "rgba(255,149,0,0.1)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,149,0,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", color: "#ff9f0a" }}>
                <HardDrive size={18} />
                <div style={{ fontSize: "14px" }}>Downloads Bin</div>
              </div>
              <div style={{ fontSize: "24px", fontWeight: 600, color: "#ff9f0a" }}>{(downloadsSize / 1024 / 1024).toFixed(1)} MB</div>
              <div style={{ fontSize: "13px", opacity: 0.7, marginTop: "4px", color: "#ff9f0a" }}>{downloadsItems.length} files</div>
            </div>

            {/* Largest File Highlight */}
            {largestFile && (
              <div style={{ background: "rgba(255,59,48,0.1)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,59,48,0.2)", gridColumn: "span 2" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", color: "#ff453a" }}>
                  <HardDrive size={18} />
                  <div style={{ fontSize: "14px" }}>Largest File Found</div>
                </div>
                <div style={{ fontSize: "20px", fontWeight: 600, color: "#ff453a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{largestFile.name}</div>
                <div style={{ fontSize: "13px", opacity: 0.8, marginTop: "4px", color: "#ff453a" }}>
                  {(largestFile.size / 1024 / 1024).toFixed(1)} MB • {largestFile.path}
                </div>
              </div>
            )}
          </div>

          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <button className="primary-button" onClick={onScan} disabled={scanning}>
              {scanning ? "Rescanning..." : "Rescan System"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
