import { Calendar } from "lucide-react";

import { requireValidatedPro } from "@/lib/supabase/auth-pro";
import { createClient } from "@/lib/supabase/server";
import DashboardContent from "./dashboard-content";

export const dynamic = 'force-dynamic';

export default async function PrestataireDashboardPage() {
  const { prestataireData, isValid, user } = await requireValidatedPro();
  const supabase = await createClient();
  const vendorName = prestataireData?.nom_entreprise || "Mon entreprise";

  // Show blocking screen if not validated
  if (!isValid) {
    const statusMessage = prestataireData?.statut_validation === 'en_attente'
      ? "Votre compte est en cours de validation"
      : "Votre compte a été rejeté";

    const statusColor = prestataireData?.statut_validation === 'en_attente'
      ? "text-goldSoft"
      : "text-henna";

    return (
      <div className="flex min-h-screen flex-col bg-porcelain">
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 pb-28 sm:px-6 sm:py-14 sm:pb-28">
          <div className="text-center">
            <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-porcelain/60 mx-auto">
              <Calendar className="size-10 text-ink-muted" />
            </div>
            <h1 className="font-heading text-3xl font-medium leading-tight tracking-tight text-ink sm:text-4xl">
              {statusMessage}
            </h1>
            <p className={`mt-4 text-sm ${statusColor} sm:text-base`}>
              {prestataireData?.statut_validation === 'en_attente'
                ? "Vous recevrez une confirmation sous 24-48h."
                : "Contactez le support pour plus d'informations."}
            </p>
            <a
              href="/pro/profil"
              className="mt-8 inline-block text-sm font-medium text-henna hover:underline sm:text-base"
            >
              Voir mon profil →
            </a>
          </div>
        </main>
      </div>
    );
  }

  // Load requests with client join
  const { data: requests } = await supabase
    .from("demandes")
    .select(`
      *,
      clients (prenom, nom)
    `)
    .eq("prestataire_id", user.id)
    .order("created_at", { ascending: false });

  // Load appointment requests with client join
  const { data: appointmentRequests } = await supabase
    .from("demandes_rdv")
    .select(`
      *,
      clients (prenom, nom)
    `)
    .eq("prestataire_id", user.id)
    .eq("statut", "en_attente")
    .order("created_at", { ascending: false });

  // Load accepted appointments with client join
  const { data: acceptedAppointments } = await supabase
    .from("demandes_rdv")
    .select(`
      *,
      clients (prenom, nom)
    `)
    .eq("prestataire_id", user.id)
    .eq("statut", "accepte")
    .order("date_rdv", { ascending: true });

  // Calculate stats
  const newRequests = requests?.filter((r) => r.statut === "nouveau").length || 0;
  const pendingQuotes = requests?.filter((r) => r.statut === "devis_envoye").length || 0;
  const totalRequests = requests?.length || 0;
  const responseRate = totalRequests > 0 
    ? Math.round(((totalRequests - newRequests) / totalRequests) * 100)
    : 0;

  return (
    <DashboardContent 
      vendorName={vendorName}
      requests={requests || []}
      appointmentRequests={appointmentRequests || []}
      acceptedAppointments={acceptedAppointments || []}
      stats={{ newRequests, pendingQuotes, responseRate }}
    />
  );
}
