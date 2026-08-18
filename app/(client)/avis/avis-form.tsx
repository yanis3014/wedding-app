"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/shared/star-rating";
import { createClient } from "@/lib/supabase/client";

type AvisFormProps = {
  vendorsWithReviewStatus: any[];
};

export default function AvisForm({ vendorsWithReviewStatus }: AvisFormProps) {
  const supabase = createClient();
  const [reviews, setReviews] = useState<Record<string, { rating: number; comment: string }>>({});
  const [isPublishing, setIsPublishing] = useState<Record<string, boolean>>({});

  // Separate vendors that can be reviewed from those with future wedding dates
  const reviewableVendors = vendorsWithReviewStatus.filter(v => v.canReview);
  const futureWeddingVendors = vendorsWithReviewStatus.filter(v => !v.canReview);

  const handleRatingChange = (requestId: string, rating: number) => {
    setReviews((prev) => ({
      ...prev,
      [requestId]: { ...prev[requestId], rating },
    }));
  };

  const handleCommentChange = (requestId: string, comment: string) => {
    setReviews((prev) => ({
      ...prev,
      [requestId]: { ...prev[requestId], comment },
    }));
  };

  const handlePublish = async (requestId: string, prestataireId: string) => {
    const currentReview = reviews[requestId];
    if (!currentReview || currentReview.rating === 0 || !currentReview.comment.trim()) {
      return;
    }

    setIsPublishing((prev) => ({ ...prev, [requestId]: true }));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("avis")
        .insert({
          demande_id: requestId,
          client_id: user.id,
          prestataire_id: prestataireId,
          note: currentReview.rating,
          commentaire: currentReview.comment,
        });

      if (error) {
        console.error("Error publishing review:", error);
        alert("Erreur lors de la publication de l'avis");
      } else {
        // Refresh the page to show the updated state
        window.location.reload();
      }
    } catch (error) {
      console.error("Error publishing review:", error);
      alert("Erreur lors de la publication de l'avis");
    } finally {
      setIsPublishing((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-porcelain">
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-heading text-3xl font-medium leading-tight tracking-tight text-ink sm:text-4xl">
            Mes avis
          </h1>
          <p className="mt-2 text-sm text-ink-muted sm:text-base">
            Partagez votre expérience avec vos prestataires
          </p>
        </div>

        {/* Empty State */}
        {vendorsWithReviewStatus.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-black/10 bg-card p-12 text-center">
            <p className="font-heading text-xl font-medium text-ink sm:text-2xl">
              Aucun prestataire confirmé
            </p>
            <p className="mt-2 text-sm text-ink-muted sm:text-base">
              Vous pourrez laisser des avis une fois vos prestataires confirmés
            </p>
          </div>
        ) : (
          <>
            {/* Future Wedding Vendors Section */}
            {futureWeddingVendors.length > 0 && (
              <div className="mb-8">
                <h2 className="font-heading text-xl font-medium text-ink sm:text-2xl mb-4">
                  Prestataires confirmés
                </h2>
                <div className="space-y-4">
                  {futureWeddingVendors.map(({ request, prestataire, weddingDate }) => (
                    <div
                      key={request.id}
                      className="rounded-[14px] border border-black/10 bg-card p-6 sm:p-8"
                    >
                      <div className="mb-4">
                        <p className="mb-1 text-[11px] font-medium uppercase tracking-widest text-henna sm:text-xs">
                          {prestataire.categorie}
                        </p>
                        <h3 className="font-heading text-xl font-medium text-ink sm:text-2xl">
                          {prestataire.nom_entreprise}
                        </h3>
                      </div>
                      <div className="rounded-xl bg-goldSoft/10 p-4">
                        <p className="text-sm text-ink-muted">
                          Vous pourrez laisser un avis après le {new Date(weddingDate).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviewable Vendors Section */}
            {reviewableVendors.length === 0 && futureWeddingVendors.length > 0 ? null : (
              <>
                {reviewableVendors.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-black/10 bg-card p-12 text-center">
                    <p className="font-heading text-xl font-medium text-ink sm:text-2xl">
                      Aucun avis à laisser pour le moment
                    </p>
                    <p className="mt-2 text-sm text-ink-muted sm:text-base">
                      Tous vos prestataires confirmés ont des mariages à venir
                    </p>
                  </div>
                ) : (
                  <div>
                    <h2 className="font-heading text-xl font-medium text-ink sm:text-2xl mb-4">
                      Prestataires notables
                    </h2>
                    <div className="space-y-6">
                      {reviewableVendors.map(({ request, prestataire, hasReview, review }) => {
                        const currentReview = reviews[request.id] || { rating: 0, comment: "" };
                        const isCurrentlyPublishing = isPublishing[request.id];

                        return (
                          <div
                            key={request.id}
                            className="rounded-[14px] border border-black/10 bg-card p-6 sm:p-8"
                          >
                            {/* Vendor Info */}
                            <div className="mb-6">
                              <p className="mb-1 text-[11px] font-medium uppercase tracking-widest text-henna sm:text-xs">
                                {prestataire.categorie}
                              </p>
                              <h3 className="font-heading text-xl font-medium text-ink sm:text-2xl">
                                {prestataire.nom_entreprise}
                              </h3>
                            </div>

                            {/* Existing Review Display */}
                            {hasReview && review && (
                              <div className="mb-6 rounded-xl bg-sage/10 p-4">
                                <div className="mb-3 flex items-center justify-between">
                                  <StarRating
                                    rating={review.note}
                                    readonly
                                    size="md"
                                  />
                                  <span className="rounded-full bg-sage/20 px-3 py-1 text-xs font-medium text-sage">
                                    Avis publié
                                  </span>
                                </div>
                                <p className="mb-2 text-sm text-ink sm:text-base">
                                  {review.commentaire}
                                </p>
                                <p className="text-xs text-ink-muted">
                                  Publié le {formatDate(review.created_at)}
                                </p>
                              </div>
                            )}

                            {/* Review Form (only if not published) */}
                            {!hasReview && (
                              <div className="space-y-4">
                                <div>
                                  <label className="mb-2 block text-sm font-medium text-ink">
                                    Note
                                  </label>
                                  <StarRating
                                    rating={currentReview.rating}
                                    onRatingChange={(rating) => handleRatingChange(request.id, rating)}
                                    size="lg"
                                  />
                                </div>

                                <div>
                                  <label
                                    htmlFor={`comment-${request.id}`}
                                    className="mb-2 block text-sm font-medium text-ink"
                                  >
                                    Commentaire
                                  </label>
                                  <textarea
                                    id={`comment-${request.id}`}
                                    rows={4}
                                    value={currentReview.comment}
                                    onChange={(e) => handleCommentChange(request.id, e.target.value)}
                                    placeholder="Partagez votre expérience avec ce prestataire..."
                                    className="w-full rounded-xl border border-black/10 bg-porcelain/60 px-4 py-3 text-sm text-ink placeholder:text-ink-muted/70 outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
                                  />
                                </div>

                                <Button
                                  onClick={() => handlePublish(request.id, prestataire.id)}
                                  disabled={currentReview.rating === 0 || !currentReview.comment.trim() || isCurrentlyPublishing}
                                  size="lg"
                                  className="h-11 w-full rounded-xl bg-henna px-6 hover:bg-henna/90 disabled:bg-henna/30 disabled:cursor-not-allowed"
                                >
                                  {isCurrentlyPublishing ? "Publication en cours..." : "Publier l'avis"}
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
