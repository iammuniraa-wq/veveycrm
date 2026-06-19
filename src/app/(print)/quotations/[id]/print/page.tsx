import { notFound } from "next/navigation";
import { getQuote } from "@/lib/data";
import QuotePrint from "@/components/QuotePrint";

export default async function QuotePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getQuote(id);
  if (!data) notFound();

  const { quote, account, contact, site, lines, revisions } = data;
  return (
    <QuotePrint
      quote={quote}
      account={account}
      contact={contact}
      site={site}
      lines={lines}
      revisions={revisions}
    />
  );
}
