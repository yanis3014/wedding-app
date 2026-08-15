"use client";

import { Calendar, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function ConnexionPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isWaitingValidation, setIsWaitingValidation] = useState(false);
  const [isRejected, setIsRejected] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setIsWaitingValidation(false);
    setIsRejected(false);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data.user) {
        const role = data.user.user_metadata?.role;

        if (role === "client") {
          // Redirect to home page
          router.push("/");
        } else if (role === "prestataire") {
          // Check validation status
          const { data: prestataireData } = await supabase
            .from("prestataires")
            .select("statut_validation")
            .eq("id", data.user.id)
            .single();

          if (prestataireData?.statut_validation === "valide") {
            router.push("/pro/dashboard");
          } else if (prestataireData?.statut_validation === "en_attente") {
            setIsWaitingValidation(true);
          } else {
            setIsRejected(true);
          }
        } else if (role === "admin") {
          // Redirect to admin dashboard
          router.push("/admin/dashboard");
        } else {
          // No role found, redirect to home
          router.push("/");
        }
      }
    } catch (err) {
      setError("Une erreur inattendue s'est produite. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // Show validation status screens for prestataires
  if (isWaitingValidation) {
    return (
      <div className="flex min-h-screen flex-col bg-porcelain">
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6 sm:py-14">
          <div className="text-center">
            <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-porcelain/60 mx-auto">
              <Calendar className="size-10 text-ink-muted" />
            </div>
            <h1 className="font-heading text-3xl font-medium leading-tight tracking-tight text-ink sm:text-4xl">
              Votre compte est en cours de validation
            </h1>
            <p className="mt-4 text-sm text-goldSoft sm:text-base">
              Vous recevrez une confirmation sous 24-48h.
            </p>
            <a
              href="/connexion"
              className="mt-8 inline-block text-sm font-medium text-henna hover:underline sm:text-base"
            >
              Se déconnecter →
            </a>
          </div>
        </main>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="flex min-h-screen flex-col bg-porcelain">
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6 sm:py-14">
          <div className="text-center">
            <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-porcelain/60 mx-auto">
              <Star className="size-10 text-ink-muted" />
            </div>
            <h1 className="font-heading text-3xl font-medium leading-tight tracking-tight text-ink sm:text-4xl">
              Votre compte a été rejeté
            </h1>
            <p className="mt-4 text-sm text-henna sm:text-base">
              Contactez le support pour plus d'informations.
            </p>
            <a
              href="/connexion"
              className="mt-8 inline-block text-sm font-medium text-henna hover:underline sm:text-base"
            >
              Se déconnecter →
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
            Se connecter
          </h1>
          <p className="mt-2 text-sm text-ink-muted sm:text-base">
            Accédez à votre espace Mon Mariage
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-ink-muted">Pas encore de compte ?</span>{" "}
          <a
            href="/inscription"
            className="font-medium text-henna hover:underline"
          >
            Créer un compte
          </a>
        </div>
      </main>
    </div>
  );
}
