"use client";

import { Check, Clock, LogOut, Plus, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type ProfilFormProps = {
  prestataireData: any;
};

export default function ProfilForm({ prestataireData }: ProfilFormProps) {
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    category: prestataireData?.categorie || "",
    location: prestataireData?.zone_intervention || "",
    price: prestataireData?.tarif_indicatif || "",
    description: prestataireData?.description || "",
  });
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No user found");
      return;
    }

    const { error } = await supabase
      .from("prestataires")
      .update({
        categorie: formData.category,
        zone_intervention: formData.location,
        tarif_indicatif: formData.price || null,
        description: formData.description || null,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error saving profile:", error);
      return;
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/connexion";
  };

  const isAccountValidated = prestataireData?.statut_validation === "valide";

  return (
    <div className="flex min-h-screen flex-col bg-porcelain">
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        {/* Cover Banner */}
        <div className="relative mb-16 h-[200px] w-full overflow-hidden rounded-2xl sm:h-[280px]">
          <div className="absolute inset-0 bg-gradient-to-br from-henna to-rose" />
        </div>

        {/* Navigation */}
        <div className="mb-10 flex gap-3 border-b border-black/10 pb-4">
          <Link
            href="/pro/dashboard"
            className="rounded-lg px-4 py-2 text-sm font-medium text-ink-muted hover:bg-porcelain/60"
          >
            Tableau de bord
          </Link>
          <Link
            href="/pro/profil"
            className="rounded-lg bg-henna/10 px-4 py-2 text-sm font-medium text-henna"
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

        {/* Avatar with overlapping position */}
        <div className="relative -mt-24 mb-6 flex flex-col items-center sm:-mt-28 sm:flex-row sm:items-end sm:gap-6">
          <div className="relative size-24 shrink-0 overflow-hidden rounded-full border-4 border-white bg-porcelain sm:size-32">
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-henna/20 to-rose/20">
              <User className="size-12 text-ink-muted sm:size-16" />
            </div>
          </div>

          <div className="mt-4 text-center sm:mt-0 sm:text-left">
            <h1 className="font-heading text-2xl font-medium leading-tight tracking-tight text-ink sm:text-3xl">
              {prestataireData?.nom_entreprise || "Mon entreprise"}
            </h1>
            <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
              {isAccountValidated ? (
                <div className="flex items-center gap-1.5 rounded-full bg-sage/20 px-3 py-1 text-xs font-medium text-sage">
                  <Check className="size-3.5" />
                  <span>Profil validé</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 rounded-full bg-goldSoft/20 px-3 py-1 text-xs font-medium text-goldSoft">
                  <Clock className="size-3.5" />
                  <span>En attente de validation</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium text-ink"
            >
              Catégorie
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="h-11 w-full rounded-xl bg-porcelain/60 px-4 text-sm text-ink outline-none ring-henna/30 focus:ring-2"
            >
              <option value="">Sélectionnez une catégorie</option>
              <option value="Photographe">Photographe</option>
              <option value="Traiteur">Traiteur</option>
              <option value="Salle des fêtes">Salle des fêtes</option>
              <option value="DJ/Musique">DJ/Musique</option>
              <option value="Fleuriste">Fleuriste</option>
              <option value="Traditionnel">Traditionnel</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="location"
              className="mb-2 block text-sm font-medium text-ink"
            >
              Zone d'intervention
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="h-11 w-full rounded-xl bg-porcelain/60 px-4 text-sm text-ink placeholder:text-ink-muted/70 outline-none ring-henna/30 focus:ring-2"
            />
          </div>

          <div>
            <label
              htmlFor="price"
              className="mb-2 block text-sm font-medium text-ink"
            >
              Tarif indicatif
            </label>
            <input
              type="text"
              id="price"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="à partir de X DT"
              className="h-11 w-full rounded-xl bg-porcelain/60 px-4 text-sm text-ink placeholder:text-ink-muted/70 outline-none ring-henna/30 focus:ring-2"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-ink"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full rounded-xl bg-porcelain/60 px-4 py-3 text-sm text-ink outline-none ring-henna/30 focus:ring-2"
            />
          </div>

          {/* Portfolio Section */}
          <div>
            <h2 className="font-heading text-xl font-medium text-ink sm:text-2xl">
              Portfolio
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Ajoutez vos meilleures réalisations
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {[1, 2, 3, 4, 5].map((index) => (
                <div
                  key={index}
                  className="aspect-square rounded-xl bg-gradient-to-br from-rose/20 to-goldSoft/20"
                />
              ))}
              <button
                type="button"
                className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-black/10 bg-porcelain/40 text-ink-muted transition-colors hover:border-henna/50 hover:text-henna"
              >
                <Plus className="size-6" />
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button
              onClick={handleSave}
              size="lg"
              className="h-12 w-full rounded-xl bg-henna px-6 hover:bg-henna/90"
            >
              {isSaved ? "Profil enregistré !" : "Enregistrer le profil"}
            </Button>
          </div>

          {/* Logout Link */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 text-sm text-ink-muted hover:text-ink"
            >
              <LogOut className="size-4" />
              Se déconnecter
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
