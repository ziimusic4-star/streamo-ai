"use client";

import { useMemo } from "react";
import TrackTable from "./track-table";
import { useTrackActions } from "./use-track-actions";
import { useAppMeta } from "./app-meta-context";

// Reused by Home, Library, Genre, Liked, Downloaded, and Playlist pages —
// each just fetches its own subset of tracks server-side and hands them
// here, along with whatever header content is specific to that page.
export default function TrackPageClient({ tracks: initialTracks, emptyLabel, header, onRemoveUpload }) {
  const { offlineMode } = useAppMeta();
  const { tracks, handleToggleLike, handleToggleDownload, toast, flash } = useTrackActions(initialTracks);

  const visible = useMemo(
    () => (offlineMode ? tracks.filter((t) => t.is_upload || t.downloaded) : tracks),
    [tracks, offlineMode]
  );

  return (
    <div>
      {header}
      <TrackTable
        tracks={visible}
        onToggleLike={handleToggleLike}
        onToggleDownload={handleToggleDownload}
        onRemoveUpload={onRemoveUpload}
        onToast={flash}
        emptyLabel={emptyLabel}
      />
      {toast && (
        <div
          className="fixed left-1/2 -translate-x-1/2 bottom-24 md:bottom-6 z-50 px-4 py-2 rounded-full text-sm"
          style={{ background: "#F2EDE4", color: "#15120F" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
