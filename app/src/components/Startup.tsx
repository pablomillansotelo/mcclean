import { Zap } from "lucide-react";
import { StartupItem } from "../types";
import { useTranslation } from "react-i18next";

interface StartupProps {
  items: StartupItem[];
}

export function Startup({ items }: StartupProps) {
  const { t } = useTranslation();

  return (
    <div className="content-view">
      <div className="view-header">
        <h2>{t('startup.title', { count: items.length })}</h2>
        <p className="text-sm text-white/50">{t('startup.subtitle')}</p>
      </div>

      <div className="file-list">
        {items.map((item, i) => (
          <div key={i} className="file-item">
            <div className="file-icon">
              <Zap size={20} color="#eab308" />
            </div>
            <div className="file-info">
              <div className="file-name">{item.name}</div>
              <div className="file-path">{item.path}</div>
              <div style={{ fontSize: "10px", opacity: 0.5, marginTop: "2px" }}>{item.type}</div>
            </div>
          </div>
        ))}
        {items.length === 0 && <div style={{ padding: "20px", textAlign: "center", opacity: 0.5 }}>{t('startup.noItems')}</div>}
      </div>
    </div>
  );
}
