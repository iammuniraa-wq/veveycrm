import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabase();
  const { id } = await params;

  // Load the work order
  const { data: wo, error: woErr } = await supabase
    .from("work_orders")
    .select("*, account_id, ref, status, authorized_by")
    .eq("id", id)
    .single();

  if (woErr || !wo) return NextResponse.json({ error: "Work order not found" }, { status: 404 });
  if (wo.status !== "completed") return NextResponse.json({ error: "Work order must be completed first" }, { status: 400 });

  // Derive total from linked quote lines if billable
  let total = 0;
  if (wo.authorized_by?.kind === "quote" && wo.authorized_by?.id) {
    const { data: lines } = await supabase
      .from("quote_lines")
      .select("amount")
      .eq("quote_id", wo.authorized_by.id);
    total = (lines ?? []).reduce((s: number, l: { amount: number }) => s + (l.amount ?? 0), 0);
  }

  const invoiceRef = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;

  const { data: invoice, error: invErr } = await supabase
    .from("invoices")
    .insert({
      account_id: wo.account_id,
      ref: invoiceRef,
      work_order_id: id,
      status: "draft",
      total,
      issued_at: new Date().toISOString(),
    })
    .select("id, ref")
    .single();

  if (invErr) return NextResponse.json({ error: invErr.message }, { status: 500 });

  // Mark work order as invoiced
  await supabase.from("work_orders").update({ status: "invoiced" }).eq("id", id);

  return NextResponse.json({ id: invoice.id, ref: invoice.ref }, { status: 201 });
}
