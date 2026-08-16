import Link from "next/link";

type AgendaContentProps = {
  clientData: any;
  confirmedRequests: any[];
  acceptedAppointments: any[];
  totalRequests: number;
};

export default function AgendaContent({ clientData, confirmedRequests, acceptedAppointments, totalRequests }: AgendaContentProps) {
  const formatWeddingDate = (dateString: string) => {
    if (!dateString) return "Date non définie";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Map real Supabase data to component expectations
  const mappedRequests = confirmedRequests.map((request) => ({
    id: request.id,
    prestataireId: request.prestataire_id,
    vendorName: request.prestataires?.nom_entreprise || "Prestataire",
    vendorCategory: request.prestataires?.categorie || "Service",
    vendorLocation: request.prestataires?.ville || "",
    quoteAmount: request.devis_montant,
  }));

  return (
    <div className="flex min-h-screen flex-col bg-porcelain">
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-heading text-3xl font-medium leading-tight tracking-tight text-ink sm:text-4xl">
            Mon agenda
          </h1>
          <p className="mt-2 text-sm text-ink-muted sm:text-base">
            Mariage le {formatWeddingDate(clientData?.date_mariage)}
          </p>
        </div>

        {/* Summary */}
        <div className="mb-8 rounded-2xl border border-black/10 bg-card p-6">
          <p className="text-sm text-ink-muted sm:text-base">
            <span className="font-heading text-2xl font-medium text-sage sm:text-3xl">
              {confirmedRequests.length}
            </span>{" "}
            prestataire{confirmedRequests.length > 1 ? "s" : ""} confirmé
            {confirmedRequests.length > 1 ? "s" : ""} sur{" "}
            <span className="font-medium text-ink">{totalRequests}</span>{" "}
            demande{totalRequests > 1 ? "s" : ""} envoyée
            {totalRequests > 1 ? "s" : ""}
          </p>
        </div>

        {/* Empty State */}
        {confirmedRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-black/10 bg-card p-12 text-center">
            <p className="font-heading text-xl font-medium text-ink sm:text-2xl">
              Aucune réservation confirmée pour le moment
            </p>
            <p className="mt-2 text-sm text-ink-muted sm:text-base">
              Vos prestataires vous répondront bientôt
            </p>
            <Link
              href="/mes-demandes"
              className="mt-6 text-sm font-medium text-henna hover:underline sm:text-base"
            >
              Voir l'avancement de mes demandes →
            </Link>
          </div>
        ) : (
          /* Timeline */
          <div className="space-y-6">
            <h2 className="font-heading text-xl font-medium text-ink sm:text-2xl">
              Prestataires confirmés
            </h2>

            <div className="space-y-4">
              {mappedRequests.map((request, index) => (
                <div
                  key={request.id}
                  className="relative pl-8"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-3 flex size-4 shrink-0 items-center justify-center">
                    <div className="size-3 rounded-full bg-sage" />
                  </div>

                  {/* Timeline line (except for last item) */}
                  {index < mappedRequests.length - 1 && (
                    <div className="absolute left-[5px] top-7 h-full w-0.5 bg-sage/30" />
                  )}

                  {/* Content */}
                  <div className="rounded-xl border border-black/10 bg-card p-4 sm:p-5">
                    <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-widest text-henna sm:text-xs">
                          {request.vendorCategory}
                        </p>
                        <h3 className="font-heading text-lg font-medium text-ink sm:text-xl">
                          {request.vendorName}
                        </h3>
                      </div>
                      {request.quoteAmount && (
                        <p className="text-sm font-medium text-ink-muted sm:text-base">
                          {request.quoteAmount.toLocaleString("fr-FR")} DT
                        </p>
                      )}
                    </div>

                    {request.vendorLocation && (
                      <p className="text-sm text-ink-muted">
                        {request.vendorLocation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Appointments Section */}
            {acceptedAppointments.length > 0 && (
              <div className="mt-8 space-y-6">
                <h2 className="font-heading text-xl font-medium text-ink sm:text-2xl">
                  Rendez-vous
                </h2>

                <div className="space-y-4">
                  {acceptedAppointments.map((appointment, index) => (
                    <div
                      key={appointment.id}
                      className="relative pl-8"
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-0 top-3 flex size-4 shrink-0 items-center justify-center">
                        <div className="size-3 rounded-full bg-henna" />
                      </div>

                      {/* Timeline line (except for last item) */}
                      {index < acceptedAppointments.length - 1 && (
                        <div className="absolute left-[5px] top-7 h-full w-0.5 bg-henna/30" />
                      )}

                      {/* Content */}
                      <div className="rounded-xl border border-black/10 bg-card p-4 sm:p-5">
                        <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-widest text-henna sm:text-xs">
                              {appointment.prestataires?.categorie || "Rendez-vous"}
                            </p>
                            <h3 className="font-heading text-lg font-medium text-ink sm:text-xl">
                              {appointment.titre}
                            </h3>
                          </div>
                          <p className="text-sm font-medium text-ink-muted sm:text-base">
                            {new Date(appointment.date_rdv).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>

                        <div className="flex flex-col gap-1 text-sm text-ink-muted sm:flex-row sm:gap-4">
                          <span>Heure : {appointment.heure_rdv}</span>
                          {appointment.lieu && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span>Lieu : {appointment.lieu}</span>
                            </>
                          )}
                          <span className="hidden sm:inline">•</span>
                          <span>{appointment.prestataires?.nom_entreprise || "Prestataire"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Encouraging message */}
            <div className="rounded-xl bg-sage/10 p-4 text-center">
              <p className="text-sm text-ink-muted sm:text-base">
                Super progression ! Continuez comme ça pour votre mariage{" "}
                {formatWeddingDate(clientData?.date_mariage)} 💚
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
