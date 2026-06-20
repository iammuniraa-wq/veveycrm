"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MOBILE_BREAKPOINT, NAV, ROUTES } from "@/lib/constants";
import { c, g, pillar } from "@/lib/theme";
import { useSettings, ACCENT_PRESETS } from "@/lib/settings";
import Logo from "./Logo";
import Sidebar from "./Sidebar";
import type { NavItem } from "@/lib/constants";

// ── Mobile icon rail ──────────────────────────────────────────────────────────

const RAIL_W = 52;

function MobileRail() {
  const pathname    = usePathname();
  const router      = useRouter();
  const { settings } = useSettings();
  const accent      = ACCENT_PRESETS[settings.accentPreset].color;

  const [tooltip, setTooltip] = useState<{ label: string; y: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allItems: NavItem[] = NAV.flatMap((g) => g.items);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  const handleTap = (item: NavItem, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (timerRef.current) clearTimeout(timerRef.current);
    setTooltip({ label: item.label, y: rect.top + rect.height / 2 });
    timerRef.current = setTimeout(() => setTooltip(null), 1300);
    router.push(item.href);
  };

  const handleSettingsTap = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (timerRef.current) clearTimeout(timerRef.current);
    setTooltip({ label: "Settings", y: rect.top + rect.height / 2 });
    timerRef.current = setTimeout(() => setTooltip(null), 1300);
    router.push(ROUTES.settings);
  };

  // Close tooltip on route change
  useEffect(() => { setTooltip(null); }, [pathname]);

  return (
    <aside style={{
      width: RAIL_W, flexShrink: 0,
      background: g.sidebar,
      position: "sticky", top: 0,
      height: "100vh", overflowY: "auto",
      display: "flex", flexDirection: "column",
      alignItems: "center",
      paddingTop: 10, paddingBottom: 10,
      boxSizing: "border-box",
      // hide scrollbar
      scrollbarWidth: "none",
      msOverflowStyle: "none" as React.CSSProperties["msOverflowStyle"],
      zIndex: 10,
    }}>
      {/* Logo mark */}
      <div style={{ marginBottom: 12, flexShrink: 0 }}>
        <Logo size={28} />
      </div>

      {/* Divider */}
      <div style={{ width: 28, height: 1, background: "rgba(255,255,255,.08)", marginBottom: 8, flexShrink: 0 }} />

      {/* Nav icons */}
      <div style={{
        flex: 1, width: "100%",
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 3,
        padding: "0 6px", boxSizing: "border-box",
        overflowY: "auto", scrollbarWidth: "none",
      }}>
        {allItems.map((item) => {
          const on = isActive(item.href);
          return (
            <button
              key={item.href}
              onClick={(e) => handleTap(item, e)}
              style={{
                width: 40, height: 40, borderRadius: 9, flexShrink: 0,
                border: "none", cursor: "pointer",
                background: on ? accent : "transparent",
                color: on ? "#fff" : "#6b8499",
                fontSize: 15,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative", transition: "background .12s, color .12s",
              }}
            >
              {item.icon}
              {item.badge != null && (
                <span style={{
                  position: "absolute", top: 5, right: 5,
                  width: 12, height: 12, borderRadius: "50%",
                  background: pillar.red.base, color: "#fff",
                  fontSize: 8, lineHeight: "12px", textAlign: "center",
                  fontWeight: 700, pointerEvents: "none",
                }}>
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div style={{ width: 28, height: 1, background: "rgba(255,255,255,.08)", margin: "6px 0", flexShrink: 0 }} />

      {/* Settings */}
      <button
        onClick={handleSettingsTap}
        style={{
          width: 40, height: 40, borderRadius: 9, flexShrink: 0,
          border: "none", cursor: "pointer",
          background: pathname.startsWith(ROUTES.settings) ? accent : "transparent",
          color: pathname.startsWith(ROUTES.settings) ? "#fff" : "#6b8499",
          fontSize: 15,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background .12s, color .12s",
        }}
      >
        ⚙
      </button>

      {/* Floating label tooltip — rendered outside rail via portal-like fixed div */}
      {tooltip && (
        <div style={{
          position: "fixed",
          left: RAIL_W + 8,
          top: tooltip.y,
          transform: "translateY(-50%)",
          background: "#1c2733",
          color: "#e2e7ee",
          padding: "5px 12px",
          borderRadius: 7,
          fontSize: 13,
          fontWeight: 600,
          boxShadow: "0 4px 18px rgba(0,0,0,.5)",
          zIndex: 9999,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          // tiny left arrow
          borderLeft: `3px solid ${accent}`,
        }}>
          {tooltip.label}
        </div>
      )}
    </aside>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────────

export default function Shell({ children }: { children: React.ReactNode }) {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const check = () => setMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {mobile ? <MobileRail /> : <Sidebar />}

      <main style={{
        flex: 1,
        padding: mobile ? 12 : "20px 24px",
        overflowX: "hidden",
        maxWidth: mobile ? `calc(100vw - ${RAIL_W}px)` : 1100,
      }}>
        {children}
      </main>
    </div>
  );
}

// Shared surface styles used across pages.
export const cardStyle: React.CSSProperties = {
  background: c.panel,
  border: `1px solid ${c.line}`,
  borderRadius: 12,
  padding: 16,
};
