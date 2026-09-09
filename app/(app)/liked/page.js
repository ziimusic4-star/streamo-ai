import { createClient } from "@/lib/supabase/server";
import { getCatalogForUser } from "@/lib/supabase/tracks-query";
import TrackPageClient from "@/components/listener/track-page-client";
import { Heart } from "lucide-react";

export default async function LikedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const allTracks = await getCatalogForUser(supabase, user.id);
  const tracks = allTracks.filter((t) => t.liked);

  return (
    <TrackPageClient
      tracks={tracks}
      emptyLabel="Ketuk ikon hati pada lagu untuk menyimpannya di sini."
      header={
        <h1 className="fraunces text-2xl md:text-3xl mb-5 flex items-center gap-2">
          <Heart size={22} fill="#B0473E" color="#B0473E" /> Lagu Disukai
        </h1>
      }
    />
  );
}

