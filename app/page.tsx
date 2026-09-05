'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// HARDCODE DULU BUAT TES
const supabase = createClient(
  'https://tfiihtfbilhyobituuve.supabase.co',
  'sb_publishable_P9Rifn4yVrznRwnfwqRSbg_8J3upJzb'
)

export default function Home() {
  const [lagu, setLagu] = useState<any[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('lagu').select('*').then(({data, error})=>{
      if(error) setError(error.message)
      else setLagu(data || [])
    })
  }, [])

  return (
    <div style={{padding:20}}>
      <h1>Daftar Lagu</h1>
      {error && <p style={{color:'red'}}>ERROR: {error}</p>}
      <p>Total: {lagu.length}</p>
      {lagu.map(i=>(
        <div key={i.id} style={{border:'1px solid #ccc', margin:10, padding:10}}>
          <b>{i.judul}</b><br/>
          <img src={i.cover_url} width={120}/><br/>
          <audio controls src={i.mp3_url}></audio>
        </div>
      ))}
    </div>
  )
}
