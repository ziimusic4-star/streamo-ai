"use client";

import { useState } from "react";
import { ShieldCheck, ShieldOff, UserCircle2, UploadCloud } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadPublicFile } from "@/lib/supabase/upload";
import { updateArtistProfile } from "./actions";

const ACCENT = "#4FA382";

export default function ProfileClient({ artist }) {
  const [bio, setBio] = useState(artist.bio || "");
  const [photoUrl, setPhotoUrl] = useState(artist.photo_url || null);
  const [bannerUrl, setBannerUrl] = useState(artist.banner_url || null);
  const [savingBio, setSavingBio] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [toast, setToast] = useState("");

  const flashToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const handleSaveBio = async () => {
    setSavingBio(true);
    try {
      await updateArtistProfile(artist.id, { bio });
      flashToast("Bio diperbarui");
    } catch (err) {
      flashToast("Gagal: " + err.message);
    }
    setSavingBio(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const supabase = createClient();
      const url = await uploadPublicFile(supabase, "avatars", file, `${artist.id}-photo-`);
      await updateArtistProfile(artist.id, { photo_url: url });
      setPhotoUrl(url);
      flashToast("Foto profil diperbarui");
    } catch (err) {
      flashToast("Gagal: " + err.message);
    }
    setUploadingPhoto(false);
    e.target.value = "";
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const supabase = createClient();
      const url = await uploadPublicFile(supabase, "avatars", file, `${artist.id}-banner-`);
      await updateArtistProfile(artist.id, { banner_url: url });
      setBannerUrl(url);
      flashToast("Banner diperbarui");
    } catch (err) {
      flashToast("Gagal: " + err.message);
    }
    setUploadingBanner(false);
    e.target.value = "";
  };

  return (
    <div>
      <div className="rounded-xl overflow-hidden mb-6" style={{ background: "#181C1B" }}>
        <div
          className="h-28 relative"
          style={{ background: bannerUrl ? `url(${bannerUrl}) center/cover` : `linear-gradient(135deg, ${ACCENT}55, #181C1B)` }}
        >
          <label className="absolute bottom-2 right-2 text-xs px-2.5 py-1.5 rounded cursor-pointer flex items-center gap-1.5" style={{ background: "#101312cc", color: "#EDEFEC" }}>
            <UploadCloud size={12} />
            {uploadingBanner ? "Mengunggah..." : "Ganti banner"}
            <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} disabled={uploadingBanner} />
          </label>
        </div>
        <div className="px-5 pb-5 -mt-8 flex items-end gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden border-4 flex items-center justify-center" style={{ borderColor: "#181C1B", background: "#232826" }}>
              {photoUrl ? <img src={photoUrl} alt="" className="w-full h-full object-cover" /> : <UserCircle2 size={34} color="#8B948F" />}
            </div>
            <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer" style={{ background: ACCENT }}>
              <UploadCloud size={12} color="#101312" />
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
            </label>
          </div>
          <div className="pb-1 flex items-center gap-1.5">
            <p className="fraunces text-lg">{artist.name}</p>
            {artist.verified ? <ShieldCheck size={15} color={ACCENT} /> : <ShieldOff size={15} color="#5C645F" />}
          </div>
        </div>
      </div>

      {!artist.verified && (
        <p className="text-xs mb-4" style={{ color: "#5C645F" }}>
          Profil belum terverifikasi — verifikasi dikelola oleh tim Streamo AI lewat portal internal.
        </p>
      )}

      <label className="text-xs block mb-1.5" style={{ color: "#8B948F" }}>Bio</label>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={4}
        className="w-full mb-3 px-3 py-2.5 rounded-md text-sm outline-none resize-none"
        style={{ background: "#181C1B", color: "#EDEFEC" }}
      />
      <button
        onClick={handleSaveBio}
        disabled={savingBio}
        className="py-2 px-4 rounded-md text-sm font-medium"
        style={{ background: ACCENT, color: "#101312", opacity: savingBio ? 0.6 : 1 }}
      >
        {savingBio ? "Menyimpan..." : "Simpan bio"}
      </button>

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-24 md:bottom-6 z-50 px-4 py-2 rounded-full text-sm" style={{ background: "#EDEFEC", color: "#101312" }}>
          {toast}
        </div>
      )}
    </div>
  );
    }
    
