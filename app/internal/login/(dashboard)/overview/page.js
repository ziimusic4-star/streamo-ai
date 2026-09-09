import Link from "next/link";
import { Users, Radio, TrendingUp, Flag, LifeBuoy, FileCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const ACCENT = "#C25450";
const fmtNum = (n) => (n || 0).toLocaleString("id-ID");

export default async function OverviewPage() {
  const supabase = await createClient();

  const { count: totalListeners } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  const { count: totalArtists } = await supabase.from("artists").select("*", { count: "exact", head: true });
  const { data: streamRows } = await supabase.from("tracks").select("streams_count");
  const totalStreams = (streamRows || []).reduce((sum, t) => sum + (t.streams_count || 0), 0);
  const { count: pendingCount } = await supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending");
  const { count: openTicketCount } = await supabase.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "open");
  const { count: pendingReviewCount } = await supabase.from("tracks").select("*", { count: "exact", head: true }).eq("review_status", "pending");

  return (
    <div>
      <h1 className="fraunces text-2xl md:text-3xl mb-1">Ringkasan Platform</h1>
      <p className="text-sm mb-6" style={{ color: "#948B89" }}>Kondisi Streamo AI hari ini.</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <StatCard icon={Users} label="Total Pengguna" value={fmtNum(totalListeners)} />
        <StatCard icon={Radio} label="Total Artis" value={fmtNum(totalArtists)} />
        <StatCard icon={TrendingUp} label="Total Stream" value={fmtNum(totalStreams)} />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Link href="/internal/review" className="rounded-xl p-5 text-left block" style={{ background: "#1B1717" }}>
          <div className="flex items-center gap-2 mb-2" style={{ color: ACCENT }}>
            <FileCheck size={16} />
            <span className="text-sm font-medium">Unggahan menunggu</span>
          </div>
          <p className="fraunces text-3xl">{pendingReviewCount || 0}</p>
          <p className="text-xs mt-1" style={{ color: "#948B89" }}>Belum ditinjau kebijakan kontennya</p>
        </Link>
        <Link href="/internal/moderation" className="rounded-xl p-5 text-left block" style={{ background: "#1B1717" }}>
          <div className="flex items-center gap-2 mb-2" style={{ color: ACCENT }}>
            <Flag size={16} />
            <span className="text-sm font-medium">Laporan menunggu</span>
          </div>
          <p className="fraunces text-3xl">{pendingCount || 0}</p>
          <p className="text-xs mt-1" style={{ color: "#948B89" }}>Perlu ditinjau tim moderasi</p>
        </Link>
        <Link href="/internal/tickets" className="rounded-xl p-5 text-left block" style={{ background: "#1B1717" }}>
          <div className="flex items-center gap-2 mb-2" style={{ color: ACCENT }}>
            <LifeBuoy size={16} />
            <span className="text-sm font-medium">Tiket terbuka</span>
          </div>
          <p className="fraunces text-3xl">{openTicketCount || 0}</p>
          <p className="text-xs mt-1" style={{ color: "#948B89" }}>Menunggu balasan tim dukungan</p>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl p-4 flex-1" style={{ background: "#1B1717" }}>
      <div className="flex items-center gap-2 mb-2" style={{ color: "#948B89" }}>
        <Icon size={14} />
        <span className="text-xs">{label}</span>
      </div>
      <p className="fraunces text-2xl" style={{ color: ACCENT }}>{value}</p>
    </div>
  );
  }
  
