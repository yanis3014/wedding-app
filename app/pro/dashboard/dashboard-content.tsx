"use client";

import { Calendar, LogOut, MessageSquare, TrendingUp, X, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/shared/status-pill";
import { MessagingModal } from "@/components/shared/messaging-modal";
import { createClient } from "@/lib/supabase/client";

type DashboardContentProps = {
  vendorName: string;
  requests: any[];
  appointmentRequests: any[];
  acceptedAppointments: any[];
  stats: {
    newRequests: number;
    pendingQuotes: number;
    responseRate: number;
  };
};

export default function DashboardContent({ vendorName, requests, appointmentRequests, acceptedAppointments, stats }: DashboardContentProps) {
  const supabase = createClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [isMessagingModalOpen, setIsMessagingModalOpen] = useState(false);
  const [messageCounts, setMessageCounts] = useState<Record<string, number>>({});

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

  // Load message counts for each request
  useEffect(() => {
    const loadMessageCounts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const counts: Record<string, number> = {};
      for (const request of requests) {
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

    if (requests.length > 0) {
      loadMessageCounts();
    }
  }, [requests, supabase]);

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

  const handleOpenMessagingModal = (request: any) => {
    setSelectedRequest(request);
    setIsMessagingModalOpen(true);
  };

  const handleCloseMessagingModal = () => {
    setIsMessagingModalOpen(false);
    setSelectedRequest(null);
  };

  const handleAcceptAppointment = async (appointmentId: string, disponibiliteId: string | null) => {
    try {
      // Update appointment status
      const { error: updateError } = await supabase
        .from("demandes_rdv")
        .update({ statut: "accepte" })
        .eq("id", appointmentId);

      if (updateError) throw updateError;

      // If a disponibilite was selected, mark it as reserved
      if (disponibiliteId) {
        const { error: dispoError } = await supabase
          .from("disponibilites")
          .update({ statut: "reserve" })
          .eq("id", disponibiliteId);

        if (dispoError) throw dispoError;
      }

      // Reload appointment requests
      window.location.reload();
    } catch (error) {
      console.error("Error accepting appointment:", error);
      alert("Erreur lors de l'acceptation du rendez-vous");
    }
  };

  const handleRejectAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from("demandes_rdv")
        .update({ statut: "refuse" })
        .eq("id", appointmentId);

      if (error) throw error;

      // Reload appointment requests
      window.location.reload();
    } catch (error) {
      console.error("Error rejecting appointment:", error);
      alert("Erreur lors du refus du rendez-vous");
    }
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
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 pb-28 sm:px-6 sm:py-14 sm:pb-28">
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
                      variant={request.statut === "nouveau" ? "new" : request.statut === "devis_envoye" ? "sent" : request.statut === "confirme" ? "confirmed" : request.statut === "refuse" ? "refuse" : "pending"}
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
                          Voir l'échange
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Appointment Requests */}
        {appointmentRequests.length > 0 && (
          <div className="mt-10">
            <h2 className="font-heading text-2xl font-medium text-ink sm:text-3xl">
              Demandes de rendez-vous
            </h2>
            <p className="mt-1 text-sm text-ink-muted sm:text-base">
              Répondez aux demandes de rendez-vous
            </p>

            <div className="mt-6 space-y-4">
              {appointmentRequests.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-2xl border border-black/10 bg-card p-5 sm:p-6"
                >
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-heading text-lg font-medium text-ink">
                        {appointment.titre}
                      </h3>
                      <p className="mt-1 text-sm text-ink-muted">
                        {appointment.clients?.prenom || "Client"}
                      </p>
                    </div>
                    <StatusPill
                      variant="pending"
                      label="En attente"
                    />
                  </div>

                  <div className="mb-4 flex flex-col gap-2 text-sm text-ink-muted sm:flex-row sm:gap-4">
                    <span>Date : {new Date(appointment.date_rdv).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Heure : {appointment.heure_rdv}</span>
                    {appointment.lieu && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span>Lieu : {appointment.lieu}</span>
                      </>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleAcceptAppointment(appointment.id, appointment.disponibilite_id)}
                      size="sm"
                      className="h-9 rounded-lg bg-henna px-4 hover:bg-henna/90"
                    >
                      Accepter
                    </Button>
                    <Button
                      onClick={() => handleRejectAppointment(appointment.id)}
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-lg border-black/10 px-4 hover:bg-porcelain/60"
                    >
                      Refuser
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accepted Appointments */}
        {acceptedAppointments.length > 0 && (
          <div className="mt-10">
            <h2 className="font-heading text-2xl font-medium text-ink sm:text-3xl">
              Mes prochains rendez-vous
            </h2>
            <p className="mt-1 text-sm text-ink-muted sm:text-base">
              Vos rendez-vous confirmés
            </p>

            <div className="mt-6 space-y-4">
              {acceptedAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-2xl border border-black/10 bg-card p-5 sm:p-6"
                >
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-heading text-lg font-medium text-ink">
                        {appointment.titre}
                      </h3>
                      <p className="mt-1 text-sm text-ink-muted">
                        {appointment.clients?.prenom || "Client"}
                      </p>
                    </div>
                    <StatusPill
                      variant="confirmed"
                      label="Confirmé"
                    />
                  </div>

                  <div className="mb-4 flex flex-col gap-2 text-sm text-ink-muted sm:flex-row sm:gap-4">
                    <span>Date : {new Date(appointment.date_rdv).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Heure : {appointment.heure_rdv}</span>
                    {appointment.lieu && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span>Lieu : {appointment.lieu}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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

      {/* Messaging Modal */}
      <MessagingModal
        isOpen={isMessagingModalOpen}
        onClose={handleCloseMessagingModal}
        request={selectedRequest}
        userRole="prestataire"
        clientName={selectedRequest ? getClientName(selectedRequest) : undefined}
      />
    </div>
  );
}
