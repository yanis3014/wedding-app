import { requireAuth } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import MesDemandesContent from "./mes-demandes-content";

export const dynamic = 'force-dynamic';

export default async function MesDemandesPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  // Load requests with prestataire join
  const { data: requests } = await supabase
    .from("demandes")
    .select(`
      *,
      prestataires (nom_entreprise, categorie)
    `)
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  return <MesDemandesContent requests={requests || []} />;
}
