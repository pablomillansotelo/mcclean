import { useState, useEffect } from "react";
import { FolderAnalysisResult, ScanResult } from "../types";
import { useTranslation } from "react-i18next";
import { open } from "@tauri-apps/plugin-dialog";
import { Folder, ArrowLeft, Loader2 } from "lucide-react";

interface FolderAnalysisProps {
  data: FolderAnalysisResult | null;
  setData: React.Dispatch<React.SetStateAction<FolderAnalysisResult | null>>;
  pathHistory: string[];
  setPathHistory: React.Dispatch<React.SetStateAction<string[]>>;
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function FolderAnalysis({ data, setData, pathHistory, setPathHistory }: FolderAnalysisProps) {
  const { t } = useTranslation();
  const [scanning, setScanning] = useState(false);
  const [progressText, setProgressText] = useState<string>("");
  const [selectedDuplicates, setSelectedDuplicates] = useState<Set<string>>(new Set());

  // Vibrant colors for visualization
  const colors = ["#ef4444", "#f97316", "#f59e0b", "#10b981", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#14b8a6", "#f43f5e"];

  const getFileCategory = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext || ext === filename.toLowerCase()) return t('spaceLens.catOther');
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'heic', 'icns'].includes(ext)) return t('spaceLens.catImages');
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return t('spaceLens.catVideos');
    if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext)) return t('spaceLens.catAudio');
    if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'pages', 'csv', 'md'].includes(ext)) return t('spaceLens.catDocs');
    if (['zip', 'tar', 'gz', 'rar', '7z'].includes(ext)) return t('spaceLens.catArchives');
    if (['dmg', 'pkg', 'exe', 'app', 'iso'].includes(ext)) return t('spaceLens.catApps');
    if (['js', 'ts', 'jsx', 'tsx', 'json', 'html', 'css', 'rs', 'py', 'go', 'c', 'cpp'].includes(ext)) return t('spaceLens.catCode');
    return t('spaceLens.catOther');
  };

  const processedSpaceData = () => {
    if (!data) return [];
    const dirs = data.space_items.filter(d => d.isDirectory);
    const files = data.space_items.filter(d => !d.isDirectory);

    const grouped: Record<string, { count: number, size: number }> = {};
    
    files.forEach(f => {
      const cat = getFileCategory(f.name);
      if (!grouped[cat]) grouped[cat] = { count: 0, size: 0 };
      grouped[cat].count += 1;
      grouped[cat].size += f.size;
    });

    const categoryItems = Object.keys(grouped).map(cat => ({
      name: `${cat} - ${grouped[cat].count} ${t('spaceLens.files')}`,
      path: `group://${cat}`,
      size: grouped[cat].size,
      isDirectory: false,
      isGroup: true
    }));

    return [...dirs, ...categoryItems].sort((a, b) => b.size - a.size);
  };

  useEffect(() => {
    if (!scanning) return;
    const unlisten = window.electron.onProgress((_event, payload) => {
      if (payload.scanId === "folder_analysis") {
        setProgressText(payload.status);
      }
    });
    return () => {
      unlisten();
    };
  }, [scanning]);

  const currentPath = pathHistory.length > 0 ? pathHistory[pathHistory.length - 1] : null;

  const analyzePath = async (path: string) => {
    setScanning(true);
    setSelectedDuplicates(new Set());
    setProgressText(t('spaceLens.calculating'));
    try {
      const result = await window.electron.deepAnalyzeDirectory(path);
      setData(result);
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
        title: t('spaceLens.selectFolder')
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
      setPathHistory([]);
      setData(null);
      return;
    }
    const newHistory = [...pathHistory];
    newHistory.pop();
    const prevPath = newHistory[newHistory.length - 1];
    setPathHistory(newHistory);
    await analyzePath(prevPath);
  };

  // Duplicates Logic
  const toggleFile = (path: string) => {
    const next = new Set(selectedDuplicates);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setSelectedDuplicates(next);
  };

  const selectAllButNewest = () => {
    if (!data) return;
    const next = new Set<string>();
    data.duplicates.forEach((group) => {
      if (group.files.length < 2) return;
      const sorted = [...group.files].sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
      for (let i = 1; i < sorted.length; i++) next.add(sorted[i].path);
    });
    setSelectedDuplicates(next);
  };

  const handleCleanDuplicates = async () => {
    if (selectedDuplicates.size === 0 || !data) return;
    for (const path of selectedDuplicates) {
      await window.electron.moveToTrash(path);
    }
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        duplicates: prev.duplicates
          .map((group) => ({
            ...group,
            files: group.files.filter((f) => !selectedDuplicates.has(f.path)),
          }))
          .filter((g) => g.files.length > 1)
      };
    });
    setSelectedDuplicates(new Set());
  };

  const spaceItems = data ? data.space_items : [];
  const duplicates = data ? data.duplicates : [];
  const totalSpaceSize = spaceItems.reduce((acc, item) => acc + item.size, 0);
  const totalWastedBytes = duplicates.reduce((acc, group) => acc + group.size * (group.files.length - 1), 0);
  
  const selectedBytes = Array.from(selectedDuplicates).reduce((acc, path) => {
    for (const g of duplicates) {
      if (g.files.some((f) => f.path === path)) return acc + g.size;
    }
    return acc;
  }, 0);

  return (
    <div className="content-view fade-in" style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <div className="view-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div>
          <h2>{t('folderAnalysis.title')}</h2>
          <p className="text-sm text-white/50" style={{ maxWidth: "500px" }}>
            {currentPath ? currentPath : t('folderAnalysis.subtitle')}
          </p>
        </div>
          
        <div style={{ display: "flex", gap: "10px" }}>
          {currentPath && (
            <button className="secondary-button" onClick={handleGoBack} disabled={scanning} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ArrowLeft size={16} /> {t('common.back', 'Atrás')}
            </button>
          )}
          <button className="primary-button" onClick={handleSelectFolder} disabled={scanning} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {scanning ? <Loader2 className="animate-spin" size={16} /> : <Folder size={16} />} {scanning ? t('spaceLens.analyzing') : t('spaceLens.scanFolder')}
          </button>
        </div>
      </div>

      {scanning && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1, flexDirection: "column", gap: "15px", color: "white" }}>
          <Loader2 className="animate-spin" size={40} color="#c026d3" />
          <p style={{ fontWeight: "bold" }}>{t('spaceLens.calculating')}</p>
          <p className="animate-pulse" style={{ fontSize: "12px", opacity: 0.6, maxWidth: "400px", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {progressText}
          </p>
        </div>
      )}

      {!scanning && !data && (
        <div style={{ padding: "40px", textAlign: "center", opacity: 0.5, display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", flex: 1, justifyContent: "center" }}>
          <Folder size={48} opacity={0.5} />
          {t('spaceLens.clickScan')}
        </div>
      )}

      {!scanning && data && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", flex: 1, overflowY: "auto", paddingBottom: "40px" }}>
          
          {/* Lente de Espacio */}
          <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "15px" }}>
            <h3 style={{ marginTop: 0, marginBottom: "15px", display: "flex", justifyContent: "space-between" }}>
              <span>{t('folderAnalysis.spaceLensTitle')}</span>
              <span style={{ fontSize: "14px", opacity: 0.6 }}>{t('folderAnalysis.total')} {formatBytes(totalSpaceSize)}</span>
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", alignContent: "flex-start" }}>
              {processedSpaceData().map((item: any, i) => {
                const percentage = totalSpaceSize > 0 ? (item.size / totalSpaceSize) * 100 : 0;
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
                    title={`${item.name} - ${formatBytes(item.size)}`}
                  >
                    <div style={{ fontWeight: 600, fontSize: "14px", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>
                      {formatBytes(item.size)}
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
          </div>

          {/* Duplicados */}
          {duplicates.length > 0 && (
            <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "15px" }}>
              <h3 style={{ marginTop: 0, marginBottom: "15px", display: "flex", justifyContent: "space-between" }}>
                <span>{t('folderAnalysis.duplicatesTitle')}</span>
                <span style={{ fontSize: "14px", color: "#ff3b30" }}>{t('folderAnalysis.waste')} {formatBytes(totalWastedBytes)}</span>
              </h3>
              <div className="toolbar" style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                <button className="secondary-button" onClick={selectAllButNewest}>
                  {t('folderAnalysis.selectAll')}
                </button>
                <div style={{ flex: 1 }}></div>
                {selectedDuplicates.size > 0 && (
                  <button className="danger-button" onClick={handleCleanDuplicates}>
                    {t('folderAnalysis.delete', { count: selectedDuplicates.size, size: formatBytes(selectedBytes) })}
                  </button>
                )}
              </div>

              <div className="results-list">
                {duplicates.map((group, idx) => (
                  <div
                    key={idx}
                    className="result-group"
                    style={{
                      marginBottom: "15px",
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      className="group-header"
                      style={{
                        padding: "10px 15px",
                        background: "rgba(0,0,0,0.2)",
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "13px",
                        fontWeight: 500,
                      }}
                    >
                      <span>
                        {group.files.length} {t('folderAnalysis.identicalCopies')} • {group.files[0].name}
                      </span>
                      <span>{formatBytes(group.size)} c/u</span>
                    </div>

                    {group.files.map((file, fIdx) => (
                      <div
                        key={fIdx}
                        className="file-item"
                        style={{
                          padding: "12px 15px",
                          borderTop: "1px solid rgba(255,255,255,0.05)",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <input type="checkbox" checked={selectedDuplicates.has(file.path)} onChange={() => toggleFile(file.path)} />
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                          <div style={{ fontSize: "13px" }}>{file.name}</div>
                          <div style={{ fontSize: "11px", opacity: 0.5 }}>{file.path}</div>
                        </div>
                        <div style={{ fontSize: "11px", opacity: 0.5 }}>
                          {file.modified && file.modified !== "0" ? new Date(parseInt(file.modified) * 1000).toLocaleDateString() : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          {data && duplicates.length === 0 && (
            <div style={{ padding: "20px", textAlign: "center", opacity: 0.5, background: "rgba(0,0,0,0.2)", borderRadius: "12px" }}>
              <span style={{ fontSize: "24px" }}>✅</span>
              <p>{t('folderAnalysis.noDuplicates')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
