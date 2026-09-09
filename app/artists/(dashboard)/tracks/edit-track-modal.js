"use client";

import { useState } from "react";
import { X, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadPublicFile } from "@/lib/supabase/upload";
import { GENRES, resolveGenre } from "@/lib/genres";
import { updateTrack } from "./actions";

const ACCENT = "#4FA382";

export default function EditTrackModal({ track, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: track.title,
    album: track.album || "",
    genre: track.genre,
    ai_tool: track.ai_tool || "",
    cover_url: track.cover_url || null,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCoverPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const supabase = createClient();
      const url = await uploadPublicFile(supabase, "covers", file, `${track.id}-`);
      setForm((f) => ({ ...f, cover_url: url }));
    } catch (err) {
      setError("Gagal unggah cover: " + err.message);
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await updateTrack(track.id, form);
      onSaved(form);
    } catch (err) {
      setError("Gagal menyimpan: " + err.message);
      setSaving(false);
    }
  };

  const g = resolveGenre(form.genre);

  return (
    <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/50" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full md:w-[26rem] rounded-t-xl md:rounded-xl p-5 max-h-[85vh] overflow-y-auto"
        style={{ background: "#181C1B" }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">Edit Lagu</span>
          <button onClick={onClose} style={{ color: "#8B948F" }}><X size={16} /></button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0"
            style={{ background: form.cover_url ? "#000" : `linear-gradient(155deg, ${g.accent} 0%, #14181A 85%)` }}
          >
            {form.cover_url && <img src={form.cover_url} alt="" className="w-full h-full object-cover" />}
          </div>
          <label className="text-xs px-2.5 py-1.5 rounded cursor-pointer text-center" style={{ background: "#232826", color: "#B7BEB9" }}>
            {uploading ? "Mengunggah..." : "Ganti cover"}
            <input type="file" accept="image/*" className="hidden" onChange={handleCoverPick} disabled={uploading} />
          </label>
        </div>

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
          {GENRES.map((g2) => (
            <option key={g2.id} value={g2.id}>{g2.name}</option>
          ))}
        </select>

        <label className="text-xs flex items-center gap-1 mb-1" style={{ color: "#8B948F" }}>
          <Sparkles size={11} /> Dibuat dengan AI (opsional)
        </label>
        <input
          value={form.ai_tool}
          onChange={(e) => setForm({ ...form, ai_tool: e.target.value })}
          placeholder="mis. Suno AI Pro, Udio Pro, dst."
          className="w-full mb-4 px-3 py-2 rounded-md text-sm outline-none"
          style={{ background: "#101312", color: "#EDEFEC" }}
        />

        {error && <p className="text-xs mb-3" style={{ color: "#E28A87" }}>{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="flex-1 py-2 rounded-md text-sm font-medium"
            style={{ background: ACCENT, color: "#101312", opacity: saving || uploading ? 0.6 : 1 }}
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
          <button onClick={onClose} className="flex-1 py-2 rounded-md text-sm" style={{ color: "#8B948F" }}>
            Batal
          </button>
        </div>
      </div>
    </div>
  );
                  }
          
