import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { LargeFiles } from "./components/LargeFiles";
import { Cleaner } from "./components/Cleaner";
import { Settings } from "./components/Settings";
import { Applications } from "./components/Applications";
import { Homebrew } from "./components/Homebrew";
import { DevCleaner } from "./components/DevCleaner";
import { Privacy } from "./components/Privacy";
import { SpaceLens } from "./components/SpaceLens";
import { SystemCleaner } from "./components/SystemCleaner";
import { Startup } from "./components/Startup";
import { DuplicateFinder } from "./components/DuplicateFinder";
import { ScanResult, StartupItem } from "./types";
import "./App.css";

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
  const [startupItems, setStartupItems] = useState<StartupItem[]>([]);
  const [privacyItems, setPrivacyItems] = useState<ScanResult[]>([]);
  const [systemItems, setSystemItems] = useState<ScanResult[]>([]); // System Cleaner State

  // Persistent state for interactive tools
  const [duplicateResults, setDuplicateResults] = useState<any[]>([]);
  const [spaceLensHistory, setSpaceLensHistory] = useState<string[]>([]);
  const [spaceLensData, setSpaceLensData] = useState<ScanResult[]>([]);

  const handleScan = async () => {
    setScanning(true);
    setHasScanned(true);
    try {
      // Parallel scan
      const [systemData, files, appsData, brewData, devData, startupData, privacyData] = await Promise.all([
        window.electron.scanSystem(),
        window.electron.startScan(""), // Empty string defaults to Home in backend
        window.electron.scanApps(),
        window.electron.scanBrew(),
        window.electron.scanDevTools(),
        window.electron.scanStartupItems(),
        window.electron.scanPrivacy(),
      ]);

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

  const handleDelete = async (path: string) => {
    if (confirm(`Move item to Trash?`)) {
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
      case "duplicates":
        return <DuplicateFinder results={duplicateResults} setResults={setDuplicateResults} />;
      case "apps":
        return <Applications data={apps} setData={setApps} />;
      case "homebrew":
        return <Homebrew data={brew} setData={setBrew} />;
      case "devtools":
        return <DevCleaner data={devItems} setData={setDevItems} />;
      case "spacelens":
        return <SpaceLens data={spaceLensData} setData={setSpaceLensData} pathHistory={spaceLensHistory} setPathHistory={setSpaceLensHistory} />;
      case "startup":
        return <Startup items={startupItems} />;
      case "privacy":
        return <Privacy data={privacyItems} setData={setPrivacyItems} />;
      case "settings":
        return <Settings onRescan={handleScan} theme={theme} setTheme={setTheme} />;
      default:
        return <Dashboard scanning={scanning} hasScanned={hasScanned} results={results} apps={apps} brew={brew} devItems={devItems} onScan={handleScan} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeView={activeView} onNavigate={setActiveView} theme={theme} setTheme={setTheme} />
      <main className="main-content">
        <div className="draggable" style={{ height: "40px", width: "100%", position: "absolute", top: 0, left: 0 }} />
        {renderView()}
      </main>
    </div>
  );
}

export default App;
