import { notFound } from "next/navigation";
import Link from "next/link";
import { getTechnicianDetail } from "@/lib/data";
import PageHeader from "@/components/PageHeader";
import { ROUTES } from "@/lib/constants";
import { c } from "@/lib/theme";
import TechnicianConfigForm from "./TechnicianConfigForm";

export default async function TechnicianConfigPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const today = new Date().toISOString().slice(0, 7);
  const data = await getTechnicianDetail(id, today);
  if (!data) notFound();

  return (
    <>
      <div style={{ marginBottom: 10 }}>
        <Link href={ROUTES.technician(id)} style={{ fontSize: 12, color: c.muted, textDecoration: "none" }}>
          ← {data.technician.name}
        </Link>
      </div>
      <PageHeader title="Edit profile" subtitle={`Technician · ${data.technician.name}`} />
      <TechnicianConfigForm technician={data.technician} leaves={data.leaves} />
    </>
  );
}
