import { Globe, Lock } from "lucide-react";
import { ScanResult } from "../types";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface PrivacyProps {
  data: ScanResult[];
  setData: React.Dispatch<React.SetStateAction<ScanResult[]>>;
}

export function Privacy({ data, setData }: PrivacyProps) {
  const [cleaning, setCleaning] = useState(false);
  const { t } = useTranslation();

  const handleClean = async (item: ScanResult) => {
    if (confirm(t('privacy.confirmClean', { name: item.name }))) {
      setCleaning(true);
      const success = await window.electron.cleanPrivacy(item.path);
      setCleaning(false);
      if (success) {
        setData((prev) => prev.filter((i) => i.path !== item.path));
      }
    }
  };

  const openSettings = async () => {
    await window.electron.openSecuritySettings();
  };

  return (
    <div className="content-view">
      <div className="view-header">
        <h2>{t('privacy.title', { count: data.length })}</h2>
        <p className="text-sm text-white/50">{t('privacy.subtitle')}</p>
      </div>

      <div className="summary-cards" style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <div className="card" onClick={openSettings} style={{ cursor: "pointer", border: "1px solid rgba(255,255,255,0.1)", padding: "15px", borderRadius: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
            <Lock size={20} color="#eab308" />
            <span style={{ fontWeight: 600 }}>{t('privacy.appPermissions')}</span>
          </div>
          <p style={{ fontSize: "12px", opacity: 0.7 }}>{t('privacy.appPermissionsDesc')}</p>
        </div>
      </div>

      <h3 style={{ marginTop: "30px", marginBottom: "15px", fontSize: "14px", fontWeight: 600, opacity: 0.8 }}>{t('privacy.browserCaches')}</h3>
      <div className="file-list">
        {data.map((item, i) => (
          <div key={i} className="file-item">
            <div className="file-icon">
              <Globe size={20} color="#3b82f6" />
            </div>
            <div className="file-info">
              <div className="file-name">{item.name}</div>
              <div className="file-path">{item.path}</div>
            </div>
            <div className="file-size">{(item.size / 1024 / 1024).toFixed(2)} MB</div>
            <button className="secondary-button" style={{ fontSize: "11px", padding: "4px 8px" }} onClick={() => handleClean(item)} disabled={cleaning}>
              {t('privacy.clean')}
            </button>
          </div>
        ))}
        {data.length === 0 && <div style={{ padding: "20px", textAlign: "center", opacity: 0.5 }}>{t('privacy.allClean')}</div>}
      </div>
    </div>
  );
}
