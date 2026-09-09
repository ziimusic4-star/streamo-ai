"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleArtistVerification(artistId, verified) {
  const supabase = await createClient();
  const { error } = await supabase.from("artists").update({ verified }).eq("id", artistId);
  if (error) throw new Error(error.message);
  revalidatePath("/internal/catalog");
}

export async function toggleTakedown(trackId, takenDown) {
  const supabase = await createClient();
  const { error } = await supabase.from("tracks").update({ taken_down: takenDown }).eq("id", trackId);
  if (error) throw new Error(error.message);
  revalidatePath("/internal/catalog");
}
