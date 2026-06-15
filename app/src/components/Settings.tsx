import { useTranslation } from "react-i18next";

export function Settings({ onRescan, theme, setTheme }: { onRescan: () => void, theme: string, setTheme: (t: string) => void }) {
  const { t, i18n } = useTranslation();

  return (
    <div className="content-view">
      <div className="view-header">
        <h2>{t('settings.title')}</h2>
        <p className="text-sm text-white/50">{t('sidebar.general')}</p>
      </div>

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
            <span>{t('settings.theme')}</span>
            <select
              style={{ background: "rgba(255,255,255,0.1)", color: "inherit", border: "1px solid rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: "6px" }}
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="light" style={{ color: "#000" }}>{t('settings.light')}</option>
              <option value="dark" style={{ color: "#000" }}>{t('settings.dark')}</option>
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <span>{t('settings.version')}</span>
            <span style={{ opacity: 0.5 }}>1.0.0 (Beta)</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <span>{t('settings.resetData')}</span>
            <button
              className="primary-button"
              style={{ background: "rgba(255,59,48,0.2)", color: "#ff3b30", fontSize: "13px", padding: "6px 12px" }}
              onClick={() => {
                if (confirm(t('settings.resetConfirm'))) {
                  onRescan(); // For now just rescan
                }
              }}
            >
              {t('settings.resetBtn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
