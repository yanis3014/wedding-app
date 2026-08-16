import { requireValidatedPro } from "@/lib/supabase/auth-pro";
import { createClient } from "@/lib/supabase/server";
import AvisContent from "./avis-content";

export default async function ProAvisPage() {
  const { prestataireData, isValid, user } = await requireValidatedPro();
  const supabase = await createClient();

  // Load reviews for this prestataire with client info
  const { data: reviews } = await supabase
    .from("avis")
    .select(`
      *,
      clients (prenom)
    `)
    .eq("prestataire_id", user.id)
    .order("created_at", { ascending: false });

  // Calculate average rating
  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.note, 0) / reviews.length
    : 0;

  return <AvisContent 
    prestataireData={prestataireData} 
    isValid={isValid} 
    reviews={reviews || []}
    averageRating={averageRating}
    reviewCount={reviews?.length || 0}
  />;
}
