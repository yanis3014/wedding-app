import { requireAdminAuth } from "@/lib/supabase/auth-admin";
import { createClient } from "@/lib/supabase/server";
import ClientsContent from "./clients-content";

export default async function AdminClientsPage() {
  await requireAdminAuth();
  const supabase = await createClient();

  // Load all clients with their request counts
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  // Get email from auth.users for each client
  const clientIds = clients?.map((c) => c.id) || [];
  const emails = new Map();
  
  if (clientIds.length > 0) {
    // We can't directly query auth.users from the client, so we'll skip emails for now
    // The email field will be empty in the table
  }

  // Calculate request counts for each client
  const clientRequestCounts = new Map();
  
  if (clientIds.length > 0) {
    const { data: demandes } = await supabase
      .from("demandes")
      .select("client_id, statut")
      .in("client_id", clientIds);

    if (demandes) {
      for (const clientId of clientIds) {
        const clientDemands = demandes.filter((d: any) => d.client_id === clientId);
        const totalRequests = clientDemands.length;
        const confirmedRequests = clientDemands.filter((d: any) => d.statut === "confirme").length;
        
        clientRequestCounts.set(clientId, {
          total: totalRequests,
          confirmed: confirmedRequests,
        });
      }
    }
  }

  // Enhance client data with request counts
  const clientsWithCounts = (clients || []).map((client) => ({
    ...client,
    requestCounts: clientRequestCounts.get(client.id) || { total: 0, confirmed: 0 },
  }));

  return (
    <ClientsContent
      clients={clientsWithCounts}
      totalClients={clients?.length || 0}
    />
  );
}
