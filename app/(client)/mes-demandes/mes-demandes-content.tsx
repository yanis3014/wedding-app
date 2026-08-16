"use client";

import { ArrowRight, Search } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/shared/status-pill";
import { MessagingModal } from "@/components/shared/messaging-modal";
import { createClient } from "@/lib/supabase/client";

type MesDemandesContentProps = {
  requests: any[];
};

export default function MesDemandesContent({ requests }: MesDemandesContentProps) {
  const supabase = createClient();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [localRequests, setLocalRequests] = useState(requests);
  const [isMessagingModalOpen, setIsMessagingModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [messageCounts, setMessageCounts] = useState<Record<string, number>>({});

  // Load message counts for each request
  useEffect(() => {
    const loadMessageCounts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const counts: Record<string, number> = {};
      for (const request of localRequests) {
        const { data, error } = await supabase
          .from("messages")
          .select("id")
          .eq("demande_id", request.id);
        
        if (!error && data) {
          counts[request.id] = data.length;
        }
      }
      setMessageCounts(counts);
    };

    if (localRequests.length > 0) {
      loadMessageCounts();
    }
  }, [localRequests, supabase]);

  const getStatusLabel = (status: string, quoteAmount?: number) => {
    switch (status) {
      case "nouveau":
        return "En attente";
      case "devis_envoye":
        return quoteAmount ? `Devis reçu (${quoteAmount.toLocaleString("fr-FR")} DT)` : "Devis reçu";
      case "confirme":
        return "Confirmé";
      case "refuse":
        return "Refusé";
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

  const handleConfirm = async (requestId: string) => {
    setUpdatingId(requestId);
    const { error } = await supabase
      .from("demandes")
      .update({ statut: "confirme" })
      .eq("id", requestId);

    if (error) {
      alert(`Erreur lors de la confirmation: ${error.message}`);
    } else {
      // Update local state to reflect the change immediately
      setLocalRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, statut: "confirme" } : req
        )
      );
    }
    setUpdatingId(null);
  };

  const handleReject = async (requestId: string) => {
    setUpdatingId(requestId);
    const { error } = await supabase
      .from("demandes")
      .update({ statut: "refuse" })
      .eq("id", requestId);

    if (error) {
      alert(`Erreur lors du refus: ${error.message}`);
    } else {
      // Update local state to reflect the change immediately
      setLocalRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, statut: "refuse" } : req
        )
      );
    }
    setUpdatingId(null);
  };

  const handleOpenMessagingModal = (request: any) => {
    setSelectedRequest(request);
    setIsMessagingModalOpen(true);
  };

  const handleCloseMessagingModal = () => {
    setIsMessagingModalOpen(false);
    setSelectedRequest(null);
  };

  const isEmpty = localRequests.length === 0;

  // Map real Supabase data to component expectations
  const mappedRequests = localRequests.map((request) => ({
    id: request.id,
    prestataireId: request.prestataire_id,
    vendorName: request.prestataires?.nom_entreprise || "Prestataire",
    vendorCategory: request.prestataires?.categorie || "Service",
    sentDate: request.created_at,
    weddingDate: request.date_mariage,
    budget: request.budget,
    status: request.statut,
    quoteAmount: request.devis_montant,
    message: request.message,
  }));

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
            {mappedRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-2xl border border-black/10 bg-card p-5 sm:p-6"
              >
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
                    variant={request.status === "nouveau" ? "new" : request.status === "devis_envoye" ? "sent" : request.status === "confirme" ? "confirmed" : "refuse"}
                    label={getStatusLabel(request.status, request.quoteAmount)}
                  />
                </div>

                <div className="mb-4 flex flex-col gap-2 text-sm text-ink-muted sm:flex-row sm:gap-4">
                  <span>Envoyé le {formatDate(request.sentDate)}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Date mariage : {formatDate(request.weddingDate)}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Budget : {formatBudget(request.budget)}</span>
                </div>

                {/* Confirm/Reject buttons for devis_envoye */}
                {request.status === "devis_envoye" && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleConfirm(request.id)}
                      disabled={updatingId === request.id}
                      size="sm"
                      className="h-9 rounded-lg bg-henna px-4 hover:bg-henna/90 disabled:bg-henna/30 disabled:cursor-not-allowed"
                    >
                      {updatingId === request.id ? "Confirmation..." : "Confirmer"}
                    </Button>
                    <Button
                      onClick={() => handleReject(request.id)}
                      disabled={updatingId === request.id}
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-lg border-black/10 px-4 hover:bg-porcelain/60 disabled:cursor-not-allowed"
                    >
                      {updatingId === request.id ? "Rejet..." : "Refuser"}
                    </Button>
                  </div>
                )}

                {/* View conversation button for confirmed requests */}
                {request.status === "confirme" && (
                  <div className="flex items-center gap-2">
                    {messageCounts[request.id] > 0 && (
                      <span className="flex size-2 items-center justify-center rounded-full bg-henna text-[10px] text-white">
                        {messageCounts[request.id]}
                      </span>
                    )}
                    <Button
                      onClick={() => handleOpenMessagingModal(request)}
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-lg border-black/10 px-4 hover:bg-porcelain/60"
                    >
                      Voir la conversation
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Messaging Modal */}
      <MessagingModal
        isOpen={isMessagingModalOpen}
        onClose={handleCloseMessagingModal}
        request={selectedRequest}
        userRole="client"
        prestataireName={selectedRequest ? selectedRequest.vendorName : undefined}
      />
    </div>
  );
}
