"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QrCode } from "lucide-react";
import { subscribe } from "../actions";

const PLANS = {
  weekly: { name: "Mingguan", price: 12000, period: "/minggu" },
  monthly: { name: "Bulanan", price: 39000, period: "/bulan" },
  yearly: { name: "Tahunan", price: 349000, period: "/tahun" },
};

const WALLETS = [
  { id: "dana", name: "DANA", accent: "#118EEA", type: "wallet" },
  { id: "ovo", name: "OVO", accent: "#4C3494", type: "wallet" },
  { id: "gopay", name: "GoPay", accent: "#00AA5B", type: "wallet" },
  { id: "shopeepay", name: "ShopeePay", accent: "#EE4D2D", type: "wallet" },
  { id: "qris", name: "QRIS", accent: "#8B1E3F", type: "qris" },
];

const formatIDR = (n) => `Rp${n.toLocaleString("id-ID")}`;

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan") || "monthly";
  const plan = PLANS[planId] || PLANS.monthly;

  const [selectedWallet, setSelectedWallet] = useState(null);
  const [walletPhone, setWalletPhone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const wallet = WALLETS.find((w) => w.id === selectedWallet);

  const handleConfirm = async () => {
    if (!selectedWallet) {
      setError("Pilih metode pembayaran dulu");
      return;
    }
    if (wallet.type === "wallet" && walletPhone.trim().replace(/\D/g, "").length < 8) {
      setError("Masukkan nomor e-wallet yang valid");
      return;
    }

    setSubmitting(true);
    const res = await subscribe(planId, selectedWallet);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    router.push("/premium/manage");
    router.refresh();
  };

  return (
    <div className="max-w-md">
      <h1 className="fraunces text-2xl mb-1">Checkout</h1>
      <p className="text-sm mb-6" style={{ color: "#8A8178" }}>Selesaikan langganan Premium kamu.</p>

      <div className="rounded-xl p-4 mb-6 flex items-center justify-between" style={{ background: "#1C1815" }}>
        <div>
          <p className="text-sm font-medium">{plan.name}</p>
          <p className="text-xs" style={{ color: "#8A8178" }}>{plan.period}</p>
        </div>
        <p className="fraunces text-xl">{formatIDR(plan.price)}</p>
      </div>

      <p className="text-sm font-medium mb-3">Pilih metode pembayaran</p>
      <div className="grid grid-cols-3 gap-2 mb-5">
        {WALLETS.map((w) => (
          <button
            key={w.id}
            onClick={() => { setSelectedWallet(w.id); setError(""); }}
            className="rounded-lg py-3 flex flex-col items-center gap-1.5 text-xs font-medium"
            style={{
              background: selectedWallet === w.id ? `${w.accent}22` : "#1C1815",
              border: selectedWallet === w.id ? `1px solid ${w.accent}` : "1px solid #221D18",
              color: "#F2EDE4",
            }}
          >
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold" style={{ background: w.accent, color: "#fff" }}>
              {w.name.slice(0, 1)}
            </span>
            {w.name}
          </button>
        ))}
      </div>

      {selectedWallet && wallet?.type === "wallet" && (
        <div className="mb-5">
          <label className="text-xs block mb-1" style={{ color: "#8A8178" }}>Nomor {wallet.name} kamu</label>
          <input
            value={walletPhone}
            onChange={(e) => setWalletPhone(e.target.value)}
            placeholder="08xxxxxxxxxx"
            inputMode="numeric"
            className="w-full px-3 py-2.5 rounded-md text-sm outline-none"
            style={{ background: "#1C1815", color: "#F2EDE4" }}
          />
        </div>
      )}

      {selectedWallet && wallet?.type === "qris" && (
        <div className="mb-5 flex flex-col items-center rounded-xl py-6" style={{ background: "#1C1815", border: "1px dashed #3A342C" }}>
          <QrCode size={110} color="#F2EDE4" strokeWidth={1} />
          <p className="text-xs mt-3" style={{ color: "#8A8178" }}>Kode QR ilustrasi — bukan kode pembayaran asli</p>
        </div>
      )}

      {error && <p className="text-xs mb-3" style={{ color: "#B0473E" }}>{error}</p>}

      <div className="rounded-md px-3 py-2.5 mb-5 text-[11px] leading-relaxed" style={{ background: "#1C1815", color: "#6B6459" }}>
        Mode demo: tidak ada pembayaran sungguhan yang diproses. Nomor dan kode QR di sini hanya ilustrasi antarmuka.
      </div>

      <button
        onClick={handleConfirm}
        disabled={submitting}
        className="w-full py-3 rounded-md text-sm font-medium"
        style={{ background: "#E8B94A", color: "#15120F", opacity: submitting ? 0.6 : 1 }}
      >
        {submitting ? "Memproses..." : wallet?.type === "qris" ? "Saya sudah membayar (Simulasi)" : "Bayar Sekarang (Simulasi)"}
      </button>
    </div>
  );
}

