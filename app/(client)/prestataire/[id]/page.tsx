import { createClient } from "@/lib/supabase/server";
import PrestataireDetail from "./prestataire-detail";

export default async function PrestatairePage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  // Load vendor data
  const { data: vendor } = await supabase
    .from("prestataires")
    .select(`
      *,
      villes!inner (nom, latitude, longitude),
      zones (nom)
    `)
    .eq("id", params.id)
    .eq("statut_validation", "valide")
    .single();

  if (!vendor) {
    throw new Error("Prestataire non trouvé");
  }

  // Load reviews for this vendor
  const { data: reviews } = await supabase
    .from("avis")
    .select(`
      *,
      clients (prenom)
    `)
    .eq("prestataire_id", params.id)
    .order("created_at", { ascending: false });

  return (
    <PrestataireDetail 
      vendor={vendor} 
      reviews={reviews || []}
    />
  );
}
