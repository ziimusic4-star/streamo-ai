"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function addPlanDuration(date, planId) {
  const d = new Date(date);
  if (planId === "weekly") d.setDate(d.getDate() + 7);
  else if (planId === "monthly") d.setMonth(d.getMonth() + 1);
  else if (planId === "yearly") d.setFullYear(d.getFullYear() + 1);
  return d;
}

// This is a UI simulation of a checkout — no real payment gateway (Midtrans,
// Xendit, etc.) is connected. It writes a real row to `subscriptions`
// though, so the free-tier gates in app/(app)/actions.js genuinely respect it.
export async function subscribe(plan, walletMethod) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sesi berakhir." };

  const expiresAt = addPlanDuration(new Date(), plan).toISOString();
  const { error } = await supabase.from("subscriptions").insert({
    profile_id: user.id,
    plan,
    wallet_method: walletMethod,
    status: "active",
    expires_at: expiresAt,
  });

  if (error) return { ok: false, message: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function cancelSubscription(subscriptionId) {
  const supabase = await createClient();
  const { error } = await supabase.from("subscriptions").update({ status: "cancelled" }).eq("id", subscriptionId);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

