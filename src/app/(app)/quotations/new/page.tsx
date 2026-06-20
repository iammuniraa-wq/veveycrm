import { getQuoteFormData } from "@/lib/data";
import QuoteForm from "./QuoteForm";

export default async function NewQuotationPage() {
  const data = await getQuoteFormData();
  return <QuoteForm {...data} />;
}
