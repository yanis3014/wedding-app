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
    .select("*")
    .eq("statut_validation", "valide")
    .order("created_at", { ascending: false });

  return <HomePageContent prestataires={prestataires || []} />;
}
