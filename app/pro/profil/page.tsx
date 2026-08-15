import { requireProAuth } from "@/lib/supabase/auth-pro";
import { createClient } from "@/lib/supabase/server";
import ProfilForm from "./profil-form";

export default async function PrestataireProfilPage() {
  const { prestataireData } = await requireProAuth();
  const supabase = await createClient();

  // Read configuration for tariff
  const { data: config } = await supabase
    .from("configuration")
    .select("tarif_mensuel")
    .eq("id", 1)
    .single();

  return (
    <ProfilForm 
      prestataireData={prestataireData} 
      tarifMensuel={config?.tarif_mensuel}
    />
  );
}
