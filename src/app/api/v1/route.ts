import { jsonOk } from "./_auth";

export async function GET() {
  return jsonOk({
    name: "VeveyCRM REST API",
    version: "1.0",
    generated_at: new Date().toISOString(),
    authentication: "Bearer token — set VEVEY_API_KEY in environment variables",
    endpoints: {
      "GET /api/v1":                "This index",
      "GET /api/v1/accounts":       "List all accounts",
      "GET /api/v1/accounts/:id":   "Account detail with contacts, cases, quotes, work orders",
      "GET /api/v1/cases":          "List all service cases",
      "GET /api/v1/quotations":     "List all quotations",
    },
    coming_soon: [
      "POST /api/v1/cases        — create case",
      "PATCH /api/v1/cases/:id   — update case status",
      "POST /api/v1/quotations   — create quotation",
      "GET  /api/v1/openapi.json — OpenAPI 3 spec",
      "POST /api/v1/webhooks     — register webhook endpoint",
    ],
  });
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
    },
  });
}
