import { useState, useEffect } from "react";
import { ScanResult } from "../types";
import { useTranslation } from "react-i18next";
import { open } from "@tauri-apps/plugin-dialog";
import { Folder, ArrowLeft, Loader2 } from "lucide-react";

interface SpaceLensProps {
  data: ScanResult[];
  setData: React.Dispatch<React.SetStateAction<ScanResult[]>>;
  pathHistory: string[];
  setPathHistory: React.Dispatch<React.SetStateAction<string[]>>;
}

export function SpaceLens({ data, setData, pathHistory, setPathHistory }: SpaceLensProps) {
  const { t } = useTranslation();
  const [scanning, setScanning] = useState(false);
  const [progressText, setProgressText] = useState<string>("");
  
  // Vibrant colors for visualization
  const colors = ["#ef4444", "#f97316", "#f59e0b", "#10b981", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#14b8a6", "#f43f5e"];

  const getFileCategory = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext || ext === filename.toLowerCase()) return t('spaceLens.catOther', 'Otros Archivos');
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'heic', 'icns'].includes(ext)) return t('spaceLens.catImages', 'Imágenes');
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return t('spaceLens.catVideos', 'Videos');
    if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext)) return t('spaceLens.catAudio', 'Audio');
    if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'pages', 'csv', 'md'].includes(ext)) return t('spaceLens.catDocs', 'Documentos');
    if (['zip', 'tar', 'gz', 'rar', '7z'].includes(ext)) return t('spaceLens.catArchives', 'Comprimidos');
    if (['dmg', 'pkg', 'exe', 'app', 'iso'].includes(ext)) return t('spaceLens.catApps', 'Instaladores/Apps');
    if (['js', 'ts', 'jsx', 'tsx', 'json', 'html', 'css', 'rs', 'py', 'go', 'c', 'cpp'].includes(ext)) return t('spaceLens.catCode', 'Código');
    return t('spaceLens.catOther', 'Otros Archivos');
  };

  const processedData = () => {
    const dirs = data.filter(d => d.isDirectory);
    const files = data.filter(d => !d.isDirectory);

    const grouped: Record<string, { count: number, size: number }> = {};
    
    files.forEach(f => {
      const cat = getFileCategory(f.name);
      if (!grouped[cat]) grouped[cat] = { count: 0, size: 0 };
      grouped[cat].count += 1;
      grouped[cat].size += f.size;
    });

    const categoryItems = Object.keys(grouped).map(cat => ({
      name: `${cat} - ${grouped[cat].count} ${t('spaceLens.files', 'archivos')}`,
      path: `group://${cat}`,
      size: grouped[cat].size,
      isDirectory: false,
      isGroup: true
    }));

    return [...dirs, ...categoryItems].sort((a, b) => b.size - a.size);
  };

  useEffect(() => {
    if (!scanning) return;
    const unlisten = window.electron.onProgress((_event, data) => {
      if (data.scanId === "space_lens") {
        setProgressText(data.status);
      }
    });
    return () => {
      unlisten();
    };
  }, [scanning]);

  const currentPath = pathHistory.length > 0 ? pathHistory[pathHistory.length - 1] : null;

  const analyzePath = async (path: string) => {
    setScanning(true);
    setProgressText(t('spaceLens.calculating', 'Calculating sizes...'));
    try {
      const results = await window.electron.analyzeDirectory(path);
      setData(results);
    } catch (error) {
      console.error("Failed to analyze directory:", error);
    } finally {
      setScanning(false);
    }
  };

  const handleSelectFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: t('spaceLens.selectFolder', 'Select a folder to analyze')
      });
      
      if (selected && typeof selected === "string") {
        setPathHistory([selected]);
        await analyzePath(selected);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDrillDown = async (item: ScanResult) => {
    if (!item.isDirectory) return;
    const newPath = item.path;
    setPathHistory(prev => [...prev, newPath]);
    await analyzePath(newPath);
  };

  const handleGoBack = async () => {
    if (pathHistory.length <= 1) {
      // Clear
      setPathHistory([]);
      setData([]);
      return;
    }
    const newHistory = [...pathHistory];
    newHistory.pop(); // remove current
    const prevPath = newHistory[newHistory.length - 1];
    setPathHistory(newHistory);
    await analyzePath(prevPath);
  };

  const totalSize = data.reduce((acc, item) => acc + item.size, 0);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="content-view">
      <div className="view-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>{t('spaceLens.title')}</h2>
          <p className="text-sm text-white/50" style={{ maxWidth: "500px" }}>
            {currentPath ? currentPath : t('spaceLens.subtitle')}
          </p>
        </div>
          
        <div style={{ display: "flex", gap: "10px" }}>
          {currentPath && (
            <button className="secondary-button" onClick={handleGoBack} disabled={scanning} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ArrowLeft size={16} /> {t('common.back', 'Atrás')}
            </button>
          )}
          <button className="primary-button" onClick={handleSelectFolder} disabled={scanning} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {scanning ? <Loader2 className="animate-spin" size={16} /> : <Folder size={16} />} {scanning ? t('spaceLens.analyzing', 'Analyzing...') : t('spaceLens.scanFolder', 'Scan Folder')}
          </button>
        </div>
      </div>

      {scanning && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px", flexDirection: "column", gap: "15px", color: "white" }}>
          <Loader2 className="animate-spin" size={40} color="#c026d3" />
          <p style={{ fontWeight: "bold" }}>{t('spaceLens.calculating', 'Calculating sizes...')}</p>
          <p className="animate-pulse" style={{ fontSize: "12px", opacity: 0.6, maxWidth: "400px", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {progressText}
          </p>
        </div>
      )}

      {!scanning && data.length > 0 && (
        <div style={{ height: "calc(100vh - 200px)", width: "100%", display: "flex", flexWrap: "wrap", gap: "5px", padding: "10px", alignContent: "flex-start", overflowY: "auto" }}>
          {processedData().map((item: any, i) => {
            const percentage = totalSize > 0 ? (item.size / totalSize) * 100 : 0;
            // Min width so text fits, logic to allow wrapping
            const flexBasis = `${Math.max(percentage, 5)}%`;
            const color = colors[i % colors.length];

            return (
              <div
                key={i}
                onClick={() => handleDrillDown(item)}
                style={{
                  flexGrow: percentage > 1 ? 1 : 0,
                  flexBasis: flexBasis,
                  background: color,
                  minHeight: "80px",
                  height: `${Math.max(percentage * 5, 80)}px`,
                  borderRadius: "8px",
                  padding: "10px",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  cursor: item.isDirectory ? "pointer" : "default",
                  boxShadow: "inset 0 0 20px rgba(0,0,0,0.1)",
                  border: "1px solid rgba(255,255,255,0.1)"
                }}
                title={`${item.name} - ${formatSize(item.size)}`}
              >
                <div style={{ fontWeight: 600, fontSize: "14px", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                  {item.name}
                </div>
                <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>
                  {formatSize(item.size)}
                </div>
                <div style={{ fontSize: "10px", position: "absolute", bottom: "5px", right: "5px", opacity: 0.8, background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: "10px" }}>
                  {percentage.toFixed(1)}%
                </div>
                {item.isDirectory ? (
                  <Folder size={24} style={{ position: "absolute", bottom: "10px", left: "10px", opacity: 0.2 }} />
                ) : (
                  <div style={{ position: "absolute", bottom: "10px", left: "10px", opacity: 0.2, fontWeight: "bold", fontSize: "20px" }}>*</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!scanning && data.length === 0 && (
        <div style={{ padding: "40px", textAlign: "center", opacity: 0.5, display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <Folder size={48} opacity={0.5} />
          {t('spaceLens.clickScan')}
        </div>
      )}
    </div>
  );
}
