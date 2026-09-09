"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Disc3 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const ACCENT = "#4FA382";

export default function ArtistLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (signInError) {
      setError("Email atau password salah.");
      return;
    }

    router.push("/artists/overview");
    router.refresh();
  };

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center px-4"
      style={{ background: "#101312", color: "#EDEFEC", fontFamily: "'Public Sans', ui-sans-serif, system-ui" }}
    >
      <form onSubmit={login} className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-7">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2" style={{ background: ACCENT }}>
            <Disc3 size={20} color="#101312" />
          </div>
          <h1 className="fraunces text-2xl">Streamo AI for Artists</h1>
          <p className="text-sm mt-1 text-center" style={{ color: "#8B948F" }}>
            Kelola profil, lagu, dan lihat statistik pendengarmu.
          </p>
        </div>

        <div className="space-y-3">
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email artis"
            className="w-full px-3 py-2.5 rounded-md text-sm outline-none"
            style={{ background: "#181C1B", color: "#EDEFEC" }}
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-3 py-2.5 rounded-md text-sm outline-none"
            style={{ background: "#181C1B", color: "#EDEFEC" }}
          />
          {error && <p className="text-xs" style={{ color: "#E28A87" }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-md text-sm font-medium"
            style={{ background: ACCENT, color: "#101312", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </div>

        <p className="text-[11px] leading-relaxed text-center mt-7" style={{ color: "#5C645F" }}>
          Akun artis dibuat oleh tim Streamo AI lewat Supabase Dashboard, lalu ditautkan ke satu
          profil artis di tabel <code>artists</code>. Belum bisa daftar mandiri — proses
          verifikasinya masih manual untuk sekarang. Streamo AI khusus musik baru buatan AI versi
          Pro — cover atau lagu non-AI akan ditolak saat ditinjau staf.
        </p>
      </form>
    </div>
  );
    }
      
