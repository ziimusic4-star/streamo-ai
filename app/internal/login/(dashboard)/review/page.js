import { createClient } from "@/lib/supabase/server";
import ReviewList from "./review-list";

export default async function ReviewPage() {
  const supabase = await createClient();

  const { data: tracks } = await supabase
    .from("tracks")
    .select(
      `
      id, title, album, genre, ai_tool, declared_original, is_upload, created_at,
      artist:artist_id ( name ),
      uploader:uploaded_by ( display_name )
    `
    )
    .eq("review_status", "pending")
    .order("created_at", { ascending: true });

  return (
    <div>
      <h1 className="fraunces text-2xl md:text-3xl mb-1">Tinjau Unggahan</h1>
      <p className="text-sm mb-6" style={{ color: "#948B89" }}>
        Kebijakan konten: hanya musik baru buatan AI Pro yang diterima — cover atau lagu tanpa AI ditolak.
      </p>
      <ReviewList initialTracks={tracks || []} />
    </div>
  );
          }
          
