"use client";

import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off"); // off | all | one
  const [lyricsOpen, setLyricsOpen] = useState(false);

  const currentTrack = currentIndex !== null ? queue[currentIndex] || null : null;

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !currentTrack) return;
    if (a.src !== currentTrack.audio_url) {
      a.src = currentTrack.audio_url;
      a.currentTime = 0;
    }
    if (isPlaying) a.play().catch(() => {});
    else a.pause();
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    const a = audioRef.current;
    if (a) a.volume = muted ? 0 : volume;
  }, [volume, muted]);

  const playTrackList = useCallback((trackList, startId) => {
    setQueue(trackList);
    const idx = trackList.findIndex((t) => t.id === startId);
    setCurrentIndex(idx === -1 ? 0 : idx);
    setIsPlaying(true);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!currentTrack) return;
    setIsPlaying((p) => !p);
  }, [currentTrack]);

  const goNext = useCallback(() => {
    if (currentIndex === null || queue.length === 0) return;
    if (shuffle) {
      let next = Math.floor(Math.random() * queue.length);
      if (queue.length > 1 && next === currentIndex) next = (next + 1) % queue.length;
      setCurrentIndex(next);
    } else if (currentIndex < queue.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (repeatMode === "all") {
      setCurrentIndex(0);
    } else {
      setIsPlaying(false);
    }
  }, [currentIndex, queue, shuffle, repeatMode]);

  const goPrev = useCallback(() => {
    if (currentIndex === null) return;
    const a = audioRef.current;
    if (a && a.currentTime > 3) {
      a.currentTime = 0;
      return;
    }
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    else if (repeatMode === "all") setCurrentIndex(queue.length - 1);
  }, [currentIndex, queue, repeatMode]);

  const handleEnded = useCallback(() => {
    if (repeatMode === "one") {
      const a = audioRef.current;
      if (a) {
        a.currentTime = 0;
        a.play().catch(() => {});
      }
      return;
    }
    goNext();
  }, [repeatMode, goNext]);

  const cycleRepeat = useCallback(
    () => setRepeatMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off")),
    []
  );

  const seek = useCallback(
    (ratio) => {
      const a = audioRef.current;
      if (!a || !duration) return;
      a.currentTime = ratio * duration;
      setProgress(a.currentTime);
    },
    [duration]
  );

  const value = {
    queue,
    currentIndex,
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    muted,
    shuffle,
    repeatMode,
    lyricsOpen,
    setLyricsOpen,
    setVolume,
    setMuted,
    setShuffle,
    playTrackList,
    togglePlayPause,
    goNext,
    goPrev,
    cycleRepeat,
    seek,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={handleEnded}
      />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
