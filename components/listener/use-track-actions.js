"use client";

import { useState } from "react";
import { toggleLike, toggleDownload } from "@/app/(app)/actions";

// Shared by every page that renders a track list: keeps a local copy of
// the tracks (for instant UI feedback) and wires like/download buttons to
// the real Server Actions, rolling back on failure (e.g. free-tier limit).
export function useTrackActions(initialTracks) {
  const [tracks, setTracks] = useState(initialTracks);
  const [toast, setToast] = useState("");

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const handleToggleLike = async (trackId) => {
    const track = tracks.find((t) => t.id === trackId);
    if (!track) return;
    const nextLiked = !track.liked;
    setTracks((prev) => prev.map((t) => (t.id === trackId ? { ...t, liked: nextLiked } : t)));
    const res = await toggleLike(trackId, nextLiked);
    if (res && !res.ok) {
      setTracks((prev) => prev.map((t) => (t.id === trackId ? { ...t, liked: !nextLiked } : t)));
      flash(res.message);
    }
  };

  const handleToggleDownload = async (trackId) => {
    const track = tracks.find((t) => t.id === trackId);
    if (!track) return;

    if (track.downloaded) {
      setTracks((prev) => prev.map((t) => (t.id === trackId ? { ...t, downloaded: false } : t)));
      await toggleDownload(trackId, false);
      flash("Dihapus dari unduhan");
      return;
    }

    // Downloading can be rejected server-side (free-tier limit), so wait
    // for the real result before flipping the UI.
    const res = await toggleDownload(trackId, true);
    if (res.ok) {
      setTracks((prev) => prev.map((t) => (t.id === trackId ? { ...t, downloaded: true } : t)));
      flash("Diunduh untuk didengarkan offline");
    } else {
      flash(res.message);
    }
  };

  return { tracks, setTracks, handleToggleLike, handleToggleDownload, toast, flash };
      }

