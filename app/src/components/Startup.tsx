import { Zap, Loader2 } from "lucide-react";
import { StartupItem } from "../types";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

interface StartupProps {
  items: StartupItem[];
  setItems: React.Dispatch<React.SetStateAction<StartupItem[]>>;
  hasScanned?: boolean;
  globalScanning?: boolean;
}

export function Startup({ items, setItems, hasScanned, globalScanning }: StartupProps) {
  const { t } = useTranslation();
  const [toggling, setToggling] = useState<string | null>(null);
  const [localScanning, setLocalScanning] = useState(false);

  useEffect(() => {
    if (!hasScanned && items.length === 0 && !globalScanning && !localScanning) {
      setLocalScanning(true);
      window.electron.scanStartupItems().then(data => {
        setItems(data || []);
        setLocalScanning(false);
      }).catch(e => {
        console.error(e);
        setLocalScanning(false);
      });
    }
  }, [hasScanned, items.length, globalScanning]);

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
        {(globalScanning || localScanning) ? (
          <div className="empty-state flex flex-col items-center justify-center gap-4 py-10">
            <Loader2 className="animate-spin text-accent" size={32} />
            <p className="text-white/70">{t('startup.scanning', 'Escaneando elementos de inicio...')}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state py-10 text-center opacity-50">
            {t('startup.noItems', 'No se encontraron elementos de inicio')}
          </div>
        ) : items.map((item, i) => (
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
      </div>
    </div>
  );
}
