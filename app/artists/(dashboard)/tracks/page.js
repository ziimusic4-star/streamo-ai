import { getCurrentArtist } from "@/lib/supabase/current-artist";
import TracksClient from "./tracks-client";

export default async function TracksPage() {
  const { supabase, artist } = await getCurrentArtist();
  if (!artist) return null;

  const { data: tracks } = await supabase
    .from("tracks")
    .select("id, title, album, genre, ai_tool, cover_url, audio_url, streams_count, taken_down, review_status, review_note")
    .eq("artist_id", artist.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="fraunces text-2xl md:text-3xl mb-1">Musik Saya</h1>
      <p className="text-sm mb-6" style={{ color: "#8B948F" }}>
        {(tracks || []).length} lagu dirilis atas nama {artist.name}.
      </p>
      <TracksClient artistId={artist.id} initialTracks={tracks || []} />
    </div>
  );
}
