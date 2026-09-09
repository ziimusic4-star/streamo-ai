"use client";

import { useState } from "react";
import { LifeBuoy } from "lucide-react";
import { createTicket } from "./actions";

export default function SupportClient({ initialTickets }) {
  const [tickets, setTickets] = useState(initialTickets);
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState("Sedang");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const handleSubmit = async () => {
    if (!subject.trim()) return;
    setSubmitting(true);
    const res = await createTicket(subject.trim(), priority);
    setSubmitting(false);
    if (res.ok) {
      setTickets((prev) => [
        { id: `temp-${Date.now()}`, subject: subject.trim(), priority, status: "open", created_at: new Date().toISOString() },
        ...prev,
      ]);
      setSubject("");
      flash("Tiket terkirim ke tim dukungan");
    } else {
      flash(res.message);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-2 mb-2">
        <LifeBuoy size={22} color="#C97B4A" />
        <h1 className="fraunces text-2xl">Bantuan</h1>
      </div>
      <p className="text-sm mb-6" style={{ color: "#8A8178" }}>Ada masalah? Kirim ke tim dukungan kami.</p>

      <div className="rounded-xl p-5 mb-8" style={{ background: "#1C1815" }}>
        <label className="text-xs block mb-1" style={{ color: "#8A8178" }}>Apa masalahnya?</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="mis. Tidak bisa memutar lagu offline"
          className="w-full mb-3 px-3 py-2 rounded-md text-sm outline-none"
          style={{ background: "#12100E", color: "#F2EDE4" }}
        />
        <label className="text-xs block mb-1" style={{ color: "#8A8178" }}>Prioritas</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-md text-sm outline-none"
          style={{ background: "#12100E", color: "#F2EDE4" }}
        >
          <option value="Rendah">Rendah</option>
          <option value="Sedang">Sedang</option>
          <option value="Tinggi">Tinggi</option>
        </select>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="py-2 px-4 rounded-md text-sm font-medium"
          style={{ background: "#C97B4A", color: "#15120F", opacity: submitting ? 0.6 : 1 }}
        >
          {submitting ? "Mengirim..." : "Kirim Tiket"}
        </button>
      </div>

      <p className="text-sm font-medium mb-3">Riwayat tiketmu</p>
      {tickets.length === 0 ? (
        <p className="text-sm" style={{ color: "#8A8178" }}>Belum ada tiket.</p>
      ) : (
        <div className="space-y-1">
          {tickets.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-3 py-2.5 rounded-md" style={{ background: "#1C1815" }}>
              <div>
                <p className="text-sm">{t.subject}</p>
                <p className="text-xs" style={{ color: "#8A8178" }}>{t.priority}</p>
              </div>
              <span className="text-xs" style={{ color: t.status === "open" ? "#C97B4A" : "#8A8178" }}>
                {t.status === "open" ? "Terbuka" : "Selesai"}
              </span>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div
          className="fixed left-1/2 -translate-x-1/2 bottom-24 md:bottom-6 z-50 px-4 py-2 rounded-full text-sm"
          style={{ background: "#F2EDE4", color: "#15120F" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
    }
    
