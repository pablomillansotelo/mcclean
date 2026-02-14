import { LayoutDashboard, HardDrive, Trash2, Settings, AppWindow, Coffee, Code2, Zap, Shield, Grid, Files } from "lucide-react";
import "./Sidebar.css";
import { useEffect, useState } from "react";
import { SystemStats } from "../types";

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const navItems = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "system-cleaner", label: "System Junk", icon: HardDrive },
    { id: "apps", label: "Applications", icon: AppWindow },
    { id: "homebrew", label: "Homebrew", icon: Coffee },
    { id: "devtools", label: "Developer", icon: Code2 },
    { id: "spacelens", label: "Space Lens", icon: Grid },
    { id: "startup", label: "Startup", icon: Zap },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "large-files", label: "Large Files", icon: HardDrive },
    { id: "duplicates", label: "Duplicates", icon: Files },
    { id: "cleaner", label: "Cleaner", icon: Trash2 },
    { id: "settings", label: "Settings", icon: Settings },
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
      <div className="draggable" style={{ height: "30px", position: "absolute", top: 0, width: "100%" }} />
      <div className="sidebar-title">mcclean</div>

      <nav>
        {navItems.map((item) => (
          <div key={item.id} className={`nav-item ${activeView === item.id ? "active" : ""}`} onClick={() => onNavigate(item.id)}>
            <item.icon className="nav-icon" />
            <span>{item.label}</span>
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
        </div>
      )}

      <div className="sidebar-footer">
        <div className="status-indicator">
          <div className="dot" />
          <span>System Healthy</span>
        </div>
      </div>
    </div>
  );
}
