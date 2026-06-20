import { NextResponse, type NextRequest } from "next/server";
import { createAdminSupabase } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  const admin = createAdminSupabase();

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: "sap.rashid@gmail.com",
    options: {
      redirectTo: `${request.nextUrl.origin}/auth/callback`,
    },
  });

  if (error) {
    return new NextResponse(`<pre>Error: ${error.message}</pre>`, {
      headers: { "content-type": "text/html" },
    });
  }

  const link = data?.properties?.action_link;

  return new NextResponse(
    `<html><body style="font-family:sans-serif;padding:40px">
      <h2>Dev Sign-in</h2>
      <p>Click the link below to sign in as sap.rashid@gmail.com:</p>
      <a href="${link}" style="font-size:14px;word-break:break-all">${link}</a>
    </body></html>`,
    { headers: { "content-type": "text/html" } }
  );
}
