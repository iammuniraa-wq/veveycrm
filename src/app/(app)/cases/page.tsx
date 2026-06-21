import Link from "next/link";
import { listCases, CASE_STATUS_LABEL, CASE_TYPE_LABEL } from "@/lib/data";
import type { ServiceCase } from "@/lib/types";
import { c, pillar } from "@/lib/theme";
import type { PillarKey } from "@/lib/theme";
import { cardStyle } from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import Pill from "@/components/Pill";
import ViewToggle from "@/components/ViewToggle";
import { ROUTES } from "@/lib/constants";

const OPEN_STATUSES: ServiceCase["status"][] = [
  "intake","inspection","report_sent","report_approved",
  "quote_sent","quote_approved","in_repair","qa","ready",
];

const statusTone: Record<ServiceCase["status"], PillarKey> = {
  intake: "blue", inspection: "blue",
  report_sent: "purple", report_approved: "purple",
  quote_sent: "amber", quote_approved: "amber",
  in_repair: "teal", qa: "teal", ready: "green",
  closed: "green", buyback: "purple", scrapped: "red",
};

const typeTone: Record<ServiceCase["type"], PillarKey> = {
  amc: "teal", adhoc: "amber", direct: "blue",
};

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const th: React.CSSProperties = {
  textAlign: "left", color: c.hint, fontWeight: 500,
  padding: "9px 12px", borderBottom: `1px solid ${c.line}`, fontSize: 11.5,
};
const td: React.CSSProperties = {
  padding: "10px 12px", borderBottom: `1px solid ${c.line}`,
  fontSize: 12.5, verticalAlign: "middle",
};

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const isCard = view !== "list";
  const cases = await listCases();

  const open     = cases.filter((r) => OPEN_STATUSES.includes(r.serviceCase.status));
  const inRepair = cases.filter((r) => r.serviceCase.status === "in_repair");
  const awaiting = cases.filter((r) => r.serviceCase.status === "report_sent" || r.serviceCase.status === "quote_sent");
  const closed   = cases.filter((r) => ["closed","buyback","scrapped"].includes(r.serviceCase.status));

  return (
    <>
      <PageHeader
        title="Cases"
        subtitle="Service · All active and historical service cases"
        action={
          <>
            <Link
              href={ROUTES.caseNew}
              style={{
                padding: "7px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 600,
                background: c.accent, color: "#fff", textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              + New Case
            </Link>
            <ViewToggle />
          </>
        }
      />

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }} className="kpi-grid">
        <Strip label="Open"             value={open.length}     tone="blue"  />
        <Strip label="In repair"        value={inRepair.length} tone="teal"  />
        <Strip label="Awaiting approval" value={awaiting.length} tone="amber" />
        <Strip label="Closed"           value={closed.length}   tone="green" />
      </div>

      {isCard ? (
        // ── Card grid ──────────────────────────────────────────────────────────
        <div className="card-grid">
          {cases.map(({ serviceCase: sc, account, technicianName }) => {
            const tone = statusTone[sc.status];
            const p = pillar[tone];
            return (
              <Link
                key={sc.id}
                href={ROUTES.case(sc.id)}
                style={{
                  ...cardStyle, textDecoration: "none",
                  borderLeft: `3px solid ${p.base}`,
                  display: "flex", flexDirection: "column", gap: 8,
                  transition: "box-shadow .15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                  <span style={{ fontFamily: "monospace", fontSize: 11.5, fontWeight: 700, color: c.accent }}>
                    {sc.ref}
                  </span>
                  <Pill label={CASE_STATUS_LABEL[sc.status]} tone={tone} />
                </div>

                <div style={{ fontSize: 13, fontWeight: 600, color: c.ink, lineHeight: 1.3 }}>
                  {sc.equipment_label}
                </div>

                {sc.complaint && (
                  <div style={{ fontSize: 11.5, color: c.muted, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {sc.complaint}
                  </div>
                )}

                <div style={{ marginTop: "auto", paddingTop: 8, borderTop: `1px solid ${c.line}` }}>
                  <div style={{ fontSize: 12, color: c.accent, fontWeight: 500, marginBottom: 4 }}>
                    {account.name}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: c.hint }}>
                    <span>{fmtDate(sc.intake_at)}</span>
                    {technicianName && <span>{technicianName}</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        // ── Table list ─────────────────────────────────────────────────────────
        <section style={{ ...cardStyle, padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Case ref</th>
                <th style={th}>Equipment</th>
                <th style={th}>Account</th>
                <th style={th}>Type</th>
                <th style={th}>Status</th>
                <th style={th}>Technician</th>
                <th style={th}>Intake</th>
              </tr>
            </thead>
            <tbody>
              {cases.map(({ serviceCase: sc, account, technicianName }) => (
                <tr key={sc.id}>
                  <td style={td}>
                    <Link href={ROUTES.case(sc.id)} style={{ color: c.accent, fontWeight: 600, fontFamily: "monospace", fontSize: 12.5, textDecoration: "none" }}>
                      {sc.ref}
                    </Link>
                  </td>
                  <td style={{ ...td, maxWidth: 240 }}>
                    <div style={{ fontWeight: 500 }}>{sc.equipment_label}</div>
                    <div style={{ fontSize: 11.5, color: c.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={sc.complaint ?? undefined}>
                      {sc.complaint}
                    </div>
                  </td>
                  <td style={td}>
                    <Link href={ROUTES.account(account.id)} style={{ color: c.ink, textDecoration: "none" }}>
                      {account.name}
                    </Link>
                  </td>
                  <td style={td}><Pill label={CASE_TYPE_LABEL[sc.type]} tone={typeTone[sc.type]} /></td>
                  <td style={td}><Pill label={CASE_STATUS_LABEL[sc.status]} tone={statusTone[sc.status]} /></td>
                  <td style={{ ...td, color: technicianName ? c.ink : c.hint }}>{technicianName ?? "—"}</td>
                  <td style={{ ...td, color: c.muted, whiteSpace: "nowrap" }}>{fmtDate(sc.intake_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}

function Strip({ label, value, tone }: { label: string; value: number; tone: PillarKey }) {
  const p = pillar[tone];
  return (
    <div style={{ background: p.bg, borderRadius: 8, padding: "12px 14px" }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: p.fg }}>{value}</div>
      <div style={{ fontSize: 11.5, color: p.fg, marginTop: 2, opacity: 0.8 }}>{label}</div>
    </div>
  );
}
