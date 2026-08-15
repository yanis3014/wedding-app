"use client";

import { Users, Calendar, Briefcase, Clock, ArrowRight, AlertTriangle } from "lucide-react";
import Link from "next/link";

import { StatusPill } from "@/components/shared/status-pill";

type DashboardContentProps = {
  kpis: {
    validatedPrestataires: number;
    pendingPrestataires: number;
    totalClients: number;
    demandesThisMonth: number;
  };
  recentPrestataires: any[];
  abonnementsARelancer: number;
};

export default function DashboardContent({ kpis, recentPrestataires, abonnementsARelancer }: DashboardContentProps) {
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

  return (
    <>
      {/* Header */}
      <div className="mb-10">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-henna sm:text-xs">
          Administration
        </p>
        <h1 className="font-heading text-3xl font-medium leading-tight tracking-tight text-ink sm:text-4xl">
          Tableau de bord
        </h1>
      </div>

        {/* KPI Cards */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-black/10 bg-card p-6">
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-sage/20">
              <Briefcase className="size-5 text-sage" />
            </div>
            <p className="font-heading text-3xl font-medium text-ink sm:text-4xl">
              {kpis.validatedPrestataires}
            </p>
            <p className="mt-1 text-sm text-ink-muted">Prestataires validés</p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-card p-6">
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-goldSoft/20">
              <Clock className="size-5 text-goldSoft" />
            </div>
            <p className="font-heading text-3xl font-medium text-ink sm:text-4xl">
              {kpis.pendingPrestataires}
            </p>
            <p className="mt-1 text-sm text-ink-muted">En attente</p>
          </div>

          <Link href="/admin/clients" className="rounded-2xl border border-black/10 bg-card p-6 transition-colors hover:bg-porcelain/60">
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-henna/10">
              <Users className="size-5 text-henna" />
            </div>
            <p className="font-heading text-3xl font-medium text-ink sm:text-4xl">
              {kpis.totalClients}
            </p>
            <p className="mt-1 text-sm text-ink-muted">Clients inscrits</p>
          </Link>

          <div className="rounded-2xl border border-black/10 bg-card p-6">
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-rose/20">
              <Calendar className="size-5 text-rose" />
            </div>
            <p className="font-heading text-3xl font-medium text-ink sm:text-4xl">
              {kpis.demandesThisMonth}
            </p>
            <p className="mt-1 text-sm text-ink-muted">Demandes ce mois</p>
          </div>
        </div>

        {/* Abonnements Alert */}
        {abonnementsARelancer > 0 && (
          <Link
            href="/admin/abonnements"
            className="mb-10 flex items-center gap-4 rounded-2xl border border-henna/30 bg-henna/5 p-6 transition-colors hover:bg-henna/10"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-henna/20">
              <AlertTriangle className="size-6 text-henna" />
            </div>
            <div className="flex-1">
              <p className="font-heading text-lg font-medium text-ink">
                {abonnementsARelancer} abonnement{abonnementsARelancer > 1 ? "s" : ""} à relancer
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                Essai(s) expirant ou déjà expiré(s)
              </p>
            </div>
            <ArrowRight className="size-5 text-henna" />
          </Link>
        )}

        {/* Recent Prestataires Table */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-2xl font-medium text-ink sm:text-3xl">
                Derniers prestataires inscrits
              </h2>
              <p className="mt-1 text-sm text-ink-muted sm:text-base">
                Suivez les nouvelles inscriptions
              </p>
            </div>
            <Link
              href="/admin/prestataires"
              className="flex items-center gap-2 text-sm font-medium text-henna hover:underline sm:text-base"
            >
              Voir tout
              <ArrowRight className="size-4" />
            </Link>
          </div>

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
                </tr>
              </thead>
              <tbody>
                {recentPrestataires.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-sm text-ink-muted"
                    >
                      Aucun prestataire inscrit pour le moment
                    </td>
                  </tr>
                ) : (
                  recentPrestataires.map((prestataire) => (
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
    </>
  );
}
