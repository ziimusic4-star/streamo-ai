"use client";

import { useState } from "react";
import { X, ListMusic, Flag } from "lucide-react";
import { useAppMeta } from "./app-meta-context";
import { addTrackToPlaylist, fileReport } from "@/app/(app)/actions";

export default function TrackMenu({ trackId, onClose, onToast }) {
  const { playlists } = useAppMeta();
  const [mode, setMode] = useState("menu"); // menu | report
  const [reportType, setReportType] = useState("Konten");
  const [reportNote, setReportNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async (playlistId) => {
    const res = await addTrackToPlaylist(playlistId, trackId);
    onToast?.(res.ok ? "Ditambahkan ke playlist" : res.message);
    onClose();
  };

  const handleReport = async () => {
    setSubmitting(true);
    const res = await fileReport(reportType, trackId, reportNote);
    setSubmitting(false);
    onToast?.(res.ok ? "Laporan terkirim, tim kami akan meninjau." : res.message);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/50" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full md:w-80 rounded-t-xl md:rounded-xl p-4 max-h-[70vh] overflow-y-auto"
        style={{ background: "#1C1815" }}
      >
        {mode === "menu" ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Tambahkan ke playlist</span>
              <button onClick={onClose} style={{ color: "#8A8178" }}><X size={16} /></button>
            </div>
            {playlists.length === 0 && (
              <p className="text-sm mb-2" style={{ color: "#8A8178" }}>Belum ada playlist.</p>
            )}
            {playlists.map((p) => (
              <button
                key={p.id}
                onClick={() => handleAdd(p.id)}
                className="w-full text-left px-2 py-2.5 rounded flex items-center gap-2 hover:bg-[#231D18]"
              >
                <ListMusic size={15} color="#8A8178" />
                <span className="text-sm">{p.name}</span>
              </button>
            ))}
            <div className="border-t mt-2 pt-2" style={{ borderColor: "#2A241E" }}>
              <button
                onClick={() => setMode("report")}
                className="w-full text-left px-2 py-2.5 rounded flex items-center gap-2 hover:bg-[#231D18]"
                style={{ color: "#B0473E" }}
              >
                <Flag size={15} />
                <span className="text-sm">Laporkan lagu ini</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Laporkan Lagu</span>
              <button onClick={onClose} style={{ color: "#8A8178" }}><X size={16} /></button>
            </div>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full mb-3 px-3 py-2 rounded-md text-sm outline-none"
              style={{ background: "#12100E", color: "#F2EDE4" }}
            >
              <option value="Konten">Konten bermasalah</option>
              <option value="Hak Cipta">Pelanggaran hak cipta</option>
            </select>
            <textarea
              value={reportNote}
              onChange={(e) => setReportNote(e.target.value)}
              rows={3}
              placeholder="Jelaskan sedikit (opsional)"
              className="w-full mb-3 px-3 py-2 rounded-md text-sm outline-none resize-none"
              style={{ background: "#12100E", color: "#F2EDE4" }}
            />
            <button
              onClick={handleReport}
              disabled={submitting}
              className="w-full py-2 rounded-md text-sm font-medium"
              style={{ background: "#B0473E", color: "#fff", opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? "Mengirim..." : "Kirim Laporan"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
