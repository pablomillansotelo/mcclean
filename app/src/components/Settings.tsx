import { useTranslation } from "react-i18next";

export function Settings({ onRescan }: { onRescan: () => void }) {
  const { t, i18n } = useTranslation();

  return (
    <div className="content-view">
      <h1>{t('settings.title')}</h1>

      <div style={{ marginTop: "40px" }}>
        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "20px" }}>
          <h3>{t('sidebar.general')}</h3>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
            <span>{t('settings.language')}</span>
            <select
              style={{ background: "rgba(255,255,255,0.1)", color: "inherit", border: "1px solid rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: "6px" }}
              value={i18n.language.startsWith("es") ? "es" : "en"}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
            >
              <option value="en" style={{ color: "#000" }}>{t('settings.english')}</option>
              <option value="es" style={{ color: "#000" }}>{t('settings.spanish')}</option>
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
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
