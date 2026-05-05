import React from "react";

function computeAngle(start, end) {
  if (!start || !end) return 135;
  const dx = (end.x || 0) - (start.x || 0);
  const dy = (end.y || 0) - (start.y || 0);
  return Math.round(Math.atan2(dy, dx) * (180 / Math.PI)) + 90;
}

export function LinearGradient({ colors: gradColors, start, end, style, children, locations, ...props }) {
  const angle = computeAngle(start, end);
  let gradient;
  if (locations && locations.length === gradColors.length) {
    const stops = gradColors.map((c, i) => `${c} ${Math.round(locations[i] * 100)}%`).join(", ");
    gradient = `linear-gradient(${angle}deg, ${stops})`;
  } else {
    gradient = `linear-gradient(${angle}deg, ${(gradColors || []).join(", ")})`;
  }
  const s = Array.isArray(style)
    ? Object.assign({}, ...style.filter(Boolean))
    : (style || {});
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        background: gradient,
        ...s,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
