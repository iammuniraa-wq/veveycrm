"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSettings, ACCENT_PRESETS } from "@/lib/settings";
import type { AccentPreset } from "@/lib/settings";
import { NAV, ROUTES } from "@/lib/constants";
import { c } from "@/lib/theme";
import { cardStyle } from "@/components/Shell";

const PILLAR_DOT: Record<string, string> = {
  blue: "#378ADD", purple: "#7f77dd", teal: "#1d9e75",
  amber: "#f6b23c", red: "#e05252", green: "#639922",
};

// ── Saved toast ───────────────────────────────────────────────────────────────

function useSavedFlash(): [boolean, () => void] {
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flash = useCallback(() => {
    setSaved(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaved(false), 1800);
  }, []);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return [saved, flash];
}

// ── Toggle switch ─────────────────────────────────────────────────────────────

function Toggle({ on, onChange, accent }: { on: boolean; onChange: (v: boolean) => void; accent: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        width: 40, height: 22, borderRadius: 11,
        background: on ? accent : "#d1d9e0",
        border: "none", cursor: "pointer", position: "relative",
        transition: "background 0.15s", flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute", top: 3, left: on ? 21 : 3,
        width: 16, height: 16, borderRadius: "50%", background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,.25)", transition: "left 0.15s", display: "block",
      }} />
    </button>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section style={{ ...cardStyle, marginBottom: 14 }}>
      <div style={{ marginBottom: description ? 4 : 14 }}>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: c.ink }}>{title}</h2>
        {description && (
          <p style={{ margin: "4px 0 14px", fontSize: 12, color: c.muted, lineHeight: 1.5 }}>
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter();
  const { settings, update, reset } = useSettings();
  const accent = ACCENT_PRESETS[settings.accentPreset].color;
  const [saved, flashSaved] = useSavedFlash();

  const [wsName, setWsName] = useState(settings.workspaceName);
  const wsNameDirty = wsName !== settings.workspaceName;

  const allNavItems = NAV.flatMap((grp) => grp.items.map((item) => ({ ...item, group: grp.group })));
  const isVisible = (href: string) => !settings.hiddenNavHrefs.includes(href);

  const patch = (vals: Parameters<typeof update>[0]) => { update(vals); flashSaved(); };

  const toggleNavItem = (href: string) => {
    const hidden = settings.hiddenNavHrefs;
    patch({
      hiddenNavHrefs: hidden.includes(href)
        ? hidden.filter((h) => h !== href)
        : [...hidden, href],
    });
  };

  return (
    <div style={{ maxWidth: 640 }}>

      {/* ── Header row ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 19, margin: 0, fontWeight: 600, paddingLeft: 12, borderLeft: `3px solid ${accent}` }}>
            Settings
          </h1>
          <p style={{ margin: "4px 0 0 12px", fontSize: 12, color: c.muted }}>
            Admin · workspace preferences
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Auto-saved flash */}
          <span style={{
            fontSize: 12, color: "#1d9e75", fontWeight: 500,
            opacity: saved ? 1 : 0, transition: "opacity 0.3s",
          }}>
            ✓ Saved
          </span>

          {/* Done / back button */}
          <button
            onClick={() => router.push(ROUTES.dashboard)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
              background: accent, color: "#fff", border: "none", cursor: "pointer",
            }}
          >
            ← Done
          </button>
        </div>
      </div>

      {/* ── 1. Navigation visibility ── */}
      <Section
        title="Navigation visibility"
        description="Toggle items on or off. Changes apply to the sidebar instantly — hidden items are still reachable by URL."
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {allNavItems.map((item, idx) => {
            const visible = isVisible(item.href);
            return (
              <div
                key={item.href}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 4px",
                  borderTop: idx > 0 ? `1px solid ${c.line}` : "none",
                  opacity: visible ? 1 : 0.4,
                  transition: "opacity 0.15s",
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: PILLAR_DOT[item.pillar] ?? "#378ADD" }} />
                <span style={{ fontSize: 16, width: 20, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: c.hint }}>{item.group}</div>
                </div>
                <Toggle on={visible} onChange={() => toggleNavItem(item.href)} accent={accent} />
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── 2. Appearance ── */}
      <Section title="Appearance">
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: c.muted, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Accent colour
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {(Object.entries(ACCENT_PRESETS) as [AccentPreset, typeof ACCENT_PRESETS[AccentPreset]][]).map(([key, preset]) => {
              const selected = settings.accentPreset === key;
              return (
                <button
                  key={key}
                  onClick={() => patch({ accentPreset: key })}
                  title={preset.label}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 14px", borderRadius: 8, cursor: "pointer",
                    border: selected ? `2px solid ${preset.color}` : `2px solid ${c.line}`,
                    background: selected ? preset.colorBg : "#fff",
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{
                    width: 14, height: 14, borderRadius: "50%", background: preset.color, flexShrink: 0,
                    boxShadow: selected ? `0 0 0 2px ${preset.color}44` : "none",
                  }} />
                  <span style={{ fontSize: 12.5, fontWeight: selected ? 600 : 400, color: selected ? preset.color : c.muted }}>
                    {preset.label}
                  </span>
                  {selected && <span style={{ fontSize: 12, color: preset.color }}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: `1px solid ${c.line}` }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>Compact sidebar</div>
            <div style={{ fontSize: 12, color: c.muted, marginTop: 2 }}>Reduce padding between navigation items</div>
          </div>
          <Toggle on={settings.compactSidebar} onChange={(v) => patch({ compactSidebar: v })} accent={accent} />
        </div>
      </Section>

      {/* ── 3. Workspace ── */}
      <Section title="Workspace" description="Displayed in the sidebar header.">
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={wsName}
            onChange={(e) => setWsName(e.target.value)}
            placeholder="Workspace name"
            style={{
              flex: 1, padding: "8px 12px", borderRadius: 8,
              border: `1px solid ${wsNameDirty ? accent : c.line}`,
              fontSize: 13, color: c.ink, outline: "none",
              transition: "border-color 0.15s",
            }}
          />
          <button
            onClick={() => {
              update({ workspaceName: wsName.trim() || settings.workspaceName });
              flashSaved();
            }}
            disabled={!wsNameDirty}
            style={{
              padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500,
              border: "none", cursor: wsNameDirty ? "pointer" : "default",
              background: wsNameDirty ? accent : c.line,
              color: wsNameDirty ? "#fff" : c.hint,
              transition: "all 0.15s",
            }}
          >
            Save
          </button>
        </div>
      </Section>

      {/* ── 4. Reset ── */}
      <Section title="Reset">
        <p style={{ margin: "0 0 14px", fontSize: 12.5, color: c.muted, lineHeight: 1.5 }}>
          Restore accent colour, nav visibility, compact mode, and workspace name to defaults. Your data is not affected.
        </p>
        <button
          onClick={() => { if (window.confirm("Reset all settings to defaults?")) { reset(); flashSaved(); } }}
          style={{
            padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500,
            background: "#fcebeb", color: "#791f1f",
            border: "1px solid #f5c5c5", cursor: "pointer",
          }}
        >
          Reset all settings to defaults
        </button>
      </Section>

      <div style={{ padding: "12px 4px", fontSize: 11.5, color: c.hint, lineHeight: 1.8 }}>
        VeveyCRM · v0.1 · Vikas Pioneers India Pvt Ltd<br />
        Seed data mode · live DB not yet connected
      </div>
    </div>
  );
}
