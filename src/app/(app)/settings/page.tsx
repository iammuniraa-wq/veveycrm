"use client";

import { useState } from "react";
import { useSettings, ACCENT_PRESETS } from "@/lib/settings";
import type { AccentPreset } from "@/lib/settings";
import { NAV } from "@/lib/constants";
import { c } from "@/lib/theme";
import { cardStyle } from "@/components/Shell";

// ── Helpers ───────────────────────────────────────────────────────────────────

const PILLAR_DOT: Record<string, string> = {
  blue:   "#378ADD",
  purple: "#7f77dd",
  teal:   "#1d9e75",
  amber:  "#f6b23c",
  red:    "#e05252",
  green:  "#639922",
};

// ── Toggle switch ─────────────────────────────────────────────────────────────

function Toggle({
  on, onChange, accent,
}: {
  on: boolean; onChange: (v: boolean) => void; accent: string;
}) {
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
        position: "absolute", top: 3,
        left: on ? 21 : 3,
        width: 16, height: 16, borderRadius: "50%",
        background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,.25)",
        transition: "left 0.15s",
        display: "block",
      }} />
    </button>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────

function Section({
  title, description, children,
}: {
  title: string; description?: string; children: React.ReactNode;
}) {
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
  const { settings, update, reset } = useSettings();
  const accent = ACCENT_PRESETS[settings.accentPreset].color;

  // Local state for workspace name input (commit on save).
  const [wsName, setWsName] = useState(settings.workspaceName);
  const wsNameDirty = wsName !== settings.workspaceName;

  // All nav items flat.
  const allNavItems = NAV.flatMap((grp) =>
    grp.items.map((item) => ({ ...item, group: grp.group }))
  );

  const toggleNavItem = (href: string) => {
    const hidden = settings.hiddenNavHrefs;
    update({
      hiddenNavHrefs: hidden.includes(href)
        ? hidden.filter((h) => h !== href)
        : [...hidden, href],
    });
  };

  const isVisible = (href: string) => !settings.hiddenNavHrefs.includes(href);

  return (
    <div style={{ maxWidth: 640 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{
          fontSize: 19, margin: 0, fontWeight: 600,
          paddingLeft: 12,
          borderLeft: `3px solid ${accent}`,
        }}>
          Settings
        </h1>
        <p style={{ margin: "4px 0 0 12px", fontSize: 12, color: c.muted }}>
          Admin · workspace preferences
        </p>
      </div>

      {/* ── 1. Navigation visibility ── */}
      <Section
        title="Navigation visibility"
        description="Hide items you don't use from the sidebar. Hidden items are still reachable by URL."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {allNavItems.map((item, idx) => {
            const visible = isVisible(item.href);
            return (
              <div
                key={item.href}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 4px",
                  borderTop: idx > 0 ? `1px solid ${c.line}` : "none",
                  opacity: visible ? 1 : 0.45,
                  transition: "opacity 0.15s",
                }}
              >
                {/* Pillar dot */}
                <span style={{
                  width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                  background: PILLAR_DOT[item.pillar] ?? "#378ADD",
                }} />
                {/* Icon */}
                <span style={{ fontSize: 16, width: 20, textAlign: "center", flexShrink: 0 }}>
                  {item.icon}
                </span>
                {/* Label + group */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: c.hint }}>{item.group}</div>
                </div>
                {/* Toggle */}
                <Toggle on={visible} onChange={() => toggleNavItem(item.href)} accent={accent} />
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── 2. Appearance ── */}
      <Section title="Appearance">

        {/* Accent colour */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: c.muted, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Accent colour
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {(Object.entries(ACCENT_PRESETS) as [AccentPreset, typeof ACCENT_PRESETS[AccentPreset]][]).map(
              ([key, preset]) => {
                const selected = settings.accentPreset === key;
                return (
                  <button
                    key={key}
                    onClick={() => update({ accentPreset: key })}
                    title={preset.label}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "8px 14px", borderRadius: 8, cursor: "pointer",
                      border: selected
                        ? `2px solid ${preset.color}`
                        : `2px solid ${c.line}`,
                      background: selected ? preset.colorBg : "#fff",
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{
                      width: 14, height: 14, borderRadius: "50%",
                      background: preset.color, flexShrink: 0,
                      boxShadow: selected ? `0 0 0 2px ${preset.color}44` : "none",
                    }} />
                    <span style={{
                      fontSize: 12.5, fontWeight: selected ? 600 : 400,
                      color: selected ? preset.color : c.muted,
                    }}>
                      {preset.label}
                    </span>
                    {selected && (
                      <span style={{ fontSize: 12, color: preset.color }}>✓</span>
                    )}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Compact sidebar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 14, borderTop: `1px solid ${c.line}`,
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>Compact sidebar</div>
            <div style={{ fontSize: 12, color: c.muted, marginTop: 2 }}>
              Reduce padding between navigation items
            </div>
          </div>
          <Toggle
            on={settings.compactSidebar}
            onChange={(v) => update({ compactSidebar: v })}
            accent={accent}
          />
        </div>
      </Section>

      {/* ── 3. Workspace ── */}
      <Section title="Workspace" description="Displayed in the sidebar header and page titles.">
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={wsName}
            onChange={(e) => setWsName(e.target.value)}
            placeholder="Workspace name"
            style={{
              flex: 1, padding: "8px 12px", borderRadius: 8,
              border: `1px solid ${wsNameDirty ? accent : c.line}`,
              fontSize: 13, color: c.ink,
              outline: "none",
              transition: "border-color 0.15s",
            }}
          />
          <button
            onClick={() => update({ workspaceName: wsName.trim() || settings.workspaceName })}
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

      {/* ── 4. Reset / danger zone ── */}
      <Section title="Reset">
        <p style={{ margin: "0 0 14px", fontSize: 12.5, color: c.muted, lineHeight: 1.5 }}>
          Restore all settings to factory defaults — accent colour, nav visibility, compact mode,
          and workspace name. Your data is not affected.
        </p>
        <button
          onClick={() => {
            if (window.confirm("Reset all settings to defaults?")) reset();
          }}
          style={{
            padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500,
            background: "#fcebeb", color: "#791f1f",
            border: "1px solid #f5c5c5",
            cursor: "pointer",
          }}
        >
          Reset all settings to defaults
        </button>
      </Section>

      {/* ── About ── */}
      <div style={{ padding: "12px 4px", fontSize: 11.5, color: c.hint, lineHeight: 1.8 }}>
        VeveyCRM · v0.1 · Vikas Pioneers India Pvt Ltd<br />
        Built on Next.js 16 + Supabase · Seed data mode (live DB not yet connected)
      </div>
    </div>
  );
}
