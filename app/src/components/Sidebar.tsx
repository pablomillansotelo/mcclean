import { LayoutDashboard, HardDrive, Trash2, Settings, AppWindow, Coffee, Code2, Zap, Shield, Grid, Files, Moon, Sun } from "lucide-react";
import "./Sidebar.css";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SystemStats } from "../types";

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  theme: string;
  setTheme: (t: string) => void;
}

export function Sidebar({ activeView, onNavigate, theme, setTheme }: SidebarProps) {
  const { t } = useTranslation();
  
  const navGroups = [
    {
      title: t('sidebar.general'),
      items: [
        { id: "dashboard", label: t('sidebar.overview'), icon: LayoutDashboard },
        { id: "settings", label: t('sidebar.settings'), icon: Settings },
      ]
    },
    {
      title: t('sidebar.cleaning'),
      items: [
        { id: "cleanup", label: t('sidebar.cleanup'), icon: Trash2 },
        { id: "large-files", label: t('sidebar.largeFiles'), icon: HardDrive },
        { id: "duplicates", label: t('sidebar.duplicates'), icon: Files },
        { id: "spacelens", label: t('sidebar.spaceLens'), icon: Grid },
      ]
    },
    {
      title: t('sidebar.appsAndPrivacy'),
      items: [
        { id: "apps", label: t('sidebar.applications'), icon: AppWindow },
        { id: "homebrew", label: t('sidebar.homebrew'), icon: Coffee },
        { id: "devtools", label: t('sidebar.devtools'), icon: Code2 },
        { id: "startup", label: t('sidebar.startup'), icon: Zap },
        { id: "privacy", label: t('sidebar.privacy'), icon: Shield },
      ]
    }
  ];

  const [stats, setStats] = useState<SystemStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await window.electron.getSystemStats();
      setStats(data);
    };
    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sidebar">
      <div className="draggable" style={{ height: "24px", position: "absolute", top: 0, width: "100%" }} />

      <nav>
        {navGroups.map((group, idx) => (
          <div key={idx} className="nav-group">
            <div className="nav-group-title">{group.title}</div>
            {group.items.map((item) => (
              <div key={item.id} className={`nav-item ${activeView === item.id ? "active" : ""}`} onClick={() => onNavigate(item.id)}>
                <item.icon className="nav-icon" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        ))}
      </nav>

      <div className="spacer" />

      {stats && (
        <div style={{ padding: "15px", fontSize: "11px", color: "rgba(255,255,255,0.6)", background: "rgba(0,0,0,0.2)", margin: "10px", borderRadius: "10px" }}>
          <div style={{ marginBottom: "5px", display: "flex", justifyContent: "space-between" }}>
            <span>CPU Load</span>
            <span>{stats.cpu.load.toFixed(2)}</span>
          </div>
          <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ width: `${Math.min(stats.cpu.load * 10, 100)}%`, height: "100%", background: "#10b981" }} />
          </div>

          <div style={{ marginTop: "10px", marginBottom: "5px", display: "flex", justifyContent: "space-between" }}>
            <span>Memory</span>
            <span>{((stats.memory.used / stats.memory.total) * 100).toFixed(0)}%</span>
          </div>
          <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ width: `${(stats.memory.used / stats.memory.total) * 100}%`, height: "100%", background: "#3b82f6" }} />
          </div>

          <div style={{ marginTop: "10px", marginBottom: "5px", display: "flex", justifyContent: "space-between" }}>
            <span>Disk Space</span>
            <span>{((1 - stats.disk.free / stats.disk.total) * 100).toFixed(0)}% used</span>
          </div>
          <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ width: `${(1 - stats.disk.free / stats.disk.total) * 100}%`, height: "100%", background: "#c026d3" }} />
          </div>
          
          <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.4)" }}>
            <span>Uptime</span>
            <span>{Math.floor(stats.uptime / 3600)}h {Math.floor((stats.uptime % 3600) / 60)}m</span>
          </div>
        </div>
      )}

      <div className="sidebar-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="status-indicator">
          <div className="dot" />
          <span>System Healthy</span>
        </div>
        <button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: '5px' }}
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </div>
  );
}
