'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'

export default function Home() {
  const [lagu, setLagu] = useState<any[]>([])
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  useEffect(() => {
    const fetchLagu = async () => {
      const { data } = await supabase.from('lagu').select('*')
      setLagu(data || [])
    }
    fetchLagu()
  }, [supabase])

  return (
    <main className="bg-black text-white min-h-screen p-6">
      <h1 className="text-4xl font-bold text-white mb-8 tracking-wider">STREAMO AI</h1>
      {lagu.length === 0? (
        <p className="text-zinc-400">Belum ada lagu. Tambah di Supabase dulu ya</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {lagu.map((l) => (
            <div key={l.id} className="bg-zinc-900 p-3 rounded-xl hover:bg-zinc-800 transition">
              <img src={l.cover_url} className="rounded-lg mb-2 w-full aspect-square object-cover"/>
              <h3 className="font-bold text-sm">{l.judul}</h3>
              <audio controls src={l.mp3_url} className="w-full mt-2 h-8"></audio>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
