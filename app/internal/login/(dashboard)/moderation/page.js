import { createClient } from "@/lib/supabase/server";
import ReportList from "./report-list";

export default async function ModerationPage() {
  const supabase = await createClient();

  const { data: reports } = await supabase
    .from("reports")
    .select(
      `
      id, type, note, status, created_at,
      target_track:target_track_id ( title, artist:artist_id ( name ) ),
      target_profile:target_profile_id ( display_name )
    `
    )
    .order("created_at", { ascending: false });

  const pending = (reports || []).filter((r) => r.status === "pending");
  const resolved = (reports || []).filter((r) => r.status !== "pending");

  return (
    <div>
      <h1 className="fraunces text-2xl md:text-3xl mb-1">Moderasi</h1>
      <p className="text-sm mb-6" style={{ color: "#948B89" }}>Laporan konten dan akun yang perlu ditinjau.</p>
      <ReportList initialPending={pending} initialResolved={resolved} />
    </div>
  );
}
