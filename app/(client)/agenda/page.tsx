import Link from "next/link";

import { mockClientRequests } from "@/lib/mock-client-requests";
import { requireAuth } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import AgendaContent from "./agenda-content";

export default async function AgendaPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: clientData } = await supabase
    .from("clients")
    .select("*")
    .eq("id", user.id)
    .single();

  const confirmedRequests = mockClientRequests.filter(
    (req) => req.status === "confirmed"
  );
  const totalRequests = mockClientRequests.length;

  return (
    <AgendaContent 
      clientData={clientData}
      confirmedRequests={confirmedRequests}
      totalRequests={totalRequests}
    />
  );
}
