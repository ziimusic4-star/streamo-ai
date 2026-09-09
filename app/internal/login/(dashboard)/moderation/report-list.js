"use client";

import { useState, useTransition } from "react";
import { resolveReport } from "./actions";

const ACCENT = "#C25450";

function targetLabel(r) {
  if (r.target_track) return `${r.target_track.title}${r.target_track.artist ? " — " + r.target_track.artist.name : ""}`;
  if (r.target_profile) return `Pengguna: ${r.target_profile.display_name}`;
  return "Target tidak diketahui";
}

export default function ReportList({ initialPending, initialResolved }) {
  const [pending, setPending] = useState(initialPending);
  const [resolved, setResolved] = useState(initialResolved);
  const [isPending, startTransition] = useTransition();

  const handleResolve = (report, outcome) => {
    startTransition(async () => {
      await resolveReport(report.id, outcome);
      setPending((prev) => prev.filter((r) => r.id !== report.id));
      setResolved((prev) => [{ ...report, status: outcome }, ...prev]);
    });
  };

  return (
    <div>
      {pending.length === 0 ? (
        <p className="text-sm py-6" style={{ color: "#948B89" }}>Tidak ada laporan yang menunggu. Semua bersih.</p>
      ) : (
        <div className="space-y-2 mb-8">
          {pending.map((r) => (
            <div key={r.id} className="rounded-xl p-4" style={{ background: "#1B1717" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#262121", color: "#C7BFBD" }}>
                  {r.type}
                </span>
              </div>
              <p className="text-sm font-medium mb-1">{targetLabel(r)}</p>
              <p className="text-xs mb-3" style={{ color: "#948B89" }}>{r.note}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  disabled={isPending}
                  onClick={() => handleResolve(r, "removed")}
                  className="text-xs px-3 py-1.5 rounded-md font-medium"
                  style={{ background: ACCENT, color: "#121011", opacity: isPending ? 0.6 : 1 }}
                >
                  {r.type === "Akun" ? "Suspend Akun" : "Hapus Konten"}
                </button>
                <button
                  disabled={isPending}
                  onClick={() => handleResolve(r, "dismissed")}
                  className="text-xs px-3 py-1.5 rounded-md"
                  style={{ background: "#262121", color: "#C7BFBD", opacity: isPending ? 0.6 : 1 }}
                >
                  Tolak Laporan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <>
          <p className="text-sm font-medium mb-3">Riwayat</p>
          <div className="space-y-1">
            {resolved.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-3 py-2.5 rounded-md" style={{ opacity: 0.6 }}>
                <div>
                  <p className="text-sm">{targetLabel(r)}</p>
                  <p className="text-xs" style={{ color: "#948B89" }}>{r.type}</p>
                </div>
                <span className="text-xs" style={{ color: "#948B89" }}>
                  {r.status === "dismissed" ? "Ditolak" : r.status === "removed" ? "Dihapus" : "Selesai"}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
  }
            
