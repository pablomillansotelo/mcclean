import { Trash2, Code2, AppWindow, HardDrive, Package, FolderX, Loader2 } from "lucide-react";
import { ScanResult } from "../types";
import { useTranslation } from "react-i18next";

import { open } from '@tauri-apps/plugin-dialog';

interface DevCleanerProps {
  data: ScanResult[];
  setData: React.Dispatch<React.SetStateAction<ScanResult[]>>;
  currentPath?: string;
  isScanning?: boolean;
  onPathChange?: (path: string) => void;
}

export function DevCleaner({ data: items, setData: setItems, currentPath, isScanning, onPathChange }: DevCleanerProps) {
  const { t } = useTranslation();

  const handleDelete = async (path: string, type?: string) => {
    if (type === "Docker Running" || type === "podman Running") {
      if (!confirm("Este contenedor está corriendo actualmente. ¿Estás seguro de que quieres detenerlo y borrarlo?")) {
        return;
      }
    } else if (!confirm(t('devCleaner.confirmMove', { path }))) {
      return;
    }
    const success = await window.electron.moveToTrash(path);
    if (success) {
      setItems((prev) => prev.filter((i) => i.path !== path));
    }
  };

  const handleSelectFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      });
      if (selected && typeof selected === 'string' && onPathChange) {
        onPathChange(selected);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // if (loading) ...

  return (
    <div className="content-view">
      <div className="view-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
            {t('devCleaner.title', { count: items.length })}
            {isScanning && <Loader2 className="animate-spin" size={20} style={{ color: "#60a5fa" }} />}
          </h2>
          <p className="text-sm text-white/50">{t('devCleaner.subtitle')} {currentPath ? `(Escaneando: ${currentPath})` : "(Usando configuración predeterminada)"}</p>
        </div>
        <button className="primary-button" style={{ fontSize: "14px", padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px" }} disabled={isScanning} onClick={handleSelectFolder}>
          <FolderX size={16} /> Seleccionar Carpeta
        </button>
      </div>

      <div className="file-list">
        {items.map((item, i) => {
          let TypeIcon = Package;
          if (item.type?.includes("Node")) TypeIcon = Code2;
          else if (item.type?.includes("Python")) TypeIcon = Code2;
          else if (item.type?.includes("Docker") || item.type?.includes("Podman")) TypeIcon = AppWindow;
          else if (item.type?.includes("Rust")) TypeIcon = Code2;
          else if (item.type?.includes("Nix")) TypeIcon = HardDrive;
          
          const isRunning = item.type?.includes("Running");

          return (
            <div key={i} className="file-item">
              <div className="file-icon"><TypeIcon size={20} /></div>
              <div className="file-info">
                <div className={`file-name ${isRunning ? 'text-yellow-400' : ''}`}>
                  {item.name}
                </div>
                <div className="file-path" title={item.path}>
                  {item.path}
                </div>
                <div style={{ fontSize: "10px", opacity: 0.8, marginTop: "4px", color: "#60a5fa", background: "rgba(96, 165, 250, 0.1)", display: "inline-block", padding: "2px 6px", borderRadius: "4px" }}>
                  {item.type || 'Unknown'}
                </div>
              </div>
              <div className="file-size">{(item.size / 1024 / 1024).toFixed(2)} MB</div>
              <button className="action-btn delete-btn" onClick={() => handleDelete(item.path, item.type)} title={t('devCleaner.moveToTrash')}>
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
