import { requireProAuth } from "@/lib/supabase/auth-pro";
import ProfilForm from "./profil-form";

export default async function PrestataireProfilPage() {
  const { prestataireData } = await requireProAuth();
  return <ProfilForm prestataireData={prestataireData} />;
}
