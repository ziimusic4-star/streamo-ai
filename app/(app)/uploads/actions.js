"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createUpload(fields) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sesi berakhir." };

  // Server-side enforcement of the content policy, not just a disabled
  // button on the client — a request that skips the UI still gets rejected.
  if (!fields.ai_tool || !fields.ai_tool.trim()) {
    return { ok: false, message: "Wajib isi nama aplikasi AI Pro yang dipakai." };
  }
  if (!fields.declared_original) {
    return { ok: false, message: "Kamu harus menyatakan lagu ini karya asli, bukan cover." };
  }

  const { data, error } = await supabase
    .from("tracks")
    .insert({
      uploaded_by: user.id,
      is_upload: true,
      artist_id: null,
      review_status: "pending",
      ...fields,
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: error.message };
  revalidatePath("/uploads");
  return { ok: true, id: data.id };
}

// RLS ("tracks: uploader deletes own personal upload") ensures this only
// ever affects a track the caller actually uploaded themselves.
export async function removeUpload(trackId) {
  const supabase = await createClient();
  const { error } = await supabase.from("tracks").delete().eq("id", trackId);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/uploads");
  return { ok: true };
}

