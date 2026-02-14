import { Trash2, Coffee, Download } from "lucide-react";
import { useState } from "react";
import { ScanResult } from "../types";

interface HomebrewProps {
  data: ScanResult[];
  setData: React.Dispatch<React.SetStateAction<ScanResult[]>>;
}

export function Homebrew({ data: packages, setData: setPackages }: HomebrewProps) {
  const handleUninstall = async (name: string) => {
    if (confirm(`Uninstall Homebrew package "${name}"? This cannot be undone.`)) {
      const success = await window.electron.uninstallBrew(name);
      if (success) {
        setPackages((prev) => prev.filter((p) => p.name !== name));
      } else {
        alert("Uninstall failed. Check console for details.");
      }
    }
  };

  const [updating, setUpdating] = useState(false);
  const [showLeavesOnly, setShowLeavesOnly] = useState(false);

  const handleUpdate = async () => {
    setUpdating(true);
    await window.electron.updateBrew();
    setUpdating(false);
    alert("Homebrew updated!");
  };

  const displayedPackages = showLeavesOnly ? packages.filter((p) => p.isLeaf) : packages;

  // if (loading) return ...

  return (
    <div className="view-container">
      <div className="view-header">
        <h2>Homebrew Packages ({packages.length})</h2>
        <p className="text-sm text-white/50">Manage formulas and casks</p>
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button className="secondary-button" onClick={handleUpdate} disabled={updating}>
            {updating ? "Updating..." : "Update Homebrew"}
          </button>
          <label style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px" }}>
            <input type="checkbox" checked={showLeavesOnly} onChange={(e) => setShowLeavesOnly(e.target.checked)} />
            Show Leaves Only
          </label>
        </div>
      </div>

      <div className="file-list">
        {displayedPackages.map((pkg, i) => (
          <div key={i} className="file-item">
            <div className="file-icon">{pkg.type === "Cask" ? <Download size={20} /> : <Coffee size={20} />}</div>
            <div className="file-info">
              <div className="file-name">
                {pkg.name}
                {pkg.isLeaf && <span style={{ marginLeft: "8px", fontSize: "10px", background: "#10b981", padding: "2px 6px", borderRadius: "4px", color: "black" }}>LEAF</span>}
              </div>
              <div className="file-path">
                {pkg.version} • {pkg.type}
              </div>
            </div>
            <button className="action-btn delete-btn" onClick={() => handleUninstall(pkg.name)} title="Uninstall">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
