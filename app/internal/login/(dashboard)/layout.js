import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InternalShell from "@/components/internal/internal-shell";
import SignOutButton from "@/components/internal/sign-out-button";

// This layout wraps every page under /internal/(dashboard)/* — i.e.
// overview, moderation, catalog, and tickets — but NOT /internal/login,
// since that lives outside the (dashboard) route group.
export default async function InternalDashboardLayout({ children }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/internal/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .single();

  // Someone is signed in but isn't staff (e.g. a listener account, or a
  // brand-new signup that defaults to 'listener'). Don't silently bounce
  // them — tell them why, since a confusing redirect loop is worse.
  if (!profile || profile.role !== "staff") {
    return (
      <div
        className="w-full min-h-screen flex items-center justify-center px-4"
        style={{ background: "#121011", color: "#EDE9E7", fontFamily: "'Public Sans', ui-sans-serif, system-ui" }}
      >
        <div className="max-w-sm text-center">
          <p className="text-sm mb-2" style={{ color: "#948B89" }}>Akun ini tidak punya akses staf.</p>
          <p className="text-xs mb-6" style={{ color: "#5C5654" }}>
            Kalau ini seharusnya akun staf, minta admin database mengubah kolom{" "}
            <code>role</code> jadi <code>staff</code> di tabel <code>profiles</code> lewat
            Supabase Dashboard → Table Editor.
          </p>
          <SignOutButton label="Keluar dan coba akun lain" />
        </div>
      </div>
    );
  }

  const { count: pendingCount } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: openTicketCount } = await supabase
    .from("support_tickets")
    .select("*", { count: "exact", head: true })
    .eq("status", "open");

  const { count: pendingReviewCount } = await supabase
    .from("tracks")
    .select("*", { count: "exact", head: true })
    .eq("review_status", "pending");

  return (
    <InternalShell
      staffName={profile.display_name}
      pendingCount={pendingCount || 0}
      openTicketCount={openTicketCount || 0}
      pendingReviewCount={pendingReviewCount || 0}
    >
      {children}
    </InternalShell>
  );
  }
  
