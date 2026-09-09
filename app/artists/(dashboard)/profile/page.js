import { getCurrentArtist } from "@/lib/supabase/current-artist";
import ProfileClient from "./profile-client";

export default async function ArtistProfilePage() {
  const { artist } = await getCurrentArtist();
  if (!artist) return null;

  return (
    <div className="max-w-lg">
      <h1 className="fraunces text-2xl md:text-3xl mb-1">Profil Artis</h1>
      <p className="text-sm mb-6" style={{ color: "#8B948F" }}>Begini tampilan profilmu untuk pendengar.</p>
      <ProfileClient artist={artist} />
    </div>
  );
}
