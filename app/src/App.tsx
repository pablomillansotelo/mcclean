import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { LargeFiles } from "./components/LargeFiles";
import { Settings } from "./components/Settings";
import { Applications } from "./components/Applications";
import { Homebrew } from "./components/Homebrew";
import { DevCleaner } from "./components/DevCleaner";
import { Privacy } from "./components/Privacy";
import { SystemCleaner } from "./components/SystemCleaner";
import { Startup } from "./components/Startup";
import { ProcessManager } from "./components/ProcessManager";
import { FolderAnalysis } from "./components/FolderAnalysis";
import { ScanResult, StartupItem, FolderAnalysisResult } from "./types";


function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [scanning, setScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [theme, setTheme] = useState("dark"); // Default dark for "pizarra fria"

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const [results, setResults] = useState<ScanResult[]>([]);
  const [apps, setApps] = useState<ScanResult[]>([]);
  const [brew, setBrew] = useState<ScanResult[]>([]);
  const [devItems, setDevItems] = useState<ScanResult[]>([]);
  const [devToolsPath, setDevToolsPath] = useState<string>(
    localStorage.getItem("devToolsPath") || ""
  );
  const [startupItems, setStartupItems] = useState<StartupItem[]>([]);
  const [privacyItems, setPrivacyItems] = useState<ScanResult[]>([]);
  const [systemItems, setSystemItems] = useState<ScanResult[]>([]); // System Cleaner State

  // Persistent state for interactive tools
  const [isScanningDevTools, setIsScanningDevTools] = useState(false);
  const [folderAnalysisHistory, setFolderAnalysisHistory] = useState<string[]>([]);
  const [folderAnalysisData, setFolderAnalysisData] = useState<FolderAnalysisResult | null>(null);

  const handleScan = async () => {
    setScanning(true);
    setHasScanned(true);
    try {
      // Parallel scan
      const [systemData, files, appsData, brewData, devData, startupData, privacyData] = await Promise.all([
        window.electron.scanSystem().catch(e => { console.error("System scan error:", e); return []; }),
        window.electron.startScan("").catch(e => { console.error("Files scan error:", e); return []; }),
        window.electron.scanApps().catch(e => { console.error("Apps scan error:", e); return []; }),
        window.electron.scanBrew().catch(e => { console.error("Brew scan error:", e); return []; }),
        window.electron.scanDevTools(devToolsPath).catch(e => { console.error("Dev scan error:", e); return []; }),
        window.electron.scanStartupItems().catch(e => { console.error("Startup scan error:", e); return []; }),
        window.electron.scanPrivacy().catch(e => { console.error("Privacy scan error:", e); return []; }),
      ]);

      // Remove duplicate scan from here to not entorpecer el disco

      setSystemItems(systemData || []);
      setResults(files || []);
      setApps(appsData || []);
      setBrew(brewData || []);
      setDevItems(devData || []);
      setStartupItems(startupData || []);
      setPrivacyItems(privacyData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setScanning(false);
    }
  };

  const { t } = useTranslation();

  const handleDelete = async (path: string) => {
    if (confirm(t('common.moveToTrashConfirm', 'Move item to Trash?'))) {
      const success = await window.electron.moveToTrash(path);
      if (success) {
        setResults((prev) => prev.filter((p) => p.path !== path));
      }
    }
  };

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard scanning={scanning} hasScanned={hasScanned} results={results} apps={apps} brew={brew} devItems={devItems} onScan={handleScan} />;
      case "cleanup":
        return <SystemCleaner data={systemItems} setData={setSystemItems} />;
      case "large-files":
        return <LargeFiles results={results} onDelete={handleDelete} />;
      case "folder-analysis":
        return <FolderAnalysis data={folderAnalysisData} setData={setFolderAnalysisData} pathHistory={folderAnalysisHistory} setPathHistory={setFolderAnalysisHistory} />;
      case "apps":
        return <Applications data={apps} setData={setApps} hasScanned={hasScanned} globalScanning={scanning} />;
      case "homebrew":
        return <Homebrew data={brew} setData={setBrew} hasScanned={hasScanned} globalScanning={scanning} />;
      case "devtools":
        return <DevCleaner 
          data={devItems} 
          setData={setDevItems} 
          currentPath={devToolsPath}
          isScanning={scanning || isScanningDevTools}
          onPathChange={(newPath) => {
            setDevToolsPath(newPath);
            localStorage.setItem("devToolsPath", newPath);
            setIsScanningDevTools(true);
            window.electron.scanDevTools(newPath).then(data => {
              setDevItems(data || []);
              setIsScanningDevTools(false);
            }).catch(e => {
              console.error(e);
              setIsScanningDevTools(false);
            });
          }}
        />;
      case "startup":
        return <Startup items={startupItems} setItems={setStartupItems} hasScanned={hasScanned} globalScanning={scanning} />;
      case "privacy":
        return <Privacy data={privacyItems} setData={setPrivacyItems} />;
      case "processes":
        return <ProcessManager />;
      case "settings":
        return <Settings onRescan={handleScan} theme={theme} setTheme={setTheme} />;
      default:
        return <Dashboard scanning={scanning} hasScanned={hasScanned} results={results} apps={apps} brew={brew} devItems={devItems} onScan={handleScan} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <main className="main-content">
        <div className="draggable" data-tauri-drag-region style={{ height: "40px", width: "100%", position: "absolute", top: 0, left: 0 }} />
        {renderView()}
      </main>
    </div>
  );
}

export default App;
