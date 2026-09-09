// Shared query helpers so every listener page doesn't re-implement the
// same "which tracks has this user liked/downloaded" joins by hand.

export async function fetchUserFlagSets(supabase, userId) {
  const { data: likedRows } = await supabase.from("likes").select("track_id").eq("profile_id", userId);
  const { data: downloadedRows } = await supabase.from("downloads").select("track_id").eq("profile_id", userId);
  return {
    likedSet: new Set((likedRows || []).map((r) => r.track_id)),
    downloadedSet: new Set((downloadedRows || []).map((r) => r.track_id)),
  };
}

export function attachFlags(tracks, likedSet, downloadedSet) {
  return (tracks || []).map((t) => ({
    ...t,
    artist_name: t.artist?.name || (t.is_upload ? "Kamu" : "Tanpa artis"),
    liked: likedSet.has(t.id),
    downloaded: downloadedSet.has(t.id),
  }));
}

// The full public catalog — approved and live only, with this user's
// like/download status attached. Used by Home, Search, Genre, Library.
// The explicit review_status filter matters even though RLS also allows
// a user's own pending/rejected uploads through — without it here, your
// own not-yet-approved upload could leak into the general catalog view
// instead of staying confined to "Unggahan Saya".
export async function getCatalogForUser(supabase, userId) {
  const { data: tracks } = await supabase
    .from("tracks")
    .select(
      "id, title, album, genre, ai_tool, cover_url, audio_url, lyrics, streams_count, is_upload, uploaded_by, artist:artist_id ( name )"
    )
    .eq("taken_down", false)
    .eq("review_status", "approved")
    .order("created_at", { ascending: false });

  const { likedSet, downloadedSet } = await fetchUserFlagSets(supabase, userId);
  return attachFlags(tracks, likedSet, downloadedSet);
}

