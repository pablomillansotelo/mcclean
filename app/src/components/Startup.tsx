import { Zap } from "lucide-react";
import { StartupItem } from "../types";
import { useTranslation } from "react-i18next";
import { useState } from "react";

interface StartupProps {
  items: StartupItem[];
  setItems: React.Dispatch<React.SetStateAction<StartupItem[]>>;
}

export function Startup({ items, setItems }: StartupProps) {
  const { t } = useTranslation();
  const [toggling, setToggling] = useState<string | null>(null);

  const handleToggle = async (item: StartupItem) => {
    setToggling(item.path);
    const success = await window.electron.toggleStartupItem(item.path, !item.enabled);
    if (success) {
      setItems(prev => prev.map(i => i.path === item.path ? { ...i, enabled: !item.enabled } : i));
    } else {
      alert("Failed to toggle startup item. It might require elevated privileges or the file might be missing.");
    }
    setToggling(null);
  };

  return (
    <div className="content-view">
      <div className="view-header">
        <h2>{t('startup.title', { count: items.length })}</h2>
        <p className="text-sm text-white/50">{t('startup.subtitle')}</p>
      </div>

      <div className="file-list">
        {items.map((item, i) => (
          <div key={i} className="file-item" style={{ opacity: item.enabled ? 1 : 0.5 }}>
            <div className="file-icon">
              <Zap size={20} color={item.enabled ? "#eab308" : "#888"} />
            </div>
            <div className="file-info">
              <div className="file-name">
                {item.name}
                <span style={{ 
                  marginLeft: "8px", 
                  fontSize: "10px", 
                  background: item.enabled ? "#10b981" : "#ef4444", 
                  padding: "2px 6px", 
                  borderRadius: "4px", 
                  color: "white" 
                }}>
                  {item.enabled ? "Activo" : "Apagado"}
                </span>
              </div>
              <div className="file-path">{item.path}</div>
              <div style={{ fontSize: "10px", opacity: 0.5, marginTop: "2px" }}>{item.type}</div>
            </div>
            <button 
              className="action-btn" 
              style={{ padding: "6px 12px", background: item.enabled ? "#333" : "#0a84ff", color: "white", borderRadius: "6px" }}
              onClick={() => handleToggle(item)}
              disabled={toggling === item.path}
            >
              {toggling === item.path ? "..." : (item.enabled ? "Apagar" : "Prender")}
            </button>
          </div>
        ))}
        {items.length === 0 && <div style={{ padding: "20px", textAlign: "center", opacity: 0.5 }}>{t('startup.noItems')}</div>}
      </div>
    </div>
  );
}
