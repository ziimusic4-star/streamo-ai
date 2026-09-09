import { createClient } from "@/lib/supabase/server";
import { fetchUserFlagSets, attachFlags } from "@/lib/supabase/tracks-query";
import UploadsClient from "./uploads-client";

export default async function UploadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: tracks } = await supabase
    .from("tracks")
    .select(
      "id, title, album, genre, ai_tool, cover_url, audio_url, lyrics, streams_count, is_upload, taken_down, review_status, review_note"
    )
    .eq("uploaded_by", user.id)
    .eq("is_upload", true)
    .order("created_at", { ascending: false });

  const { likedSet, downloadedSet } = await fetchUserFlagSets(supabase, user.id);
  const withFlags = attachFlags(tracks || [], likedSet, downloadedSet);

  return <UploadsClient initialTracks={withFlags} />;
}

