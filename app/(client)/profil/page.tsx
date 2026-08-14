import { requireAuth } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import ProfilForm from "./profil-form";

export default async function ClientProfilPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: clientData } = await supabase
    .from("clients")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!clientData) {
    // Create client record if it doesn't exist
    const { error } = await supabase.from("clients").insert({
      id: user.id,
      prenom: "",
      nom: "",
      partenaire_prenom: null,
      partenaire_nom: null,
      telephone: null,
      date_mariage: null,
      lieu_souhaite: null,
    });

    if (error) {
      throw new Error("Erreur lors de la création du profil");
    }
  }

  return <ProfilForm initialData={clientData || {}} email={user.email || ""} />;
}
