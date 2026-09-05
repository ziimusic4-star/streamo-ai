'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://tfiihtfbilhyobituuve.supabase.co',
  'sb_publishable_P9Rifn4yVrznRwnfwqRSbg_8J3upJzb'
)

export default function Home() {
  const [lagu, setLagu] = useState<any[]>([])

  useEffect(() => {
    supabase.from('lagu').select('*').then(({data})=>{
      setLagu(data || [])
    })
  }, [])

  return (
    <div style={{background:'#f5f5f5', minHeight:'100vh', padding:20, fontFamily:'sans-serif'}}>
      <h1 style={{textAlign:'center', color:'#111'}}>🎵 Streamo AI</h1>
      
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(250px, 1fr))', gap:20, maxWidth:1000, margin:'0 auto'}}>
        {lagu.map(i=>(
          <div key={i.id} style={{background:'white', borderRadius:12, padding:15, boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>
            <img src={i.cover_url} style={{width:'100%', borderRadius:8, aspectRatio:'1/1', objectFit:'cover'}}/>
            <h3 style={{color:'#222', margin:'10px 0 5px'}}>{i.judul}</h3>
            <audio controls style={{width:'100%'}} src={i.mp3_url}></audio>
          </div>
        ))}
      </div>
      
      {lagu.length === 0 && <p style={{textAlign:'center', color:'#666'}}>Belum ada lagu...</p>}
    </div>
  )
}
