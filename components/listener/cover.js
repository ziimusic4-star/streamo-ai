"use client";

import { Disc3 } from "lucide-react";
import { resolveGenre } from "@/lib/genres";

export default function Cover({ genre, coverUrl, size = 44, playing = false, rounded = "rounded-md" }) {
  const g = resolveGenre(genre);
  return (
    <div
      className={`relative flex-shrink-0 ${rounded} overflow-hidden flex items-center justify-center`}
      style={{
        width: size,
        height: size,
        background: coverUrl
          ? "#000"
          : `radial-gradient(circle at 30% 25%, ${g.accent}55, #0000 60%), linear-gradient(155deg, ${g.accent} 0%, #15120F 85%)`,
      }}
    >
      {coverUrl ? (
        <img src={coverUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        <Disc3
          size={size * 0.5}
          color="#F2EDE4"
          strokeWidth={1.3}
          style={{ opacity: 0.85, animation: playing ? "spin 6s linear infinite" : "none" }}
        />
      )}
    </div>
  );
}
