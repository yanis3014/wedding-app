import { Search } from "lucide-react";

import { VendorCard } from "@/components/vendor/vendor-card";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/shared/site-header";
import { createClient } from "@/lib/supabase/server";
import HomePageContent from "./home-content";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: prestataires } = await supabase
    .from("prestataires")
    .select(`
      *,
      villes!inner (nom, latitude, longitude),
      zones (nom)
    `)
    .eq("statut_validation", "valide")
    .order("created_at", { ascending: false });

  // Load villes for search filter
  const { data: villes } = await supabase
    .from("villes")
    .select("*")
    .order("nom");

  return <HomePageContent prestataires={prestataires || []} villes={villes || []} />;
}
