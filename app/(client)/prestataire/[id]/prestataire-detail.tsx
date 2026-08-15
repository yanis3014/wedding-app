"use client";

import { ArrowLeft, MapPin, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/shared/site-header";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/auth-client";

type TabType = "portfolio" | "reviews" | "pricing";

type PrestataireDetailProps = {
  vendor: any;
  reviews: any[];
};

export default function PrestataireDetail({ vendor, reviews }: PrestataireDetailProps) {
  const router = useRouter();
  const supabase = createClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>("portfolio");
  const [formData, setFormData] = useState({
    weddingDate: "",
    budget: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!isAuthenticated) {
        setIsCheckingRole(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.role === "client") {
        setIsClient(true);
      }
      setIsCheckingRole(false);
    };

    checkUserRole();
  }, [isAuthenticated, supabase]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.weddingDate) {
      newErrors.weddingDate = "La date du mariage est requise";
    }
    if (!formData.budget) {
      newErrors.budget = "Le budget estimé est requis";
    }
    if (!formData.message) {
      newErrors.message = "Le message est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !isClient) {
      // Redirect to login with intent
      router.push(`/connexion?redirect=/prestataire/${vendor.id}`);
      return;
    }

    if (validateForm()) {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/connexion");
        return;
      }

      const { error } = await supabase.from("demandes").insert({
        client_id: user.id,
        prestataire_id: vendor.id,
        date_mariage: formData.weddingDate,
        budget: formData.budget,
        message: formData.message,
        statut: "nouveau",
      });

      if (error) {
        console.error("Error creating request:", error);
        return;
      }

      setIsSubmitted(true);
    }
  };

  // Mock portfolio data (will be connected later)
  const portfolio = [1, 2, 3, 4, 5, 6];

  // Mock pricing data (will be connected later)
  const pricing = [
    { name: "Forfait Essentiel", price: 800, description: "Service de base pour les mariages simples" },
    { name: "Forfait Premium", price: 1500, description: "Service complet avec photos et vidéo" },
    { name: "Forfait Luxe", price: 2500, description: "Premium avec album et séance engagement" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-porcelain">
      <SiteHeader />
      
      {/* Cover Image with Back Button */}
      <div className="relative h-[200px] w-full overflow-hidden sm:h-[280px]">
        <div className="absolute inset-0 bg-gradient-to-br from-henna to-rose" />
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-4 size-10 rounded-full bg-white/80 text-ink hover:bg-white/90"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="size-5" />
        </Button>
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        {/* Vendor Header */}
        <div className="rounded-[20px] border border-black/10 bg-card p-6 sm:p-8 -mt-16 relative z-10">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-henna sm:text-xs">
            {vendor.categorie}
          </p>
          <h1 className="font-heading text-3xl font-medium leading-tight tracking-tight text-ink sm:text-4xl">
            {vendor.nom_entreprise}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-ink-muted sm:mt-4 sm:text-base">
            <div className="flex items-center gap-1.5">
              <MapPin className="size-4 shrink-0" />
              <span>
                {vendor.zones?.nom ? `${vendor.zones.nom}, ` : ""}
                {vendor.villes?.nom || "Non localisé"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="size-4 fill-goldSoft text-goldSoft" />
              <span className="font-medium text-ink">4.5</span>
              <span>({reviews.length} avis)</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-black/10 bg-card">
          <div className="flex gap-6 px-6 sm:px-8">
            {[
              { id: "portfolio" as TabType, label: "Portfolio" },
              { id: "reviews" as TabType, label: "Avis" },
              { id: "pricing" as TabType, label: "Tarifs" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 pb-3 text-sm font-medium transition-colors sm:text-base ${
                  activeTab === tab.id
                    ? "border-henna text-henna"
                    : "border-transparent text-ink-muted hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-card p-6 sm:p-8">
          {/* Description */}
          <p className="mb-6 text-base leading-relaxed text-ink-muted sm:text-lg">
            {vendor.description || "Description non disponible"}
          </p>

          {/* Portfolio Tab */}
          {activeTab === "portfolio" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {portfolio.map((item, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-xl bg-gradient-to-br from-rose/20 to-goldSoft/20"
                />
              ))}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-ink-muted">Aucun avis pour le moment</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-black/10 bg-porcelain/50 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-ink">
                          {review.clients?.prenom || "Client"}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="size-3.5 fill-goldSoft text-goldSoft" />
                          <span className="text-sm">{review.note}</span>
                        </div>
                      </div>
                      <span className="text-xs text-ink-muted">
                        {new Date(review.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-ink-muted">{review.commentaire}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === "pricing" && (
            <div className="space-y-4">
              {pricing.map((plan, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-black/10 bg-porcelain/50 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-heading text-lg font-medium text-ink">
                      {plan.name}
                    </h3>
                    <span className="font-heading text-lg font-medium text-henna">
                      {plan.price.toLocaleString("fr-FR")} DT
                    </span>
                  </div>
                  <p className="text-sm text-ink-muted">{plan.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quote Request Form */}
        <div className="mt-6 rounded-2xl border border-black/10 bg-card p-6 sm:mt-8 sm:p-8">
          <h2 className="font-heading text-2xl font-medium text-ink sm:text-3xl">
            Demander un devis
          </h2>
          <p className="mt-2 text-sm text-ink-muted sm:text-base">
            Remplissez le formulaire ci-dessous pour recevoir une proposition
            personnalisée.
          </p>

          {isCheckingRole ? (
            <div className="mt-6 text-center text-sm text-ink-muted">
              Vérification de votre compte...
            </div>
          ) : !isAuthenticated ? (
            <div className="mt-6 rounded-xl bg-porcelain/50 p-6 text-center">
              <p className="font-heading text-lg font-medium text-ink">
                Connectez-vous pour envoyer une demande
              </p>
              <p className="mt-2 text-sm text-ink-muted">
                Vous devez être connecté en tant que client pour contacter ce prestataire
              </p>
              <a
                href={`/connexion?redirect=/prestataire/${vendor.id}`}
                className="mt-4 inline-block text-sm font-medium text-henna hover:underline"
              >
                Se connecter →
              </a>
            </div>
          ) : !isClient ? (
            <div className="mt-6 rounded-xl bg-porcelain/50 p-6 text-center">
              <p className="font-heading text-lg font-medium text-ink">
                Compte client requis
              </p>
              <p className="mt-2 text-sm text-ink-muted">
                Seuls les comptes clients peuvent envoyer des demandes de devis
              </p>
            </div>
          ) : isSubmitted ? (
            <div className="mt-6 rounded-xl bg-sage/20 p-6 text-center">
              <p className="font-heading text-lg font-medium text-ink">
                Demande envoyée avec succès !
              </p>
              <p className="mt-2 text-sm text-ink-muted">
                Le prestataire vous répondra dans les plus brefs délais.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="weddingDate"
                  className="mb-2 block text-sm font-medium text-ink"
                >
                  Date du mariage *
                </label>
                <input
                  type="date"
                  id="weddingDate"
                  value={formData.weddingDate}
                  onChange={(e) =>
                    setFormData({ ...formData, weddingDate: e.target.value })
                  }
                  className={`h-11 w-full rounded-xl bg-porcelain/60 px-4 text-sm text-ink outline-none ring-henna/30 focus:ring-2 ${
                    errors.weddingDate ? "ring-2 ring-destructive" : ""
                  }`}
                />
                {errors.weddingDate && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.weddingDate}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="budget"
                  className="mb-2 block text-sm font-medium text-ink"
                >
                  Budget estimé *
                </label>
                <select
                  id="budget"
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({ ...formData, budget: e.target.value })
                  }
                  className={`h-11 w-full rounded-xl bg-porcelain/60 px-4 text-sm text-ink outline-none ring-henna/30 focus:ring-2 ${
                    errors.budget ? "ring-2 ring-destructive" : ""
                  }`}
                >
                  <option value="">Sélectionnez une fourchette</option>
                  <option value="0-1000">Moins de 1 000 DT</option>
                  <option value="1000-3000">1 000 - 3 000 DT</option>
                  <option value="3000-5000">3 000 - 5 000 DT</option>
                  <option value="5000-10000">5 000 - 10 000 DT</option>
                  <option value="10000+">Plus de 10 000 DT</option>
                </select>
                {errors.budget && (
                  <p className="mt-1 text-xs text-destructive">{errors.budget}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-ink"
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Décrivez votre projet et vos attentes..."
                  className={`w-full rounded-xl bg-porcelain/60 px-4 py-3 text-sm text-ink outline-none ring-henna/30 focus:ring-2 ${
                    errors.message ? "ring-2 ring-destructive" : ""
                  }`}
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-destructive">{errors.message}</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="h-12 w-full rounded-xl bg-henna px-6 hover:bg-henna/90"
              >
                Envoyer la demande
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
