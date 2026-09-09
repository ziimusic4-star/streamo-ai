"use client";

import { createContext, useContext, useState, useCallback } from "react";

const AppMetaContext = createContext(null);

export function AppMetaProvider({ initialPlaylists, isPremium, children }) {
  const [playlists, setPlaylists] = useState(initialPlaylists);
  const [offlineMode, setOfflineMode] = useState(false);

  const addPlaylistLocal = useCallback((playlist) => {
    setPlaylists((prev) => [...prev, playlist]);
  }, []);

  return (
    <AppMetaContext.Provider value={{ playlists, addPlaylistLocal, isPremium, offlineMode, setOfflineMode }}>
      {children}
    </AppMetaContext.Provider>
  );
}

export function useAppMeta() {
  const ctx = useContext(AppMetaContext);
  if (!ctx) throw new Error("useAppMeta must be used within AppMetaProvider");
  return ctx;
}
