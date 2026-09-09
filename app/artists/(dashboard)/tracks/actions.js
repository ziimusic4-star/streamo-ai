"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// RLS ("tracks: artist updates own tracks") re-checks ownership server-side
// regardless of what trackId the client sends — if it doesn't belong to
// this artist, Postgres just updates 0 rows rather than erroring.
export async function updateTrack(trackId, fields) {
  const supabase = await createClient();
  const { error } = await supabase.from("tracks").update(fields).eq("id", trackId);
  if (error) throw new Error(error.message);
  revalidatePath("/artists/tracks");
  revalidatePath("/artists/overview");
}

// RLS ("tracks: artist inserts own tracks") re-checks that artistId really
// resolves to this signed-in artist's own row — a spoofed artistId gets
// rejected by the database, not just hidden by the UI.
export async function createTrack(artistId, fields) {
  const supabase = await createClient();

  // Content policy, enforced server-side: Streamo AI only accepts genuinely
  // new music made with a Pro AI tool — never covers.
  if (!fields.ai_tool || !fields.ai_tool.trim()) {
    throw new Error("Wajib isi nama aplikasi AI Pro yang dipakai.");
  }
  if (!fields.declared_original) {
    throw new Error("Kamu harus menyatakan lagu ini karya asli, bukan cover.");
  }

  const { error } = await supabase
    .from("tracks")
    .insert({ artist_id: artistId, is_upload: false, review_status: "pending", ...fields });
  if (error) throw new Error(error.message);
  revalidatePath("/artists/tracks");
  revalidatePath("/artists/overview");
}

