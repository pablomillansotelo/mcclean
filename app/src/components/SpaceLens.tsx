import { ScanResult } from "../types";

interface SpaceLensProps {
  data: ScanResult[];
  scanning: boolean;
  onScan: () => void;
}

export function SpaceLens({ data, scanning, onScan }: SpaceLensProps) {
  const totalSize = data.reduce((acc, item) => acc + item.size, 0);

  // Colors for visualization
  const colors = ["#ef4444", "#f97316", "#f59e0b", "#10b981", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899"];

  return (
    <div className="view-container">
      <div className="view-header">
        <h2>Space Lens</h2>
        <p className="text-sm text-white/50">Visualize your storage usage</p>
        <button className="primary-button" onClick={onScan} disabled={scanning} style={{ marginTop: "10px" }}>
          {scanning ? "Scanning..." : "Scan Home Folder"}
        </button>
      </div>

      {!scanning && data.length > 0 && (
        <div style={{ height: "calc(100vh - 200px)", width: "100%", display: "flex", flexWrap: "wrap", gap: "5px", padding: "10px", alignContent: "flex-start" }}>
          {data.map((item, i) => {
            const percentage = (item.size / totalSize) * 100;
            // Min width 50px so text fits, logic to allow wrapping
            const flexBasis = `${Math.max(percentage, 5)}%`;
            const color = colors[i % colors.length];

            return (
              <div
                key={i}
                style={{
                  flexGrow: 1,
                  flexBasis: flexBasis,
                  background: color,
                  minHeight: "80px",
                  height: `${Math.max(percentage * 5, 80)}px`,
                  borderRadius: "8px",
                  padding: "10px",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  cursor: "default",
                }}
                title={`${item.name} - ${(item.size / 1024 / 1024).toFixed(2)} MB`}
              >
                <div style={{ fontWeight: 600, fontSize: "14px", whiteSpace: "nowrap" }}>{item.name}</div>
                <div style={{ fontSize: "12px", opacity: 0.8 }}>{(item.size / 1024 / 1024 / 1024).toFixed(1)} GB</div>
                <div style={{ fontSize: "10px", position: "absolute", bottom: "5px", right: "5px", opacity: 0.5 }}>{percentage.toFixed(1)}%</div>
              </div>
            );
          })}
        </div>
      )}

      {!scanning && data.length === 0 && <div style={{ padding: "40px", textAlign: "center", opacity: 0.5 }}>Click Scan to visualize your Home folder.</div>}
    </div>
  );
}
