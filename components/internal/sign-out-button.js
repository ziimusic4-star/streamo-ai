"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton({ label = "Keluar" }) {
  const router = useRouter();

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/internal/login");
    router.refresh();
  };

  return (
    <button onClick={signOut} className="flex items-center gap-1.5 text-xs flex-shrink-0" style={{ color: "#948B89" }}>
      <LogOut size={14} /> {label}
    </button>
  );
}

