import { requireAuth } from "@/lib/supabase/auth";
import { mockClientRequests } from "@/lib/mock-client-requests";
import MesDemandesContent from "./mes-demandes-content";

export default async function MesDemandesPage() {
  await requireAuth();
  return <MesDemandesContent requests={mockClientRequests} />;
}
