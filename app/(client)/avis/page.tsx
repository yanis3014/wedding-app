import { requireAuth } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import AvisForm from "./avis-form";

export const dynamic = 'force-dynamic';

export default async function AvisPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  // Load confirmed requests for this client with prestataire info
  const { data: confirmedRequests } = await supabase
    .from("demandes")
    .select(`
      *,
      prestataires (id, nom_entreprise, categorie)
    `)
    .eq("client_id", user.id)
    .eq("statut", "confirme");

  // Load existing reviews for these requests
  const requestIds = confirmedRequests?.map(r => r.id) || [];
  const { data: existingReviews } = await supabase
    .from("avis")
    .select("*")
    .in("demande_id", requestIds);

  // Combine data and check if wedding date is in the past
  const vendorsWithReviewStatus = confirmedRequests?.map(request => {
    const existingReview = existingReviews?.find(r => r.demande_id === request.id);
    const weddingDate = new Date(request.date_mariage);
    const isWeddingPast = weddingDate < new Date();
    
    return {
      request,
      prestataire: request.prestataires,
      hasReview: !!existingReview,
      review: existingReview || null,
      canReview: !existingReview && isWeddingPast,
      weddingDate: request.date_mariage,
    };
  }) || [];

  return <AvisForm vendorsWithReviewStatus={vendorsWithReviewStatus} />;
}
