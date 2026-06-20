export function checkApiKey(req: Request): boolean {
  const auth = req.headers.get("Authorization") ?? "";
  const provided = auth.startsWith("Bearer ") ? auth.slice(7).trim() : auth.trim();
  const expected = process.env.VEVEY_API_KEY;
  if (!expected) return false; // key not configured — block all access
  return provided === expected;
}

export const ERR_401 = () =>
  Response.json(
    { error: "Unauthorized", message: "Include header: Authorization: Bearer <VEVEY_API_KEY>" },
    { status: 401, headers: { "Content-Type": "application/json" } }
  );

export const jsonOk = (data: unknown) =>
  Response.json(data, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
    },
  });
