import { AlertTriangle, Calendar, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export function SmartAssistant() {
  const [trashSize, setTrashSize] = useState(0);
  const [daysSinceScan, setDaysSinceScan] = useState(0);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const checkStatus = async () => {
      // Check Trash
      const size = await window.electron.getTrashSize();
      setTrashSize(size);

      // Check Last Scan
      const lastScan = (await window.electron.getStoreValue("lastScanDate")) as string; // simple cast
      if (lastScan) {
        const diffTime = Math.abs(new Date().getTime() - new Date(lastScan).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysSinceScan(diffDays);
      } else {
        setDaysSinceScan(999); // Never scanned
      }
      setLoading(false);
    };

    checkStatus();
  }, []);

  if (loading) return null;

  const hasTrashWarning = trashSize > 1024 * 1024 * 1024; // 1GB
  const hasScanWarning = daysSinceScan > 7;

  if (!hasTrashWarning && !hasScanWarning) return null;

  return (
    <div
      style={{
        marginTop: "20px",
        background: "rgba(251, 191, 36, 0.1)",
        border: "1px solid rgba(251, 191, 36, 0.3)",
        borderRadius: "8px",
        padding: "15px",
      }}
    >
      <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "#fbbf24", marginBottom: "10px" }}>
        <AlertTriangle size={18} />
        {t('smartAssistant.title')}
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {hasTrashWarning && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
            <Trash size={16} color="#ef4444" />
            <span>{t('smartAssistant.trashWarning', { size: (trashSize / 1024 / 1024 / 1024).toFixed(1) })}</span>
          </div>
        )}
        {hasScanWarning && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
            <Calendar size={16} color="#eab308" />
            <span>{daysSinceScan === 999 ? t('smartAssistant.neverScanned') : t('smartAssistant.scanWarning', { days: daysSinceScan })}</span>
          </div>
        )}
      </div>
    </div>
  );
}
