"use client";

import { useState } from "react";
import { Check, X, Sparkles, ShieldCheck } from "lucide-react";
import { approveTrack, rejectTrack } from "./actions";

const ACCENT = "#C25450";

export default function ReviewList({ initialTracks }) {
  const [tracks, setTracks] = useState(initialTracks);
  const [rejectingId, setRejectingId] = useState(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const handleApprove = async (id) => {
    setBusy(true);
    await approveTrack(id);
    setTracks((prev) => prev.filter((t) => t.id !== id));
    setBusy(false);
  };

  const handleReject = async () => {
    setBusy(true);
    await rejectTrack(rejectingId, note.trim());
    setTracks((prev) => prev.filter((t) => t.id !== rejectingId));
    setBusy(false);
    setRejectingId(null);
    setNote("");
  };

  if (tracks.length === 0) {
    return <p className="text-sm py-6" style={{ color: "#948B89" }}>Tidak ada unggahan yang menunggu tinjauan. Semua bersih.</p>;
  }

  return (
    <div className="space-y-2">
      {tracks.map((t) => {
        const submitterLabel = t.is_upload ? `Pendengar: ${t.uploader?.display_name || "-"}` : `Artis: ${t.artist?.name || "-"}`;
        return (
          <div key={t.id} className="rounded-xl p-4" style={{ background: "#1B1717" }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#262121", color: "#C7BFBD" }}>{submitterLabel}</span>
              {t.declared_original && (
                <span className="flex items-center gap-1 text-[11px]" style={{ color: "#8FBF8A" }}>
                  <ShieldCheck size={12} /> Menyatakan orisinal
                </span>
              )}
            </div>
            <p className="text-sm font-medium mb-1">{t.title}</p>
            <p className="text-xs mb-1" style={{ color: "#948B89" }}>{t.album}</p>
            <p className="text-xs flex items-center gap-1 mb-3" style={{ color: "#8F7FE8" }}>
              <Sparkles size={12} /> {t.ai_tool || "Tidak dicantumkan"}
            </p>

            {rejectingId === t.id ? (
              <div>
                <textarea
                  autoFocus
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="Alasan penolakan (opsional, default: bukan karya AI baru)"
                  className="w-full mb-2 px-3 py-2 rounded-md text-xs outline-none resize-none"
                  style={{ background: "#101011", color: "#EDE9E7" }}
                />
                <div className="flex gap-2">
                  <button disabled={busy} onClick={handleReject} className="text-xs px-3 py-1.5 rounded-md font-medium" style={{ background: ACCENT, color: "#121011", opacity: busy ? 0.6 : 1 }}>
                    Konfirmasi Tolak
                  </button>
                  <button disabled={busy} onClick={() => { setRejectingId(null); setNote(""); }} className="text-xs px-3 py-1.5 rounded-md" style={{ background: "#262121", color: "#C7BFBD" }}>
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button disabled={busy} onClick={() => handleApprove(t.id)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium" style={{ background: "#3A6B4F", color: "#fff", opacity: busy ? 0.6 : 1 }}>
                  <Check size={13} /> Setujui
                </button>
                <button disabled={busy} onClick={() => setRejectingId(t.id)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md" style={{ background: "#262121", color: "#C7BFBD" }}>
                  <X size={13} /> Tolak
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
      }
    
