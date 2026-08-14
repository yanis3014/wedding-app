"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function ProInscriptionPage() {
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    companyName: "",
    category: "",
    city: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (authData.user) {
        // Create the prestataire record
        const { error: dbError } = await supabase
          .from("prestataires")
          .insert({
            id: authData.user.id,
            nom_entreprise: formData.companyName,
            categorie: formData.category,
            ville: formData.city,
            telephone: null,
            tarif_indicatif: null,
            description: null,
            zone_intervention: null,
            statut_validation: "en_attente",
          });

        if (dbError) {
          setError("Erreur lors de la création du profil. Veuillez réessayer.");
          return;
        }

        setIsSuccess(true);
      }
    } catch (err) {
      setError("Une erreur inattendue s'est produite. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col bg-porcelain">
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6 sm:py-14">
          <div className="text-center">
            <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-goldSoft/20 mx-auto">
              <svg
                className="size-10 text-goldSoft"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="font-heading text-3xl font-medium leading-tight tracking-tight text-ink sm:text-4xl">
              Inscription réussie !
            </h1>
            <p className="mt-4 text-sm text-ink-muted sm:text-base">
              Votre compte est en cours de validation, vous recevrez une
              confirmation sous 24-48h.
            </p>
            <a
              href="/pro/connexion"
              className="mt-8 inline-block text-sm font-medium text-henna hover:underline sm:text-base"
            >
              Se connecter →
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-porcelain">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6 sm:py-14">
        <div className="text-center">
          <h1 className="font-heading text-3xl font-medium leading-tight tracking-tight text-ink sm:text-4xl">
            Créer mon compte prestataire
          </h1>
          <p className="mt-2 text-sm text-ink-muted sm:text-base">
            Rejoignez Mon Mariage en tant que prestataire
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="companyName"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Nom de l'entreprise
            </label>
            <input
              type="text"
              id="companyName"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              required
              className="h-10 w-full rounded-lg border border-black/10 bg-porcelain/60 px-3 text-sm text-ink placeholder:text-ink-muted/70 outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Catégorie
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
              className="h-10 w-full rounded-lg border border-black/10 bg-porcelain/60 px-3 text-sm text-ink outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
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
              htmlFor="city"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Ville
            </label>
            <input
              type="text"
              id="city"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              required
              className="h-10 w-full rounded-lg border border-black/10 bg-porcelain/60 px-3 text-sm text-ink placeholder:text-ink-muted/70 outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="h-10 w-full rounded-lg border border-black/10 bg-porcelain/60 px-3 text-sm text-ink placeholder:text-ink-muted/70 outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              minLength={6}
              className="h-10 w-full rounded-lg border border-black/10 bg-porcelain/60 px-3 text-sm text-ink placeholder:text-ink-muted/70 outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="h-11 w-full rounded-xl bg-henna px-6 hover:bg-henna/90 disabled:bg-henna/30 disabled:cursor-not-allowed"
          >
            {loading ? "Création en cours..." : "Créer mon compte"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-ink-muted">Déjà un compte ?</span>{" "}
          <a
            href="/pro/connexion"
            className="font-medium text-henna hover:underline"
          >
            Se connecter
          </a>
        </div>
      </main>
    </div>
  );
}
