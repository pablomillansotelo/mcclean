import { useTranslation } from "react-i18next";

export function LargeFiles({ results, onDelete }: { results: any[]; onDelete: (path: string) => void }) {
  // Filter > 100MB
  const largeFiles = results.filter((item) => item.size > 100 * 1024 * 1024);
  const { t } = useTranslation();

  return (
    <div className="content-view">
      <div className="view-header">
        <h2>{t('sidebar.largeFiles')}</h2>
        <p className="text-sm text-white/50">{t('largeFiles.subtitle')}</p>
      </div>

      {largeFiles.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", opacity: 0.5 }}>{t('largeFiles.noFiles')}</div>
      ) : (
        <div className="results-list">
          {largeFiles.map((item, idx) => (
            <div
              key={idx}
              className="result-item"
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "16px",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 500 }}>{item.name}</span>
                <span style={{ fontSize: "12px", opacity: 0.7 }}>{item.path}</span>
              </div>
              <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                <span>{(item.size / 1024 / 1024).toFixed(2)} MB</span>
                <button
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    background: "rgba(255,59,48,0.15)",
                    color: "#ff3b30",
                    border: "1px solid rgba(255,59,48,0.2)",
                  }}
                  onClick={() => onDelete(item.path)}
                >
                  {t('largeFiles.trash')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
