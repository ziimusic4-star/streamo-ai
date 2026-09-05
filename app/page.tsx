'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

export default function Home() {
  const [lagu, setLagu] = useState<any[]>([])

  useEffect(() => {
    async function getData() {
      const { data } = await supabase.from('lagu').select('*')
      setLagu(data || [])
    }
    getData()
  }, [])

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold mb-5">Daftar Lagu</h1>
      {lagu.length === 0 ? <p>Loading...</p> : 
        lagu.map((item) => (
          <div key={item.id} className="border p-3 mb-2 rounded">
            {item.judul}
          </div>
        ))
      }
    </main>
  )
}      )}
    </main>
  )
}
