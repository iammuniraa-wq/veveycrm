import { listAccounts } from "@/lib/data";
import NewContactForm from "./NewContactForm";

export default async function NewContactPage() {
  const accountData = await listAccounts();
  const accounts = accountData.map(({ account }) => account);
  return <NewContactForm accounts={accounts} />;
}
