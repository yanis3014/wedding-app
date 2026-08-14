import { requireValidatedPro } from "@/lib/supabase/auth-pro";
import { mockVendors } from "@/lib/mock-vendors";
import AvisContent from "./avis-content";

export default async function ProAvisPage() {
  const { prestataireData, isValid } = await requireValidatedPro();
  const vendor = mockVendors[0];
  
  return <AvisContent vendor={vendor} prestataireData={prestataireData} isValid={isValid} />;
}
