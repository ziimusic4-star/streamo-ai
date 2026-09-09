import { createClient } from "@/lib/supabase/server";
import { getCatalogForUser } from "@/lib/supabase/tracks-query";
import { GENRES } from "@/lib/genres";
import SearchClient from "./search-client";

export default async function SearchPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const tracks = await getCatalogForUser(supabase, user.id);

  return <SearchClient tracks={tracks} genres={GENRES} />;
}

