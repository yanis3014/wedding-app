import { requireAdminAuth } from "@/lib/supabase/auth-admin";
import { createClient } from "@/lib/supabase/server";
import PrestatairesContent from "./prestataires-content";

export default async function AdminPrestatairesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireAdminAuth();
  const supabase = await createClient();
  const params = await searchParams;

  const statusFilter = params.status || "en_attente";

  // Load prestataires with filter
  let query = supabase
    .from("prestataires")
    .select(`
      *,
      villes!inner (nom),
      zones (nom)
    `)
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("statut_validation", statusFilter);
  }

  const { data: prestataires, error } = await query;

  return (
    <PrestatairesContent
      prestataires={prestataires || []}
      statusFilter={statusFilter}
    />
  );
}
