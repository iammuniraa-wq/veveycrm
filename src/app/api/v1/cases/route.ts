import { listCases } from "@/lib/data";
import { checkApiKey, ERR_401, jsonOk } from "../_auth";

export async function GET(req: Request) {
  if (!checkApiKey(req)) return ERR_401();

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const accountId = url.searchParams.get("account_id");

  let cases = await listCases();

  if (status)    cases = cases.filter((c) => c.serviceCase.status === status);
  if (accountId) cases = cases.filter((c) => c.serviceCase.account_id === accountId);

  return jsonOk({
    data: cases.map(({ serviceCase: sc, account, technicianName }) => ({
      id: sc.id,
      ref: sc.ref,
      type: sc.type,
      status: sc.status,
      equipment_label: sc.equipment_label,
      complaint: sc.complaint,
      disposition: sc.disposition,
      has_loaner: sc.has_loaner,
      intake_at: sc.intake_at,
      closed_at: sc.closed_at,
      account: account ? { id: account.id, name: account.name } : null,
      technician_name: technicianName,
      _links: { self: `/api/v1/cases/${sc.id}`, account: `/api/v1/accounts/${sc.account_id}` },
    })),
    meta: {
      count: cases.length,
      filters: { status: status ?? null, account_id: accountId ?? null },
      generated_at: new Date().toISOString(),
    },
    _links: { self: "/api/v1/cases" },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "Authorization, Content-Type" },
  });
}
