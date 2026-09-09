import { createClient } from "@/lib/supabase/server";

// The (dashboard) layout already guarantees a signed-in, artist-role,
// linked-to-an-artist-row user before rendering any page — this just
// re-fetches that same artist row for the page's own queries. If it comes
// back null here, the layout has already swapped in the "not linked" screen
// instead of this page, so returning null and rendering nothing is safe.
export async function getCurrentArtist() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, artist: null };

  const { data: artist } = await supabase
    .from("artists")
    .select("id, name, bio, photo_url, banner_url, verified, followers_count")
    .eq("profile_id", user.id)
    .single();

  return { supabase, user, artist: artist || null };
}

