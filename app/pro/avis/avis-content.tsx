import { Star } from "lucide-react";
import Link from "next/link";

import { StarRating } from "@/components/shared/star-rating";

type AvisContentProps = {
  prestataireData: any;
  isValid: boolean;
  reviews: any[];
  averageRating: number;
  reviewCount: number;
};

export default function AvisContent({ prestataireData, isValid, reviews, averageRating, reviewCount }: AvisContentProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Show blocking screen if not validated
  if (!isValid) {
    const statusMessage = prestataireData?.statut_validation === 'en_attente'
      ? "Votre compte est en cours de validation"
      : "Votre compte a été rejeté";

    const statusColor = prestataireData?.statut_validation === 'en_attente'
      ? "text-goldSoft"
      : "text-henna";

    return (
      <div className="flex min-h-screen flex-col bg-porcelain">
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 pb-28 sm:px-6 sm:py-14 sm:pb-28">
          <div className="text-center">
            <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-porcelain/60 mx-auto">
              <Star className="size-10 text-ink-muted" />
            </div>
            <h1 className="font-heading text-3xl font-medium leading-tight tracking-tight text-ink sm:text-4xl">
              {statusMessage}
            </h1>
            <p className={`mt-4 text-sm ${statusColor} sm:text-base`}>
              {prestataireData?.statut_validation === 'en_attente'
                ? "Vous recevrez une confirmation sous 24-48h."
                : "Contactez le support pour plus d'informations."}
            </p>
            <Link
              href="/pro/profil"
              className="mt-8 inline-block text-sm font-medium text-henna hover:underline sm:text-base"
            >
              Voir mon profil →
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-porcelain">
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 pb-28 sm:px-6 sm:py-14 sm:pb-28">
        {/* Header */}
        <div className="mb-10">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-henna sm:text-xs">
            Espace prestataire
          </p>
          <h1 className="font-heading text-3xl font-medium leading-tight tracking-tight text-ink sm:text-4xl">
            Avis reçus
          </h1>
        </div>

        {/* Navigation */}
        <div className="mb-10 flex gap-3 border-b border-black/10 pb-4">
          <Link
            href="/pro/dashboard"
            className="rounded-lg px-4 py-2 text-sm font-medium text-ink-muted hover:bg-porcelain/60"
          >
            Tableau de bord
          </Link>
          <Link
            href="/pro/profil"
            className="rounded-lg px-4 py-2 text-sm font-medium text-ink-muted hover:bg-porcelain/60"
          >
            Mon profil
          </Link>
          <Link
            href="/pro/avis"
            className="rounded-lg bg-henna/10 px-4 py-2 text-sm font-medium text-henna"
          >
            Avis reçus
          </Link>
        </div>

        {/* Rating Summary */}
        <div className="mb-10 rounded-2xl border border-black/10 bg-card p-6 sm:p-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-8">
            <div className="text-center sm:text-left">
              <p className="font-heading text-5xl font-medium text-ink sm:text-6xl">
                {averageRating > 0 ? averageRating.toFixed(1) : "-"}
              </p>
              <div className="mt-2 flex items-center justify-center gap-1 sm:justify-start">
                <StarRating rating={Math.round(averageRating)} readonly size="md" />
              </div>
              <p className="mt-2 text-sm text-ink-muted sm:text-base">
                {reviewCount} avis
              </p>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm text-ink-muted sm:text-base">
                {reviewCount > 0
                  ? "Excellent travail ! Continuez à offrir un service de qualité pour maintenir cette note exceptionnelle."
                  : "Vous n'avez pas encore reçu d'avis. Vos premiers clients seront ravis de partager leur expérience."}
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-black/10 bg-card p-12 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-porcelain/60">
              <Star className="size-8 text-ink-muted" />
            </div>
            <p className="font-heading text-xl font-medium text-ink sm:text-2xl">
              Vous n'avez pas encore reçu d'avis
            </p>
            <p className="mt-2 text-sm text-ink-muted sm:text-base">
              Vos premiers clients seront ravis de partager leur expérience
            </p>
          </div>
        ) : (
          /* Reviews List */
          <div>
            <h2 className="font-heading text-2xl font-medium text-ink sm:text-3xl">
              Derniers avis
            </h2>
            <p className="mt-1 text-sm text-ink-muted sm:text-base">
              Ce que vos clients disent de vous
            </p>

            <div className="mt-6 space-y-4">
              {reviews.map((review: any) => (
                <div
                  key={review.id}
                  className="rounded-2xl border border-black/10 bg-card p-5 sm:p-6"
                >
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-heading text-lg font-medium text-ink">
                        {review.clients?.prenom || "Client"}
                      </h3>
                      <div className="mt-1 flex items-center gap-1">
                        <StarRating rating={review.note} readonly size="sm" />
                      </div>
                    </div>
                    <p className="text-xs text-ink-muted sm:text-sm">
                      {formatDate(review.created_at)}
                    </p>
                  </div>

                  <p className="text-sm text-ink-muted sm:text-base">
                    {review.commentaire}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
