import { Users } from "lucide-react";

type ClientsContentProps = {
  clients: any[];
  totalClients: number;
};

export default function ClientsContent({ clients, totalClients }: ClientsContentProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getFullName = (client: any) => {
    const parts = [];
    if (client.prenom) parts.push(client.prenom);
    if (client.nom) parts.push(client.nom);
    return parts.join(" ") || "-";
  };

  const getPartnerName = (client: any) => {
    const parts = [];
    if (client.partenaire_prenom) parts.push(client.partenaire_prenom);
    if (client.partenaire_nom) parts.push(client.partenaire_nom);
    return parts.length > 0 ? parts.join(" ") : "-";
  };

  return (
    <>
      {/* Header */}
      <div className="mb-10">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-henna sm:text-xs">
          Administration
        </p>
        <h1 className="font-heading text-3xl font-medium leading-tight tracking-tight text-ink sm:text-4xl">
          Clients
        </h1>
        <p className="mt-2 text-sm text-ink-muted sm:text-base">
          {totalClients} client{totalClients > 1 ? "s" : ""} inscrit{totalClients > 1 ? "s" : ""}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-card">
        <table className="w-full">
          <thead className="border-b border-black/10 bg-porcelain/30">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-ink">
                Nom complet
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-ink">
                Partenaire
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-ink">
                Email
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-ink">
                Date du mariage
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-ink">
                Lieu souhaité
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-ink">
                Demandes envoyées
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-ink">
                Demandes confirmées
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-ink">
                Date d'inscription
              </th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-sm text-ink-muted"
                >
                  Aucun client inscrit pour le moment
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-black/10 last:border-0"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-ink">
                      {getFullName(client)}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-muted">
                    {getPartnerName(client)}
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-muted">
                    -
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-muted">
                    {client.date_mariage ? formatDate(client.date_mariage) : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-muted">
                    {client.lieu_souhaite || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-muted">
                    {client.requestCounts?.total || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-muted">
                    {client.requestCounts?.confirmed || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-muted">
                    {formatDate(client.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
