"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createTicket(subject, priority) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sesi berakhir." };

  const { error } = await supabase.from("support_tickets").insert({ user_id: user.id, subject, priority });
  if (error) return { ok: false, message: error.message };
  revalidatePath("/support");
  return { ok: true };
}

