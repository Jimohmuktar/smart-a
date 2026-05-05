import React from "react";
import { useColors } from "@/hooks/useColors.js";

export function ProgressBar({ progress, height = 8, color, style, animated = true }) {
  const colors = useColors();
  const pct = Math.min(Math.max(progress || 0, 0), 1) * 100;
  const s = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : (style || {});
  return (
    <div
      style={{
        height,
        borderRadius: height / 2,
        backgroundColor: colors.muted,
        overflow: "visible",
        boxSizing: "border-box",
        ...s,
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          backgroundColor: color || colors.primary,
          borderRadius: height / 2,
          transition: animated ? "width 0.6s ease" : "none",
        }}
      />
    </div>
  );
}
