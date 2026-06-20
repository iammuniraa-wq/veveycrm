import { listAccountsLive } from "@/lib/data/live";
import NewContactForm from "./NewContactForm";

export default async function NewContactPage() {
  const accountData = await listAccountsLive();
  const accounts = accountData.map(({ account }) => account);
  return <NewContactForm accounts={accounts} />;
}
