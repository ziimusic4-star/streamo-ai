"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadPublicFile } from "@/lib/supabase/upload";
import TrackTable from "@/components/listener/track-table";
import { useTrackActions } from "@/components/listener/use-track-actions";
import { createUpload, removeUpload } from "./actions";

export default function UploadsClient({ initialTracks }) {
  const { tracks, setTracks, handleToggleLike, handleToggleDownload, toast, flash } = useTrackActions(initialTracks);
  const [pendingFile, setPendingFile] = useState(null);
  const [aiTool, setAiTool] = useState("");
  const [declaredOriginal, setDeclaredOriginal] = useState(false);
  const [formError, setFormError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handlePickFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingFile(file);
      setAiTool("");
      setDeclaredOriginal(false);
      setFormError("");
    }
    e.target.value = "";
  };

  const finalizeUpload = async () => {
    if (!aiTool.trim()) {
      setFormError("Wajib isi nama aplikasi AI Pro yang dipakai.");
      return;
    }
    if (!declaredOriginal) {
      setFormError("Centang dulu pernyataan orisinalitasnya.");
      return;
    }
    if (!pendingFile) return;

    setUploading(true);
    setFormError("");
    try {
      const supabase = createClient();
      const audio_url = await uploadPublicFile(supabase, "audio", pendingFile, "personal-");
      const title = pendingFile.name.replace(/\.[^/.]+$/, "");
      const fields = {
        title,
        album: "Unggahan",
        genre: "upload",
        ai_tool: aiTool.trim(),
        audio_url,
        declared_original: declaredOriginal,
      };
      const res = await createUpload(fields);

      if (res.ok) {
        setTracks((prev) => [
          {
            id: res.id,
            ...fields,
            cover_url: null,
            is_upload: true,
            taken_down: false,
            streams_count: 0,
            artist_name: "Kamu",
            liked: false,
            downloaded: false,
            review_status: "pending",
            review_note: null,
          },
          ...prev,
        ]);
        flash("Lagu dikirim — menunggu tinjauan staf sebelum tayang.");
      } else {
        setFormError(res.message);
        setUploading(false);
        return;
      }
    } catch (err) {
      setFormError("Gagal unggah: " + err.message);
      setUploading(false);
      return;
    }
    setUploading(false);
    setPendingFile(null);
    setAiTool("");
    setDeclaredOriginal(false);
  };

  const handleRemove = async (trackId) => {
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
    const res = await removeUpload(trackId);
    if (!res.ok) flash(res.message);
  };

  return (
    <div>
      <h1 className="fraunces text-2xl md:text-3xl mb-1">Unggahan Saya</h1>
      <p className="text-sm mb-2" style={{ color: "#8A8178" }}>File audio dari perangkatmu — tersimpan permanen di akunmu.</p>
      <p className="text-xs mb-5" style={{ color: "#6B6459" }}>
        Streamo AI khusus untuk musik baru yang dibuat dengan AI versi Pro — bukan cover. Lagu lain akan ditolak saat ditinjau staf.
      </p>

      <label
        className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-full mb-6 cursor-pointer inline-flex"
        style={{ background: "#F2EDE4", color: "#15120F" }}
      >
        <UploadCloud size={15} /> Unggah lagu dari perangkat
        <input type="file" accept="audio/*" className="hidden" onChange={handlePickFile} />
      </label>

      <TrackTable
        tracks={tracks}
        onToggleLike={handleToggleLike}
        onToggleDownload={handleToggleDownload}
        onRemoveUpload={handleRemove}
        onToast={flash}
        emptyLabel="Belum ada unggahan. File audio dari perangkatmu akan muncul di sini."
      />

      {pendingFile && (
        <div
          className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/50"
          onClick={() => !uploading && setPendingFile(null)}
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full md:w-96 rounded-t-xl md:rounded-xl p-5" style={{ background: "#1C1815" }}>
            <p className="text-sm font-medium mb-1">Info Wajib Sebelum Unggah</p>
            <label className="text-xs block mb-1 mt-3" style={{ color: "#8A8178" }}>Dibuat dengan AI apa? (wajib, versi Pro)</label>
            <input
              autoFocus
              value={aiTool}
              onChange={(e) => setAiTool(e.target.value)}
              placeholder="mis. Suno AI Pro, Udio Pro"
              className="w-full mb-3 px-3 py-2.5 rounded-md text-sm outline-none"
              style={{ background: "#12100E", color: "#F2EDE4" }}
            />
            <label className="flex items-start gap-2 text-xs mb-4 cursor-pointer" style={{ color: "#B5ACA0" }}>
              <input
                type="checkbox"
                checked={declaredOriginal}
                onChange={(e) => setDeclaredOriginal(e.target.checked)}
                className="mt-0.5"
              />
              <span>Saya menyatakan lagu ini karya baru yang benar-benar dibuat dengan AI, bukan cover atau lagu orang lain.</span>
            </label>
            {formError && <p className="text-xs mb-3" style={{ color: "#B0473E" }}>{formError}</p>}
            <p className="text-[11px] mb-4" style={{ color: "#6B6459" }}>
              Lagu akan masuk status "menunggu tinjauan" sampai staf menyetujuinya.
            </p>
            <div className="flex gap-2">
              <button
                onClick={finalizeUpload}
                disabled={uploading}
                className="flex-1 py-2 rounded-md text-sm font-medium"
                style={{ background: "#C97B4A", color: "#15120F", opacity: uploading ? 0.6 : 1 }}
              >
                {uploading ? "Mengunggah..." : "Kirim untuk Ditinjau"}
              </button>
              <button onClick={() => setPendingFile(null)} disabled={uploading} className="flex-1 py-2 rounded-md text-sm" style={{ color: "#8A8178" }}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className="fixed left-1/2 -translate-x-1/2 bottom-24 md:bottom-6 z-50 px-4 py-2 rounded-full text-sm"
          style={{ background: "#F2EDE4", color: "#15120F" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
    }
        
