import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ProcessInfo } from "../types";
import { Activity, XCircle } from "lucide-react";

export function ProcessManager() {
  const { t } = useTranslation();
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [killing, setKilling] = useState<number | null>(null);

  const fetchProcesses = async () => {
    const data = await window.electron.getProcesses();
    setProcesses(data);
  };

  useEffect(() => {
    fetchProcesses();
    const interval = setInterval(fetchProcesses, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleKill = async (pid: number, name: string) => {
    if (confirm(`¿Estás seguro de que deseas forzar el cierre de '${name}'?`)) {
      setKilling(pid);
      const success = await window.electron.killProcess(pid);
      if (success) {
        setProcesses(prev => prev.filter(p => p.pid !== pid));
      } else {
        alert(`No se pudo cerrar '${name}'. Es posible que no tengas permisos.`);
      }
      setKilling(null);
    }
  };

  return (
    <div className="content-view">
      <div className="view-header">
        <h2>{t('processManager.title', 'Monitor de Actividad')}</h2>
        <p className="text-sm text-white/50">{t('processManager.subtitle', 'Visualiza y gestiona el consumo de RAM y CPU en tiempo real')}</p>
      </div>

      <div className="file-list">
        {processes.slice(0, 100).map((proc) => (
          <div key={proc.pid} className="file-item">
            <div className="file-icon">
              <Activity size={20} color="#10b981" />
            </div>
            <div className="file-info" style={{ display: "flex", flex: 1, alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div className="file-name">{proc.name}</div>
                <div className="file-path">PID: {proc.pid}</div>
              </div>
              <div style={{ width: "120px", textAlign: "right" }}>
                <div style={{ fontWeight: 500, color: "#3b82f6" }}>
                  {(proc.memory / 1024 / 1024).toFixed(1)} MB
                </div>
                <div style={{ fontSize: "10px", opacity: 0.7, color: "#10b981" }}>
                  CPU: {proc.cpu.toFixed(1)}%
                </div>
              </div>
            </div>
            <button 
              className="action-btn" 
              style={{ marginLeft: "15px", padding: "6px 12px", background: "#ef4444", color: "white", borderRadius: "6px" }}
              onClick={() => handleKill(proc.pid, proc.name)}
              disabled={killing === proc.pid}
              title="Terminar Proceso"
            >
              {killing === proc.pid ? "..." : <XCircle size={16} />}
            </button>
          </div>
        ))}
        {processes.length === 0 && <div style={{ padding: "20px", textAlign: "center", opacity: 0.5 }}>Cargando procesos...</div>}
      </div>
    </div>
  );
}
