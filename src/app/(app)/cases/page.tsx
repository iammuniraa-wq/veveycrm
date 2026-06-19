import Link from "next/link";
import { listCases, CASE_STATUS_LABEL, CASE_TYPE_LABEL } from "@/lib/data";
import type { ServiceCase } from "@/lib/types";
import { c } from "@/lib/theme";
import type { PillarKey } from "@/lib/theme";
import { cardStyle } from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import Pill from "@/components/Pill";
import { ROUTES } from "@/lib/constants";

const OPEN_STATUSES: ServiceCase["status"][] = [
  "intake","inspection","report_sent","report_approved",
  "quote_sent","quote_approved","in_repair","qa","ready",
];

const statusTone: Record<ServiceCase["status"], PillarKey> = {
  intake:          "blue",
  inspection:      "blue",
  report_sent:     "purple",
  report_approved: "purple",
  quote_sent:      "amber",
  quote_approved:  "amber",
  in_repair:       "teal",
  qa:              "teal",
  ready:           "green",
  closed:          "green",
  buyback:         "purple",
  scrapped:        "red",
};

const typeTone: Record<ServiceCase["type"], PillarKey> = {
  amc:    "teal",
  adhoc:  "amber",
  direct: "blue",
};

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const th: React.CSSProperties = {
  textAlign: "left",
  color: c.hint,
  fontWeight: 500,
  padding: "9px 12px",
  borderBottom: `1px solid ${c.line}`,
  fontSize: 11.5,
};
const td: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: `1px solid ${c.line}`,
  fontSize: 12.5,
  verticalAlign: "middle",
};

export default async function CasesPage() {
  const cases = await listCases();

  const open     = cases.filter((row) => OPEN_STATUSES.includes(row.serviceCase.status));
  const inRepair = cases.filter((row) => row.serviceCase.status === "in_repair");
  const awaiting = cases.filter((row) =>
    row.serviceCase.status === "report_sent" || row.serviceCase.status === "quote_sent"
  );
  const closed   = cases.filter((row) =>
    ["closed","buyback","scrapped"].includes(row.serviceCase.status)
  );

  return (
    <>
      <PageHeader title="Cases" subtitle="Service · All active and historical service cases" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        <Strip label="Open cases"        value={open.length}     tone="blue" />
        <Strip label="In repair"         value={inRepair.length} tone="teal" />
        <Strip label="Awaiting approval" value={awaiting.length} tone="amber" />
        <Strip label="Closed"            value={closed.length}   tone="green" />
      </div>

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
                  <Link
                    href={ROUTES.case(sc.id)}
                    style={{ color: c.accent, fontWeight: 600, fontFamily: "monospace", fontSize: 12.5, textDecoration: "none" }}
                  >
                    {sc.ref}
                  </Link>
                </td>
                <td style={{ ...td, maxWidth: 240 }}>
                  <div style={{ fontWeight: 500 }}>{sc.equipment_label}</div>
                  <div
                    style={{ fontSize: 11.5, color: c.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    title={sc.complaint}
                  >
                    {sc.complaint}
                  </div>
                </td>
                <td style={td}>
                  <Link href={ROUTES.account(account.id)} style={{ color: c.ink, textDecoration: "none" }}>
                    {account.name}
                  </Link>
                </td>
                <td style={td}>
                  <Pill label={CASE_TYPE_LABEL[sc.type]} tone={typeTone[sc.type]} />
                </td>
                <td style={td}>
                  <Pill label={CASE_STATUS_LABEL[sc.status]} tone={statusTone[sc.status]} />
                </td>
                <td style={{ ...td, color: technicianName ? c.ink : c.hint }}>
                  {technicianName ?? "—"}
                </td>
                <td style={{ ...td, color: c.muted, whiteSpace: "nowrap" }}>
                  {fmtDate(sc.intake_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

function Strip({ label, value, tone }: { label: string; value: number; tone: PillarKey }) {
  const tones = {
    blue:   { fg: "#0c447c", bg: "#e6f1fb" },
    teal:   { fg: "#04342c", bg: "#e1f5ee" },
    amber:  { fg: "#633806", bg: "#faeeda" },
    green:  { fg: "#173404", bg: "#eaf3de" },
    purple: { fg: "#26215c", bg: "#eeedfe" },
    red:    { fg: "#791f1f", bg: "#fcebeb" },
  } as const;
  const p = tones[tone as keyof typeof tones] ?? tones.blue;
  return (
    <div style={{ background: p.bg, borderRadius: 8, padding: "12px 14px" }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: p.fg }}>{value}</div>
      <div style={{ fontSize: 11.5, color: p.fg, marginTop: 2, opacity: 0.8 }}>{label}</div>
    </div>
  );
}
