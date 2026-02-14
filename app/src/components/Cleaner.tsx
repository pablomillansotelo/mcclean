export function Cleaner({ results, onDelete }: { results: any[]; onDelete: (path: string) => void }) {
  // Group by category
  const categories: Record<string, any[]> = results.reduce((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="content-view">
      <h1>Cleaner</h1>
      <p style={{ opacity: 0.7, marginBottom: "20px" }}>System junk and caches</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
        {Object.keys(categories).length === 0 && <div style={{ padding: "40px", textAlign: "center", opacity: 0.5 }}>Nothing to clean. Run a scan first.</div>}

        {Object.entries(categories).map(([category, items]) => (
          <div key={category} className="category-section">
            <h3 style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px" }}>{category}</h3>
            <div>
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="result-item"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    fontSize: "14px",
                  }}
                >
                  <span>{item.name}</span>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <span style={{ opacity: 0.7 }}>{(item.size / 1024 / 1024).toFixed(2)} MB</span>
                    <button onClick={() => onDelete(item.path)} style={{ color: "#ff3b30", background: "none", border: "none", cursor: "pointer" }}>
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
