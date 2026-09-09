"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import TrackTable from "@/components/listener/track-table";
import GenreGrid from "@/components/listener/genre-grid";
import { useTrackActions } from "@/components/listener/use-track-actions";

export default function SearchClient({ tracks: initialTracks, genres }) {
  const { tracks, handleToggleLike, handleToggleDownload, toast, flash } = useTrackActions(initialTracks);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist_name.toLowerCase().includes(q) ||
        (t.album || "").toLowerCase().includes(q)
    );
  }, [tracks, query]);

  return (
    <div>
      <h1 className="fraunces text-2xl md:text-3xl mb-5">Cari</h1>
      <div className="relative max-w-md mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" color="#8A8178" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Judul lagu, artis, atau album"
          className="w-full pl-9 pr-3 py-2.5 rounded-full outline-none text-sm"
          style={{ background: "#1C1815", color: "#F2EDE4" }}
        />
      </div>

      {query.trim() === "" ? (
        <GenreGrid genres={genres} />
      ) : (
        <TrackTable
          tracks={results}
          onToggleLike={handleToggleLike}
          onToggleDownload={handleToggleDownload}
          onToast={flash}
          emptyLabel={`Tidak ada hasil untuk "${query}"`}
        />
      )}

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
            
