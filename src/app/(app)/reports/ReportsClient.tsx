"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { c, pillar, type PillarKey } from "@/lib/theme";
import { cardStyle } from "@/components/Shell";
import Pill from "@/components/Pill";
import { ROUTES } from "@/lib/constants";
import { QUOTE_STATUS_LABEL } from "@/lib/data";
import type { QuoteSummary, AnalyticsData } from "@/lib/data";
import type { Quote } from "@/lib/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

const inr = (n: number) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const statusTone: Record<Quote["status"], PillarKey> = {
  draft: "blue", sent: "purple", approved: "teal", rejected: "red",
};

const CHART_COLORS = [
  pillar.blue.base, pillar.teal.base, pillar.purple.base, pillar.amber.base,
  pillar.green.base, pillar.red.base,
];

const td: React.CSSProperties = {
  padding: "10px 12px", borderBottom: `1px solid ${c.line}`,
  fontSize: 12.5, verticalAlign: "middle",
};
const th: React.CSSProperties = {
  ...td, color: c.hint, fontWeight: 500, background: c.panel2, whiteSpace: "nowrap",
};

// ── Chart Components ──────────────────────────────────────────────────────────

/** SVG Donut — stroke-dasharray segments starting at 12 o'clock */
function DonutChart({
  segments, size = 160, r = 54, sw = 22,
}: {
  segments: Array<{ label: string; value: number; color: string }>;
  size?: number; r?: number; sw?: number;
}) {
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (!total) return null;

  let cumDash = 0;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ display: "block" }}>
      <g transform={`rotate(-90 ${cx} ${cy})`}>
        {segments.map((seg, i) => {
          const dash   = (seg.value / total) * circ;
          const offset = circ - cumDash;
          cumDash += dash;
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={seg.color} strokeWidth={sw}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={offset}
            />
          );
        })}
      </g>
      <text x={cx} y={cy - 6}  textAnchor="middle" fontSize={22} fontWeight={700} fill={c.ink}>{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize={10} fill={c.hint}>total</text>
    </svg>
  );
}

/** SVG Area / line chart */
function AreaChart({
  points, color = pillar.blue.base,
}: {
  points: Array<{ label: string; value: number }>;
  color?: string;
}) {
  const W = 300, H = 100;
  const PAD = { t: 12, r: 12, b: 28, l: 52 };
  const iW = W - PAD.l - PAD.r;
  const iH = H - PAD.t - PAD.b;
  const maxVal = Math.max(...points.map((p) => p.value), 1);
  const gridTicks = [0, 0.25, 0.5, 0.75, 1];

  const toX = (i: number) =>
    PAD.l + (points.length < 2 ? iW / 2 : (i / (points.length - 1)) * iW);
  const toY = (v: number) => PAD.t + (1 - v / maxVal) * iH;

  const line = points.map((p, i) => `${toX(i)},${toY(p.value)}`).join(" ");
  const area = `${toX(0)},${H - PAD.b} ${line} ${toX(points.length - 1)},${H - PAD.b}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H + 4 }}>
      {gridTicks.map((f, i) => (
        <g key={i}>
          <line x1={PAD.l} y1={toY(maxVal * f)} x2={W - PAD.r} y2={toY(maxVal * f)}
            stroke={c.line} strokeWidth={0.6} />
          {f > 0 && (
            <text x={PAD.l - 4} y={toY(maxVal * f) + 4}
              textAnchor="end" fontSize={8.5} fill={c.hint}>
              {maxVal * f >= 1000
                ? `${Math.round(maxVal * f / 1000)}k`
                : String(Math.round(maxVal * f))}
            </text>
          )}
        </g>
      ))}
      <polygon points={area} fill={color + "22"} />
      <polyline points={line} fill="none" stroke={color} strokeWidth={2} />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={toX(i)} cy={toY(p.value)} r={4} fill={color} />
          <text x={toX(i)} y={H - PAD.b + 16}
            textAnchor="middle" fontSize={9} fill={c.hint}>{p.label}</text>
        </g>
      ))}
    </svg>
  );
}

/** CSS horizontal bar chart */
function HBarChart({
  rows, colorFn,
}: {
  rows: Array<{ label: string; value: number; sub?: string }>;
  colorFn?: (i: number) => string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {rows.map((row, i) => {
        const pct   = Math.max(4, (row.value / max) * 100);
        const color = colorFn ? colorFn(i) : CHART_COLORS[i % CHART_COLORS.length];
        return (
          <div key={row.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: c.ink }}>{row.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color }}>{row.sub ?? row.value}</span>
            </div>
            <div style={{ height: 8, background: c.line, borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                width: `${pct}%`, height: "100%", background: color,
                borderRadius: 4, transition: "width .3s",
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** CSS vertical bar chart */
function VBarChart({
  rows, colorFn,
}: {
  rows: Array<{ label: string; value: number }>;
  colorFn?: (i: number) => string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  const H = 90;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: H + 28 }}>
      {rows.map((row, i) => {
        const barH  = Math.max(6, (row.value / max) * H);
        const color = colorFn ? colorFn(i) : CHART_COLORS[i % CHART_COLORS.length];
        return (
          <div key={row.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color }}>{row.value}</span>
            <div style={{ width: "100%", height: barH, background: color, borderRadius: "4px 4px 0 0" }} />
            <span style={{ fontSize: 10, color: c.hint, textAlign: "center", lineHeight: 1.2 }}>{row.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/** CSS funnel chart */
function FunnelChart({ stages }: { stages: Array<{ stage: string; count: number }> }) {
  const max = stages[0]?.count || 1;
  const colors = [pillar.blue.base, pillar.purple.base, pillar.teal.base, pillar.green.base];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {stages.map((s, i) => {
        const pct = Math.max(25, Math.round((s.count / max) * 100));
        return (
          <div key={s.stage} style={{ display: "flex", justifyContent: "center" }}>
            <div style={{
              width: `${pct}%`, height: 34, borderRadius: 6,
              background: colors[i % colors.length],
              display: "flex", alignItems: "center",
              justifyContent: "space-between", padding: "0 12px", boxSizing: "border-box",
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{s.stage}</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{s.count}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** SVG semi-circle gauge (half-donut) */
function GaugeChart({
  value, max, color, label,
}: {
  value: number; max: number; color: string; label: string;
}) {
  const r = 56;
  const arcLen = Math.PI * r; // half-circle arc ≈ 175.9
  const pct = max > 0 ? value / max : 0;
  const activeDash = pct * arcLen;

  return (
    <svg viewBox="0 0 160 100" width={160} height={100} style={{ display: "block", margin: "0 auto" }}>
      <path d="M 16 90 A 56 56 0 0 1 144 90"
        fill="none" stroke={c.line} strokeWidth={14} strokeLinecap="round" />
      <path d="M 16 90 A 56 56 0 0 1 144 90"
        fill="none" stroke={color} strokeWidth={14} strokeLinecap="round"
        strokeDasharray={`${activeDash} ${arcLen}`} strokeDashoffset={0} />
      <text x={80} y={68} textAnchor="middle" fontSize={20} fontWeight={700} fill={c.ink}>{value}/{max}</text>
      <text x={80} y={84} textAnchor="middle" fontSize={9} fill={c.hint}>{label}</text>
    </svg>
  );
}

/** Chart card wrapper */
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ ...cardStyle }}>
      <div style={{
        fontSize: 12, fontWeight: 600, color: c.muted,
        letterSpacing: ".04em", textTransform: "uppercase", marginBottom: 16,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

/** Donut legend */
function DonutLegend({ items }: { items: Array<{ label: string; value: number; color: string }> }) {
  const total = items.reduce((s, x) => s + x.value, 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((item) => (
        <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: c.ink, flex: 1 }}>{item.label}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: c.ink }}>{item.value}</span>
          <span style={{ fontSize: 11, color: c.hint }}>
            {total > 0 ? `${Math.round((item.value / total) * 100)}%` : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ReportsClient({
  rows: initialRows,
  analytics: a,
}: {
  rows: QuoteSummary[];
  analytics: AnalyticsData;
}) {
  const [rows]            = useState<QuoteSummary[]>(initialRows);
  const [filterStatus, setFilterStatus]   = useState<Quote["status"] | "">("");
  const [filterAccount, setFilterAccount] = useState("");
  const [sortKey, setSortKey]             = useState<"date" | "total" | "ref">("date");
  const [sortDir, setSortDir]             = useState<"asc" | "desc">("desc");
  const [filtersOpen, setFiltersOpen]     = useState(false);

  const STATUSES: Array<Quote["status"]> = ["draft", "sent", "approved", "rejected"];

  const filtered = useMemo(() => {
    const base = rows
      .filter((r) => !filterStatus  || r.quote.status === filterStatus)
      .filter((r) => !filterAccount || r.account.name.toLowerCase().includes(filterAccount.toLowerCase()));

    return base.slice().sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date")  cmp = a.quote.created_at.localeCompare(b.quote.created_at);
      if (sortKey === "total") cmp = a.quote.total - b.quote.total;
      if (sortKey === "ref")   cmp = a.quote.ref.localeCompare(b.quote.ref);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rows, filterStatus, filterAccount, sortKey, sortDir]);

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };
  const sortArrow = (key: typeof sortKey) =>
    sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  const exportCsv = () => {
    const header = "Ref,Account,Status,Lines,Total,Date,Valid Until";
    const csvRows = filtered.map((r) =>
      [r.quote.ref, `"${r.account.name}"`, r.quote.status, r.lineCount,
       r.quote.total, r.quote.created_at, r.quote.valid_until ?? ""].join(",")
    );
    const blob = new Blob([header + "\n" + csvRows.join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const el   = document.createElement("a");
    el.href = url; el.download = "quotes.csv"; el.click();
    URL.revokeObjectURL(url);
  };

  // Derived chart data
  const accountDonutSegs = a.accountsByType.map((x, i) => ({
    label: x.label, value: x.count, color: CHART_COLORS[i],
  }));
  const assetDonutSegs = a.assetsByKind.map((x, i) => ({
    label: x.label, value: x.count, color: CHART_COLORS[i],
  }));
  const quoteTrendPoints = a.quoteTrend.map((p) => ({
    label: p.dateLabel, value: p.cumulative,
  }));
  const pillarTone: Record<string, PillarKey> = {
    marketing: "purple", sales: "teal", service: "blue",
    field: "amber", finance: "green",
  };

  return (
    <>
      {/* ── Command strip ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
        gap: 10, marginBottom: 20,
      }}>
        {([
          { label: "Accounts",    value: a.totals.accounts,        color: pillar.blue.fg   },
          { label: "Contacts",    value: a.totals.contacts,        color: c.ink            },
          { label: "Assets",      value: a.totals.customerAssets,  color: pillar.teal.fg   },
          { label: "Open cases",  value: a.totals.openCases,       color: pillar.amber.fg  },
          { label: "Work orders", value: a.totals.workOrders,      color: pillar.purple.fg },
          { label: "Contracts",   value: a.totals.activeContracts, color: pillar.green.fg  },
          { label: "Leads",       value: a.totals.leads,           color: c.ink            },
          { label: "Technicians", value: a.totals.technicians,     color: pillar.blue.fg   },
        ] as { label: string; value: number; color: string }[]).map((s) => (
          <div key={s.label} style={{
            background: c.panel, border: `1px solid ${c.line}`, borderRadius: 10,
            padding: "12px 14px",
          }}>
            <div style={{ fontSize: 10.5, color: c.hint, textTransform: "uppercase", letterSpacing: ".04em" }}>
              {s.label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Row 1: Accounts donut · Lead funnel · Assets donut ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginBottom: 14 }}>

        <ChartCard title="Accounts by type">
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <DonutChart segments={accountDonutSegs} />
            <DonutLegend items={accountDonutSegs} />
          </div>
        </ChartCard>

        <ChartCard title="Lead pipeline funnel">
          <FunnelChart stages={a.leadFunnel} />
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
            {a.leadFunnel.slice(1).map((s, i) => {
              const prev = a.leadFunnel[i].count;
              const conv = prev > 0 ? Math.round((s.count / prev) * 100) : 0;
              return (
                <span key={s.stage} style={{ fontSize: 11, color: c.hint }}>
                  → {s.stage}: <strong style={{ color: c.ink }}>{conv}%</strong>
                </span>
              );
            })}
          </div>
        </ChartCard>

        <ChartCard title="Assets by kind">
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <DonutChart segments={assetDonutSegs} />
            <div>
              <DonutLegend items={assetDonutSegs} />
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${c.line}` }}>
                <div style={{ fontSize: 11, color: c.hint, marginBottom: 6 }}>Loaner stock</div>
                <div style={{ display: "flex", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: pillar.teal.fg }}>{a.loanerStock.available}</div>
                    <div style={{ fontSize: 10, color: c.hint }}>available</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: pillar.amber.fg }}>{a.loanerStock.onLoan}</div>
                    <div style={{ fontSize: 10, color: c.hint }}>on loan</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* ── Row 2: Area chart · Case status bars ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 14 }}>

        <ChartCard title="Cumulative quote value">
          <AreaChart points={quoteTrendPoints} color={pillar.blue.base} />
          <div style={{ display: "flex", gap: 20, marginTop: 12, flexWrap: "wrap" }}>
            {a.quotesByStatus.map((s, i) => (
              <div key={s.status}>
                <div style={{ fontSize: 10, color: c.hint, textTransform: "capitalize" }}>{s.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: CHART_COLORS[i] }}>{inr(s.value)}</div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Service case status">
          <HBarChart
            rows={a.casesByStatus.map((x) => ({ label: x.label, value: x.count }))}
          />
        </ChartCard>
      </div>

      {/* ── Row 3: Work orders vbar · Technician gauge · Revenue hbar ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 14 }}>

        <ChartCard title="Work orders by status">
          <VBarChart
            rows={a.workOrdersByStatus.map((x) => ({ label: x.label, value: x.count }))}
            colorFn={(i) => [pillar.amber.base, pillar.blue.base, pillar.teal.base][i]}
          />
        </ChartCard>

        <ChartCard title="Technician availability">
          <GaugeChart
            value={a.techniciansByStatus.find((t) => t.status === "active")?.count ?? 0}
            max={a.totals.technicians}
            color={pillar.teal.base}
            label="active"
          />
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 8 }}>
            {a.techniciansByStatus.map((t) => (
              <div key={t.status} style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: 18, fontWeight: 700,
                  color: t.status === "active"   ? pillar.teal.fg
                       : t.status === "on_leave" ? pillar.amber.fg : c.muted,
                }}>{t.count}</div>
                <div style={{ fontSize: 10, color: c.hint }}>{t.label}</div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Revenue overview">
          <HBarChart
            rows={[
              {
                label: "AMC contracts",
                value: a.contractStats.totalValue,
                sub:   inr(a.contractStats.totalValue),
              },
              {
                label: "Quotes pipeline",
                value: a.quotesByStatus.reduce((s, x) => s + x.value, 0),
                sub:   inr(a.quotesByStatus.reduce((s, x) => s + x.value, 0)),
              },
              ...a.invoicesByStatus.map((inv) => ({
                label: `Invoices (${inv.label})`,
                value: inv.value || 1, // avoid 0-width bars
                sub:   `${inv.count} · ${inr(inv.value)}`,
              })),
            ]}
            colorFn={(i) => [pillar.green.base, pillar.blue.base, pillar.purple.base, pillar.teal.base][i]}
          />
          <div style={{ marginTop: 14, borderTop: `1px solid ${c.line}`, paddingTop: 10,
            display: "flex", gap: 20 }}>
            <div>
              <div style={{ fontSize: 10, color: c.hint }}>Active contracts</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: pillar.green.fg }}>{a.contractStats.activeCount}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: c.hint }}>Total AMC value</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: pillar.green.fg }}>{inr(a.contractStats.totalValue)}</div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* ── Row 4: Activity feed · Invoices + Loaner gauge ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 20 }}>

        <ChartCard title="Recent activity">
          {a.recentActivity.map((act, i) => {
            const pk = (pillarTone[act.pillar] ?? "blue") as PillarKey;
            return (
              <div key={i} style={{
                display: "flex", gap: 12, alignItems: "flex-start",
                padding: "10px 0",
                borderBottom: i < a.recentActivity.length - 1 ? `1px solid ${c.line}` : "none",
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  marginTop: 5, flexShrink: 0, background: pillar[pk].base,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, color: c.ink }}>{act.text}</div>
                  <div style={{ fontSize: 11, color: c.hint, marginTop: 2 }}>
                    {act.accountName} · {new Date(act.at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </div>
                </div>
                <Pill label={act.pillar} tone={pk} />
              </div>
            );
          })}
        </ChartCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <ChartCard title="Invoices by status">
            <HBarChart
              rows={a.invoicesByStatus.map((x) => ({
                label: x.label, value: x.count, sub: `${x.count} · ${inr(x.value)}`,
              }))}
              colorFn={(i) => [pillar.purple.base, pillar.blue.base, pillar.teal.base][i]}
            />
          </ChartCard>

          <ChartCard title="Loaner availability">
            <GaugeChart
              value={a.loanerStock.available}
              max={a.loanerStock.total}
              color={pillar.blue.base}
              label="available"
            />
          </ChartCard>
        </div>
      </div>

      {/* ── Quote table ── */}
      <div style={{ ...cardStyle }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 10, marginBottom: 14,
        }}>
          <div style={{
            fontSize: 12, fontWeight: 600, color: c.muted,
            letterSpacing: ".04em", textTransform: "uppercase",
          }}>
            Quotations — {filtered.length} of {rows.length}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              style={{
                fontSize: 12, padding: "5px 12px", borderRadius: 7,
                border: `1px solid ${c.line}`, cursor: "pointer",
                background: filtersOpen ? c.accentbg : c.panel2, color: c.ink,
              }}
            >
              {filtersOpen ? "▲ Hide filters" : "▼ Filters"}
            </button>
            <button
              onClick={exportCsv}
              style={{
                fontSize: 12, padding: "5px 12px", borderRadius: 7,
                border: `1px solid ${c.line}`, cursor: "pointer",
                background: c.panel2, color: c.ink,
              }}
            >
              ↓ Export CSV
            </button>
          </div>
        </div>

        {filtersOpen && (
          <div style={{
            display: "flex", gap: 10, flexWrap: "wrap",
            marginBottom: 14, padding: "12px 14px",
            background: c.panel2, borderRadius: 8,
          }}>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setFilterStatus("")}
                style={{
                  fontSize: 12, padding: "5px 12px", borderRadius: 20,
                  border: "none", cursor: "pointer", fontWeight: 600,
                  background: filterStatus === "" ? c.accent : c.line,
                  color:      filterStatus === "" ? "#fff" : c.muted,
                }}
              >All</button>
              {STATUSES.map((s) => (
                <button key={s}
                  onClick={() => setFilterStatus(filterStatus === s ? "" : s)}
                  style={{
                    fontSize: 12, padding: "5px 12px", borderRadius: 20,
                    border: "none", cursor: "pointer", fontWeight: 600,
                    background: filterStatus === s ? pillar[statusTone[s]].base : c.line,
                    color:      filterStatus === s ? "#fff" : c.muted,
                  }}
                >{QUOTE_STATUS_LABEL[s]}</button>
              ))}
            </div>
            <input
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              placeholder="Search account…"
              style={{
                border: `1px solid ${c.line}`, borderRadius: 7,
                padding: "5px 12px", fontSize: 12, color: c.ink,
                background: c.panel, fontFamily: "inherit", outline: "none",
              }}
            />
          </div>
        )}

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {([
                  { label: "Ref",     key: "ref"   as const, right: false },
                  { label: "Account", key: null,             right: false },
                  { label: "Status",  key: null,             right: false },
                  { label: "Lines",   key: null,             right: false },
                  { label: "Total ₹", key: "total" as const, right: true  },
                  { label: "Date",    key: "date"  as const, right: false },
                ]).map(({ label, key, right }) => (
                  <th key={label}
                    onClick={key ? () => toggleSort(key) : undefined}
                    style={{
                      ...th, textAlign: right ? "right" : "left",
                      cursor: key ? "pointer" : "default", userSelect: "none",
                    }}>
                    {label}{key ? sortArrow(key) : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ ...td, textAlign: "center", padding: "28px 0", color: c.hint }}>
                    No quotes match filters
                  </td>
                </tr>
              ) : filtered.map(({ quote, account, lineCount }) => (
                <tr key={quote.id}>
                  <td style={td}>
                    <Link href={ROUTES.quotation(quote.id)}
                      style={{ fontWeight: 600, color: c.accent, fontFamily: "monospace" }}>
                      {quote.ref}
                    </Link>
                  </td>
                  <td style={td}>
                    <Link href={ROUTES.account(account.id)} style={{ color: c.ink }}>{account.name}</Link>
                  </td>
                  <td style={td}>
                    <Pill label={QUOTE_STATUS_LABEL[quote.status]} tone={statusTone[quote.status]} />
                  </td>
                  <td style={{ ...td, color: c.muted }}>{lineCount} items</td>
                  <td style={{ ...td, textAlign: "right", fontWeight: 600 }}>{inr(quote.total)}</td>
                  <td style={{ ...td, color: c.muted }}>{fmtDate(quote.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
