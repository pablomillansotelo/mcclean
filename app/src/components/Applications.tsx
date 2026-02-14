import { Trash2, Package } from "lucide-react";
import { ScanResult } from "../types";

interface ApplicationsProps {
  data: ScanResult[];
  setData: React.Dispatch<React.SetStateAction<ScanResult[]>>;
}

export function Applications({ data: apps, setData: setApps }: ApplicationsProps) {
  // const [loading, setLoading] = useState(false); // Managed by parent scan

  const handleUninstall = async (appPath: string) => {
    // 1. Check for associated files
    const appName = appPath.split("/").pop()?.replace(".app", "") || "";
    let message = `Are you sure you want to move "${appPath}" to Trash?`;

    // We can run this check optimistically
    const associated = appName ? await window.electron.findAssociatedFiles(appName) : [];

    if (associated.length > 0) {
      message += `\n\nFound ${associated.length} associated files (plist, caches) that can also be deleted.`;
    }

    if (confirm(message)) {
      const success = await window.electron.moveToTrash(appPath);

      // Delete associated too if confirmed (for MVP we assume 'Yes' deletes all, or we could add a second prompt)
      // Let's add a second prompt for safety in this MVP to keep it simple but safe
      if (success && associated.length > 0) {
        if (confirm(`Do you want to delete the ${associated.length} associated files found?\n\n${associated.slice(0, 5).join("\n")}...`)) {
          for (const file of associated) {
            await window.electron.moveToTrash(file);
          }
        }
      }

      if (success) {
        setApps((prev) => prev.filter((a) => a.path !== appPath));
      }
    }
  };

  // if (loading) return <div className="p-8 text-center text-white/60">Scanning applications...</div>;

  return (
    <div className="view-container">
      <div className="view-header">
        <h2>Applications ({apps.length})</h2>
        <p className="text-sm text-white/50">Manage installed applications</p>
      </div>

      <div className="file-list">
        {apps.map((app, i) => (
          <div key={i} className="file-item">
            <div className="file-icon">
              <Package size={20} />
            </div>
            <div className="file-info">
              <div className="file-name">{app.name}</div>
              <div className="file-path">{app.path}</div>
            </div>
            <div className="file-size">{(app.size / 1024 / 1024).toFixed(2)} MB</div>
            <button className="action-btn delete-btn" onClick={() => handleUninstall(app.path)} title="Move to Trash">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
