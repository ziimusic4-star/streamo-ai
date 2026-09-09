"use client";

import { useRef, useEffect } from "react";
import { X } from "lucide-react";

export default function LyricsPanel({ track, progress, duration, onClose }) {
  const lines = track.lyrics;
  const activeIdx =
    lines && lines.length && duration ? Math.min(lines.length - 1, Math.floor((progress / duration) * lines.length)) : -1;
  const lineRefs = useRef([]);

  useEffect(() => {
    const el = lineRefs.current[activeIdx];
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeIdx]);

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="flex-1 bg-black/50" onClick={onClose} />
      <div className="w-full sm:w-96 h-full flex flex-col" style={{ background: "#15120F", borderLeft: "1px solid #221D18" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#221D18" }}>
          <div className="min-w-0">
            <p className="text-xs" style={{ color: "#8A8178" }}>Lirik</p>
            <p className="text-sm font-medium truncate">{track.title}</p>
            <p className="text-xs truncate" style={{ color: "#8A8178" }}>{track.artist_name}</p>
          </div>
          <button onClick={onClose} style={{ color: "#8A8178" }}><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {lines && lines.length > 0 ? (
            lines.map((line, i) => (
              <p
                key={i}
                ref={(el) => (lineRefs.current[i] = el)}
                className="fraunces mb-4"
                style={{ fontSize: 19, lineHeight: 1.5, color: i === activeIdx ? "#F2EDE4" : "#5C554C", opacity: i === activeIdx ? 1 : 0.8 }}
              >
                {line}
              </p>
            ))
          ) : (
            <p className="text-sm" style={{ color: "#8A8178" }}>Lirik tidak tersedia untuk lagu ini.</p>
          )}
        </div>
      </div>
    </div>
  );
}
