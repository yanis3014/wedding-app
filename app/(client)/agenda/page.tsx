import Link from "next/link";

import { requireAuth } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import AgendaContent from "./agenda-content";

export const dynamic = 'force-dynamic';

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

  // Load accepted appointments with prestataire join
  const { data: acceptedAppointments } = await supabase
    .from("demandes_rdv")
    .select(`
      *,
      prestataires (nom_entreprise, categorie)
    `)
    .eq("client_id", user.id)
    .eq("statut", "accepte")
    .order("date_rdv", { ascending: true });

  const totalRequests = confirmedRequests?.length || 0;

  return (
    <AgendaContent 
      clientData={clientData}
      confirmedRequests={confirmedRequests || []}
      acceptedAppointments={acceptedAppointments || []}
      totalRequests={totalRequests}
    />
  );
}
