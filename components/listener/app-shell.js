"use client";

import { useState } from "react";
import { Disc3 } from "lucide-react";
import { PlayerProvider } from "./player-context";
import { AppMetaProvider } from "./app-meta-context";
import Sidebar from "./sidebar";
import NowPlayingBar from "./now-playing-bar";

export default function AppShell({ displayName, initialPlaylists, isPremium, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AppMetaProvider initialPlaylists={initialPlaylists} isPremium={isPremium}>
      <PlayerProvider>
        <div
          className="w-full h-screen flex flex-col overflow-hidden"
          style={{ background: "#12100E", color: "#F2EDE4", fontFamily: "'Public Sans', ui-sans-serif, system-ui" }}
        >
          <div className="md:hidden flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#221D18" }}>
            <button onClick={() => setSidebarOpen(true)} className="flex items-center gap-2">
              <Disc3 size={20} color="#C97B4A" />
              <span className="fraunces text-lg">Streamo AI</span>
            </button>
          </div>

          <div className="flex flex-1 min-h-0">
            <Sidebar displayName={displayName} sidebarOpen={sidebarOpen} onCloseSidebar={() => setSidebarOpen(false)} />
            <div className="flex-1 overflow-y-auto px-5 md:px-10 py-6 md:py-8">{children}</div>
          </div>

          <NowPlayingBar />
        </div>
      </PlayerProvider>
    </AppMetaProvider>
  );
}
