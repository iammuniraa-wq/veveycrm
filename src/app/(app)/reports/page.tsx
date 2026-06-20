import { listQuotes, getAnalyticsData } from "@/lib/data";
import PageHeader from "@/components/PageHeader";
import ReportsClient from "./ReportsClient";

export default async function ReportsPage() {
  const [rows, analytics] = await Promise.all([listQuotes(), getAnalyticsData()]);
  return (
    <>
      <PageHeader title="Analytics" subtitle="Data · Reports · Export" />
      <ReportsClient rows={rows} analytics={analytics} />
    </>
  );
}
