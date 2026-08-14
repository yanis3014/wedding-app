import { Calendar, MessageSquare, TrendingUp } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/shared/status-pill";
import { requireValidatedPro } from "@/lib/supabase/auth-pro";
import { mockDashboardStats, mockRequests } from "@/lib/mock-requests";

export default async function PrestataireDashboardPage() {
  const { prestataireData, isValid } = await requireValidatedPro();
  const vendorName = prestataireData?.nom_entreprise || "Mon entreprise";

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
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6 sm:py-14">
          <div className="text-center">
            <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-porcelain/60 mx-auto">
              <Calendar className="size-10 text-ink-muted" />
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new":
        return "Nouveau";
      case "sent":
        return "Devis envoyé";
      case "confirmed":
        return "Confirmé";
      default:
        return status;
    }
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
          <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-henna sm:text-xs">
            Espace prestataire
          </p>
          <h1 className="font-heading text-3xl font-medium leading-tight tracking-tight text-ink sm:text-4xl">
            {vendorName}
          </h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-sage">
            <span className="size-2 rounded-full bg-sage" />
            <span>Compte validé</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-10 flex gap-3 border-b border-black/10 pb-4">
          <Link
            href="/pro/dashboard"
            className="rounded-lg bg-henna/10 px-4 py-2 text-sm font-medium text-henna"
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
            className="rounded-lg px-4 py-2 text-sm font-medium text-ink-muted hover:bg-porcelain/60"
          >
            Avis reçus
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-black/10 bg-card p-6">
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-henna/10">
              <MessageSquare className="size-5 text-henna" />
            </div>
            <p className="font-heading text-3xl font-medium text-ink sm:text-4xl">
              {mockDashboardStats.newRequests}
            </p>
            <p className="mt-1 text-sm text-ink-muted">Nouvelles demandes</p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-card p-6">
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-goldSoft/20">
              <Calendar className="size-5 text-goldSoft" />
            </div>
            <p className="font-heading text-3xl font-medium text-ink sm:text-4xl">
              {mockDashboardStats.pendingQuotes}
            </p>
            <p className="mt-1 text-sm text-ink-muted">Devis en attente</p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-card p-6">
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-sage/20">
              <TrendingUp className="size-5 text-sage" />
            </div>
            <p className="font-heading text-3xl font-medium text-ink sm:text-4xl">
              {mockDashboardStats.responseRate}%
            </p>
            <p className="mt-1 text-sm text-ink-muted">Taux de réponse</p>
          </div>
        </div>

        {/* Recent Requests */}
        <div>
          <h2 className="font-heading text-2xl font-medium text-ink sm:text-3xl">
            Demandes récentes
          </h2>
          <p className="mt-1 text-sm text-ink-muted sm:text-base">
            Gérez vos demandes de devis
          </p>

          <div className="mt-6 space-y-4">
            {mockRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-2xl border border-black/10 bg-card p-5 sm:p-6"
              >
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-medium text-ink">
                      {request.clientName}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-sm text-ink-muted">
                      <span>Date souhaitée : {formatDate(request.weddingDate)}</span>
                      <span>•</span>
                      <span>Budget : {formatBudget(request.budget)}</span>
                    </div>
                  </div>
                  <StatusPill
                    variant={request.status}
                    label={getStatusLabel(request.status)}
                  />
                </div>

                <p className="mb-4 text-sm text-ink-muted">
                  {request.message}
                </p>

                <div className="flex gap-3">
                  {request.status === "new" ? (
                    <Button
                      size="sm"
                      className="h-9 rounded-lg bg-henna px-4 hover:bg-henna/90"
                    >
                      Répondre
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-lg border-black/10 px-4 hover:bg-porcelain/60"
                    >
                      Voir l'échange
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
