import { createClient } from "@/lib/supabase/server";
import { fetchUserFlagSets, attachFlags } from "@/lib/supabase/tracks-query";
import TrackPageClient from "@/components/listener/track-page-client";

export default async function PlaylistPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: playlist } = await supabase.from("playlists").select("id, name").eq("id", id).single();

  const { data: items } = await supabase
    .from("playlist_tracks")
    .select(
      "tracks ( id, title, album, genre, ai_tool, cover_url, audio_url, lyrics, streams_count, is_upload, taken_down, artist:artist_id ( name ) )"
    )
    .eq("playlist_id", id)
    .order("added_at");

  const rawTracks = (items || []).map((i) => i.tracks).filter(Boolean);
  const { likedSet, downloadedSet } = await fetchUserFlagSets(supabase, user.id);
  const tracks = attachFlags(rawTracks, likedSet, downloadedSet);

  return (
    <TrackPageClient
      tracks={tracks}
      emptyLabel="Belum ada lagu. Tambahkan dari menu (⋯) pada lagu manapun."
      header={
        <>
          <h1 className="fraunces text-2xl md:text-3xl mb-1">{playlist?.name || "Playlist"}</h1>
          <p className="text-sm mb-5" style={{ color: "#8A8178" }}>{tracks.length} lagu</p>
        </>
      }
    />
  );
  }

