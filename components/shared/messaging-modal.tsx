"use client";

import { X, Calendar, Plus } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type MessagingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  userRole: "client" | "prestataire";
  clientName?: string;
  prestataireName?: string;
};

export function MessagingModal({ 
  isOpen, 
  onClose, 
  request, 
  userRole,
  clientName,
  prestataireName 
}: MessagingModalProps) {
  const supabase = createClient();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [disponibilites, setDisponibilites] = useState<any[]>([]);
  const [selectedDispo, setSelectedDispo] = useState<string | null>(null);
  const [customAppointment, setCustomAppointment] = useState({ titre: "", date_rdv: "", heure_rdv: "", lieu: "" });

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

  // Load messages when modal opens
  useEffect(() => {
    if (isOpen && request) {
      loadMessages();
      loadDisponibilites();
    }
  }, [isOpen, request]);

  const loadMessages = async () => {
    if (!request) return;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("demande_id", request.id)
      .order("created_at", { ascending: true });
    
    if (error) {
      console.error("Error loading messages:", error);
    } else {
      setMessages(data || []);
    }
  };

  const loadDisponibilites = async () => {
    if (!request) return;

    const { data, error } = await supabase
      .from("disponibilites")
      .select("*")
      .eq("prestataire_id", request.prestataire_id)
      .eq("statut", "disponible")
      .order("date_dispo", { ascending: true });
    
    if (error) {
      console.error("Error loading disponibilités:", error);
    } else {
      setDisponibilites(data || []);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !request) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setIsSendingMessage(true);

    const { error } = await supabase
      .from("messages")
      .insert({
        demande_id: request.id,
        auteur_id: user.id,
        auteur_role: userRole,
        contenu: newMessage.trim(),
      });

    if (error) {
      console.error("Error sending message:", error);
      alert("Erreur lors de l'envoi du message");
    } else {
      // Reload messages
      await loadMessages();
      setNewMessage("");
    }

    setIsSendingMessage(false);
  };

  const handleRequestAppointment = async () => {
    if (!request) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase
        .from("demandes_rdv")
        .insert({
          demande_id: request.id,
          client_id: user.id,
          prestataire_id: request.prestataire_id,
          disponibilite_id: selectedDispo,
          titre: selectedDispo ? "Rendez-vous sur créneau disponible" : customAppointment.titre,
          date_rdv: selectedDispo ? disponibilites.find(d => d.id === selectedDispo)?.date_dispo : customAppointment.date_rdv,
          heure_rdv: selectedDispo ? disponibilites.find(d => d.id === selectedDispo)?.heure_debut : customAppointment.heure_rdv,
          lieu: customAppointment.lieu || null,
          statut: "en_attente",
        });

      if (error) throw error;

      alert("Demande de rendez-vous envoyée !");
      setShowAppointmentForm(false);
      setSelectedDispo(null);
      setCustomAppointment({ titre: "", date_rdv: "", heure_rdv: "", lieu: "" });
    } catch (error) {
      console.error("Error requesting appointment:", error);
      alert("Erreur lors de la demande de rendez-vous");
    }
  };

  if (!isOpen || !request) return null;

  const otherPartyName = userRole === "client" ? prestataireName : clientName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-card p-6 sm:p-8 max-h-[80vh] flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-xl font-medium text-ink">
            Conversation avec {otherPartyName || "Partenaire"}
          </h3>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-porcelain/60 text-ink-muted hover:bg-porcelain/80"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mb-4 space-y-2 text-sm">
          <p className="text-ink-muted">
            <span className="font-medium text-ink">Date souhaitée :</span> {formatDate(request.date_mariage)}
          </p>
          <p className="text-ink-muted">
            <span className="font-medium text-ink">Budget :</span> {formatBudget(request.budget)}
          </p>
          {request.devis_montant && (
            <p className="text-ink-muted">
              <span className="font-medium text-ink">Devis envoyé :</span> {request.devis_montant.toLocaleString("fr-FR")} DT
            </p>
          )}
        </div>

        {/* Appointment Request Section (only for clients) */}
        {userRole === "client" && !showAppointmentForm && (
          <div className="mb-4">
            <Button
              onClick={() => setShowAppointmentForm(true)}
              variant="outline"
              size="sm"
              className="w-full h-9 rounded-lg border-black/10 px-4 hover:bg-porcelain/60"
            >
              <Calendar className="mr-2 size-4" />
              Demander un rendez-vous
            </Button>
          </div>
        )}

        {/* Appointment Form */}
        {showAppointmentForm && (
          <div className="mb-4 rounded-xl bg-porcelain/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-medium text-ink">Demander un rendez-vous</h4>
              <button
                onClick={() => setShowAppointmentForm(false)}
                className="flex size-6 items-center justify-center rounded-full text-ink-muted hover:bg-porcelain/60"
              >
                <X className="size-4" />
              </button>
            </div>

            {disponibilites.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-sm font-medium text-ink">Créneaux disponibles :</p>
                <div className="space-y-2">
                  {disponibilites.map((dispo) => (
                    <button
                      key={dispo.id}
                      onClick={() => setSelectedDispo(dispo.id)}
                      className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                        selectedDispo === dispo.id
                          ? 'border-henna bg-henna/10'
                          : 'border-black/10 bg-porcelain/60 hover:border-henna/50'
                      }`}
                    >
                      <Calendar className="size-4 text-henna" />
                      <div>
                        <p className="text-sm font-medium text-ink">
                          {new Date(dispo.date_dispo).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-ink-muted">
                          {dispo.heure_debut} - {dispo.heure_fin}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4 text-center text-sm text-ink-muted">
              — ou proposer votre propre créneau —
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Titre du rendez-vous"
                value={customAppointment.titre}
                onChange={(e) => setCustomAppointment({ ...customAppointment, titre: e.target.value })}
                className="h-10 w-full rounded-lg border border-black/10 bg-porcelain/60 px-3 text-sm text-ink placeholder:text-ink-muted/70 outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="date"
                  value={customAppointment.date_rdv}
                  onChange={(e) => setCustomAppointment({ ...customAppointment, date_rdv: e.target.value })}
                  className="h-10 w-full rounded-lg border border-black/10 bg-porcelain/60 px-3 text-sm text-ink outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
                />
                <input
                  type="time"
                  value={customAppointment.heure_rdv}
                  onChange={(e) => setCustomAppointment({ ...customAppointment, heure_rdv: e.target.value })}
                  className="h-10 w-full rounded-lg border border-black/10 bg-porcelain/60 px-3 text-sm text-ink outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
                />
              </div>
              <input
                type="text"
                placeholder="Lieu (optionnel)"
                value={customAppointment.lieu}
                onChange={(e) => setCustomAppointment({ ...customAppointment, lieu: e.target.value })}
                className="h-10 w-full rounded-lg border border-black/10 bg-porcelain/60 px-3 text-sm text-ink placeholder:text-ink-muted/70 outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
              />
            </div>

            <div className="mt-4 flex gap-3">
              <Button
                onClick={handleRequestAppointment}
                size="sm"
                className="h-9 rounded-lg bg-henna px-4 hover:bg-henna/90"
              >
                Envoyer la demande
              </Button>
              <button
                onClick={() => setShowAppointmentForm(false)}
                className="h-9 rounded-lg border border-black/10 px-4 text-sm font-medium text-ink-muted hover:bg-porcelain/60"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-3 max-h-60">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-ink-muted py-4">
              Aucun message pour le moment
            </p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.auteur_role === userRole ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.auteur_role === userRole
                      ? 'bg-henna text-white'
                      : 'bg-porcelain/60 text-ink'
                  }`}
                >
                  <p className="text-sm">{message.contenu}</p>
                  <p className="text-[10px] opacity-70 mt-1">
                    {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1 h-10 rounded-lg border border-black/10 bg-porcelain/60 px-3 text-sm text-ink placeholder:text-ink-muted/70 outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSendingMessage}
            size="sm"
            className="h-10 rounded-lg bg-henna px-4 hover:bg-henna/90 disabled:bg-henna/30 disabled:cursor-not-allowed"
          >
            {isSendingMessage ? "..." : "Envoyer"}
          </Button>
        </div>
      </div>
    </div>
  );
}
