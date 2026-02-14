export function Settings({ onRescan }: { onRescan: () => void }) {
  return (
    <div className="content-view">
      <h1>Settings</h1>

      <div style={{ marginTop: "40px" }}>
        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "20px" }}>
          <h3>General</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
            <span>Version</span>
            <span style={{ opacity: 0.5 }}>1.0.0 (Beta)</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <span>Reset Application Data</span>
            <button
              className="primary-button"
              style={{ background: "rgba(255,59,48,0.2)", color: "#ff3b30", fontSize: "13px", padding: "6px 12px" }}
              onClick={() => {
                if (confirm("Are you sure? This will not delete your files, just app settings.")) {
                  onRescan(); // For now just rescan
                }
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
