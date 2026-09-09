"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// outcome: 'removed' | 'dismissed'
// RLS ("reports: staff updates status") double-checks the caller is staff
// even if this ever got invoked outside the gated /internal UI.
export async function resolveReport(reportId, outcome) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("reports")
    .update({ status: outcome, resolved_by: user?.id ?? null, resolved_at: new Date().toISOString() })
    .eq("id", reportId);

  if (error) throw new Error(error.message);

  revalidatePath("/internal/moderation");
  revalidatePath("/internal/overview");
}
