"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Disc3, ShieldCheck, LayoutDashboard, ListMusic, UserCircle2 } from "lucide-react";
import SignOutButton from "./sign-out-button";

const ACCENT = "#4FA382";

const NAV = [
  { href: "/artists/overview", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/artists/tracks", label: "Musik Saya", icon: ListMusic },
  { href: "/artists/profile", label: "Profil Artis", icon: UserCircle2 },
];

export default function ArtistShell({ artistName, children }) {
  const pathname = usePathname();

  return (
    <div
      className="w-full min-h-screen flex flex-col"
      style={{ background: "#101312", color: "#EDEFEC", fontFamily: "'Public Sans', ui-sans-serif, system-ui" }}
    >
      <div className="flex items-center justify-between px-5 md:px-8 py-4 border-b flex-shrink-0" style={{ borderColor: "#1D2220" }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: ACCENT }}>
            <Disc3 size={15} color="#101312" />
          </div>
          <span className="fraunces text-lg">Streamo AI for Artists</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-sm">
            <span>{artistName}</span>
            <ShieldCheck size={14} color={ACCENT} />
          </div>
          <SignOutButton />
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="w-56 flex-shrink-0 border-r px-3 py-5 hidden md:block" style={{ borderColor: "#1D2220" }}>
          {NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm mb-1"
                style={{ background: active ? "#1D2220" : "transparent", color: active ? ACCENT : "#B7BEB9" }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t flex" style={{ background: "#101312", borderColor: "#1D2220" }}>
          {NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 flex flex-col items-center gap-1 py-2.5"
                style={{ color: active ? ACCENT : "#8B948F" }}
              >
                <Icon size={18} />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto px-5 md:px-10 py-6 md:py-8 pb-24 md:pb-8">{children}</div>
      </div>
    </div>
  );
}
