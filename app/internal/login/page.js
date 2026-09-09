"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function StaffLoginPage() {
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

    router.push("/internal/overview");
    router.refresh();
  };

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center px-4"
      style={{ background: "#121011", color: "#EDE9E7", fontFamily: "'Public Sans', ui-sans-serif, system-ui" }}
    >
      <form onSubmit={login} className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-7">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2" style={{ background: "#C25450" }}>
            <ShieldCheck size={20} color="#121011" />
          </div>
          <h1 className="fraunces text-2xl">Streamo AI Internal</h1>
          <p className="text-sm mt-1 text-center" style={{ color: "#948B89" }}>
            Akses staf — moderasi, katalog, dan dukungan pengguna.
          </p>
        </div>

        <div className="space-y-3">
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email staf"
            className="w-full px-3 py-2.5 rounded-md text-sm outline-none"
            style={{ background: "#1B1717", color: "#EDE9E7" }}
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-3 py-2.5 rounded-md text-sm outline-none"
            style={{ background: "#1B1717", color: "#EDE9E7" }}
          />
          {error && <p className="text-xs" style={{ color: "#E28A87" }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-md text-sm font-medium"
            style={{ background: "#C25450", color: "#121011", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </div>

        <p className="text-[11px] leading-relaxed text-center mt-7" style={{ color: "#5C5654" }}>
          Akun staf dibuat manual lewat Supabase Dashboard (Authentication → Add user), lalu
          perannya di-set jadi <code>staff</code> di tabel <code>profiles</code>. Tidak ada
          pendaftaran mandiri di portal ini — sengaja, karena ini akses internal.
        </p>
      </form>
    </div>
  );
    }
      
