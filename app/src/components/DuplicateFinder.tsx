import { useState } from "react";
import { useTranslation } from "react-i18next";

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

interface DuplicateGroup {
  hash: string;
  size: number;
  files: {
    path: string;
    name: string;
    modified: string;
  }[];
}

export function DuplicateFinder() {
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<DuplicateGroup[]>([]);
  const [progress, setProgress] = useState({ progress: 0, status: "" });
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const { t } = useTranslation();

  const handleScan = () => {
    setScanning(true);
    setResults([]);
    setSelectedFiles(new Set());
    setProgress({ progress: 1, status: "Starting..." });

    const removeListener = window.electron.onProgress((_event, data) => {
      if (data.scanId === "duplicates") {
        setProgress({ progress: data.progress, status: data.status });
      }
    });

    window.electron
      .scanDuplicates()
      .then((res) => {
        setResults(res);
        setScanning(false);
        removeListener();
      })
      .catch(() => {
        setScanning(false);
        removeListener();
      });
  };

  const toggleFile = (path: string) => {
    const next = new Set(selectedFiles);
    if (next.has(path)) {
      next.delete(path);
    } else {
      next.add(path);
    }
    setSelectedFiles(next);
  };

  const selectAllButNewest = () => {
    const next = new Set<string>();
    results.forEach((group) => {
      if (group.files.length < 2) return;
      // Sort by modified desc (newest first)
      const sorted = [...group.files].sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
      // Select all except the first one (newest)
      for (let i = 1; i < sorted.length; i++) {
        next.add(sorted[i].path);
      }
    });
    setSelectedFiles(next);
  };

  const selectAllButOldest = () => {
    const next = new Set<string>();
    results.forEach((group) => {
      if (group.files.length < 2) return;
      // Sort by modified asc (oldest first)
      const sorted = [...group.files].sort((a, b) => new Date(a.modified).getTime() - new Date(b.modified).getTime());
      // Select all except the first one (oldest)
      for (let i = 1; i < sorted.length; i++) {
        next.add(sorted[i].path);
      }
    });
    setSelectedFiles(next);
  };

  const handleClean = async () => {
    if (selectedFiles.size === 0) return;

    // For now simple loop
    for (const path of selectedFiles) {
      await window.electron.moveToTrash(path);
    }

    // Refresh results locally? or just re-scan?
    // Let's remove them from the list
    setResults((prev) => {
      return prev
        .map((group) => ({
          ...group,
          files: group.files.filter((f) => !selectedFiles.has(f.path)),
        }))
        .filter((g) => g.files.length > 1); // Remove groups that became unique or empty
    });
    setSelectedFiles(new Set());
  };

  const totalWastedBytes = results.reduce((acc, group) => acc + group.size * (group.files.length - 1), 0);
  const selectedBytes = Array.from(selectedFiles).reduce((acc, path) => {
    // Find the group/file size
    // This is O(N^2) worst case but N is small (duplicates count) usually
    for (const g of results) {
      if (g.files.some((f) => f.path === path)) return acc + g.size;
    }
    return acc;
  }, 0);

  return (
    <div className="content-view fade-in">
      <div className="header-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1>{t('duplicateFinder.title')}</h1>
          <p className="subtitle">{t('duplicateFinder.subtitle')}</p>
        </div>
        {!scanning && results.length > 0 && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#ff3b30" }}>{formatBytes(totalWastedBytes)}</div>
            <div style={{ fontSize: "12px", opacity: 0.7 }}>{t('duplicateFinder.wastedSpace')}</div>
          </div>
        )}
      </div>

      {!scanning && results.length === 0 && (
        <div
          className="empty-state"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "400px",
            opacity: 0.8,
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>👯‍♀️</div>
          <p>{t('duplicateFinder.scanPrompt')}</p>
          <button className="primary-button" onClick={handleScan} style={{ marginTop: "20px" }}>
            {t('duplicateFinder.startScan')}
          </button>
        </div>
      )}

      {scanning && (
        <div className="scanning-state">
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress.progress}%` }}></div>
          </div>
          <p className="status-text">{progress.status}</p>
        </div>
      )}

      {!scanning && results.length > 0 && (
        <>
          <div className="toolbar" style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <button className="secondary-button" onClick={selectAllButNewest}>
              {t('duplicateFinder.keepNewest')}
            </button>
            <button className="secondary-button" onClick={selectAllButOldest}>
              {t('duplicateFinder.keepOldest')}
            </button>
            <div style={{ flex: 1 }}></div>
            {selectedFiles.size > 0 && (
              <button className="danger-button" onClick={handleClean}>
                {t('duplicateFinder.trashSelected', { size: formatBytes(selectedBytes) })}
              </button>
            )}
          </div>

          <div className="results-list">
            {results.map((group, idx) => (
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
                    {t('duplicateFinder.copies', { count: group.files.length })} • {group.files[0].name}
                  </span>
                  <span>{t('duplicateFinder.each', { size: formatBytes(group.size) })}</span>
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
                    <input type="checkbox" checked={selectedFiles.has(file.path)} onChange={() => toggleFile(file.path)} />
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                      <div style={{ fontSize: "13px" }}>{file.name}</div>
                      <div style={{ fontSize: "11px", opacity: 0.5 }}>{file.path}</div>
                    </div>
                    <div style={{ fontSize: "11px", opacity: 0.5 }}>{new Date(file.modified).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
