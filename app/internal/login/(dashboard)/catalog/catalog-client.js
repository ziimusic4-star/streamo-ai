"use client";

import { useState, useMemo, useTransition } from "react";
import { Search, ShieldCheck, ShieldOff, Eye, EyeOff, Disc3 } from "lucide-react";
import { toggleArtistVerification, toggleTakedown } from "./actions";

const ACCENT = "#C25450";
const GENRE_COLORS = {
  lofi: "#C97B4A",
  jazz: "#8B4B6B",
  electro: "#4B7B8B",
  folk: "#A69056",
  ambient: "#5B5B7B",
  soul: "#B0473E",
};

const fmtNum = (n) => (n || 0).toLocaleString("id-ID");

export default function CatalogClient({ artists: initialArtists, tracks: initialTracks }) {
  const [artists, setArtists] = useState(initialArtists);
  const [tracks, setTracks] = useState(initialTracks);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredTracks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tracks;
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.album || "").toLowerCase().includes(q) ||
        (t.artist?.name || "").toLowerCase().includes(q)
    );
  }, [tracks, query]);

  const handleVerify = (artist) => {
    const next = !artist.verified;
    startTransition(async () => {
      await toggleArtistVerification(artist.id, next);
      setArtists((prev) => prev.map((a) => (a.id === artist.id ? { ...a, verified: next } : a)));
    });
  };

  const handleTakedown = (track) => {
    const next = !track.taken_down;
    startTransition(async () => {
      await toggleTakedown(track.id, next);
      setTracks((prev) => prev.map((t) => (t.id === track.id ? { ...t, taken_down: next } : t)));
    });
  };

  return (
    <div>
      <p className="text-sm font-medium mb-3">Verifikasi artis</p>
      <div className="grid sm:grid-cols-2 gap-2 mb-8">
        {artists.map((a) => (
          <div key={a.id} className="flex items-center justify-between px-3 py-2.5 rounded-md" style={{ background: "#1B1717" }}>
            <span className="text-sm">{a.name}</span>
            <button
              disabled={isPending}
              onClick={() => handleVerify(a)}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md"
              style={{ background: a.verified ? `${ACCENT}22` : "#262121", color: a.verified ? ACCENT : "#948B89" }}
            >
              {a.verified ? <ShieldCheck size={13} /> : <ShieldOff size={13} />}
              {a.verified ? "Terverifikasi" : "Verifikasi"}
            </button>
          </div>
        ))}
        {artists.length === 0 && <p className="text-sm" style={{ color: "#948B89" }}>Belum ada artis di database.</p>}
      </div>

      <p className="text-sm font-medium mb-3">Semua lagu</p>
      <div className="relative max-w-sm mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" color="#948B89" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari judul, artis, atau album"
          className="w-full pl-9 pr-3 py-2 rounded-md text-sm outline-none"
          style={{ background: "#1B1717", color: "#EDE9E7" }}
        />
      </div>

      <div className="space-y-1">
        {filteredTracks.map((t) => (
          <div key={t.id} className="flex items-center gap-3 px-3 py-2.5 rounded-md" style={{ opacity: t.taken_down ? 0.55 : 1 }}>
            <div
              className="flex-shrink-0 rounded-md flex items-center justify-center"
              style={{ width: 36, height: 36, background: `linear-gradient(155deg, ${GENRE_COLORS[t.genre] || "#726A68"} 0%, #171313 85%)` }}
            >
              <Disc3 size={18} color="#EDE9E7" strokeWidth={1.3} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">
                {t.title}
                {t.taken_down && (
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "#262121", color: "#C7BFBD" }}>
                    Diturunkan
                  </span>
                )}
              </p>
              <p className="text-xs truncate" style={{ color: "#948B89" }}>
                {t.artist?.name || "Tanpa artis"} · {t.album}
              </p>
            </div>
            <span className="text-xs hidden sm:block" style={{ color: "#948B89" }}>{fmtNum(t.streams_count)} stream</span>
            <button disabled={isPending} onClick={() => handleTakedown(t)} title={t.taken_down ? "Pulihkan" : "Turunkan"}>
              {t.taken_down ? <Eye size={16} color="#948B89" /> : <EyeOff size={16} color="#948B89" />}
            </button>
          </div>
        ))}
        {filteredTracks.length === 0 && <p className="text-sm py-6" style={{ color: "#948B89" }}>Tidak ada hasil.</p>}
      </div>
    </div>
  );
                     }
    
