"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Disc3, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ListenerLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    const supabase = createClient();

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName.trim() || email.split("@")[0] } },
      });
      setLoading(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (!data.session) {
        // Email confirmation is likely enabled on this Supabase project.
        setInfo("Akun dibuat. Cek email kamu untuk konfirmasi sebelum masuk.");
        return;
      }
      router.push("/");
      router.refresh();
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError("Email atau password salah.");
      return;
    }
    router.push("/");
    router.refresh();
  };

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center px-4"
      style={{ background: "#12100E", color: "#F2EDE4", fontFamily: "'Public Sans', ui-sans-serif, system-ui" }}
    >
      <form onSubmit={submit} className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-7">
          <Disc3 size={34} color="#C97B4A" />
          <h1 className="fraunces text-2xl mt-2">Streamo AI</h1>
          <p className="text-sm mt-1" style={{ color: "#8A8178" }}>Musik yang dibuat dengan AI Pro.</p>
        </div>

        <div className="flex rounded-md overflow-hidden mb-5" style={{ background: "#1C1815" }}>
          <button
            type="button"
            onClick={() => setMode("login")}
            className="flex-1 py-2 text-sm"
            style={{ background: mode === "login" ? "#221D18" : "transparent", color: mode === "login" ? "#F2EDE4" : "#8A8178" }}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className="flex-1 py-2 text-sm"
            style={{ background: mode === "signup" ? "#221D18" : "transparent", color: mode === "signup" ? "#F2EDE4" : "#8A8178" }}
          >
            Daftar
          </button>
        </div>

        <div className="space-y-3">
          {mode === "signup" && (
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2" color="#8A8178" />
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nama tampilan"
                className="w-full pl-9 pr-3 py-2.5 rounded-md text-sm outline-none"
                style={{ background: "#1C1815", color: "#F2EDE4" }}
              />
            </div>
          )}
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-3 py-2.5 rounded-md text-sm outline-none"
            style={{ background: "#1C1815", color: "#F2EDE4" }}
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-3 py-2.5 rounded-md text-sm outline-none"
            style={{ background: "#1C1815", color: "#F2EDE4" }}
          />
          {error && <p className="text-xs" style={{ color: "#E28A87" }}>{error}</p>}
          {info && <p className="text-xs" style={{ color: "#8FBF8A" }}>{info}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-md text-sm font-medium"
            style={{ background: "#C97B4A", color: "#15120F", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Memproses..." : mode === "signup" ? "Buat Akun" : "Masuk"}
          </button>
        </div>

        <p className="text-[11px] text-center mt-7" style={{ color: "#6B6459" }}>
          Berbeda dari portal artis dan staf, siapa pun bisa mendaftar jadi pendengar di sini. Streamo AI khusus musik baru buatan AI versi Pro — cover atau lagu non-AI akan ditolak saat ditinjau.
        </p>
      </form>
    </div>
  );
}

