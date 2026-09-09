import { Headphones, Users, TrendingUp } from "lucide-react";
import { getCurrentArtist } from "@/lib/supabase/current-artist";

const ACCENT = "#4FA382";
const fmtNum = (n) => (n || 0).toLocaleString("id-ID");

export default async function ArtistOverviewPage() {
  const { supabase, artist } = await getCurrentArtist();
  if (!artist) return null;

  const { data: tracks } = await supabase
    .from("tracks")
    .select("id, title, album, streams_count")
    .eq("artist_id", artist.id)
    .order("streams_count", { ascending: false });

  const trackList = tracks || [];
  const totalStreams = trackList.reduce((sum, t) => sum + (t.streams_count || 0), 0);
  const topTracks = trackList.slice(0, 5);
  const maxStream = Math.max(1, ...topTracks.map((t) => t.streams_count || 0));

  return (
    <div>
      <h1 className="fraunces text-2xl md:text-3xl mb-1">Halo, {artist.name}</h1>
      <p className="text-sm mb-6" style={{ color: "#8B948F" }}>Begini performa musikmu sejauh ini.</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <StatCard icon={Headphones} label="Jumlah Lagu" value={fmtNum(trackList.length)} />
        <StatCard icon={TrendingUp} label="Total Stream" value={fmtNum(totalStreams)} />
        <StatCard icon={Users} label="Pengikut" value={fmtNum(artist.followers_count)} />
      </div>

      <div className="rounded-xl p-5 mb-8" style={{ background: "#181C1B" }}>
        <p className="text-sm font-medium mb-4">Lagu dengan stream terbanyak</p>
        {topTracks.length === 0 ? (
          <p className="text-sm" style={{ color: "#8B948F" }}>Belum ada lagu untuk ditampilkan.</p>
        ) : (
          <div className="space-y-3">
            {topTracks.map((t) => (
              <div key={t.id} className="flex items-center gap-3">
                <span className="text-xs w-28 truncate flex-shrink-0" style={{ color: "#8B948F" }}>{t.title}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#232826" }}>
                  <div className="h-full rounded-full" style={{ width: `${((t.streams_count || 0) / maxStream) * 100}%`, background: ACCENT }} />
                </div>
                <span className="text-xs w-16 text-right flex-shrink-0" style={{ color: ACCENT }}>{fmtNum(t.streams_count)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl p-4 flex-1" style={{ background: "#181C1B" }}>
      <div className="flex items-center gap-2 mb-2" style={{ color: "#8B948F" }}>
        <Icon size={14} />
        <span className="text-xs">{label}</span>
      </div>
      <p className="fraunces text-2xl" style={{ color: ACCENT }}>{value}</p>
    </div>
  );
                        }
  
