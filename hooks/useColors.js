import { useState, useEffect } from "react";
import colors from "@/constants/colors.js";

export function useColors() {
  const [scheme, setScheme] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setScheme(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const palette = scheme === "dark" && "dark" in colors ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius };
}
