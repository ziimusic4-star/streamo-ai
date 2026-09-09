import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ArtistShell from "@/components/artists/artist-shell";
import SignOutButton from "@/components/artists/sign-out-button";

export default async function ArtistDashboardLayout({ children }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/artists/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "artist") {
    return (
      <DeniedScreen
        title="Akun ini bukan akun artis."
        detail="Kalau ini seharusnya akun artis, minta admin database mengubah kolom role jadi artist di tabel profiles."
      />
    );
  }

  const { data: artist } = await supabase
    .from("artists")
    .select("name")
    .eq("profile_id", user.id)
    .single();

  // Role is correct, but nobody has linked this login to an artist row yet.
  // Real Spotify for Artists has a "claim your profile" verification flow —
  // here that link is made manually via Supabase Table Editor for now.
  if (!artist) {
    return (
      <DeniedScreen
        title="Akun ini belum ditautkan ke profil artis manapun."
        detail="Minta admin database mengisi kolom profile_id di tabel artists dengan ID akun ini."
      />
    );
  }

  return <ArtistShell artistName={artist.name}>{children}</ArtistShell>;
}

function DeniedScreen({ title, detail }) {
  return (
    <div
      className="w-full min-h-screen flex items-center justify-center px-4"
      style={{ background: "#101312", color: "#EDEFEC", fontFamily: "'Public Sans', ui-sans-serif, system-ui" }}
    >
      <div className="max-w-sm text-center">
        <p className="text-sm mb-2" style={{ color: "#8B948F" }}>{title}</p>
        <p className="text-xs mb-6" style={{ color: "#5C645F" }}>{detail}</p>
        <SignOutButton label="Keluar dan coba akun lain" />
      </div>
    </div>
  );
}
  
