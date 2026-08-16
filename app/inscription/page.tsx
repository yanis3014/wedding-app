"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function InscriptionPage() {
  const supabase = createClient();
  
  const [role, setRole] = useState<"client" | "prestataire">("client");
  const [trialMonths, setTrialMonths] = useState<number>(3);
  const [clientFormData, setClientFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [prestataireFormData, setPrestataireFormData] = useState({
    companyName: "",
    category: "",
    ville_id: "",
    zone_id: "",
    email: "",
    password: "",
  });
  const [villes, setVilles] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Load villes on mount
  useEffect(() => {
    const loadVilles = async () => {
      const { data, error } = await supabase
        .from("villes")
        .select("*")
        .order("nom");
      console.log("Villes fetch result:", { data, error });
      if (data) setVilles(data);
    };
    loadVilles();
  }, [supabase]);

  // Load zones when a ville is selected
  useEffect(() => {
    if (prestataireFormData.ville_id) {
      const loadZones = async () => {
        const { data } = await supabase
          .from("zones")
          .select("*")
          .eq("ville_id", prestataireFormData.ville_id)
          .order("nom");
        if (data) setZones(data);
      };
      loadZones();
    } else {
      setZones([]);
    }
  }, [prestataireFormData.ville_id, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = role === "client" ? clientFormData : prestataireFormData;

      // Sign up the user with role in metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: role,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (authData.user) {
        if (role === "client") {
          // Create the client record
          const { error: dbError } = await supabase
            .from("clients")
            .insert({
              id: authData.user.id,
              prenom: clientFormData.firstName,
              nom: clientFormData.lastName,
              partenaire_prenom: null,
              partenaire_nom: null,
              telephone: null,
              date_mariage: null,
              lieu_souhaite: null,
            });

          if (dbError) {
            setError("Erreur lors de la création du profil. Veuillez réessayer.");
            return;
          }

          // Redirect to home page
          window.location.href = "/";
        } else {
          // Read configuration for trial duration
          const { data: config } = await supabase
            .from("configuration")
            .select("duree_essai_mois")
            .eq("id", 1)
            .single();

          const trialMonths = config?.duree_essai_mois || 3;
          const trialEndDate = new Date();
          trialEndDate.setMonth(trialEndDate.getMonth() + trialMonths);

          // Create the prestataire record
          const { error: dbError } = await supabase
            .from("prestataires")
            .insert({
              id: authData.user.id,
              nom_entreprise: prestataireFormData.companyName,
              categorie: prestataireFormData.category,
              ville_id: prestataireFormData.ville_id,
              zone_id: prestataireFormData.zone_id || null,
              telephone: null,
              tarif_indicatif: null,
              description: null,
              zone_intervention: null,
              statut_validation: "en_attente",
              abonnement_statut: "essai",
              essai_fin_date: trialEndDate.toISOString(),
            });

          if (dbError) {
            console.error("Prestataire insert error:", dbError);
            setError(`Erreur lors de la création du profil: ${dbError.message}`);
            return;
          }

          setIsSuccess(true);
          setTrialMonths(trialMonths);
        }
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
            <p className="mt-3 text-sm text-goldSoft sm:text-base">
              Vous bénéficiez de {trialMonths} mois d'essai gratuit à partir de votre validation. Le tarif de votre abonnement vous sera communiqué prochainement.
            </p>
            <a
              href="/connexion"
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
            Créer un compte
          </h1>
          <p className="mt-2 text-sm text-ink-muted sm:text-base">
            Rejoignez Mon Mariage
          </p>
        </div>

        {/* Role Toggle */}
        <div className="mt-8">
          <div className="flex rounded-xl border border-black/10 bg-card p-1">
            <button
              type="button"
              onClick={() => setRole("client")}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                role === "client"
                  ? "bg-henna text-white"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Je suis un client
            </button>
            <button
              type="button"
              onClick={() => setRole("prestataire")}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                role === "prestataire"
                  ? "bg-henna text-white"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Je suis un prestataire
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {role === "client" ? (
            <>
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-1.5 block text-sm font-medium text-ink"
                >
                  Prénom
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={clientFormData.firstName}
                  onChange={(e) =>
                    setClientFormData({ ...clientFormData, firstName: e.target.value })
                  }
                  required
                  className="h-10 w-full rounded-lg border border-black/10 bg-porcelain/60 px-3 text-sm text-ink placeholder:text-ink-muted/70 outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="mb-1.5 block text-sm font-medium text-ink"
                >
                  Nom
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={clientFormData.lastName}
                  onChange={(e) =>
                    setClientFormData({ ...clientFormData, lastName: e.target.value })
                  }
                  required
                  className="h-10 w-full rounded-lg border border-black/10 bg-porcelain/60 px-3 text-sm text-ink placeholder:text-ink-muted/70 outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
                />
              </div>
            </>
          ) : (
            <>
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
                  value={prestataireFormData.companyName}
                  onChange={(e) =>
                    setPrestataireFormData({ ...prestataireFormData, companyName: e.target.value })
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
                <div className="relative">
                  <select
                    id="category"
                    value={prestataireFormData.category}
                    onChange={(e) =>
                      setPrestataireFormData({ ...prestataireFormData, category: e.target.value })
                    }
                    required
                    className="h-10 w-full appearance-none rounded-lg border border-black/10 bg-porcelain/60 px-3 pr-10 text-sm text-ink outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
                  >
                    <option value="">Sélectionnez une catégorie</option>
                    <option value="Photographe">Photographe</option>
                    <option value="Traiteur">Traiteur</option>
                    <option value="Salle des fêtes">Salle des fêtes</option>
                    <option value="DJ/Musique">DJ/Musique</option>
                    <option value="Fleuriste">Fleuriste</option>
                    <option value="Traditionnel">Traditionnel</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="ville"
                  className="mb-1.5 block text-sm font-medium text-ink"
                >
                  Ville
                </label>
                <div className="relative">
                  <select
                    id="ville"
                    value={prestataireFormData.ville_id}
                    onChange={(e) => {
                      setPrestataireFormData({ 
                        ...prestataireFormData, 
                        ville_id: e.target.value,
                        zone_id: "" // Reset zone when ville changes
                      });
                    }}
                    required
                    className="h-10 w-full appearance-none rounded-lg border border-black/10 bg-porcelain/60 px-3 pr-10 text-sm text-ink outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
                  >
                    <option value="">Sélectionnez une ville</option>
                    {villes.map((ville) => (
                      <option key={ville.id} value={ville.id}>
                        {ville.nom}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
                </div>
              </div>

              {prestataireFormData.ville_id && (
                <div>
                  <label
                    htmlFor="zone"
                    className="mb-1.5 block text-sm font-medium text-ink"
                  >
                    Zone (optionnel)
                  </label>
                  <div className="relative">
                    <select
                      id="zone"
                      value={prestataireFormData.zone_id}
                      onChange={(e) =>
                        setPrestataireFormData({ ...prestataireFormData, zone_id: e.target.value })
                      }
                      className="h-10 w-full appearance-none rounded-lg border border-black/10 bg-porcelain/60 px-3 pr-10 text-sm text-ink outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
                    >
                      <option value="">Sélectionnez une zone</option>
                      {zones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.nom}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
                  </div>
                </div>
              )}
            </>
          )}

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
              value={role === "client" ? clientFormData.email : prestataireFormData.email}
              onChange={(e) =>
                role === "client"
                  ? setClientFormData({ ...clientFormData, email: e.target.value })
                  : setPrestataireFormData({ ...prestataireFormData, email: e.target.value })
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
              value={role === "client" ? clientFormData.password : prestataireFormData.password}
              onChange={(e) =>
                role === "client"
                  ? setClientFormData({ ...clientFormData, password: e.target.value })
                  : setPrestataireFormData({ ...prestataireFormData, password: e.target.value })
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
            href="/connexion"
            className="font-medium text-henna hover:underline"
          >
            Se connecter
          </a>
        </div>
      </main>
    </div>
  );
}
