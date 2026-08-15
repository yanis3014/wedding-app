import { requireAdminAuth } from "@/lib/supabase/auth-admin";
import { createClient } from "@/lib/supabase/server";
import AbonnementsContent from "./abonnements-content";

export default async function AdminAbonnementsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdminAuth();
  const supabase = await createClient();
  const params = await searchParams;

  const statusFilter = params.status || "essai";

  // Load configuration for tariff
  const { data: config } = await supabase
    .from("configuration")
    .select("tarif_mensuel")
    .eq("id", 1)
    .single();

  // Load prestataires with subscription data
  let query = supabase
    .from("prestataires")
    .select(`
      *,
      villes!inner (nom),
      zones (nom)
    `)
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("abonnement_statut", statusFilter);
  }

  const { data: prestataires } = await query;

  // Sort trial expiring soonest for "essai" tab
  let sortedPrestataires = prestataires || [];
  if (statusFilter === "essai") {
    sortedPrestataires = sortedPrestataires.sort((a, b) => {
      const dateA = a.essai_fin_date ? new Date(a.essai_fin_date).getTime() : Infinity;
      const dateB = b.essai_fin_date ? new Date(b.essai_fin_date).getTime() : Infinity;
      return dateA - dateB;
    });
  }

  return (
    <AbonnementsContent
      prestataires={sortedPrestataires}
      statusFilter={statusFilter}
      tarifMensuel={config?.tarif_mensuel}
    />
  );
}
