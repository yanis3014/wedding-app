"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/shared/status-pill";
import { createClient } from "@/lib/supabase/client";

type PrestatairesContentProps = {
  prestataires: any[];
  statusFilter: string;
};

export default function PrestatairesContent({
  prestataires,
  statusFilter,
}: PrestatairesContentProps) {
  const supabase = createClient();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "valide":
        return "confirmed";
      case "en_attente":
        return "pending";
      case "rejete":
        return "refuse";
      default:
        return "new";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "valide":
        return "Validé";
      case "en_attente":
        return "En attente";
      case "rejete":
        return "Rejeté";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleApprove = async (prestataireId: string) => {
    setUpdatingId(prestataireId);
    const { error } = await supabase
      .from("prestataires")
      .update({ statut_validation: "valide" })
      .eq("id", prestataireId);

    if (error) {
      console.error("Error approving prestataire:", error);
    }
    setUpdatingId(null);
    window.location.reload();
  };

  const handleReject = async (prestataireId: string) => {
    setUpdatingId(prestataireId);
    const { error } = await supabase
      .from("prestataires")
      .update({ statut_validation: "rejete" })
      .eq("id", prestataireId);

    if (error) {
      console.error("Error rejecting prestataire:", error);
    }
    setUpdatingId(null);
    window.location.reload();
  };

  const tabs = [
    { id: "en_attente", label: "En attente" },
    { id: "valide", label: "Validés" },
    { id: "rejete", label: "Rejetés" },
  ];

  return (
    <>
      {/* Header */}
      <div className="mb-10">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-henna sm:text-xs">
          Administration
        </p>
        <h1 className="font-heading text-3xl font-medium leading-tight tracking-tight text-ink sm:text-4xl">
          Prestataires
        </h1>
        <p className="mt-2 text-sm text-ink-muted sm:text-base">
          Gérez la validation des prestataires
        </p>
      </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 border-b border-black/10">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={`/admin/prestataires?status=${tab.id}`}
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
                  Ville
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-ink">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-ink">
                  Date
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
                    colSpan={6}
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
                    <td className="px-6 py-4 text-sm text-ink-muted">
                      {prestataire.zones?.nom ? `${prestataire.zones.nom}, ` : ""}
                      {prestataire.villes?.nom || "Non localisé"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill
                        variant={getStatusVariant(prestataire.statut_validation)}
                        label={getStatusLabel(prestataire.statut_validation)}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-muted">
                      {formatDate(prestataire.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      {prestataire.statut_validation === "en_attente" ? (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApprove(prestataire.id)}
                            disabled={updatingId === prestataire.id}
                            size="sm"
                            className="h-8 rounded-lg bg-sage px-3 hover:bg-sage/90 disabled:bg-sage/30 disabled:cursor-not-allowed"
                          >
                            <Check className="size-4" />
                          </Button>
                          <Button
                            onClick={() => handleReject(prestataire.id)}
                            disabled={updatingId === prestataire.id}
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg border-black/10 px-3 hover:bg-porcelain/60 disabled:cursor-not-allowed"
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-ink-muted">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
    </>
  );
}
