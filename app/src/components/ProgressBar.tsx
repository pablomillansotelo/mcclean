import React from "react";

interface ProgressBarProps {
  progress: number;
  label?: string;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label, color = "#007aff" }) => {
  return (
    <div style={{ width: "100%", marginBottom: "10px" }}>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "12px", opacity: 0.8 }}>
          <span>{label}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: color,
            transition: "width 0.3s ease-out",
          }}
        />
      </div>
    </div>
  );
};
