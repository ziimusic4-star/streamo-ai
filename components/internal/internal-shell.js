"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, LayoutDashboard, Flag, ListMusic, LifeBuoy, FileCheck } from "lucide-react";
import SignOutButton from "./sign-out-button";

const ACCENT = "#C25450";

const NAV = [
  { href: "/internal/overview", label: "Ringkasan", icon: LayoutDashboard, badgeKey: null },
  { href: "/internal/review", label: "Tinjau Unggahan", icon: FileCheck, badgeKey: "review" },
  { href: "/internal/moderation", label: "Moderasi", icon: Flag, badgeKey: "pending" },
  { href: "/internal/catalog", label: "Katalog", icon: ListMusic, badgeKey: null },
  { href: "/internal/tickets", label: "Tiket Dukungan", icon: LifeBuoy, badgeKey: "tickets" },
];

export default function InternalShell({ staffName, pendingCount, openTicketCount, pendingReviewCount, children }) {
  const pathname = usePathname();
  const badges = { pending: pendingCount, tickets: openTicketCount, review: pendingReviewCount };

  return (
    <div
      className="w-full min-h-screen flex flex-col"
      style={{ background: "#121011", color: "#EDE9E7", fontFamily: "'Public Sans', ui-sans-serif, system-ui" }}
    >
      <div className="flex items-center justify-between px-5 md:px-8 py-4 border-b flex-shrink-0" style={{ borderColor: "#221D1D" }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: ACCENT }}>
            <ShieldCheck size={15} color="#121011" />
          </div>
          <span className="fraunces text-lg">Streamo AI Internal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:block text-sm">{staffName}</span>
          <SignOutButton />
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="w-56 flex-shrink-0 border-r px-3 py-5 hidden md:block" style={{ borderColor: "#221D1D" }}>
          {NAV.map((item) => {
            const active = pathname === item.href;
            const badge = item.badgeKey ? badges[item.badgeKey] : 0;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm mb-1"
                style={{ background: active ? "#221D1D" : "transparent", color: active ? ACCENT : "#C7BFBD" }}
              >
                <Icon size={16} />
                <span className="flex-1">{item.label}</span>
                {!!badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: ACCENT, color: "#121011" }}>
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t flex" style={{ background: "#121011", borderColor: "#221D1D" }}>
          {NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 flex flex-col items-center gap-1 py-2.5"
                style={{ color: active ? ACCENT : "#948B89" }}
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
