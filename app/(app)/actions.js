"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveSubscription } from "@/lib/supabase/subscription";
import { revalidatePath } from "next/cache";

const MAX_FREE_DOWNLOADS = 5;
const MAX_FREE_PLAYLISTS = 3;

export async function toggleLike(trackId, liked) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sesi berakhir, silakan masuk lagi." };

  if (liked) {
    const { error } = await supabase.from("likes").insert({ profile_id: user.id, track_id: trackId });
    if (error) return { ok: false, message: error.message };
  } else {
    await supabase.from("likes").delete().eq("profile_id", user.id).eq("track_id", trackId);
  }
  revalidatePath("/liked");
  return { ok: true };
}

// This is the real enforcement of the free-tier download limit — the UI
// only reflects what this returns, it never decides the limit itself.
export async function toggleDownload(trackId, download) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sesi berakhir, silakan masuk lagi." };

  if (!download) {
    await supabase.from("downloads").delete().eq("profile_id", user.id).eq("track_id", trackId);
    revalidatePath("/downloaded");
    return { ok: true };
  }

  const { isPremium } = await getActiveSubscription(supabase, user.id);

  if (!isPremium) {
    const { count } = await supabase
      .from("downloads")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", user.id);
    if ((count || 0) >= MAX_FREE_DOWNLOADS) {
      return {
        ok: false,
        message: `Batas unduhan gratis (${MAX_FREE_DOWNLOADS} lagu) tercapai — upgrade ke Premium untuk unduhan tanpa batas.`,
      };
    }
  }

  const { error } = await supabase.from("downloads").insert({ profile_id: user.id, track_id: trackId });
  if (error) return { ok: false, message: error.message };
  revalidatePath("/downloaded");
  return { ok: true };
}

export async function createPlaylist(name) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sesi berakhir." };

  const { isPremium } = await getActiveSubscription(supabase, user.id);

  if (!isPremium) {
    const { count } = await supabase
      .from("playlists")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", user.id);
    if ((count || 0) >= MAX_FREE_PLAYLISTS) {
      return {
        ok: false,
        message: `Batas playlist gratis (${MAX_FREE_PLAYLISTS}) tercapai — upgrade ke Premium untuk playlist tanpa batas.`,
      };
    }
  }

  const { data, error } = await supabase.from("playlists").insert({ owner_id: user.id, name }).select("id, name").single();
  if (error) return { ok: false, message: error.message };
  revalidatePath("/", "layout");
  return { ok: true, playlist: data };
}

export async function addTrackToPlaylist(playlistId, trackId) {
  const supabase = await createClient();
  const { error } = await supabase.from("playlist_tracks").insert({ playlist_id: playlistId, track_id: trackId });
  if (error) return { ok: false, message: error.message };
  revalidatePath(`/playlist/${playlistId}`);
  return { ok: true };
}

// This is what connects the listener app to the staff moderation queue —
// a report filed here shows up directly in /internal/moderation.
export async function fileReport(type, targetTrackId, note) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("reports")
    .insert({ type, target_track_id: targetTrackId, note, reporter_id: user?.id ?? null });
  if (error) return { ok: false, message: error.message };
  return { ok: true };
    }
    
