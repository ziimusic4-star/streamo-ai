"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function closeTicket(ticketId) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("support_tickets")
    .update({ status: "closed", closed_at: new Date().toISOString() })
    .eq("id", ticketId);

  if (error) throw new Error(error.message);

  revalidatePath("/internal/tickets");
  revalidatePath("/internal/overview");
}
