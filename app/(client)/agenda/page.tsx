import Link from "next/link";

import { requireAuth } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import AgendaContent from "./agenda-content";

export default async function AgendaPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: clientData } = await supabase
    .from("clients")
    .select("*")
    .eq("id", user.id)
    .single();

  // Load confirmed requests with prestataire join
  const { data: confirmedRequests } = await supabase
    .from("demandes")
    .select(`
      *,
      prestataires (nom_entreprise, categorie, ville)
    `)
    .eq("client_id", user.id)
    .eq("statut", "confirme")
    .order("created_at", { ascending: false });

  const totalRequests = confirmedRequests?.length || 0;

  return (
    <AgendaContent 
      clientData={clientData}
      confirmedRequests={confirmedRequests || []}
      totalRequests={totalRequests}
    />
  );
}
