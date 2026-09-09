import { createClient } from "@/lib/supabase/server";
import TicketList from "./ticket-list";

export default async function TicketsPage() {
  const supabase = await createClient();

  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("id, subject, priority, status, created_at, user:user_id ( display_name )")
    .order("created_at", { ascending: false });

  const open = (tickets || []).filter((t) => t.status === "open");
  const closed = (tickets || []).filter((t) => t.status === "closed");

  return (
    <div>
      <h1 className="fraunces text-2xl md:text-3xl mb-1">Tiket Dukungan</h1>
      <p className="text-sm mb-6" style={{ color: "#948B89" }}>Pertanyaan dan keluhan pengguna yang masuk.</p>
      <TicketList initialOpen={open} initialClosed={closed} />
    </div>
  );
}
