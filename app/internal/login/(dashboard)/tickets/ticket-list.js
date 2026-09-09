"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { closeTicket } from "./actions";

const ACCENT = "#C25450";

export default function TicketList({ initialOpen, initialClosed }) {
  const [open, setOpen] = useState(initialOpen);
  const [closed, setClosed] = useState(initialClosed);
  const [isPending, startTransition] = useTransition();

  const handleClose = (ticket) => {
    startTransition(async () => {
      await closeTicket(ticket.id);
      setOpen((prev) => prev.filter((t) => t.id !== ticket.id));
      setClosed((prev) => [{ ...ticket, status: "closed" }, ...prev]);
    });
  };

  return (
    <div>
      {open.length === 0 ? (
        <p className="text-sm py-6" style={{ color: "#948B89" }}>Tidak ada tiket terbuka.</p>
      ) : (
        <div className="space-y-2 mb-8">
          {open.map((t) => (
            <div key={t.id} className="rounded-xl p-4 flex items-start justify-between gap-3" style={{ background: "#1B1717" }}>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: t.priority === "Tinggi" ? `${ACCENT}33` : "#262121", color: t.priority === "Tinggi" ? ACCENT : "#C7BFBD" }}
                  >
                    {t.priority}
                  </span>
                  <span className="text-xs" style={{ color: "#948B89" }}>@{t.user?.display_name || "pengguna"}</span>
                </div>
                <p className="text-sm">{t.subject}</p>
              </div>
              <button
                disabled={isPending}
                onClick={() => handleClose(t)}
                className="flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium"
                style={{ background: ACCENT, color: "#121011", opacity: isPending ? 0.6 : 1 }}
              >
                <Check size={13} /> Selesai
              </button>
            </div>
          ))}
        </div>
      )}

      {closed.length > 0 && (
        <>
          <p className="text-sm font-medium mb-3">Riwayat</p>
          <div className="space-y-1">
            {closed.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-3 py-2.5 rounded-md" style={{ opacity: 0.6 }}>
                <div>
                  <p className="text-sm">{t.subject}</p>
                  <p className="text-xs" style={{ color: "#948B89" }}>@{t.user?.display_name || "pengguna"}</p>
                </div>
                <span className="text-xs" style={{ color: "#948B89" }}>Selesai</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
                     }
        
