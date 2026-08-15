import { requireAdminAuth } from "@/lib/supabase/auth-admin";
import { createClient } from "@/lib/supabase/server";
import MapWrapper from "@/components/shared/MapWrapper";

export default async function AdminCartePage() {
  await requireAdminAuth();
  const supabase = await createClient();

  // Load all prestataires with coordinates via villes join
  const { data: prestataires } = await supabase
    .from("prestataires")
    .select(`
      *,
      villes!inner (nom, latitude, longitude),
      zones (nom)
    `)
    .order("created_at", { ascending: false });

  // Separate prestataires with and without coordinates
  const withCoords = (prestataires || []).filter(
    (p) => p.villes?.latitude && p.villes?.longitude
  );
  const withoutCoords = (prestataires || []).filter(
    (p) => !p.villes?.latitude || !p.villes?.longitude
  );

  return (
    <>
      {/* Header */}
      <div className="mb-10">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-henna sm:text-xs">
          Administration
        </p>
        <h1 className="font-heading text-3xl font-medium leading-tight tracking-tight text-ink sm:text-4xl">
          Carte des prestataires
        </h1>
        <p className="mt-2 text-sm text-ink-muted sm:text-base">
          Visualisez la localisation des prestataires
        </p>
      </div>

      {/* Map */}
      <div className="mb-10">
        <MapWrapper prestataires={withCoords} />
      </div>

      {/* Non-localized prestataires */}
      {withoutCoords.length > 0 && (
        <div>
          <h2 className="font-heading text-xl font-medium text-ink mb-4">
            Non localisés ({withoutCoords.length})
          </h2>
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-card">
            <table className="w-full">
              <thead className="border-b border-black/10 bg-porcelain/30">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-ink">
                    Entreprise
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-ink">
                    Catégorie
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-ink">
                    Ville
                  </th>
                </tr>
              </thead>
              <tbody>
                {withoutCoords.map((prestataire) => (
                  <tr
                    key={prestataire.id}
                    className="border-b border-black/10 last:border-0"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-ink">
                        {prestataire.nom_entreprise}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-muted">
                      {prestataire.categorie}
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-muted">
                      {prestataire.zones?.nom ? `${prestataire.zones.nom}, ` : ""}
                      {prestataire.villes?.nom || "Non localisé"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
