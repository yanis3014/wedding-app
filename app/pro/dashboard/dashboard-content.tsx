"use client";

import { Calendar, LogOut, MessageSquare, TrendingUp, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/shared/status-pill";
import { createClient } from "@/lib/supabase/client";

type DashboardContentProps = {
  vendorName: string;
  requests: any[];
  stats: {
    newRequests: number;
    pendingQuotes: number;
    responseRate: number;
  };
};

export default function DashboardContent({ vendorName, requests, stats }: DashboardContentProps) {
  const supabase = createClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [quoteAmount, setQuoteAmount] = useState("");

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "nouveau":
        return "Nouveau";
      case "devis_envoye":
        return "Devis envoyé";
      case "confirme":
        return "Confirmé";
      case "refuse":
        return "Refusé";
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

  const handleOpenModal = (request: any) => {
    setSelectedRequest(request);
    setQuoteAmount(request.devis_montant?.toString() || "");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
    setQuoteAmount("");
  };

  const handleSubmitQuote = async () => {
    if (!selectedRequest || !quoteAmount) return;

    const { error } = await supabase
      .from("demandes")
      .update({
        statut: "devis_envoye",
        devis_montant: parseInt(quoteAmount),
      })
      .eq("id", selectedRequest.id);

    if (error) {
      console.error("Error updating request:", error);
      return;
    }

    handleCloseModal();
    // Reload the page to show updated data
    window.location.reload();
  };

  const getClientName = (request: any) => {
    if (request.clients) {
      const { prenom, nom } = request.clients;
      return `${prenom} ${nom}`.trim();
    }
    return "Client";
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/connexion";
  };

  return (
    <div className="flex min-h-screen flex-col bg-porcelain">
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        {/* Header */}
        <div className="mb-10 flex items-start justify-between">
          <div>
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
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-ink-muted hover:text-ink"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Se déconnecter</span>
          </button>
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
              {stats.newRequests}
            </p>
            <p className="mt-1 text-sm text-ink-muted">Nouvelles demandes</p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-card p-6">
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-goldSoft/20">
              <Calendar className="size-5 text-goldSoft" />
            </div>
            <p className="font-heading text-3xl font-medium text-ink sm:text-4xl">
              {stats.pendingQuotes}
            </p>
            <p className="mt-1 text-sm text-ink-muted">Devis en attente</p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-card p-6">
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-sage/20">
              <TrendingUp className="size-5 text-sage" />
            </div>
            <p className="font-heading text-3xl font-medium text-ink sm:text-4xl">
              {stats.responseRate}%
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
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-black/10 bg-card p-12 text-center">
                <p className="font-heading text-xl font-medium text-ink sm:text-2xl">
                  Aucune demande pour le moment
                </p>
                <p className="mt-2 text-sm text-ink-muted sm:text-base">
                  Vous recevrez des notifications quand des clients vous contacteront
                </p>
              </div>
            ) : (
              requests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl border border-black/10 bg-card p-5 sm:p-6"
                >
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-heading text-lg font-medium text-ink">
                        {getClientName(request)}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-sm text-ink-muted">
                        <span>Date souhaitée : {formatDate(request.date_mariage)}</span>
                        <span>•</span>
                        <span>Budget : {formatBudget(request.budget)}</span>
                      </div>
                    </div>
                    <StatusPill
                      variant={request.statut === "nouveau" ? "new" : request.statut === "devis_envoye" ? "sent" : request.statut}
                      label={getStatusLabel(request.statut)}
                    />
                  </div>

                  <p className="mb-4 text-sm text-ink-muted">
                    {request.message}
                  </p>

                  <div className="flex gap-3">
                    {request.statut === "nouveau" ? (
                      <Button
                        onClick={() => handleOpenModal(request)}
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
              ))
            )}
          </div>
        </div>
      </main>

      {/* Quote Response Modal */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-heading text-xl font-medium text-ink">
                Envoyer un devis
              </h3>
              <button
                onClick={handleCloseModal}
                className="flex size-8 items-center justify-center rounded-full bg-porcelain/60 text-ink-muted hover:bg-porcelain/80"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mb-4 space-y-2">
              <p className="text-sm text-ink-muted">
                <span className="font-medium text-ink">Client :</span> {getClientName(selectedRequest)}
              </p>
              <p className="text-sm text-ink-muted">
                <span className="font-medium text-ink">Budget :</span> {formatBudget(selectedRequest.budget)}
              </p>
            </div>

            <div className="mb-6">
              <label
                htmlFor="quoteAmount"
                className="mb-2 block text-sm font-medium text-ink"
              >
                Montant du devis (DT)
              </label>
              <input
                type="number"
                id="quoteAmount"
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(e.target.value)}
                placeholder="Ex: 1500"
                className="h-11 w-full rounded-xl bg-porcelain/60 px-4 text-sm text-ink placeholder:text-ink-muted/70 outline-none ring-henna/30 focus:ring-2"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSubmitQuote}
                size="lg"
                className="h-11 flex-1 rounded-xl bg-henna px-6 hover:bg-henna/90"
              >
                Envoyer le devis
              </Button>
              <Button
                onClick={handleCloseModal}
                variant="outline"
                size="lg"
                className="h-11 rounded-xl border-black/10 px-6 hover:bg-porcelain/60"
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
