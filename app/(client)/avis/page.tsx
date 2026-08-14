import { mockClientRequests } from "@/lib/mock-client-requests";
import { requireAuth } from "@/lib/supabase/auth";
import AvisForm from "./avis-form";

export default async function AvisPage() {
  await requireAuth();
  const confirmedVendors = mockClientRequests.filter(
    (req) => req.status === "confirmed"
  );

  return <AvisForm confirmedVendors={confirmedVendors} />;
}
