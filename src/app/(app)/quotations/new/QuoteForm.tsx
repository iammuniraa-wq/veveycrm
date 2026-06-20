"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { c, pillar, type PillarKey } from "@/lib/theme";
import { cardStyle } from "@/components/Shell";
import Pill from "@/components/Pill";
import { ROUTES } from "@/lib/constants";
import { ACCOUNT_TYPE_LABEL } from "@/lib/data";
import type { Account, Contact, PricingItem, TextFragment, PricingCategory } from "@/lib/types";

// ── Styles ────────────────────────────────────────────────────────────────────

const inp: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  border: `1px solid ${c.line}`, borderRadius: 8,
  padding: "8px 12px", fontSize: 13, color: c.ink,
  background: c.panel, fontFamily: "inherit", outline: "none",
};
const sel: React.CSSProperties = { ...inp, cursor: "pointer" };
const label: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 600,
  color: c.muted, textTransform: "uppercase", letterSpacing: "0.06em",
  marginBottom: 5,
};
const sectionTitle: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: c.muted,
  textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 12px",
};

const ACCOUNT_TYPE_TONE: Record<Account["type"], PillarKey> = {
  prospect: "amber", oem: "purple", direct: "blue", end_customer: "teal",
};

const CAT_LABEL: Record<PricingCategory, string> = {
  labour: "Labour", material: "Materials", testing: "Testing", transport: "Transport",
};
const CAT_TONE: Record<PricingCategory, PillarKey> = {
  labour: "blue", material: "teal", testing: "purple", transport: "amber",
};

type LineRow = { id: string; description: string; qty: string; rate: string };

type Props = {
  accounts: Account[];
  contacts: Contact[];
  pricingItems: PricingItem[];
  textFragments: TextFragment[];
};

export default function QuoteForm({ accounts, contacts, pricingItems, textFragments }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const defaultValid = new Date(Date.now() + 30 * 86400_000).toISOString().slice(0, 10);

  const [accountId, setAccountId]     = useState("");
  const [contactId, setContactId]     = useState("");
  const [quoteDate, setQuoteDate]     = useState(today);
  const [validUntil, setValidUntil]   = useState(defaultValid);
  const [lines, setLines]             = useState<LineRow[]>([
    { id: "1", description: "", qty: "1", rate: "0" },
  ]);
  const [notes, setNotes]             = useState("");
  const [terms, setTerms]             = useState("");
  const [discountPct, setDiscountPct] = useState("0");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogTarget, setCatalogTarget] = useState<string | null>(null);
  const [catalogCat, setCatalogCat]   = useState<PricingCategory | "">("");
  const [fragTarget, setFragTarget]   = useState<"notes" | "terms" | null>(null);
  const [saved, setSaved]             = useState(false);

  const quoteRef = useMemo(() => {
    const n = 160 + Math.floor(Math.random() * 30);
    return `QT-2026-${String(n).padStart(4, "0")}`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accountContacts  = contacts.filter((c) => c.account_id === accountId);
  const selectedAccount  = accounts.find((a) => a.id === accountId);

  const parsedLines = lines.map((l) => {
    const qty = parseFloat(l.qty) || 0;
    const rate = parseFloat(l.rate) || 0;
    return { ...l, qty, rate, amount: qty * rate };
  });
  const subtotal      = parsedLines.reduce((s, l) => s + l.amount, 0);
  const discPct       = Math.max(0, Math.min(100, parseFloat(discountPct) || 0));
  const discAmount    = Math.round(subtotal * discPct / 100);
  const total         = subtotal - discAmount;

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  const addLine = () =>
    setLines((prev) => [...prev, { id: String(Date.now()), description: "", qty: "1", rate: "0" }]);

  const removeLine = (id: string) =>
    setLines((prev) => prev.length > 1 ? prev.filter((l) => l.id !== id) : prev);

  const updateLine = (id: string, field: keyof LineRow, val: string) =>
    setLines((prev) => prev.map((l) => l.id === id ? { ...l, [field]: val } : l));

  const openCatalog = (lineId: string) => {
    setCatalogTarget(lineId);
    setCatalogCat("");
    setCatalogOpen(true);
  };

  const insertCatalogItem = (item: PricingItem) => {
    if (catalogTarget) {
      updateLine(catalogTarget, "description", item.description);
      updateLine(catalogTarget, "rate", String(item.rate));
    }
    setCatalogOpen(false);
    setCatalogTarget(null);
  };

  const insertFragment = (frag: TextFragment) => {
    if (fragTarget === "notes") setNotes((p) => p ? p + "\n\n" + frag.text : frag.text);
    if (fragTarget === "terms") setTerms((p) => p ? p + "\n\n" + frag.text : frag.text);
    setFragTarget(null);
  };

  const filteredCatalog = catalogCat
    ? pricingItems.filter((p) => p.category === catalogCat)
    : pricingItems;

  const noteFrags  = textFragments.filter((f) => f.category === "notes");
  const termsFrags = textFragments.filter((f) => f.category === "terms");

  // Success screen
  if (saved) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "55vh", gap: 14, textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: pillar.green.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: pillar.green.base }}>✓</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: c.ink }}>Draft saved</div>
        <div style={{ fontFamily: "monospace", fontSize: 15, color: c.accent, background: c.accentbg, padding: "6px 16px", borderRadius: 8 }}>{quoteRef}</div>
        <p style={{ fontSize: 13, color: c.muted, maxWidth: 340, lineHeight: 1.6 }}>
          Saved as draft for {selectedAccount?.name ?? "the customer"}. You can review and send it from the quotations list.
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <Link href={ROUTES.quotations} style={{ background: c.accent, color: "#fff", padding: "8px 20px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
            All quotations
          </Link>
          <button onClick={() => setSaved(false)} style={{ border: `1px solid ${c.line}`, background: c.panel, color: c.muted, padding: "8px 20px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
            Edit again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: 10 }}>
        <Link href={ROUTES.quotations} style={{ fontSize: 12, color: c.muted, textDecoration: "none" }}>
          ← Quotations
        </Link>
      </div>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: c.ink, margin: 0 }}>New Quotation</h1>
          <div style={{ fontSize: 12.5, color: c.muted, marginTop: 3, fontFamily: "monospace" }}>{quoteRef} · Draft</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 288px", gap: 14, alignItems: "start" }} className="hub-grid">

        {/* ── LEFT ─────────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Account & Contact */}
          <section style={cardStyle}>
            <h3 style={sectionTitle}>Account & Contact</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <span style={label}>Account *</span>
                <select
                  style={sel}
                  value={accountId}
                  onChange={(e) => { setAccountId(e.target.value); setContactId(""); }}
                >
                  <option value="">Select account…</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                {selectedAccount && (
                  <div style={{ display: "flex", gap: 6, marginTop: 7, alignItems: "center" }}>
                    <Pill label={ACCOUNT_TYPE_LABEL[selectedAccount.type]} tone={ACCOUNT_TYPE_TONE[selectedAccount.type]} />
                    {selectedAccount.city && (
                      <span style={{ fontSize: 11.5, color: c.muted }}>{selectedAccount.city}</span>
                    )}
                  </div>
                )}
              </div>
              <div>
                <span style={label}>Contact</span>
                <select
                  style={{ ...sel, opacity: !accountId ? 0.5 : 1 }}
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                  disabled={!accountId}
                >
                  <option value="">{accountId ? "Select contact…" : "Choose account first"}</option>
                  {accountContacts.map((ct) => (
                    <option key={ct.id} value={ct.id}>{ct.name}{ct.role ? ` · ${ct.role}` : ""}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Quote details */}
          <section style={cardStyle}>
            <h3 style={sectionTitle}>Quote details</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <div>
                <span style={label}>Reference</span>
                <input style={{ ...inp, color: c.muted, background: c.panel2 }} value={quoteRef} readOnly />
              </div>
              <div>
                <span style={label}>Date</span>
                <input style={inp} type="date" value={quoteDate} onChange={(e) => setQuoteDate(e.target.value)} />
              </div>
              <div>
                <span style={label}>Valid until</span>
                <input style={inp} type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
              </div>
            </div>
          </section>

          {/* Line items */}
          <section style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <h3 style={{ ...sectionTitle, margin: 0 }}>Line items</h3>
              <button
                onClick={addLine}
                style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: c.accent, background: c.accentbg, border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }}
              >
                + Add line
              </button>
            </div>

            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 120px 110px 32px", gap: 8, marginBottom: 6 }}>
              {["Description", "Qty", "Rate (₹)", "Amount", ""].map((h) => (
                <div key={h} style={{ fontSize: 10.5, fontWeight: 600, color: c.hint, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</div>
              ))}
            </div>

            {/* Rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {parsedLines.map((line, idx) => (
                <div key={line.id} style={{ display: "grid", gridTemplateColumns: "1fr 60px 120px 110px 32px", gap: 8, alignItems: "start", paddingBottom: 8, borderBottom: `1px solid ${c.line}` }}>
                  {/* Description */}
                  <div>
                    <textarea
                      style={{ ...inp, resize: "vertical", minHeight: 58, lineHeight: 1.5 }}
                      value={line.description}
                      onChange={(e) => updateLine(line.id, "description", e.target.value)}
                      placeholder="Describe the service or item…"
                    />
                    <button
                      onClick={() => openCatalog(line.id)}
                      style={{ marginTop: 4, fontSize: 11, color: c.accent, background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}
                    >
                      ◈ From catalog
                    </button>
                  </div>
                  {/* Qty */}
                  <input
                    style={{ ...inp, textAlign: "center" }}
                    type="number" min="0" step="1"
                    value={line.qty}
                    onChange={(e) => updateLine(line.id, "qty", e.target.value)}
                  />
                  {/* Rate */}
                  <input
                    style={{ ...inp, textAlign: "right" }}
                    type="number" min="0" step="100"
                    value={line.rate}
                    onChange={(e) => updateLine(line.id, "rate", e.target.value)}
                  />
                  {/* Amount */}
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: c.ink, textAlign: "right", paddingTop: 8 }}>
                    {fmt(line.amount)}
                  </div>
                  {/* Delete */}
                  <button
                    onClick={() => removeLine(line.id)}
                    style={{ color: c.hint, background: "none", border: "none", fontSize: 18, cursor: "pointer", paddingTop: 6, lineHeight: 1 }}
                    title="Remove line"
                  >×</button>
                </div>
              ))}
            </div>

            {lines.length === 0 && (
              <div style={{ textAlign: "center", padding: "24px 0", color: c.hint, fontSize: 13 }}>No lines yet — click + Add line</div>
            )}
          </section>

          {/* Notes */}
          <section style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
              <h3 style={{ ...sectionTitle, margin: 0 }}>Notes</h3>
              <button
                onClick={() => setFragTarget("notes")}
                style={{ marginLeft: "auto", fontSize: 11.5, color: c.accent, background: c.accentbg, border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 600 }}
              >
                + Insert template
              </button>
            </div>
            <textarea
              style={{ ...inp, minHeight: 88, resize: "vertical", lineHeight: 1.6 }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes for the customer (payment terms, special conditions, delivery notes)…"
            />
          </section>

          {/* Terms */}
          <section style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
              <h3 style={{ ...sectionTitle, margin: 0 }}>Terms & Conditions</h3>
              <button
                onClick={() => setFragTarget("terms")}
                style={{ marginLeft: "auto", fontSize: 11.5, color: c.accent, background: c.accentbg, border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 600 }}
              >
                + Use preset
              </button>
            </div>
            <textarea
              style={{ ...inp, minHeight: 100, resize: "vertical", lineHeight: 1.6, fontFamily: "inherit" }}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Standard terms and conditions…"
            />
          </section>
        </div>

        {/* ── RIGHT (summary + actions) ─────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "sticky", top: 20 }}>
          {/* Totals */}
          <section style={cardStyle}>
            <h3 style={sectionTitle}>Summary</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {parsedLines.map((l, i) => l.amount > 0 && (
                <div key={l.id} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 12, borderTop: `1px solid ${c.line}`, color: c.muted }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 150 }}>
                    {l.description || `Line ${i + 1}`}
                  </span>
                  <span style={{ flexShrink: 0, marginLeft: 8 }}>{fmt(l.amount)}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: `1px solid ${c.line}`, marginTop: 10, paddingTop: 10, display: "flex", flexDirection: "column", gap: 7 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: c.muted }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 600, color: c.ink }}>{fmt(subtotal)}</span>
              </div>

              {/* Discount */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: c.muted }}>
                <span>Discount</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="number" min="0" max="100" step="0.5"
                    value={discountPct}
                    onChange={(e) => setDiscountPct(e.target.value)}
                    style={{ width: 48, border: `1px solid ${c.line}`, borderRadius: 6, padding: "3px 6px", fontSize: 12, textAlign: "right", color: c.ink, fontFamily: "inherit" }}
                  />
                  <span style={{ fontSize: 11, color: c.hint }}>%</span>
                  <span style={{ fontWeight: 600, color: discAmount > 0 ? pillar.red.fg : c.muted }}>
                    {discAmount > 0 ? `− ${fmt(discAmount)}` : "—"}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: pillar.green.bg, borderRadius: 9, marginTop: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: pillar.green.fg }}>Total</span>
                <span style={{ fontSize: 17, fontWeight: 800, color: pillar.green.fg }}>{fmt(total)}</span>
              </div>
            </div>
          </section>

          {/* Actions */}
          <section style={cardStyle}>
            <h3 style={sectionTitle}>Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                onClick={() => setSaved(true)}
                disabled={!accountId}
                style={{
                  width: "100%", padding: "10px 0", borderRadius: 9, fontSize: 13.5, fontWeight: 700,
                  background: accountId ? c.accent : c.line,
                  color: accountId ? "#fff" : c.hint,
                  border: "none", cursor: accountId ? "pointer" : "not-allowed",
                }}
              >
                Save as draft
              </button>
              <button
                disabled
                style={{ width: "100%", padding: "9px 0", borderRadius: 9, fontSize: 13, fontWeight: 600, background: pillar.teal.bg, color: pillar.teal.fg, border: "none", cursor: "not-allowed", opacity: 0.7 }}
              >
                Preview PDF · Coming soon
              </button>
              <button
                disabled
                style={{ width: "100%", padding: "9px 0", borderRadius: 9, fontSize: 13, fontWeight: 600, background: c.panel2, color: c.muted, border: `1px solid ${c.line}`, cursor: "not-allowed", opacity: 0.7 }}
              >
                Send to customer · Coming soon
              </button>
            </div>
          </section>

          {/* Line count hint */}
          <div style={{ fontSize: 11.5, color: c.hint, textAlign: "center" }}>
            {parsedLines.filter((l) => l.amount > 0).length} of {lines.length} line{lines.length !== 1 ? "s" : ""} have values
          </div>
        </div>
      </div>

      {/* ── Catalog slide panel ─────────────────────────────────────────── */}
      {catalogOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setCatalogOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(14,26,40,.45)", zIndex: 998 }}
          />
          {/* Panel */}
          <div style={{
            position: "fixed", top: 0, right: 0, bottom: 0, width: 400,
            background: c.panel, zIndex: 999, display: "flex", flexDirection: "column",
            boxShadow: "-6px 0 32px rgba(0,0,0,.18)",
          }}>
            {/* Panel header */}
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${c.line}`, display: "flex", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: c.ink }}>Pricing catalog</div>
                <div style={{ fontSize: 11.5, color: c.muted, marginTop: 2 }}>Click an item to insert it into the line</div>
              </div>
              <button
                onClick={() => setCatalogOpen(false)}
                style={{ marginLeft: "auto", background: "none", border: "none", fontSize: 20, color: c.muted, cursor: "pointer", lineHeight: 1 }}
              >×</button>
            </div>

            {/* Category filter */}
            <div style={{ display: "flex", gap: 6, padding: "12px 16px", borderBottom: `1px solid ${c.line}`, flexWrap: "wrap" }}>
              {(["", "labour", "material", "testing", "transport"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCatalogCat(cat as PricingCategory | "")}
                  style={{
                    fontSize: 11.5, padding: "4px 10px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 600,
                    background: catalogCat === cat ? c.accent : c.panel2,
                    color: catalogCat === cat ? "#fff" : c.muted,
                  }}
                >
                  {cat === "" ? "All" : CAT_LABEL[cat as PricingCategory]}
                </button>
              ))}
            </div>

            {/* Items list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
              {(["labour", "material", "testing", "transport"] as PricingCategory[])
                .filter((cat) => !catalogCat || catalogCat === cat)
                .map((cat) => {
                  const items = filteredCatalog.filter((p) => p.category === cat);
                  if (items.length === 0) return null;
                  return (
                    <div key={cat}>
                      <div style={{ padding: "8px 20px 4px", fontSize: 10.5, fontWeight: 700, color: c.hint, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {CAT_LABEL[cat]}
                      </div>
                      {items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => insertCatalogItem(item)}
                          style={{
                            width: "100%", textAlign: "left", padding: "10px 20px",
                            background: "none", border: "none", cursor: "pointer",
                            borderBottom: `1px solid ${c.line}`,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = c.panel2)}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                        >
                          <div style={{ fontSize: 12.5, color: c.ink, fontWeight: 500, lineHeight: 1.4 }}>{item.description}</div>
                          <div style={{ display: "flex", gap: 10, marginTop: 4, alignItems: "center" }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: c.accent }}>
                              ₹{item.rate.toLocaleString("en-IN")}
                            </span>
                            <span style={{ fontSize: 11, color: c.hint }}>/ {item.unit}</span>
                            {item.notes && (
                              <span style={{ fontSize: 10.5, color: c.hint, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                · {item.notes}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}

      {/* ── Fragment picker panel ───────────────────────────────────────── */}
      {fragTarget && (
        <>
          <div
            onClick={() => setFragTarget(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(14,26,40,.45)", zIndex: 998 }}
          />
          <div style={{
            position: "fixed", top: 0, right: 0, bottom: 0, width: 380,
            background: c.panel, zIndex: 999, display: "flex", flexDirection: "column",
            boxShadow: "-6px 0 32px rgba(0,0,0,.18)",
          }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${c.line}`, display: "flex", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: c.ink }}>
                  {fragTarget === "notes" ? "Note templates" : "Terms presets"}
                </div>
                <div style={{ fontSize: 11.5, color: c.muted, marginTop: 2 }}>Click to append to the text area</div>
              </div>
              <button onClick={() => setFragTarget(null)} style={{ marginLeft: "auto", background: "none", border: "none", fontSize: 20, color: c.muted, cursor: "pointer" }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {(fragTarget === "notes" ? noteFrags : termsFrags).map((frag) => (
                <button
                  key={frag.id}
                  onClick={() => insertFragment(frag)}
                  style={{
                    width: "100%", textAlign: "left", padding: "14px 20px",
                    background: "none", border: "none", borderBottom: `1px solid ${c.line}`,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = c.panel2)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: c.ink, marginBottom: 5 }}>{frag.label}</div>
                  <div style={{ fontSize: 11.5, color: c.muted, lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {frag.text}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
