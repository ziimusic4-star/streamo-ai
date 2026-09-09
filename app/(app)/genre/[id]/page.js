import { createClient } from "@/lib/supabase/server";
import { getCatalogForUser } from "@/lib/supabase/tracks-query";
import { resolveGenre } from "@/lib/genres";
import TrackPageClient from "@/components/listener/track-page-client";

export default async function GenrePage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const allTracks = await getCatalogForUser(supabase, user.id);
  const tracks = allTracks.filter((t) => t.genre === id);
  const g = resolveGenre(id);

  return (
    <TrackPageClient
      tracks={tracks}
      emptyLabel="Tidak ada lagu di genre ini."
      header={
        <div className="rounded-xl p-6 md:p-8 mb-6" style={{ background: `linear-gradient(135deg, ${g.accent}55, #15120F 75%)` }}>
          <p className="text-xs tracking-wide mb-2" style={{ color: "#F2EDE4cc" }}>Genre</p>
          <h1 className="fraunces text-3xl md:text-4xl">{g.name}</h1>
        </div>
      }
    />
  );
  }

