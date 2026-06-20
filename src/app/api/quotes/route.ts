import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase();
  const body = await request.json();
  const { account_id, ref, total, valid_until, notes, terms, lines } = body;

  if (!account_id || !ref) {
    return NextResponse.json({ error: "account_id and ref are required" }, { status: 400 });
  }

  // Insert quote
  const { data: quote, error: qErr } = await supabase
    .from("quotes")
    .insert({ account_id, ref, status: "draft", total: total ?? 0, valid_until: valid_until || null, notes: [notes, terms].filter(Boolean).join("\n\n") || null, revision: 1 })
    .select("id, ref")
    .single();

  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });

  // Insert lines
  if (Array.isArray(lines) && lines.length > 0) {
    const lineRows = lines
      .filter((l) => l.description?.trim())
      .map((l) => ({
        quote_id: quote.id,
        description: l.description,
        qty: parseFloat(l.qty) || 1,
        rate: parseFloat(l.rate) || 0,
        amount: (parseFloat(l.qty) || 1) * (parseFloat(l.rate) || 0),
      }));
    if (lineRows.length > 0) {
      await supabase.from("quote_lines").insert(lineRows);
    }
  }

  // First revision log
  await supabase.from("quote_revisions").insert({ quote_id: quote.id, rev: 1, date: new Date().toISOString().split("T")[0], description: "Initial draft" });

  return NextResponse.json({ id: quote.id, ref: quote.ref }, { status: 201 });
}
