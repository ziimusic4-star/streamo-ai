import { createClient } from "@/lib/supabase/server";
import CatalogClient from "./catalog-client";

export default async function CatalogPage() {
  const supabase = await createClient();

  const { data: artists } = await supabase.from("artists").select("id, name, verified").order("name");

  const { data: tracks } = await supabase
    .from("tracks")
    .select("id, title, album, genre, streams_count, taken_down, artist:artist_id ( name )")
    .order("streams_count", { ascending: false });

  return (
    <div>
      <h1 className="fraunces text-2xl md:text-3xl mb-1">Katalog</h1>
      <p className="text-sm mb-6" style={{ color: "#948B89" }}>
        Verifikasi artis dan tindakan penurunan konten lintas platform.
      </p>
      <CatalogClient artists={artists || []} tracks={tracks || []} />
    </div>
  );
          }
          
