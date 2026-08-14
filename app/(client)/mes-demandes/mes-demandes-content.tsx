import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/shared/status-pill";

type MesDemandesContentProps = {
  requests: any[];
};

export default function MesDemandesContent({ requests }: MesDemandesContentProps) {
  const getStatusLabel = (status: string, quoteAmount?: number) => {
    switch (status) {
      case "new":
      case "pending":
        return "En attente";
      case "sent":
        return quoteAmount ? `Devis reçu (${quoteAmount.toLocaleString("fr-FR")} DT)` : "Devis reçu";
      case "confirmed":
        return "Confirmé";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatBudget = (budget: string) => {
    const budgetMap: Record<string, string> = {
      "0-1000": "Moins de 1 000 DT",
      "1000-3000": "1 000 - 3 000 DT",
      "3000-5000": "3 000 - 5 000 DT",
      "5000-10000": "5 000 - 10 000 DT",
      "10000+": "Plus de 10 000 DT",
    };
    return budgetMap[budget] || budget;
  };

  const isEmpty = requests.length === 0;

  return (
    <div className="flex min-h-screen flex-col bg-porcelain">
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-heading text-3xl font-medium leading-tight tracking-tight text-ink sm:text-4xl">
            Mes demandes
          </h1>
          <p className="mt-2 text-sm text-ink-muted sm:text-base">
            Suivez l'avancement de vos demandes de devis
          </p>
        </div>

        {/* Empty State */}
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-black/10 bg-card p-12 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-porcelain/60">
              <Search className="size-8 text-ink-muted" />
            </div>
            <h2 className="font-heading text-xl font-medium text-ink sm:text-2xl">
              Aucune demande envoyée
            </h2>
            <p className="mt-2 text-sm text-ink-muted sm:text-base">
              Commencez par rechercher des prestataires pour votre mariage
            </p>
            <Link href="/">
              <Button
                size="lg"
                className="mt-6 h-12 rounded-xl bg-henna px-6 hover:bg-henna/90"
              >
                Rechercher des prestataires
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
          </div>
        ) : (
          /* Requests List */
          <div className="space-y-4">
            {requests.map((request) => (
              <Link
                key={request.id}
                href={`/prestataire/${request.vendorId}`}
                className="block"
              >
                <div className="rounded-2xl border border-black/10 bg-card p-5 transition-colors hover:bg-porcelain/30 sm:p-6">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-heading text-lg font-medium text-ink">
                        {request.vendorName}
                      </h3>
                      <p className="mt-1 text-sm text-ink-muted">
                        {request.vendorCategory}
                      </p>
                    </div>
                    <StatusPill
                      variant={request.status}
                      label={getStatusLabel(request.status, request.quoteAmount)}
                    />
                  </div>

                  <div className="flex flex-col gap-2 text-sm text-ink-muted sm:flex-row sm:gap-4">
                    <span>Envoyé le {formatDate(request.sentDate)}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Date mariage : {formatDate(request.weddingDate)}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Budget : {formatBudget(request.budget)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
