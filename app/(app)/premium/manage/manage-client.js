"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Crown, CheckCircle2 } from "lucide-react";
import { cancelSubscription } from "../actions";

const PLAN_NAMES = { weekly: "Mingguan", monthly: "Bulanan", yearly: "Tahunan" };

export default function ManageClient({ subscription }) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);

  if (!subscription) {
    return (
      <div>
        <p className="text-sm mb-4" style={{ color: "#8A8178" }}>Kamu belum berlangganan Premium.</p>
        <Link href="/premium" className="text-sm px-4 py-2 rounded-md inline-block" style={{ background: "#E8B94A", color: "#15120F" }}>
          Lihat paket Premium
        </Link>
      </div>
    );
  }

  const expiresLabel = new Date(subscription.expires_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleCancel = async () => {
    setCancelling(true);
    await cancelSubscription(subscription.id);
    router.push("/premium");
    router.refresh();
  };

  return (
    <div className="max-w-md">
      <div className="flex items-center gap-2 mb-1">
        <Crown size={22} color="#E8B94A" />
        <h1 className="fraunces text-2xl">Premium Aktif</h1>
      </div>
      <p className="text-sm mb-6" style={{ color: "#8A8178" }}>Terima kasih sudah berlangganan.</p>

      <div className="rounded-xl p-5 mb-6" style={{ background: "#1C1815" }}>
        <p className="text-xs mb-1" style={{ color: "#8A8178" }}>Paket saat ini</p>
        <p className="fraunces text-xl mb-3">{PLAN_NAMES[subscription.plan] || subscription.plan}</p>
        <p className="text-xs" style={{ color: "#8A8178" }}>Berlaku sampai {expiresLabel} (simulasi)</p>
      </div>

      <ul className="space-y-2 text-sm mb-6">
        <li className="flex items-center gap-2"><CheckCircle2 size={15} color="#E8B94A" /> Unduhan offline tanpa batas</li>
        <li className="flex items-center gap-2"><CheckCircle2 size={15} color="#E8B94A" /> Playlist tanpa batas</li>
        <li className="flex items-center gap-2"><CheckCircle2 size={15} color="#E8B94A" /> Lencana Premium di profil</li>
      </ul>

      <button
        onClick={handleCancel}
        disabled={cancelling}
        className="text-sm px-4 py-2 rounded-md"
        style={{ color: "#B0473E", border: "1px solid #B0473E55" }}
      >
        {cancelling ? "Memproses..." : "Batalkan Langganan (Simulasi)"}
      </button>
    </div>
  );
}

