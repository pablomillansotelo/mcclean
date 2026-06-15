import { Trash2, Code2, FolderX, AppWindow, HardDrive, Package } from "lucide-react";
import { ScanResult } from "../types";
import { useTranslation } from "react-i18next";

interface DevCleanerProps {
  data: ScanResult[];
  setData: React.Dispatch<React.SetStateAction<ScanResult[]>>;
}

export function DevCleaner({ data: items, setData: setItems }: DevCleanerProps) {
  const { t } = useTranslation();

  const handleDelete = async (path: string) => {
    if (confirm(t('devCleaner.confirmMove', { path }))) {
      const success = await window.electron.moveToTrash(path);
      if (success) {
        setItems((prev) => prev.filter((i) => i.path !== path));
      }
    }
  };

  // if (loading) ...

  return (
    <div className="view-container">
      <div className="view-header">
        <h2>{t('devCleaner.title', { count: items.length })}</h2>
        <p className="text-sm text-white/50">{t('devCleaner.subtitle')}</p>
      </div>

      <div className="file-list">
        {items.map((item, i) => {
          let icon = <Code2 size={20} />;
          if (item.type === "Node") icon = <FolderX size={20} color="#84ba64" />;
          if (item.type === "Python Venv") icon = <Code2 size={20} color="#3776ab" />;
          if (item.type === "Xcode") icon = <AppWindow size={20} color="#157efb" />;
          if (item.type === "Docker") icon = <HardDrive size={20} color="#0db7ed" />;
          if (["npm", "Yarn", "pnpm", "CocoaPods"].includes(item.type || "")) icon = <Package size={20} color="#e11d48" />;

          return (
            <div key={i} className="file-item">
              <div className="file-icon">{icon}</div>
              <div className="file-info">
                <div className="file-name">{item.name}</div>
                <div className="file-path">{item.path}</div>
                {item.type && <div style={{ fontSize: "10px", opacity: 0.5, marginTop: "2px" }}>{item.type}</div>}
              </div>
              <div className="file-size">{(item.size / 1024 / 1024).toFixed(2)} MB</div>
              <button className="action-btn delete-btn" onClick={() => handleDelete(item.path)} title={t('devCleaner.moveToTrash')}>
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
