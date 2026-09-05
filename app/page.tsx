'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export default function Home() {
  const [lagu, setLagu] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getData() {
      const { data, error } = await supabase.from('lagu').select('*')
      if (error) {
        console.log('ERROR:', error)
      } else {
        setLagu(data || [])
      }
      setLoading(false)
    }
    getData()
  }, [])

  if (loading) {
    return <div style={{padding: 20}}>Loading...</div>
  }

  return (
    <div style={{padding: 20}}>
      <h1 style={{fontSize: 24, fontWeight: 'bold', marginBottom: 20}}>Daftar Lagu</h1>
      
      {lagu.length === 0 ? (
        <p>Data kosong</p>
      ) : (
        lagu.map((item) => (
          <div key={item.id} style={{border: '1px solid #ccc', padding: 10, marginBottom: 10, borderRadius: 8}}>
            <h2 style={{fontWeight: 'bold'}}>{item.judul}</h2>
            {item.cover_url && <img src={item.cover_url} width="200" style={{marginTop: 10}}/>}
            {item.mp3_url && <audio controls src={item.mp3_url} style={{width: '100%', marginTop: 10}}></audio>}
          </div>
        ))
      )}
    </div>
  )
}
