import { redirect } from "next/navigation";
import { createAdminSupabase } from "@/lib/supabase-server";
import TenantEditor from "./TenantEditor";
import type { Tenant } from "@/lib/tenant";

export default async function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: tenant } = await createAdminSupabase()
    .from("tenants")
    .select("*")
    .eq("id", id)
    .single();

  if (!tenant) redirect("/admin");

  const { data: users } = await createAdminSupabase()
    .from("tenant_users")
    .select("id, role, created_at, user_id")
    .eq("tenant_id", id)
    .order("created_at");

  return <TenantEditor tenant={tenant as Tenant} users={users ?? []} />;
}
