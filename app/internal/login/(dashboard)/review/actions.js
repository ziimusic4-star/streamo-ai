"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveTrack(trackId) {
  const supabase = await createClient();
  const { error } = await supabase.from("tracks").update({ review_status: "approved", review_note: null }).eq("id", trackId);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/internal/review");
  return { ok: true };
}

export async function rejectTrack(trackId, note) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tracks")
    .update({ review_status: "rejected", review_note: note || "Tidak memenuhi kebijakan konten (bukan karya AI baru)." })
    .eq("id", trackId);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/internal/review");
  return { ok: true };
}
