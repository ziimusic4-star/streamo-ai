"use client";

import { useState } from "react";
import { Play, Pause, Heart, Download, Check, MoreHorizontal, Trash2, Clock, Sparkles } from "lucide-react";
import { usePlayer } from "./player-context";
import Cover from "./cover";
import TrackMenu from "./track-menu";

export default function TrackTable({ tracks, onToggleLike, onToggleDownload, onRemoveUpload, onToast, emptyLabel }) {
  const { currentTrack, isPlaying, playTrackList } = usePlayer();
  const [menuTrackId, setMenuTrackId] = useState(null);

  if (!tracks || tracks.length === 0) {
    return <div className="text-sm py-10 text-center" style={{ color: "#8A8178" }}>{emptyLabel || "Tidak ada lagu."}</div>;
  }

  return (
    <div>
      <div
        className="grid text-xs px-3 pb-2 border-b"
        style={{ gridTemplateColumns: "28px 1fr auto auto auto", gap: "12px", borderColor: "#221D18", color: "#8A8178" }}
      >
        <span>#</span>
        <span>Judul</span>
        <span className="hidden sm:block">Album</span>
        <span></span>
        <span className="flex justify-end pr-1"><Clock size={13} /></span>
      </div>
      <div>
        {tracks.map((t, i) => {
          const isCurrent = currentTrack?.id === t.id;
          return (
            <div
              key={t.id}
              className="grid items-center px-3 py-2 rounded-md cursor-pointer hover:bg-[#1C1815]"
              style={{ gridTemplateColumns: "28px 1fr auto auto auto", gap: "12px" }}
              onClick={() => playTrackList(tracks, t.id)}
            >
              <span className="text-sm" style={{ color: isCurrent ? "#C97B4A" : "#8A8178" }}>
                {isCurrent && isPlaying ? "♪" : i + 1}
              </span>

              <div className="flex items-center gap-3 min-w-0">
                <Cover genre={t.genre} coverUrl={t.cover_url} size={36} playing={isCurrent && isPlaying} />
                <div className="min-w-0">
                  <p className="text-sm truncate" style={{ color: isCurrent ? "#C97B4A" : "#F2EDE4" }}>{t.title}</p>
                  <p className="text-xs truncate flex items-center gap-1.5" style={{ color: "#8A8178" }}>
                    <span className="truncate">{t.artist_name}</span>
                    {t.ai_tool && (
                      <span className="inline-flex items-center gap-0.5 flex-shrink-0" style={{ color: "#8F7FE8" }}>
                        <Sparkles size={10} />
                        {t.ai_tool}
                      </span>
                    )}
                    {t.taken_down && (
                      <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "#262121", color: "#C7BFBD" }}>
                        Diturunkan staf
                      </span>
                    )}
                    {t.review_status === "pending" && (
                      <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "#3A2E1E", color: "#E8B94A" }}>
                        Menunggu tinjauan
                      </span>
                    )}
                    {t.review_status === "rejected" && (
                      <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "#3A1E1E", color: "#E28A87" }} title={t.review_note || ""}>
                        Ditolak
                      </span>
                    )}
                  </p>
                  {t.review_status === "rejected" && t.review_note && (
                    <p className="text-[11px] truncate" style={{ color: "#E28A87" }}>Alasan: {t.review_note}</p>
                  )}
                </div>
              </div>

              <span className="hidden sm:block text-xs truncate max-w-[140px]" style={{ color: "#8A8178" }}>{t.album}</span>

              <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                {!t.is_upload && (
                  <button onClick={() => onToggleDownload(t.id)} title={t.downloaded ? "Diunduh" : "Unduh untuk offline"}>
                    {t.downloaded ? <Check size={15} color="#8A8178" /> : <Download size={15} color="#8A8178" />}
                  </button>
                )}
                <button onClick={() => onToggleLike(t.id)}>
                  <Heart size={15} fill={t.liked ? "#B0473E" : "none"} color={t.liked ? "#B0473E" : "#8A8178"} />
                </button>
                {t.is_upload && onRemoveUpload ? (
                  <button onClick={() => onRemoveUpload(t.id)} title="Hapus unggahan">
                    <Trash2 size={15} color="#8A8178" />
                  </button>
                ) : (
                  <button onClick={() => setMenuTrackId(t.id)}>
                    <MoreHorizontal size={16} color="#8A8178" />
                  </button>
                )}
              </div>

              <span className="text-xs text-right" style={{ color: "#8A8178" }}>
                {t.is_upload ? "—" : `${(i % 4) + 2}:${((10 + i * 7) % 60).toString().padStart(2, "0")}`}
              </span>
            </div>
          );
        })}
      </div>

      {menuTrackId && <TrackMenu trackId={menuTrackId} onClose={() => setMenuTrackId(null)} onToast={onToast} />}
    </div>
  );
}
