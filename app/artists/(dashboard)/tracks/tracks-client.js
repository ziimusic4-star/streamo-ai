"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Pencil, Plus } from "lucide-react";
import { resolveGenre } from "@/lib/genres";
import EditTrackModal from "./edit-track-modal";
import UploadTrackModal from "./upload-track-modal";

const ACCENT = "#4FA382";
const fmtNum = (n) => (n || 0).toLocaleString("id-ID");
const fmtTime = (s) => {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

function Cover({ genre, coverUrl, size = 40, playing = false }) {
  const g = resolveGenre(genre);
  return (
    <div
      className="flex-shrink-0 rounded-md overflow-hidden flex items-center justify-center"
      style={{ width: size, height: size, background: coverUrl ? "#000" : `linear-gradient(155deg, ${g.accent} 0%, #14181A 85%)` }}
    >
      {coverUrl ? (
        <img src={coverUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-2 h-2 rounded-full" style={{ background: "#EDEFEC", opacity: playing ? 1 : 0.5 }} />
      )}
    </div>
  );
}

export default function TracksClient({ artistId, initialTracks }) {
  const [tracks, setTracks] = useState(initialTracks);
  const [editingTrack, setEditingTrack] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const [playingId, setPlayingId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const playingTrack = tracks.find((t) => t.id === playingId) || null;

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !playingTrack) return;
    if (a.src !== playingTrack.audio_url) {
      a.src = playingTrack.audio_url;
      a.currentTime = 0;
    }
    if (isPlaying) a.play().catch(() => {});
    else a.pause();
  }, [playingTrack, isPlaying]);

  const handlePlay = (t) => {
    if (playingId === t.id) setIsPlaying((p) => !p);
    else {
      setPlayingId(t.id);
      setIsPlaying(true);
    }
  };

  const seek = (e) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    a.currentTime = ratio * duration;
    setProgress(a.currentTime);
  };

  const applyUpdatedTrack = (trackId, fields) => {
    setTracks((prev) => prev.map((t) => (t.id === trackId ? { ...t, ...fields } : t)));
  };

  const applyNewTrack = (track) => {
    setTracks((prev) => [track, ...prev]);
  };

  return (
    <div>
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => setIsPlaying(false)}
      />

      <button
        onClick={() => setUploadOpen(true)}
        className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-full mb-6"
        style={{ background: ACCENT, color: "#101312" }}
      >
        <Plus size={15} /> Tambah Lagu
      </button>

      {tracks.length === 0 ? (
        <p className="text-sm py-10 text-center" style={{ color: "#8B948F" }}>Belum ada lagu. Tambahkan lagu pertamamu.</p>
      ) : (
        <div className="space-y-1">
          {tracks.map((t) => {
            const isCurrent = playingId === t.id;
            return (
              <div key={t.id} className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-[#181C1B]">
                <button onClick={() => handlePlay(t)} className="flex-shrink-0 relative">
                  <Cover genre={t.genre} coverUrl={t.cover_url} size={40} playing={isCurrent && isPlaying} />
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity" style={{ background: "#00000066" }}>
                    {isCurrent && isPlaying ? <Pause size={14} fill="#fff" color="#fff" /> : <Play size={14} fill="#fff" color="#fff" />}
                  </span>
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">
                    {t.title}
                    {t.taken_down && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "#262121", color: "#C7BFBD" }}>
                        Diturunkan staf
                      </span>
                    )}
                    {t.review_status === "pending" && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "#3A2E1E", color: "#E8B94A" }}>
                        Menunggu tinjauan
                      </span>
                    )}
                    {t.review_status === "rejected" && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "#3A1E1E", color: "#E28A87" }}>
                        Ditolak
                      </span>
                    )}
                  </p>
                  <p className="text-xs truncate" style={{ color: "#8B948F" }}>{t.album} · {resolveGenre(t.genre).name}</p>
                  {t.ai_tool && (
                    <p className="text-[11px] truncate" style={{ color: "#8F7FE8" }}>✨ {t.ai_tool}</p>
                  )}
                  {t.review_status === "rejected" && t.review_note && (
                    <p className="text-[11px] truncate" style={{ color: "#E28A87" }}>Alasan: {t.review_note}</p>
                  )}
                </div>
                <span className="text-xs hidden sm:block" style={{ color: "#8B948F" }}>{fmtNum(t.streams_count)} stream</span>
                <button onClick={() => setEditingTrack(t)} title="Edit">
                  <Pencil size={15} color="#8B948F" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {playingTrack && (
        <div className="fixed bottom-16 md:bottom-0 left-0 md:left-56 right-0 border-t px-4 md:px-6 py-3 flex items-center gap-4" style={{ borderColor: "#1D2220", background: "#141817" }}>
          <Cover genre={playingTrack.genre} coverUrl={playingTrack.cover_url} size={36} playing={isPlaying} />
          <p className="text-sm truncate w-32 hidden sm:block">{playingTrack.title}</p>
          <button onClick={() => setIsPlaying((p) => !p)} className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: ACCENT }}>
            {isPlaying ? <Pause size={14} fill="#101312" color="#101312" /> : <Play size={14} fill="#101312" color="#101312" style={{ marginLeft: 1 }} />}
          </button>
          <span className="text-[11px] w-9 text-right" style={{ color: "#8B948F" }}>{fmtTime(progress)}</span>
          <div className="flex-1 cursor-pointer py-2" onClick={seek}>
            <div className="h-1 rounded-full" style={{ background: "#232826" }}>
              <div className="h-full rounded-full" style={{ width: `${duration ? (progress / duration) * 100 : 0}%`, background: ACCENT }} />
            </div>
          </div>
          <span className="text-[11px] w-9" style={{ color: "#8B948F" }}>{fmtTime(duration)}</span>
        </div>
      )}

      {editingTrack && (
        <EditTrackModal
          track={editingTrack}
          onClose={() => setEditingTrack(null)}
          onSaved={(fields) => {
            applyUpdatedTrack(editingTrack.id, fields);
            setEditingTrack(null);
          }}
        />
      )}

      {uploadOpen && (
        <UploadTrackModal
          artistId={artistId}
          onClose={() => setUploadOpen(false)}
          onCreated={(track) => {
            applyNewTrack(track);
            setUploadOpen(false);
          }}
        />
      )}
    </div>
  );
        }
        
