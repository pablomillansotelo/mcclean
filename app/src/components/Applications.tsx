import { Trash2, Package, Loader2 } from "lucide-react";
import { ScanResult } from "../types";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

interface ApplicationsProps {
  data: ScanResult[];
  setData: React.Dispatch<React.SetStateAction<ScanResult[]>>;
  hasScanned?: boolean;
  globalScanning?: boolean;
}

export function Applications({ data: apps, setData: setApps, hasScanned, globalScanning }: ApplicationsProps) {
  const { t } = useTranslation();
  const [localScanning, setLocalScanning] = useState(false);

  useEffect(() => {
    if (!hasScanned && apps.length === 0 && !globalScanning && !localScanning) {
      setLocalScanning(true);
      window.electron.scanApps().then(data => {
        setApps(data || []);
        setLocalScanning(false);
      }).catch(e => {
        console.error(e);
        setLocalScanning(false);
      });
    }
  }, [hasScanned, apps.length, globalScanning]);
  const handleUninstall = async (appPath: string) => {
    // 1. Check for associated files
    const appName = appPath.split("/").pop()?.replace(".app", "") || "";
    let message = t('applications.confirmUninstall', { app: appPath });

    // We can run this check optimistically
    const associated = appName ? await window.electron.findAssociatedFiles(appName) : [];

    if (associated.length > 0) {
      message += `\n\n${t('applications.foundAssociated', { count: associated.length })}`;
    }

    if (confirm(message)) {
      const success = await window.electron.moveToTrash(appPath);

      // Delete associated too if confirmed
      if (success && associated.length > 0) {
        if (confirm(t('applications.confirmAssociated', { count: associated.length, files: `${associated.slice(0, 5).join("\n")}...` }))) {
          for (const file of associated) {
            await window.electron.moveToTrash(file);
          }
        }
      }

      if (success) {
        setApps((prev) => prev.filter((a) => a.path !== appPath));
      }
    }
  };

  return (
    <div className="content-view">
      <div className="view-header">
        <h2>{t('applications.title', { count: apps.length })}</h2>
        <p className="text-sm text-white/50">{t('applications.subtitle')}</p>
      </div>

      <div className="file-list">
        {(globalScanning || localScanning) ? (
          <div className="empty-state flex flex-col items-center justify-center gap-4 py-10">
            <Loader2 className="animate-spin text-accent" size={32} />
            <p className="text-white/70">{t('applications.scanning', 'Escaneando aplicaciones...')}</p>
          </div>
        ) : apps.length === 0 ? (
          <div className="empty-state py-10 text-center opacity-50">
            {t('applications.noItems', 'No se encontraron aplicaciones')}
          </div>
        ) : apps.map((app, i) => (
          <div key={i} className="file-item">
            <div className="file-icon">
              <Package size={20} />
            </div>
            <div className="file-info">
              <div className="file-name">{app.name}</div>
              <div className="file-path">{app.path}</div>
            </div>
            <div className="file-size">{(app.size / 1024 / 1024).toFixed(2)} MB</div>
            <button className="action-btn delete-btn" onClick={() => handleUninstall(app.path)} title={t('applications.moveToTrash')}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
