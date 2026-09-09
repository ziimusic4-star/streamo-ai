import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveSubscription } from "@/lib/supabase/subscription";
import AppShell from "@/components/listener/app-shell";

// Unlike /artists and /internal, this layout doesn't check role — any
// signed-in account (listener, artist, or staff) can use the listener app,
// same as how a real artist or Spotify employee can still just listen.
export default async function AppLayout({ children }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).single();
  const { data: playlists } = await supabase
    .from("playlists")
    .select("id, name")
    .eq("owner_id", user.id)
    .order("created_at");
  const { isPremium } = await getActiveSubscription(supabase, user.id);

  return (
    <AppShell displayName={profile?.display_name || "Pendengar"} initialPlaylists={playlists || []} isPremium={isPremium}>
      {children}
    </AppShell>
  );
}

