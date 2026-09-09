import { createClient } from "@/lib/supabase/server";
import { getCatalogForUser } from "@/lib/supabase/tracks-query";
import TrackPageClient from "@/components/listener/track-page-client";

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const tracks = await getCatalogForUser(supabase, user.id);

  return (
    <TrackPageClient
      tracks={tracks}
      emptyLabel="Belum ada lagu di katalog."
      header={
        <>
          <h1 className="fraunces text-2xl md:text-3xl mb-5">Koleksi</h1>
          <p className="text-sm mb-4" style={{ color: "#8A8178" }}>Semua lagu</p>
        </>
      }
    />
  );
}

