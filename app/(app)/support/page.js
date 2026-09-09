import { createClient } from "@/lib/supabase/server";
import SupportClient from "./support-client";

export default async function SupportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("id, subject, priority, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <SupportClient initialTickets={tickets || []} />;
}

