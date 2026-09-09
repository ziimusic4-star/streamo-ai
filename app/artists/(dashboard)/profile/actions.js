"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// RLS ("artists: owner updates own profile") ensures profile_id = auth.uid()
// — an artist can never update someone else's profile row this way.
export async function updateArtistProfile(artistId, fields) {
  const supabase = await createClient();
  const { error } = await supabase.from("artists").update(fields).eq("id", artistId);
  if (error) throw new Error(error.message);
  revalidatePath("/artists/profile");
}

