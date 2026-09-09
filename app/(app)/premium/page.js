"use client";

import Link from "next/link";
import { Crown, CheckCircle2 } from "lucide-react";
import { useAppMeta } from "@/components/listener/app-meta-context";

const PLANS = [
  { id: "weekly", name: "Mingguan", price: 12000, period: "/minggu" },
  { id: "monthly", name: "Bulanan", price: 39000, period: "/bulan", badge: "Populer" },
  { id: "yearly", name: "Tahunan", price: 349000, period: "/tahun", badge: "Hemat" },
];

const formatIDR = (n) => `Rp${n.toLocaleString("id-ID")}`;

export default function PremiumPage() {
  const { isPremium } = useAppMeta();

  if (isPremium) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Crown size={24} color="#E8B94A" />
          <h1 className="fraunces text-2xl">Kamu sudah Premium</h1>
        </div>
        <Link href="/premium/manage" className="text-sm px-4 py-2 rounded-md inline-block" style={{ background: "#E8B94A", color: "#15120F" }}>
          Kelola langganan
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Crown size={26} color="#E8B94A" />
        <h1 className="fraunces text-2xl md:text-3xl">Streamo AI Premium</h1>
      </div>
      <p className="text-sm mb-6" style={{ color: "#8A8178" }}>Dengarkan dan simpan lebih banyak, tanpa batas.</p>

      <div className="rounded-xl p-5 mb-8" style={{ background: "linear-gradient(135deg, #E8B94A33, #15120F 70%)" }}>
        <p className="text-sm font-medium mb-3">Yang kamu dapatkan:</p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2"><CheckCircle2 size={15} color="#E8B94A" /> Unduhan offline tanpa batas</li>
          <li className="flex items-center gap-2"><CheckCircle2 size={15} color="#E8B94A" /> Playlist tanpa batas</li>
          <li className="flex items-center gap-2"><CheckCircle2 size={15} color="#E8B94A" /> Lencana Premium di profil</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {PLANS.map((p) => (
          <div
            key={p.id}
            className="rounded-xl p-5 flex flex-col"
            style={{ background: "#1C1815", border: p.badge ? "1px solid #E8B94A" : "1px solid #221D18" }}
          >
            {p.badge && (
              <span className="text-[10px] font-medium mb-2 self-start px-2 py-0.5 rounded-full" style={{ background: "#E8B94A", color: "#15120F" }}>
                {p.badge}
              </span>
            )}
            <p className="text-sm mb-1" style={{ color: "#8A8178" }}>{p.name}</p>
            <p className="fraunces text-2xl mb-1">{formatIDR(p.price)}</p>
            <p className="text-xs mb-4" style={{ color: "#8A8178" }}>{p.period}</p>
            <Link
              href={`/premium/checkout?plan=${p.id}`}
              className="mt-auto py-2 rounded-md text-sm font-medium text-center"
              style={{ background: "#E8B94A", color: "#15120F" }}
            >
              Pilih paket
            </Link>
          </div>
        ))}
      </div>

      <p className="text-[11px]" style={{ color: "#6B6459" }}>Mode demo — tidak ada pembayaran sungguhan yang diproses.</p>
    </div>
  );
      }

