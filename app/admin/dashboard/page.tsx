import { requireAdminAuth } from "@/lib/supabase/auth-admin";
import { createClient } from "@/lib/supabase/server";
import DashboardContent from "./dashboard-content";

export default async function AdminDashboardPage() {
  await requireAdminAuth();
  const supabase = await createClient();

  // KPIs
  const [{ count: validatedPrestataires }, { count: pendingPrestataires }, { count: totalClients }, { data: recentPrestataires }] = await Promise.all([
    supabase
      .from("prestataires")
      .select("*", { count: "exact", head: true })
      .eq("statut_validation", "valide"),
    supabase
      .from("prestataires")
      .select("*", { count: "exact", head: true })
      .eq("statut_validation", "en_attente"),
    supabase
      .from("clients")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("prestataires")
      .select(`
        *,
        villes!inner (nom),
        zones (nom)
      `)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  // Demandes created this month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const { count: demandesThisMonth } = await supabase
    .from("demandes")
    .select("*", { count: "exact", head: true })
    .gte("created_at", firstDayOfMonth.toISOString());

  // Abonnements à relancer
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  const { data: prestatairesAbonnements } = await supabase
    .from("prestataires")
    .select("abonnement_statut, essai_fin_date")
    .or("abonnement_statut.eq.expire,abonnement_statut.eq.essai");

  // Filter client-side for trial expiring soon
  const abonnementsARelancer = prestatairesAbonnements?.filter((p: any) => {
    if (p.abonnement_statut === "expire") return true;
    if (p.abonnement_statut === "essai" && p.essai_fin_date) {
      return new Date(p.essai_fin_date) <= threeDaysFromNow;
    }
    return false;
  }).length || 0;

  return (
    <DashboardContent
      kpis={{
        validatedPrestataires: validatedPrestataires || 0,
        pendingPrestataires: pendingPrestataires || 0,
        totalClients: totalClients || 0,
        demandesThisMonth: demandesThisMonth || 0,
      }}
      recentPrestataires={recentPrestataires || []}
      abonnementsARelancer={abonnementsARelancer}
    />
  );
}
