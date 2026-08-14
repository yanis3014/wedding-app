"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/shared/star-rating";

type AvisFormProps = {
  confirmedVendors: any[];
};

export default function AvisForm({ confirmedVendors }: AvisFormProps) {
  const [reviews, setReviews] = useState<Record<string, { rating: number; comment: string }>>({});
  const [publishedReviews, setPublishedReviews] = useState<Record<string, boolean>>({});

  const handleRatingChange = (vendorId: string, rating: number) => {
    setReviews((prev) => ({
      ...prev,
      [vendorId]: { ...prev[vendorId], rating },
    }));
  };

  const handleCommentChange = (vendorId: string, comment: string) => {
    setReviews((prev) => ({
      ...prev,
      [vendorId]: { ...prev[vendorId], comment },
    }));
  };

  const handlePublish = (vendorId: string) => {
    setPublishedReviews((prev) => ({ ...prev, [vendorId]: true }));
    // In a real app, you would send this to your backend
    console.log("Review published for vendor:", vendorId, reviews[vendorId]);
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
        {confirmedVendors.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-black/10 bg-card p-12 text-center">
            <p className="font-heading text-xl font-medium text-ink sm:text-2xl">
              Aucun prestataire confirmé
            </p>
            <p className="mt-2 text-sm text-ink-muted sm:text-base">
              Vous pourrez laisser des avis une fois vos prestataires confirmés
            </p>
          </div>
        ) : (
          /* Vendor Cards */
          <div className="space-y-6">
            {confirmedVendors.map((vendor) => {
              const hasExistingReview = vendor.hasReview;
              const isPublished = publishedReviews[vendor.id];
              const currentReview = reviews[vendor.id] || { rating: 0, comment: "" };

              return (
                <div
                  key={vendor.id}
                  className="rounded-[14px] border border-black/10 bg-card p-6 sm:p-8"
                >
                  {/* Vendor Info */}
                  <div className="mb-6">
                    <p className="mb-1 text-[11px] font-medium uppercase tracking-widest text-henna sm:text-xs">
                      {vendor.vendorCategory}
                    </p>
                    <h3 className="font-heading text-xl font-medium text-ink sm:text-2xl">
                      {vendor.vendorName}
                    </h3>
                  </div>

                  {/* Existing Review Display */}
                  {(hasExistingReview || isPublished) && (
                    <div className="mb-6 rounded-xl bg-sage/10 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <StarRating
                          rating={hasExistingReview ? vendor.existingReview!.rating : currentReview.rating}
                          readonly
                          size="md"
                        />
                        <span className="rounded-full bg-sage/20 px-3 py-1 text-xs font-medium text-sage">
                          Avis publié
                        </span>
                      </div>
                      <p className="mb-2 text-sm text-ink sm:text-base">
                        {hasExistingReview ? vendor.existingReview!.comment : currentReview.comment}
                      </p>
                      <p className="text-xs text-ink-muted">
                        Publié le {hasExistingReview ? formatDate(vendor.existingReview!.date) : formatDate(new Date().toISOString())}
                      </p>
                    </div>
                  )}

                  {/* Review Form (only if not published) */}
                  {!hasExistingReview && !isPublished && (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-ink">
                          Note
                        </label>
                        <StarRating
                          rating={currentReview.rating}
                          onRatingChange={(rating) => handleRatingChange(vendor.id, rating)}
                          size="lg"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`comment-${vendor.id}`}
                          className="mb-2 block text-sm font-medium text-ink"
                        >
                          Commentaire
                        </label>
                        <textarea
                          id={`comment-${vendor.id}`}
                          rows={4}
                          value={currentReview.comment}
                          onChange={(e) => handleCommentChange(vendor.id, e.target.value)}
                          placeholder="Partagez votre expérience avec ce prestataire..."
                          className="w-full rounded-xl border border-black/10 bg-porcelain/60 px-4 py-3 text-sm text-ink placeholder:text-ink-muted/70 outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
                        />
                      </div>

                      <Button
                        onClick={() => handlePublish(vendor.id)}
                        disabled={currentReview.rating === 0 || !currentReview.comment.trim()}
                        size="lg"
                        className="h-11 w-full rounded-xl bg-henna px-6 hover:bg-henna/90 disabled:bg-henna/30 disabled:cursor-not-allowed"
                      >
                        Publier l'avis
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
