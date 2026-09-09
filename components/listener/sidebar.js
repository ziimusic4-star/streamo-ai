"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Disc3, Home, Search, Library, UploadCloud, Heart, Download, ListMusic,
  Plus, Crown, WifiOff, LogOut, X, LifeBuoy
} from "lucide-react";
import { useAppMeta } from "./app-meta-context";
import { createPlaylist } from "@/app/(app)/actions";
import { createClient } from "@/lib/supabase/client";

export default function Sidebar({ displayName, sidebarOpen, onCloseSidebar }) {
  const pathname = usePathname();
  const router = useRouter();
  const { playlists, addPlaylistLocal, isPremium, offlineMode, setOfflineMode } = useAppMeta();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");

  const isActive = (href) => pathname === href;

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    const res = await createPlaylist(name);
    if (res.ok) {
      addPlaylistLocal(res.playlist);
      setNewName("");
      setCreating(false);
      setError("");
    } else {
      setError(res.message);
    }
  };

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <div
        className={`fixed md:static z-30 inset-y-0 left-0 w-64 flex-shrink-0 border-r flex flex-col transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        style={{ background: "#15120F", borderColor: "#221D18" }}
      >
        <div className="hidden md:flex items-center gap-2 px-6 pt-6 pb-4">
          <Disc3 size={22} color="#C97B4A" />
          <span className="fraunces text-xl">Streamo AI</span>
        </div>
        <button onClick={onCloseSidebar} className="md:hidden self-end mr-4 mt-4 mb-2" style={{ color: "#8A8178" }}>
          <X size={20} />
        </button>

        <nav className="px-3 mt-2 space-y-1">
          <NavLink href="/" icon={Home} label="Beranda" active={isActive("/")} onClick={onCloseSidebar} />
          <NavLink href="/search" icon={Search} label="Cari" active={isActive("/search")} onClick={onCloseSidebar} />
          <NavLink href="/library" icon={Library} label="Koleksi" active={isActive("/library")} onClick={onCloseSidebar} />
          <NavLink href="/uploads" icon={UploadCloud} label="Unggahan Saya" active={isActive("/uploads")} onClick={onCloseSidebar} />
          <NavLink href="/support" icon={LifeBuoy} label="Bantuan" active={isActive("/support")} onClick={onCloseSidebar} />
        </nav>

        <div className="px-3 mt-1">
          <Link
            href="/premium"
            onClick={onCloseSidebar}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm"
            style={{
              background: pathname.startsWith("/premium") ? "#221D18" : "transparent",
              color: isPremium ? "#E8B94A" : "#B5ACA0",
              border: isPremium ? "1px solid #3A2E1E" : "1px dashed #3A2E1E",
            }}
          >
            <Crown size={16} color={isPremium ? "#E8B94A" : "#B5ACA0"} />
            <span className="truncate">{isPremium ? "Premium Aktif" : "Upgrade ke Premium"}</span>
          </Link>
        </div>

        <div className="mx-3 mt-3 flex items-center justify-between px-3 py-2.5 rounded-md" style={{ background: "#1C1815" }}>
          <div className="flex items-center gap-2">
            <WifiOff size={14} color={offlineMode ? "#C97B4A" : "#8A8178"} />
            <span className="text-xs" style={{ color: "#B5ACA0" }}>Mode Offline</span>
          </div>
          <button
            onClick={() => setOfflineMode((v) => !v)}
            className="relative rounded-full flex-shrink-0"
            style={{ background: offlineMode ? "#C97B4A" : "#332C24", height: 18, width: 32 }}
          >
            <span
              className="absolute top-0.5 left-0.5 rounded-full bg-white"
              style={{ width: 14, height: 14, transform: offlineMode ? "translateX(14px)" : "translateX(0)" }}
            />
          </button>
        </div>

        <div className="px-6 mt-5 mb-2 flex items-center justify-between">
          <span className="text-xs tracking-wide" style={{ color: "#8A8178" }}>Playlist</span>
          <button onClick={() => setCreating(true)} style={{ color: "#8A8178" }}><Plus size={15} /></button>
        </div>

        {creating && (
          <div className="px-4 mb-2">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Nama playlist"
              className="w-full text-sm px-2 py-1.5 rounded outline-none"
              style={{ background: "#1C1815", color: "#F2EDE4" }}
            />
            {error && <p className="text-xs mt-1" style={{ color: "#B0473E" }}>{error}</p>}
            <div className="flex gap-2 mt-1.5">
              <button onClick={handleCreate} className="text-xs px-2 py-1 rounded" style={{ background: "#C97B4A", color: "#15120F" }}>Simpan</button>
              <button onClick={() => { setCreating(false); setNewName(""); setError(""); }} className="text-xs px-2 py-1 rounded" style={{ color: "#8A8178" }}>Batal</button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <NavLink href="/liked" icon={Heart} label="Lagu Disukai" active={isActive("/liked")} onClick={onCloseSidebar} />
          <NavLink href="/downloaded" icon={Download} label="Diunduh" active={isActive("/downloaded")} onClick={onCloseSidebar} />
          {playlists.map((p) => (
            <NavLink
              key={p.id}
              href={`/playlist/${p.id}`}
              icon={ListMusic}
              label={p.name}
              active={pathname === `/playlist/${p.id}`}
              onClick={onCloseSidebar}
            />
          ))}
        </div>

        <div className="px-3 py-3 border-t flex items-center justify-between flex-shrink-0" style={{ borderColor: "#221D18" }}>
          <p className="text-xs truncate">{displayName}</p>
          <button onClick={logout} title="Keluar"><LogOut size={15} color="#8A8178" /></button>
        </div>
      </div>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={onCloseSidebar} />}
    </>
  );
}

function NavLink({ href, icon: Icon, label, active, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-left"
      style={{ background: active ? "#221D18" : "transparent", color: active ? "#F2EDE4" : "#B5ACA0" }}
    >
      <Icon size={16} />
      <span className="truncate">{label}</span>
    </Link>
  );
}
