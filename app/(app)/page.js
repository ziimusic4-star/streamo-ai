import { createClient } from "@/lib/supabase/server";
import { getCatalogForUser } from "@/lib/supabase/tracks-query";
import { GENRES } from "@/lib/genres";
import TrackPageClient from "@/components/listener/track-page-client";
import GenreGrid from "@/components/listener/genre-grid";

export default async function HomePage() {
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
          <h1 className="fraunces text-2xl md:text-3xl mb-1">Selamat datang kembali</h1>
          <p className="text-sm mb-6" style={{ color: "#8A8178" }}>Lanjutkan mendengarkan, atau jelajahi suasana baru.</p>
          <h2 className="fraunces text-xl mb-3">Jelajahi suasana</h2>
          <GenreGrid genres={GENRES} />
          <h2 className="fraunces text-xl mb-3">Semua lagu</h2>
        </>
      }
    />
  );
        }

