"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/shared/status-pill";
import { createClient } from "@/lib/supabase/client";

type AbonnementsContentProps = {
  prestataires: any[];
  statusFilter: string;
  tarifMensuel: number | null;
};

export default function AbonnementsContent({
  prestataires,
  statusFilter,
  tarifMensuel,
}: AbonnementsContentProps) {
  const supabase = createClient();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPrestataire, setSelectedPrestataire] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("D17");
  const [loading, setLoading] = useState(false);
  const [editTarifOpen, setEditTarifOpen] = useState(false);
  const [newTarif, setNewTarif] = useState("");

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "essai":
        return "pending";
      case "actif":
        return "confirmed";
      case "expire":
        return "refuse";
      case "suspendu":
        return "suspended";
      default:
        return "new";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "essai":
        return "Essai";
      case "actif":
        return "Actif";
      case "expire":
        return "Expiré";
      case "suspendu":
        return "Suspendu";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getNextDateLabel = (prestataire: any) => {
    if (prestataire.abonnement_statut === "essai") {
      return `Fin essai: ${formatDate(prestataire.essai_fin_date)}`;
    } else if (prestataire.abonnement_statut === "actif") {
      return `Prochaine échéance: ${formatDate(prestataire.prochaine_echeance)}`;
    } else if (prestataire.abonnement_statut === "expire") {
      return `Expiré depuis: ${formatDate(prestataire.prochaine_echeance)}`;
    }
    return "-";
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrestataire || !paymentAmount) return;

    setLoading(true);
    try {
      // Insert payment
      const { error: paymentError } = await supabase.from("paiements").insert({
        prestataire_id: selectedPrestataire.id,
        montant: parseFloat(paymentAmount),
        methode: paymentMethod,
        date_paiement: new Date().toISOString(),
      });

      if (paymentError) {
        console.error("Error inserting payment:", paymentError);
        return;
      }

      // Update prestataire subscription status
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const { error: updateError } = await supabase
        .from("prestataires")
        .update({
          abonnement_statut: "actif",
          derniere_echeance: today.toISOString(),
          prochaine_echeance: nextMonth.toISOString(),
        })
        .eq("id", selectedPrestataire.id);

      if (updateError) {
        console.error("Error updating prestataire:", updateError);
        return;
      }

      // Close modal and reload
      setPaymentModalOpen(false);
      setSelectedPrestataire(null);
      setPaymentAmount("");
      setPaymentMethod("D17");
      window.location.reload();
    } catch (error) {
      console.error("Error processing payment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (prestataireId: string) => {
    const { error } = await supabase
      .from("prestataires")
      .update({ abonnement_statut: "suspendu" })
      .eq("id", prestataireId);

    if (error) {
      console.error("Error suspending prestataire:", error);
      return;
    }
    window.location.reload();
  };

  const handleReactivate = async (prestataireId: string) => {
    const { error } = await supabase
      .from("prestataires")
      .update({ abonnement_statut: "actif" })
      .eq("id", prestataireId);

    if (error) {
      console.error("Error reactivating prestataire:", error);
      return;
    }
    window.location.reload();
  };

  const handleUpdateTarif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTarif) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("configuration")
        .update({ tarif_mensuel: parseFloat(newTarif) })
        .eq("id", 1);

      if (error) {
        console.error("Error updating tariff:", error);
        return;
      }

      setEditTarifOpen(false);
      setNewTarif("");
      window.location.reload();
    } catch (error) {
      console.error("Error updating tariff:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "essai", label: "Essai" },
    { id: "actif", label: "Actifs" },
    { id: "expire", label: "Expirés" },
    { id: "suspendu", label: "Suspendus" },
  ];

  return (
    <>
      {/* Header */}
      <div className="mb-10">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-henna sm:text-xs">
          Administration
        </p>
        <h1 className="font-heading text-3xl font-medium leading-tight tracking-tight text-ink sm:text-4xl">
          Abonnements
        </h1>
        <p className="mt-2 text-sm text-ink-muted sm:text-base">
          Gérez les abonnements des prestataires
        </p>
      </div>

      {/* Tarif Display */}
      <div className="mb-6 flex items-center justify-between rounded-xl border border-black/10 bg-card p-4">
        <div>
          <p className="text-sm font-medium text-ink">Tarif mensuel actuel</p>
          <p className="mt-1 text-lg font-heading font-medium text-ink">
            {tarifMensuel ? `${tarifMensuel} DT/mois` : "Non défini"}
          </p>
        </div>
        <Button
          onClick={() => setEditTarifOpen(true)}
          variant="outline"
          size="sm"
          className="h-9 rounded-lg border-black/10 px-4 hover:bg-porcelain/60"
        >
          Modifier
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 border-b border-black/10">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={`/admin/abonnements?status=${tab.id}`}
            className={`border-b-2 pb-3 text-sm font-medium transition-colors sm:text-base ${
              statusFilter === tab.id
                ? "border-henna text-henna"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-card">
        <table className="w-full">
          <thead className="border-b border-black/10 bg-porcelain/30">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-ink">
                Entreprise
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-ink">
                Catégorie
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-ink">
                Statut abonnement
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-ink">
                Échéance
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-ink">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {prestataires.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm text-ink-muted"
                >
                  Aucun prestataire trouvé
                </td>
              </tr>
            ) : (
              prestataires.map((prestataire) => (
                <tr
                  key={prestataire.id}
                  className="border-b border-black/10 last:border-0"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-ink">
                      {prestataire.nom_entreprise}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-muted">
                    {prestataire.categorie}
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill
                      variant={getStatusVariant(prestataire.abonnement_statut)}
                      label={getStatusLabel(prestataire.abonnement_statut)}
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-muted">
                    {getNextDateLabel(prestataire)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setSelectedPrestataire(prestataire);
                          setPaymentModalOpen(true);
                        }}
                        size="sm"
                        className="h-8 rounded-lg bg-sage px-3 hover:bg-sage/90"
                      >
                        <CreditCard className="size-4" />
                      </Button>
                      {prestataire.abonnement_statut === "actif" && (
                        <Button
                          onClick={() => handleSuspend(prestataire.id)}
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-lg border-black/10 px-3 hover:bg-porcelain/60"
                        >
                          <Pause className="size-4" />
                        </Button>
                      )}
                      {prestataire.abonnement_statut === "suspendu" && (
                        <Button
                          onClick={() => handleReactivate(prestataire.id)}
                          size="sm"
                          className="h-8 rounded-lg bg-sage px-3 hover:bg-sage/90"
                        >
                          <Play className="size-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {paymentModalOpen && selectedPrestataire && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-card p-6">
            <h2 className="font-heading text-2xl font-medium text-ink">
              Enregistrer un paiement
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              {selectedPrestataire.nom_entreprise}
            </p>

            <form onSubmit={handlePayment} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Montant (€)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                  className="h-10 w-full rounded-lg border border-black/10 bg-porcelain/60 px-3 text-sm text-ink outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Méthode de paiement
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-10 w-full rounded-lg border border-black/10 bg-porcelain/60 px-3 text-sm text-ink outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
                >
                  <option value="D17">D17</option>
                  <option value="Virement">Virement</option>
                  <option value="Espèces">Espèces</option>
                  <option value="Chèque">Chèque</option>
                </select>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPaymentModalOpen(false);
                    setSelectedPrestataire(null);
                    setPaymentAmount("");
                    setPaymentMethod("D17");
                  }}
                  className="flex-1 h-11 rounded-xl border-black/10"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-11 rounded-xl bg-henna px-6 hover:bg-henna/90 disabled:bg-henna/30 disabled:cursor-not-allowed"
                >
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tarif Modal */}
      {editTarifOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-card p-6">
            <h2 className="font-heading text-2xl font-medium text-ink">
              Modifier le tarif mensuel
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Ce tarif s'applique immédiatement à tous les prestataires actifs et en essai.
            </p>

            <form onSubmit={handleUpdateTarif} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Tarif mensuel (DT)
                </label>
                <input
                  type="number"
                  value={newTarif}
                  onChange={(e) => setNewTarif(e.target.value)}
                  required
                  className="h-10 w-full rounded-lg border border-black/10 bg-porcelain/60 px-3 text-sm text-ink outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditTarifOpen(false);
                    setNewTarif("");
                  }}
                  className="flex-1 h-11 rounded-xl border-black/10"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-11 rounded-xl bg-henna px-6 hover:bg-henna/90 disabled:bg-henna/30 disabled:cursor-not-allowed"
                >
                  {loading ? "Modification..." : "Modifier"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
