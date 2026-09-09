import { createClient } from "@/lib/supabase/server";
import { getCatalogForUser } from "@/lib/supabase/tracks-query";
import { getActiveSubscription } from "@/lib/supabase/subscription";
import TrackPageClient from "@/components/listener/track-page-client";
import { Download } from "lucide-react";

const MAX_FREE_DOWNLOADS = 5;

export default async function DownloadedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const allTracks = await getCatalogForUser(supabase, user.id);
  const tracks = allTracks.filter((t) => t.downloaded);
  const { isPremium } = await getActiveSubscription(supabase, user.id);

  return (
    <TrackPageClient
      tracks={tracks}
      emptyLabel="Belum ada lagu yang diunduh. Ketuk ikon unduh pada lagu manapun."
      header={
        <>
          <h1 className="fraunces text-2xl md:text-3xl mb-1 flex items-center gap-2">
            <Download size={20} /> Diunduh
          </h1>
          {!isPremium && (
            <p className="text-xs mb-5" style={{ color: "#8A8178" }}>
              {tracks.length}/{MAX_FREE_DOWNLOADS} slot unduhan gratis terpakai.
            </p>
          )}
        </>
      }
    />
  );
}

