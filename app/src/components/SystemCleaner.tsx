import { useState, useEffect, useCallback } from "react";
import { ScanResult } from "../types";
import { HardDrive, RefreshCw, Trash2, AlertTriangle, FileText, Database } from "lucide-react";
import "./SystemCleaner.css";

interface SystemCleanerProps {
  data: ScanResult[];
  setData: (data: ScanResult[]) => void;
}

export function SystemCleaner({ data, setData }: SystemCleanerProps) {
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const scanSystem = useCallback(async () => {
    setLoading(true);
    try {
      const results = await window.electron.scanSystem();
      setData(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [setData]);

  useEffect(() => {
    if (data.length === 0 && !loading) {
      scanSystem();
    }
  }, [data.length, loading, scanSystem]);

  const toggleSelect = (path: string) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(path)) {
      newSet.delete(path);
    } else {
      newSet.add(path);
    }
    setSelectedItems(newSet);
  };

  const cleanSelected = async () => {
    if (selectedItems.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedItems.size} system items? This cannot be undone.`)) return;

    for (const path of selectedItems) {
      // Use move-to-trash which now has safety checks
      await window.electron.moveToTrash(path);
    }

    // Refresh
    scanSystem();
    setSelectedItems(new Set());
  };

  const getIcon = (type?: string) => {
    if (type?.includes("Log")) return <FileText size={18} />;
    if (type?.includes("Cache")) return <Database size={18} />;
    return <HardDrive size={18} />;
  };

  return (
    <div className="content-view">
      <div className="header-actions">
        <h1>System Junk</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="secondary-button" onClick={scanSystem} disabled={loading}>
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            Rescan
          </button>
          {selectedItems.size > 0 && (
            <button className="primary-button danger" onClick={cleanSelected}>
              <Trash2 size={16} />
              Clean Selected
            </button>
          )}
        </div>
      </div>

      <div
        className="info-banner"
        style={{
          background: "rgba(245, 158, 11, 0.1)",
          border: "1px solid rgba(245, 158, 11, 0.2)",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <AlertTriangle size={20} color="#f59e0b" />
        <p style={{ margin: 0, fontSize: "13px", color: "#f59e0b" }}>
          These files are generally safe to delete, but clearing system caches may slow down your Mac temporarily while they rebuild. McClean protects critical files automatically.
        </p>
      </div>

      <div className="file-list">
        {loading ? (
          <div className="empty-state">Scanning system locations...</div>
        ) : data.length === 0 ? (
          <div className="empty-state">No system junk found. Your Mac is clean!</div>
        ) : (
          data.map((item) => (
            <div key={item.path} className={`file-item selectable ${selectedItems.has(item.path) ? "selected" : ""}`} onClick={() => toggleSelect(item.path)}>
              <div className="file-icon">{getIcon(item.type)}</div>
              <div className="file-info">
                <div className="file-name">{item.name}</div>
                <div className="file-path">{item.path}</div>
              </div>
              <div className="meta-container" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="badge">{item.type}</span>
                <div className="file-size">{(item.size / 1024 / 1024).toFixed(1)} MB</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
