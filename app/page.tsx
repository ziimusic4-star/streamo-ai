'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export default function Home() {
  const [lagu, setLagu] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getData() {
      const { data, error } = await supabase.from('lagu').select('*')
      if (error) {
        console.log('ERROR SUPABASE:', error)
      } else {
        setLagu(data || [])
      }
      setLoading(false)
    }
    getData()
  }, [])

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold mb-5">Daftar Lagu</h1>
      
      {loading ? <p>Loading...</p> : 
        lagu.length === 0 ? <p>Data kosong</p> :
        lagu.map((item) => (
          <div key={item.id} className="border p-3 mb-2 rounded">
            <h2 className="font-bold">{item.judul}</h2>
            {item.cover_url && <img src={item.cover_url} width="200" className="my-2"/>}
            {item.mp3_url && <audio controls src={item.mp3_url} className="w-full"/>}
          </div>
        ))
      }
    </main>
  )
}
