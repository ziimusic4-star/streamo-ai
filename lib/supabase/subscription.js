// Shared helper: is this user's Premium subscription currently active?
// Used both by the layout (to show the sidebar badge) and by Server
// Actions (to enforce free-tier limits) — the Action's own check is what
// actually matters for security, this is convenience for the UI.
export async function getActiveSubscription(supabase, userId) {
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("id, plan, status, expires_at")
    .eq("profile_id", userId)
    .eq("status", "active")
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const isPremium = !!sub && new Date(sub.expires_at) > new Date();
  return { isPremium, subscription: isPremium ? sub : null };
}

