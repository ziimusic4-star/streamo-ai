"use client";

import { useState, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Volume2, Volume1, VolumeX, Heart, Mic2 } from "lucide-react";
import { usePlayer } from "./player-context";
import Cover from "./cover";
import LyricsPanel from "./lyrics-panel";
import { resolveGenre } from "@/lib/genres";
import { toggleLike } from "@/app/(app)/actions";

const fmtTime = (s) => {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

export default function NowPlayingBar() {
  const {
    currentTrack, isPlaying, progress, duration, volume, muted, shuffle, repeatMode,
    lyricsOpen, setLyricsOpen, togglePlayPause, goNext, goPrev, cycleRepeat, seek,
    setVolume, setMuted, setShuffle,
  } = usePlayer();

  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLiked(currentTrack?.liked ?? false);
  }, [currentTrack?.id]);

  const activeAccent = currentTrack ? resolveGenre(currentTrack.genre).accent : "#C97B4A";

  const handleSeekClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    seek(ratio);
  };

  const handleLikeClick = async () => {
    if (!currentTrack) return;
    const next = !liked;
    setLiked(next);
    await toggleLike(currentTrack.id, next);
  };

  return (
    <>
      <div className="flex-shrink-0 border-t px-3 md:px-6 py-3 flex items-center gap-3 md:gap-6" style={{ borderColor: "#221D18", background: "#15120F" }}>
        <div className="flex items-center gap-3 w-1/3 min-w-0">
          {currentTrack ? (
            <>
              <Cover genre={currentTrack.genre} coverUrl={currentTrack.cover_url} size={44} playing={isPlaying} />
              <div className="min-w-0 hidden sm:block">
                <p className="text-sm font-medium truncate">{currentTrack.title}</p>
                <p className="text-xs truncate" style={{ color: "#8A8178" }}>{currentTrack.artist_name}</p>
              </div>
              <button onClick={handleLikeClick} className="ml-1 flex-shrink-0">
                <Heart size={16} fill={liked ? "#B0473E" : "none"} color={liked ? "#B0473E" : "#8A8178"} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-md" style={{ background: "#1C1815" }} />
              <p className="text-xs hidden sm:block" style={{ color: "#8A8178" }}>Pilih lagu untuk memutar</p>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center gap-1.5 max-w-xl mx-auto">
          <div className="flex items-center gap-4 md:gap-5">
            <button onClick={() => setShuffle((s) => !s)} title="Acak">
              <Shuffle size={16} color={shuffle ? activeAccent : "#8A8178"} />
            </button>
            <button onClick={goPrev}><SkipBack size={18} fill="#F2EDE4" color="#F2EDE4" /></button>
            <button onClick={togglePlayPause} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#F2EDE4" }}>
              {isPlaying ? <Pause size={16} fill="#15120F" color="#15120F" /> : <Play size={16} fill="#15120F" color="#15120F" style={{ marginLeft: 2 }} />}
            </button>
            <button onClick={goNext}><SkipForward size={18} fill="#F2EDE4" color="#F2EDE4" /></button>
            <button onClick={cycleRepeat} title="Ulangi">
              {repeatMode === "one" ? <Repeat1 size={16} color={activeAccent} /> : <Repeat size={16} color={repeatMode === "all" ? activeAccent : "#8A8178"} />}
            </button>
          </div>
          <div className="w-full flex items-center gap-2">
            <span className="text-[11px] w-9 text-right" style={{ color: "#8A8178" }}>{fmtTime(progress)}</span>
            <div className="flex-1 cursor-pointer py-2" onClick={handleSeekClick}>
              <div className="h-1 rounded-full" style={{ background: "#2A241E" }}>
                <div className="h-full rounded-full" style={{ width: `${duration ? (progress / duration) * 100 : 0}%`, background: activeAccent }} />
              </div>
            </div>
            <span className="text-[11px] w-9" style={{ color: "#8A8178" }}>{fmtTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-1/3 justify-end">
          <button onClick={() => setLyricsOpen((v) => !v)} title="Lirik" disabled={!currentTrack} style={{ opacity: currentTrack ? 1 : 0.4 }}>
            <Mic2 size={16} color={lyricsOpen ? activeAccent : "#8A8178"} />
          </button>
          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => setMuted((m) => !m)}>
              {muted || volume === 0 ? <VolumeX size={16} color="#8A8178" /> : volume < 0.5 ? <Volume1 size={16} color="#8A8178" /> : <Volume2 size={16} color="#8A8178" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={(e) => { setMuted(false); setVolume(parseFloat(e.target.value)); }}
              className="w-24"
            />
          </div>
        </div>
      </div>

      {lyricsOpen && currentTrack && (
        <LyricsPanel track={currentTrack} progress={progress} duration={duration} onClose={() => setLyricsOpen(false)} />
      )}
    </>
  );
}
