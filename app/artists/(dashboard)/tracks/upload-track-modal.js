"use client";

import { useState } from "react";
import { X, Sparkles, UploadCloud } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadPublicFile } from "@/lib/supabase/upload";
import { GENRES } from "@/lib/genres";
import { createTrack } from "./actions";

const ACCENT = "#4FA382";

export default function UploadTrackModal({ artistId, onClose, onCreated }) {
  const [form, setForm] = useState({ title: "", album: "", genre: GENRES[0].id, ai_tool: "" });
  const [declaredOriginal, setDeclaredOriginal] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError("Judul lagu wajib diisi.");
      return;
    }
    if (!form.ai_tool.trim()) {
      setError("Wajib isi nama aplikasi AI Pro yang dipakai.");
      return;
    }
    if (!declaredOriginal) {
      setError("Centang dulu pernyataan orisinalitasnya.");
      return;
    }
    if (!audioFile) {
      setError("Pilih file audio dulu.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const supabase = createClient();
      const audio_url = await uploadPublicFile(supabase, "audio", audioFile, `${artistId}-`);
      const cover_url = coverFile ? await uploadPublicFile(supabase, "covers", coverFile, `${artistId}-`) : null;

      const fields = {
        title: form.title.trim(),
        album: form.album.trim(),
        genre: form.genre,
        ai_tool: form.ai_tool.trim(),
        declared_original: declaredOriginal,
        audio_url,
        cover_url,
      };

      await createTrack(artistId, fields);

      // We don't get the new row's real id/streams_count back from the
      // Server Action here, so build a placeholder for optimistic display —
      // a refresh (or the next navigation) will show the real database row.
      onCreated({ id: `temp-${Date.now()}`, streams_count: 0, taken_down: false, review_status: "pending", review_note: null, ...fields });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/50" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full md:w-[26rem] rounded-t-xl md:rounded-xl p-5 max-h-[85vh] overflow-y-auto"
        style={{ background: "#181C1B" }}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">Tambah Lagu Baru</span>
          <button onClick={onClose} style={{ color: "#8B948F" }}><X size={16} /></button>
        </div>
        <p className="text-[11px] mb-4" style={{ color: "#5C645F" }}>
          Streamo AI khusus untuk musik baru buatan AI Pro — bukan cover. Lagu akan menunggu tinjauan staf sebelum tayang.
        </p>

        <label className="text-xs block mb-1" style={{ color: "#8B948F" }}>Judul</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full mb-3 px-3 py-2 rounded-md text-sm outline-none"
          style={{ background: "#101312", color: "#EDEFEC" }}
        />

        <label className="text-xs block mb-1" style={{ color: "#8B948F" }}>Album</label>
        <input
          value={form.album}
          onChange={(e) => setForm({ ...form, album: e.target.value })}
          className="w-full mb-3 px-3 py-2 rounded-md text-sm outline-none"
          style={{ background: "#101312", color: "#EDEFEC" }}
        />

        <label className="text-xs block mb-1" style={{ color: "#8B948F" }}>Genre</label>
        <select
          value={form.genre}
          onChange={(e) => setForm({ ...form, genre: e.target.value })}
          className="w-full mb-3 px-3 py-2 rounded-md text-sm outline-none"
          style={{ background: "#101312", color: "#EDEFEC" }}
        >
          {GENRES.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>

        <label className="text-xs flex items-center gap-1 mb-1" style={{ color: "#8B948F" }}>
          <Sparkles size={11} /> Dibuat dengan AI (wajib, versi Pro)
        </label>
        <input
          value={form.ai_tool}
          onChange={(e) => setForm({ ...form, ai_tool: e.target.value })}
          placeholder="mis. Suno AI Pro, Udio Pro, dst."
          className="w-full mb-3 px-3 py-2 rounded-md text-sm outline-none"
          style={{ background: "#101312", color: "#EDEFEC" }}
        />

        <label className="flex items-start gap-2 text-xs mb-4 cursor-pointer" style={{ color: "#B7BEB9" }}>
          <input type="checkbox" checked={declaredOriginal} onChange={(e) => setDeclaredOriginal(e.target.checked)} className="mt-0.5" />
          <span>Saya menyatakan lagu ini karya baru yang benar-benar dibuat dengan AI, bukan cover atau lagu orang lain.</span>
        </label>

        <label className="text-xs block mb-1" style={{ color: "#8B948F" }}>File audio (wajib)</label>
        <label className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm cursor-pointer mb-3" style={{ background: "#101312", color: audioFile ? "#EDEFEC" : "#5C645F" }}>
          <UploadCloud size={15} />
          {audioFile ? audioFile.name : "Pilih file .mp3 / .wav"}
          <input type="file" accept="audio/*" className="hidden" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
        </label>

        <label className="text-xs block mb-1" style={{ color: "#8B948F" }}>Cover (opsional)</label>
        <label className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm cursor-pointer mb-4" style={{ background: "#101312", color: coverFile ? "#EDEFEC" : "#5C645F" }}>
          <UploadCloud size={15} />
          {coverFile ? coverFile.name : "Pilih gambar cover"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
        </label>

        {error && <p className="text-xs mb-3" style={{ color: "#E28A87" }}>{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2 rounded-md text-sm font-medium"
            style={{ background: ACCENT, color: "#101312", opacity: saving ? 0.6 : 1 }}
          >
            {saving ? "Mengunggah..." : "Unggah Lagu"}
          </button>
          <button onClick={onClose} className="flex-1 py-2 rounded-md text-sm" style={{ color: "#8B948F" }}>
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
