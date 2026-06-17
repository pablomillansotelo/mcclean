import { Trash2, Code2, AppWindow, HardDrive, Package } from "lucide-react";
import { ScanResult } from "../types";
import { useTranslation } from "react-i18next";

import { open } from '@tauri-apps/plugin-dialog';

interface DevCleanerProps {
  data: ScanResult[];
  setData: React.Dispatch<React.SetStateAction<ScanResult[]>>;
  currentPath?: string;
  onPathChange?: (path: string) => void;
}

export function DevCleaner({ data: items, setData: setItems, currentPath, onPathChange }: DevCleanerProps) {
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
        <div className="section-header">
          <div className="title-row">
            <Code2 size={24} className="text-blue-400" />
            <h2 className="text-xl font-semibold text-white">{t('devCleaner.title')}</h2>
          </div>
          <div className="actions-row">
            <span className="text-sm text-gray-400 mr-4">
              {currentPath ? `Carpeta: ${currentPath}` : "Ninguna carpeta seleccionada"}
            </span>
            <button className="btn-primary text-sm px-4 py-2" onClick={handleSelectFolder}>
              Seleccionar Carpeta
            </button>
          </div>
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
              <div className="flex flex-col">
                <span className={`font-medium ${isRunning ? 'text-yellow-400' : 'text-gray-200'}`}>
                  {item.name}
                </span>
                <span className="text-sm text-gray-500 truncate max-w-[400px]" title={item.path}>
                  {item.path}
                </span>
                <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded mt-1 w-fit">
                  {item.type || 'Unknown'}
                </span>
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
