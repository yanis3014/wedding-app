"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

import { VendorCard } from "@/components/vendor/vendor-card";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/shared/site-header";

type HomePageContentProps = {
  prestataires: any[];
  villes: any[];
};

export default function HomePageContent({ prestataires, villes }: HomePageContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedVille, setSelectedVille] = useState<string>("");

  const categories = ["all", ...Array.from(new Set(prestataires.map((p) => p.categorie)))];

  const filteredVendors = prestataires.filter((p) => {
    const categoryMatch = selectedCategory === "all" || p.categorie === selectedCategory;
    const villeMatch = !selectedVille || p.villes?.id === selectedVille;
    return categoryMatch && villeMatch;
  });

  // Transform Supabase data to match VendorCard interface
  const vendorCards = filteredVendors.map((p) => {
    const villeName = p.villes?.nom || "Non localisé";
    const zoneName = p.zones?.nom;
    const location = zoneName ? `${zoneName}, ${villeName}` : villeName;
    
    return {
      id: p.id,
      name: p.nom_entreprise,
      category: p.categorie,
      location: location,
      rating: 4.5, // Default rating for now
      reviewCount: 0, // Will be calculated from avis table later
      price: p.tarif_indicatif || "Sur devis",
    };
  });

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <section className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-henna">
            Votre jour J, sans stress
          </p>
          <h1 className="font-heading text-4xl font-medium leading-tight tracking-tight text-ink sm:text-5xl">
            Trouvez le prestataire idéal pour votre mariage
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-muted sm:text-lg">
            Photographes, traiteurs, lieux de réception… Comparez les avis et
            les tarifs en un seul endroit.
          </p>
        </section>

        <section className="mx-auto mt-10 max-w-3xl">
          <form
            className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-card p-3 sm:flex-row sm:items-center sm:p-2"
            aria-label="Rechercher un prestataire"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
              <input
                type="search"
                placeholder="Photographe, traiteur, lieu…"
                className="h-11 w-full rounded-xl bg-porcelain/60 pl-10 pr-4 text-sm text-ink placeholder:text-ink-muted/70 outline-none ring-henna/30 focus:ring-2"
              />
            </div>
            <select
              value={selectedVille}
              onChange={(e) => setSelectedVille(e.target.value)}
              className="h-11 rounded-xl bg-porcelain/60 px-4 text-sm text-ink outline-none ring-henna/30 focus:ring-2 sm:w-48"
            >
              <option value="">Toutes les villes</option>
              {villes.map((ville) => (
                <option key={ville.id} value={ville.id}>
                  {ville.nom}
                </option>
              ))}
            </select>
            <Button
              type="submit"
              size="lg"
              className="h-11 rounded-xl bg-henna px-6 hover:bg-henna/90"
            >
              Rechercher
            </Button>
          </form>
        </section>

        <section className="mt-14">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-medium text-ink">
                Prestataires populaires
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                Les mieux notés près de chez vous
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-henna text-white"
                      : "bg-porcelain/60 text-ink-muted hover:bg-porcelain/80"
                  }`}
                >
                  {category === "all" ? "Tous" : category}
                </button>
              ))}
            </div>
          </div>

          {vendorCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-black/10 bg-card p-12 text-center">
              <p className="font-heading text-xl font-medium text-ink sm:text-2xl">
                Aucun prestataire disponible pour le moment
              </p>
              <p className="mt-2 text-sm text-ink-muted sm:text-base">
                Revenez bientôt pour découvrir de nouveaux prestataires
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {vendorCards.map((vendor) => (
                <Link key={vendor.id} href={`/prestataire/${vendor.id}`}>
                  <VendorCard vendor={vendor} />
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
