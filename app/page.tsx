'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://tfiihtfbilhyobituuve.supabase.co',
  'sb_publishable_P9Rifn4yVrznRwnfwqRSbg_8J3upJzb'
)

export default function Home() {
  const [lagu, setLagu] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [playing, setPlaying] = useState<any>(null)

  useEffect(() => {
    supabase.from('lagu').select('*').then(({data})=>{
      setLagu(data || [])
    })
  }, [])

  const filtered = lagu.filter(l => 
    l.judul.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{background:'#121212', minHeight:'100vh', color:'white', fontFamily:'Poppins, sans-serif', paddingBottom:90}}>
      
      {/* HEADER */}
      <header style={{background:'#000', padding:'16px 24px', position:'sticky', top:0, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <img src="https://tfiihtfbilhyobituuve.supabase.co/storage/v1/object/public/Image/Logo/Logo%20STREAMO%20AI.png" style={{height:32}} alt="logo" />
        <input 
          type="text" 
          placeholder="Cari lagu..." 
          onChange={(e)=>setSearch(e.target.value)}
          style={{padding:'10px 16px', borderRadius:500, border:'none', width:250, fontSize:14, background:'#242424', color:'white', outline:'none'}}
        />
      </header>

      {/* CONTENT */}
      <div style={{padding:'24px'}}>
        <h2 style={{fontSize:24, marginBottom:20}}>Buat Kamu</h2>
        
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:16}}>
          {filtered.map(i=>(
            <div key={i.id} onClick={()=>setPlaying(i)} style={{
              background:'#181818', 
              borderRadius:8, 
              padding:12,
              cursor:'pointer',
              transition:'background 0.3s'
            }}
            onMouseOver={(e)=>e.currentTarget.style.background='#282828'}
            onMouseOut={(e)=>e.currentTarget.style.background='#181818'}
            >
              <img src={i.cover_url} style={{width:'100%', borderRadius:6, aspectRatio:'1/1', objectFit:'cover', marginBottom:12}}/>
              <h3 style={{fontSize:14, fontWeight:700, margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{i.judul}</h3>
              <p style={{fontSize:12, color:'#b3b3b3', margin:'4px 0 0'}}>ZIIPROJECT</p>
            </div>
          ))}
        </div>
      </div>

      {/* PLAYER BAWAH KAYAK SPOTIFY */}
      {playing && (
        <div style={{
          position:'fixed', bottom:0, left:0, right:0, 
          background:'#181818', borderTop:'1px solid #282828',
          padding:'12px 16px', display:'flex', alignItems:'center', gap:16
        }}>
          <img src={playing.cover_url} style={{width:56, height:56, borderRadius:4}}/>
          <div style={{flex:1}}>
            <p style={{margin:0, fontSize:14, fontWeight:600}}>{playing.judul}</p>
            <p style={{margin:0, fontSize:12, color:'#b3b3b3'}}>ZIIPROJECT</p>
          </div>
          <audio controls autoPlay style={{width:300, accentColor:'#1DB954'}} src={playing.mp3_url}></audio>
        </div>
      )}
    </div>
  )
                                             }
