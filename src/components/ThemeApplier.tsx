"use client";

import { useEffect } from "react";
import { loadSettings, ACCENT_PRESETS } from "@/lib/settings";

// Stamps CSS custom properties onto <html> so every page reacts to the
// chosen accent preset without requiring a full re-render of all pages.
export default function ThemeApplier() {
  useEffect(() => {
    const apply = () => {
      const s = loadSettings();
      const p = ACCENT_PRESETS[s.accentPreset];
      const root = document.documentElement;
      root.style.setProperty("--vevey-accent",    p.color);
      root.style.setProperty("--vevey-accent-bg", p.colorBg);
    };
    apply();
    window.addEventListener("vevey-settings-changed", apply);
    return () => window.removeEventListener("vevey-settings-changed", apply);
  }, []);

  return null;
}
