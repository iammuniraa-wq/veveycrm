"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { NAV, WORKSPACE_NAME } from "@/lib/constants";
import type { NavItem } from "@/lib/constants";
import { c, g } from "@/lib/theme";
import Logo from "./Logo";

// ── Storage ───────────────────────────────────────────────────────────────────

const NAV_STATE_KEY = "vevey_nav_state_v2";

type NavState = {
  favs: string[]; // hrefs in favourite order
  rest: string[]; // remaining hrefs in their order
};

type FlatItem = NavItem & { group: string };

const PILLAR_COLOR: Record<string, string> = {
  blue:   "#378ADD",
  purple: "#7f77dd",
  teal:   "#1d9e75",
  amber:  "#f6b23c",
  red:    "#e05252",
  green:  "#639922",
};

function flattenNav(): FlatItem[] {
  return NAV.flatMap((grp) => grp.items.map((item) => ({ ...item, group: grp.group })));
}

function defaultState(): NavState {
  return { favs: [], rest: flattenNav().map((i) => i.href) };
}

function loadState(): NavState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(NAV_STATE_KEY);
    if (!raw) return defaultState();
    const saved: NavState = JSON.parse(raw);
    const all = flattenNav();
    const allHrefs = all.map((i) => i.href);
    const validFavs = saved.favs.filter((h) => allHrefs.includes(h));
    const validRest = saved.rest.filter((h) => allHrefs.includes(h));
    // Append any new items (added after last save) to rest.
    const known = new Set([...validFavs, ...validRest]);
    const fresh = allHrefs.filter((h) => !known.has(h));
    return { favs: validFavs, rest: [...validRest, ...fresh] };
  } catch {
    return defaultState();
  }
}

function saveState(s: NavState) {
  try { localStorage.setItem(NAV_STATE_KEY, JSON.stringify(s)); } catch {}
}

// ── Drop indicator ────────────────────────────────────────────────────────────

function DropLine() {
  return (
    <div style={{
      height: 2, background: "#378ADD", borderRadius: 2,
      margin: "2px 6px", boxShadow: "0 0 8px #378ADD88",
    }} />
  );
}

// ── Draggable section ─────────────────────────────────────────────────────────

type SectionProps = {
  items: FlatItem[];
  isFavSection: boolean;
  isActive: (href: string) => boolean;
  onToggleFav: (href: string) => void;
  onReorder: (reordered: FlatItem[]) => void;
  onNavigate?: () => void;
};

function DraggableSection({ items, isFavSection, isActive, onToggleFav, onReorder, onNavigate }: SectionProps) {
  const [dropAt, setDropAt]   = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const dragIdx = useRef<number | null>(null);

  const onDragStart = (e: React.DragEvent, idx: number) => {
    dragIdx.current = idx;
    // Suppress the browser ghost so we can style via opacity instead.
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    e.dataTransfer.setDragImage(canvas, 0, 0);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>, idx: number) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setDropAt(e.clientY < rect.top + rect.height / 2 ? idx : idx + 1);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const from = dragIdx.current;
    const to   = dropAt;
    dragIdx.current = null;
    if (from === null || to === null || from === to || from + 1 === to) {
      setDropAt(null);
      return;
    }
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(from < to ? to - 1 : to, 0, moved);
    onReorder(next);
    setDropAt(null);
  };

  const onDragEnd = () => { dragIdx.current = null; setDropAt(null); };

  if (items.length === 0) {
    if (isFavSection) {
      return (
        <div style={{ padding: "6px 10px 8px", fontSize: 11, color: "#3a5166", fontStyle: "italic" }}>
          Hover an item below and click ☆ to pin it here
        </div>
      );
    }
    return null;
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      {items.map((item, idx) => {
        const on          = isActive(item.href);
        const isDragging  = dragIdx.current === idx;
        const dotColor    = PILLAR_COLOR[item.pillar] ?? "#378ADD";
        const showHover   = hovered === idx;

        return (
          <div
            key={item.href}
            draggable
            onDragStart={(e) => onDragStart(e, idx)}
            onDragOver={(e) => onDragOver(e, idx)}
            onDragEnd={onDragEnd}
            onMouseEnter={() => setHovered(idx)}
            onMouseLeave={() => setHovered(null)}
          >
            {dropAt === idx && <DropLine />}

            <Link
              href={item.href}
              onClick={onNavigate}
              style={{
                display:       "flex",
                alignItems:    "center",
                gap:           9,
                padding:       "8px 10px",
                borderRadius:  8,
                fontSize:      13,
                marginBottom:  1,
                color:         on ? "#fff" : "#aebccd",
                background:    on ? c.accent : "transparent",
                opacity:       isDragging ? 0.35 : 1,
                textDecoration: "none",
                userSelect:    "none",
                transition:    "background 0.12s",
                cursor:        "default",
              }}
            >
              {/* Pillar dot */}
              <span style={{
                width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
                background: on ? "rgba(255,255,255,.6)" : dotColor,
              }} />

              {/* Icon */}
              <span style={{ width: 16, textAlign: "center", fontSize: 14, flexShrink: 0 }}>
                {item.icon}
              </span>

              {/* Label */}
              <span style={{ flex: 1 }}>{item.label}</span>

              {/* Badge */}
              {item.badge != null && (
                <span style={{
                  fontSize: 10, background: "rgba(255,255,255,.13)", color: "#dce6f1",
                  borderRadius: 10, padding: "1px 7px", flexShrink: 0,
                }}>
                  {item.badge}
                </span>
              )}

              {/* Star — always visible (filled) for fav items; hollow on hover for rest items */}
              {(isFavSection || showHover) && (
                <span
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFav(item.href); }}
                  title={isFavSection ? "Remove from favourites" : "Add to favourites"}
                  style={{
                    fontSize: 13,
                    color: isFavSection ? "#f6b23c" : "rgba(255,255,255,.28)",
                    flexShrink: 0,
                    cursor: "pointer",
                    lineHeight: 1,
                  }}
                >
                  {isFavSection ? "★" : "☆"}
                </span>
              )}

              {/* Drag handle */}
              <span style={{
                fontSize: 14,
                color:    showHover ? "rgba(255,255,255,.3)" : "transparent",
                flexShrink: 0,
                cursor:   "grab",
                lineHeight: 1,
                transition: "color 0.1s",
              }}>
                ⠿
              </span>
            </Link>
          </div>
        );
      })}

      {/* Drop zone after last item */}
      {dropAt === items.length && <DropLine />}
    </div>
  );
}

// ── Main sidebar ──────────────────────────────────────────────────────────────

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  // Initialize with defaults (SSR-safe), hydrate from localStorage on mount.
  const [state, setState] = useState<NavState>(defaultState);

  useEffect(() => {
    setState(loadState());
  }, []);

  // Derive ordered FlatItem lists from the stored href arrays.
  const allItemsMap = new Map(flattenNav().map((i) => [i.href, i]));
  const favItems  = state.favs.map((h) => allItemsMap.get(h)).filter((i): i is FlatItem => !!i);
  const restItems = state.rest.map((h) => allItemsMap.get(h)).filter((i): i is FlatItem => !!i);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  const toggleFav = (href: string) => {
    const isFav = state.favs.includes(href);
    const next: NavState = isFav
      ? { favs: state.favs.filter((h) => h !== href), rest: [href, ...state.rest] }
      : { favs: [...state.favs, href],                rest: state.rest.filter((h) => h !== href) };
    setState(next);
    saveState(next);
  };

  const reorderFavs = (reordered: FlatItem[]) => {
    const next = { ...state, favs: reordered.map((i) => i.href) };
    setState(next);
    saveState(next);
  };

  const reorderRest = (reordered: FlatItem[]) => {
    const next = { ...state, rest: reordered.map((i) => i.href) };
    setState(next);
    saveState(next);
  };

  const resetToDefault = () => {
    const fresh = defaultState();
    setState(fresh);
    saveState(fresh);
  };

  const hasFavs = favItems.length > 0 || true; // always show favourites section so hint is visible

  return (
    <aside
      style={{
        width: 236,
        background: g.sidebar,
        flexShrink: 0,
        padding: "16px 12px",
        color: "#aebccd",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Logo / workspace header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 9,
        padding: "4px 6px 14px",
        borderBottom: "1px solid rgba(255,255,255,.08)",
        marginBottom: 12,
      }}>
        <Logo size={34} />
        <div>
          <div style={{ fontWeight: 600, color: "#fff", fontSize: 14 }}>
            Vevey<span style={{ color: "#7fb4ec" }}>CRM</span>
          </div>
          <div style={{ fontSize: 11, color: "#8aa0b8" }}>{WORKSPACE_NAME}</div>
        </div>
      </div>

      <nav style={{ flex: 1 }}>

        {/* ── Favourites section ── */}
        <div style={{
          fontSize: 9.5, letterSpacing: 1.1, fontWeight: 700,
          color: "#f6b23c", paddingLeft: 10, marginBottom: 3,
          display: "flex", alignItems: "center", gap: 5,
        }}>
          ★ FAVOURITES
        </div>

        <DraggableSection
          items={favItems}
          isFavSection={true}
          isActive={isActive}
          onToggleFav={toggleFav}
          onReorder={reorderFavs}
          onNavigate={onNavigate}
        />

        {/* ── Divider ── */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,.08)",
          margin: "10px 4px 10px",
        }} />

        {/* ── All items section ── */}
        <div style={{
          fontSize: 9.5, letterSpacing: 1.1, fontWeight: 600,
          color: "#3d5166", paddingLeft: 10, marginBottom: 3,
        }}>
          ALL · drag to reorder · ☆ to pin
        </div>

        <DraggableSection
          items={restItems}
          isFavSection={false}
          isActive={isActive}
          onToggleFav={toggleFav}
          onReorder={reorderRest}
          onNavigate={onNavigate}
        />
      </nav>

      {/* Reset */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,.05)", paddingTop: 10, marginTop: 4 }}>
        <button
          onClick={resetToDefault}
          style={{
            background: "transparent", border: "none",
            color: "#3d5166", fontSize: 11,
            cursor: "pointer", padding: "4px 8px",
            borderRadius: 5, width: "100%", textAlign: "left",
          }}
        >
          ↺ Reset nav & favourites
        </button>
      </div>
    </aside>
  );
}
