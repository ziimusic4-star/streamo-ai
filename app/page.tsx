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
    supabase.from('lagu').select('*').then(({data}) => setLagu(data || []))
  }, [])

  return (
    <main className="bg-black text-white min-h-screen p-6">
      <h1 className="text-4xl font-bold text-green-500 mb-8">STREAMO AI</h1>
      <div className="grid grid-cols-2 gap-4">
        {lagu.map((l) => (
          <div key={l.id} className="bg-zinc-900 p-3 rounded-xl">
            <img src={l.cover_url} className="rounded-lg mb-2"/>
            <h3 className="font-bold">{l.judul}</h3>
            <audio controls src={l.mp3_url} className="w-full mt-2"></audio>
          </div>
        ))}
      </div>
    </main>
  )
}
