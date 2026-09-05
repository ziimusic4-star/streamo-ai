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
    <div style={{background:'linear-gradient(135deg, #00b894 0%, #0984e3 100%)', minHeight:'100vh', fontFamily:'Poppins, sans-serif'}}>
      
      {/* HEADER */}
      <header style={{background:'rgba(255,255,255,0.98)', padding:'12px 20px', position:'sticky', top:0, backdropFilter:'blur(10px)', boxShadow:'0 2px 10px rgba(0,0,0,0.1)'}}>
        <div style={{maxWidth:1200, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h1 style={{color:'#00b894', margin:0, fontSize:20, fontWeight:700}}>🎵 Streamo</h1>
          <input 
            type="text" 
            placeholder="Cari lagu..." 
            onChange={(e)=>setSearch(e.target.value)}
            style={{padding:'8px 14px', borderRadius:20, border:'1.5px solid #00b894', width:160, fontSize:14, outline:'none', color:'#00b894'}}
          />
        </div>
      </header>

      {/* CONTENT */}
      <div style={{padding:'30px 20px'}}>
        <div style={{maxWidth:1200, margin:'0 auto'}}>
          <h2 style={{color:'white', textAlign:'center', marginBottom:25, fontSize:24}}>Daftar Lagu</h2>
          
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:20}}>
            {filtered.map(i=>(
              <div key={i.id} style={{
                background:'white', 
                borderRadius:14, 
                padding:12, 
                boxShadow:'0 6px 15px rgba(0,0,0,0.15)',
                transition:'transform 0.2s',
              }}
              onMouseOver={(e)=>e.currentTarget.style.transform='translateY(-4px)'}
              onMouseOut={(e)=>e.currentTarget.style.transform='translateY(0)'}
              >
                <img src={i.cover_url} style={{width:'100%', borderRadius:10, aspectRatio:'1/1', objectFit:'cover'}}/>
                <h3 style={{color:'#00b894', margin:'10px 0 6px', fontSize:15, fontWeight:600}}>{i.judul}</h3>
                <audio controls style={{width:'100%', height:32}} src={i.mp3_url}></audio>
              </div>
            ))}
          </div>

          {filtered.length === 0 && <p style={{textAlign:'center', color:'white', marginTop:40}}>Lagu tidak ditemukan 😢</p>}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{background:'rgba(0,0,0,0.15)', color:'white', textAlign:'center', padding:16, marginTop:30, fontSize:14}}>
        <p>© 2026 Streamo AI</p>
      </footer>
    </div>
  )
                      }
