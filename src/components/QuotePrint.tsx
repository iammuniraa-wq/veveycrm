"use client";

import type { Quote, QuoteLine, QuoteRevision, Account, Contact, Site } from "@/lib/types";
import { COMPANY } from "@/lib/constants";

const STATUS_LABEL: Record<Quote["status"], string> = {
  draft: "Draft", sent: "Sent", approved: "Approved", rejected: "Rejected",
};

type Props = {
  quote: Quote;
  account: Account | null;
  contact: Contact | null;
  site: Site | null;
  lines: QuoteLine[];
  revisions: QuoteRevision[];
};

const inr = (n: number) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

// Brand palette used inline so print colours are always exact.
const brand = { dark: "#152233", blue: "#378ADD", amber: "#F6B23C", line: "#d0d7e0", bg2: "#f4f6f9" };

export default function QuotePrint({ quote, account, contact, site, lines, revisions }: Props) {
  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  const gst = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + gst;

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 12mm 15mm; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
        }
        body { margin: 0; background: #e8ecf0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 13px; color: #1c2733; }
        .doc { background: #fff; max-width: 800px; margin: 0 auto; }
        table { border-collapse: collapse; width: 100%; }
        td, th { vertical-align: top; }
      `}</style>

      {/* ── Screen-only toolbar ─────────────────────────────── */}
      <div className="no-print" style={{ background: brand.dark, padding: "10px 24px", display: "flex", alignItems: "center", gap: 10, position: "sticky", top: 0, zIndex: 10, flexWrap: "wrap" }}>
        <button
          onClick={() => window.print()}
          style={{ background: brand.blue, color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
        >
          ↓ Print / Save PDF
        </button>
        {/* Email — Coming Soon */}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.07)", color: "#6b8099", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8, padding: "7px 14px", fontSize: 12.5, fontWeight: 500, cursor: "not-allowed" }}>
          📧 Email quote
          <span style={{ fontSize: 9, fontWeight: 700, color: "#f6b23c", background: "rgba(246,178,60,.15)", border: "1px solid rgba(246,178,60,.3)", borderRadius: 5, padding: "1px 5px", letterSpacing: 0.4 }}>
            SOON
          </span>
        </span>
        {/* WhatsApp — Coming Soon */}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.07)", color: "#6b8099", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8, padding: "7px 14px", fontSize: 12.5, fontWeight: 500, cursor: "not-allowed" }}>
          💬 WhatsApp
          <span style={{ fontSize: 9, fontWeight: 700, color: "#f6b23c", background: "rgba(246,178,60,.15)", border: "1px solid rgba(246,178,60,.3)", borderRadius: 5, padding: "1px 5px", letterSpacing: 0.4 }}>
            SOON
          </span>
        </span>
        <button
          onClick={() => window.close()}
          style={{ background: "transparent", color: "#aebccd", border: "1px solid rgba(255,255,255,.2)", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}
        >
          Close
        </button>
        <span style={{ marginLeft: "auto", color: "#4a6278", fontSize: 11 }}>
          Save as PDF · use browser print dialog
        </span>
      </div>

      {/* ── A4 Document ─────────────────────────────────────── */}
      <div className="doc">

        {/* Header */}
        <div style={{ background: brand.dark, padding: "22px 28px 18px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            {/* V logo */}
            <svg width="38" height="38" viewBox="0 0 96 96" style={{ marginBottom: 8 }}>
              <rect width="96" height="96" rx="16" fill={brand.blue} />
              <path d="M29 29L48 63L67 29" fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="48" cy="63" r="8" fill={brand.amber} />
            </svg>
            <div style={{ color: "#fff", fontWeight: 600, fontSize: 15, letterSpacing: -0.3 }}>{COMPANY.name}</div>
            <div style={{ color: "#7fb4ec", fontSize: 11, marginTop: 3 }}>{COMPANY.tagline}</div>
            <div style={{ color: "#8aa0b8", fontSize: 10.5, marginTop: 6 }}>
              {COMPANY.address}<br />
              {COMPANY.phone} · {COMPANY.email}<br />
              GSTIN: {COMPANY.gstin} · PAN: {COMPANY.pan}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#fff", fontSize: 26, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Quotation</div>
            <div style={{ color: brand.amber, fontSize: 14, fontWeight: 600, marginTop: 4, fontFamily: "monospace" }}>{quote.ref}</div>
            <div style={{ display: "inline-block", background: brand.amber, color: brand.dark, fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 4, marginTop: 6 }}>
              Rev. {quote.revision}
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div style={{ background: brand.bg2, padding: "12px 28px", display: "flex", gap: 32, borderBottom: `1px solid ${brand.line}` }}>
          <Meta label="Date" value={fmtDate(quote.created_at)} />
          <Meta label="Valid until" value={quote.valid_until ? fmtDate(quote.valid_until) : "—"} />
          <Meta label="Status" value={STATUS_LABEL[quote.status]} />
          <Meta label="Revision" value={`Rev. ${quote.revision}`} />
        </div>

        {/* Bill To / Site */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, borderBottom: `1px solid ${brand.line}` }}>
          <div style={{ padding: "16px 28px", borderRight: `1px solid ${brand.line}` }}>
            <SectionLabel>Bill to</SectionLabel>
            {account && (
              <>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{account.name}</div>
                {account.city && <div style={{ color: "#5f6b7a", marginTop: 2 }}>{account.city}</div>}
                {account.phone && <div style={{ color: "#5f6b7a", fontSize: 12 }}>{account.phone}</div>}
                {account.email && <div style={{ color: "#5f6b7a", fontSize: 12 }}>{account.email}</div>}
              </>
            )}
          </div>
          <div style={{ padding: "16px 28px" }}>
            <SectionLabel>Attention</SectionLabel>
            {contact ? (
              <>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{contact.name}</div>
                {contact.role && <div style={{ color: "#5f6b7a", marginTop: 2 }}>{contact.role}</div>}
                {contact.phone && <div style={{ color: "#5f6b7a", fontSize: 12 }}>{contact.phone}</div>}
                {contact.email && <div style={{ color: "#5f6b7a", fontSize: 12 }}>{contact.email}</div>}
              </>
            ) : (
              <div style={{ color: "#8a96a5" }}>—</div>
            )}
            {site && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${brand.line}` }}>
                <SectionLabel>Site</SectionLabel>
                <div style={{ fontWeight: 500 }}>{site.label}</div>
                {site.address && <div style={{ color: "#5f6b7a", fontSize: 12 }}>{site.address}</div>}
              </div>
            )}
          </div>
        </div>

        {/* Scope of work heading */}
        <div style={{ padding: "12px 28px 0", borderBottom: `1px solid ${brand.line}` }}>
          <SectionLabel>Scope of work</SectionLabel>
        </div>

        {/* Line items */}
        <table style={{ margin: "0 0 0 0" }}>
          <thead>
            <tr style={{ background: "#e6f1fb" }}>
              <th style={{ padding: "9px 28px 9px 28px", textAlign: "left", fontSize: 11, color: "#0c447c", fontWeight: 600, width: 32 }}>#</th>
              <th style={{ padding: "9px 12px", textAlign: "left", fontSize: 11, color: "#0c447c", fontWeight: 600 }}>Description</th>
              <th style={{ padding: "9px 12px", textAlign: "right", fontSize: 11, color: "#0c447c", fontWeight: 600, whiteSpace: "nowrap" }}>Qty</th>
              <th style={{ padding: "9px 12px", textAlign: "right", fontSize: 11, color: "#0c447c", fontWeight: 600, whiteSpace: "nowrap" }}>Rate (₹)</th>
              <th style={{ padding: "9px 28px 9px 12px", textAlign: "right", fontSize: 11, color: "#0c447c", fontWeight: 600, whiteSpace: "nowrap" }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, i) => (
              <tr key={line.id} style={{ background: i % 2 === 1 ? "#fafbfc" : "#fff" }}>
                <td style={{ padding: "9px 12px 9px 28px", color: "#8a96a5", fontSize: 11 }}>{i + 1}</td>
                <td style={{ padding: "9px 12px", fontSize: 12.5 }}>{line.description}</td>
                <td style={{ padding: "9px 12px", textAlign: "right", color: "#5f6b7a", fontSize: 12 }}>{line.qty}</td>
                <td style={{ padding: "9px 12px", textAlign: "right", color: "#5f6b7a", fontSize: 12 }}>{line.rate.toLocaleString("en-IN")}</td>
                <td style={{ padding: "9px 28px 9px 12px", textAlign: "right", fontWeight: 500, fontSize: 12.5 }}>{inr(line.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ borderTop: `1px solid ${brand.line}`, padding: "12px 28px", display: "flex", justifyContent: "flex-end" }}>
          <table style={{ width: 260 }}>
            <tbody>
              <TotalRow label="Subtotal" value={inr(subtotal)} />
              <TotalRow label="GST @ 18%" value={inr(gst)} muted />
              <tr>
                <td colSpan={2} style={{ paddingTop: 6 }}>
                  <div style={{ background: brand.dark, color: "#fff", borderRadius: 6, padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Grand total</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: brand.amber }}>{inr(grandTotal)}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Notes */}
        {quote.notes && (
          <div style={{ margin: "0 28px 16px", background: brand.bg2, borderRadius: 6, padding: "12px 14px", borderLeft: `3px solid ${brand.blue}` }}>
            <SectionLabel>Notes &amp; terms</SectionLabel>
            <div style={{ color: "#5f6b7a", fontSize: 12, lineHeight: 1.7 }}>{quote.notes}</div>
          </div>
        )}

        {/* Revision history */}
        {revisions.length > 0 && (
          <div style={{ margin: "0 28px 16px" }}>
            <SectionLabel>Revision history</SectionLabel>
            <table style={{ borderRadius: 6, overflow: "hidden", border: `1px solid ${brand.line}` }}>
              <thead>
                <tr style={{ background: brand.bg2 }}>
                  <th style={{ padding: "7px 12px", textAlign: "left", fontSize: 11, color: "#5f6b7a", fontWeight: 600, width: 60 }}>Rev</th>
                  <th style={{ padding: "7px 12px", textAlign: "left", fontSize: 11, color: "#5f6b7a", fontWeight: 600, width: 110 }}>Date</th>
                  <th style={{ padding: "7px 12px", textAlign: "left", fontSize: 11, color: "#5f6b7a", fontWeight: 600 }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {revisions.map((r, i) => (
                  <tr key={r.id} style={{ borderTop: `1px solid ${brand.line}`, background: r.rev === quote.revision ? "#fffdf5" : "#fff" }}>
                    <td style={{ padding: "8px 12px", fontSize: 12 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        Rev. {r.rev}
                        {r.rev === quote.revision && (
                          <span style={{ fontSize: 9, background: brand.amber, color: brand.dark, padding: "1px 5px", borderRadius: 3, fontWeight: 700 }}>current</span>
                        )}
                      </span>
                    </td>
                    <td style={{ padding: "8px 12px", fontSize: 12, color: "#5f6b7a" }}>{fmtDate(r.date)}</td>
                    <td style={{ padding: "8px 12px", fontSize: 12 }}>{r.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Signature block */}
        <div style={{ margin: "8px 28px 28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div style={{ border: `1px solid ${brand.line}`, borderRadius: 6, padding: "16px 14px" }}>
            <div style={{ fontSize: 11, color: "#8a96a5", marginBottom: 36 }}>For {COMPANY.name}</div>
            <div style={{ borderTop: `1px solid ${brand.dark}`, paddingTop: 6, fontSize: 11, color: "#5f6b7a" }}>Authorised Signatory</div>
          </div>
          <div style={{ border: `1px solid ${brand.line}`, borderRadius: 6, padding: "16px 14px" }}>
            <div style={{ fontSize: 11, color: "#8a96a5", marginBottom: 36 }}>Customer acceptance — {account?.name ?? ""}</div>
            <div style={{ borderTop: `1px solid ${brand.line}`, paddingTop: 6, fontSize: 11, color: "#5f6b7a" }}>Name, Designation &amp; Stamp</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: brand.bg2, borderTop: `1px solid ${brand.line}`, padding: "10px 28px", display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "#8a96a5" }}>
          <span>{COMPANY.name} · GSTIN {COMPANY.gstin}</span>
          <span>{quote.ref} · Rev. {quote.revision} · Generated {fmtDate(new Date().toISOString())}</span>
        </div>

      </div>
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#8a96a5", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontWeight: 500, fontSize: 12.5, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: "#378ADD", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
      {children}
    </div>
  );
}

function TotalRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <tr>
      <td style={{ padding: "4px 0", fontSize: 12.5, color: muted ? "#8a96a5" : "#1c2733" }}>{label}</td>
      <td style={{ padding: "4px 0", fontSize: 12.5, textAlign: "right", color: muted ? "#8a96a5" : "#1c2733" }}>{value}</td>
    </tr>
  );
}
