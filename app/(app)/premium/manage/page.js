import { createClient } from "@/lib/supabase/server";
import ManageClient from "./manage-client";

export default async function PremiumManagePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("id, plan, status, expires_at")
    .eq("profile_id", user.id)
    .eq("status", "active")
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return <ManageClient subscription={sub} />;
}

