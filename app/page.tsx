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

  useEffect(() => {
    supabase.from('lagu').select('*').then(({data})=>{
      setLagu(data || [])
    })
  }, [])

  const filtered = lagu.filter(l => 
    l.judul.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight:'100vh', fontFamily:'sans-serif'}}>
      
      {/* HEADER */}
      <header style={{background:'rgba(255,255,255,0.95)', padding:'20px', position:'sticky', top:0, backdropFilter:'blur(10px)'}}>
        <div style={{maxWidth:1200, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h1 style={{color:'#667eea', margin:0}}>🎵 Streamo AI</h1>
          <input 
            type="text" 
            placeholder="Cari lagu..." 
            onChange={(e)=>setSearch(e.target.value)}
            style={{padding:'10px 15px', borderRadius:20, border:'2px solid #667eea', width:200, outline:'none'}}
          />
        </div>
      </header>

      {/* CONTENT */}
      <div style={{padding:'40px 20px'}}>
        <div style={{maxWidth:1200, margin:'0 auto'}}>
          <h2 style={{color:'white', textAlign:'center', marginBottom:30}}>Daftar Lagu</h2>
          
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:25}}>
            {filtered.map(i=>(
              <div key={i.id} style={{
                background:'white', 
                borderRadius:16, 
                padding:15, 
                boxShadow:'0 8px 20px rgba(0,0,0,0.2)',
                transition:'transform 0.2s',
              }}
              onMouseOver={(e)=>e.currentTarget.style.transform='translateY(-5px)'}
              onMouseOut={(e)=>e.currentTarget.style.transform='translateY(0)'}
              >
                <img src={i.cover_url} style={{width:'100%', borderRadius:12, aspectRatio:'1/1', objectFit:'cover'}}/>
                <h3 style={{color:'#333', margin:'12px 0 8px', fontSize:16}}>{i.judul}</h3>
                <audio controls style={{width:'100%', height:35}} src={i.mp3_url}></audio>
              </div>
            ))}
          </div>

          {filtered.length === 0 && <p style={{textAlign:'center', color:'white', marginTop:50}}>Lagu tidak ditemukan 😢</p>}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{background:'rgba(0,0,0,0.2)', color:'white', textAlign:'center', padding:20, marginTop:40}}>
        <p>© 2026 Streamo AI - Dibuat dengan ❤️</p>
      </footer>
    </div>
  )
            }
