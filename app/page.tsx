'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://tfiihtfbilhyobituuve.supabase.co',
  'sb_publishable_P9Rifn4yVrznRwnfwqRSbg_8J3upJzb'
)

export default function Home() {
  const [lagu, setLagu] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    supabase.from('lagu').select('*').then(({data})=>{
      setLagu(data || [])
    })
  }, [])

  const filtered = lagu.filter(l =>
    l.judul.toLowerCase().includes(search.toLowerCase())
  )

  const playing = playingIndex!== null? filtered[playingIndex] : null

  const playNext = () => {
    if(playingIndex === null) return
    setPlayingIndex((playingIndex + 1) % filtered.length)
  }

  const playPrev = () => {
    if(playingIndex === null) return
    setPlayingIndex((playingIndex - 1 + filtered.length) % filtered.length)
  }

  return (
    <div style={{background:'linear-gradient(135deg, #00b894 0%, #0984e3 100%)', minHeight:'100vh', fontFamily:'Poppins, sans-serif', paddingBottom:120}}>

      {/* HEADER */}
      <header style={{background:'rgba(255,255,255,0.98)', padding:'10px 20px', position:'sticky', top:0, backdropFilter:'blur(10px)', boxShadow:'0 2px 10px rgba(0,0,0,0.1)'}}>
        <div style={{maxWidth:1200, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <img
            src="https://tfiihtfbilhyobituuve.supabase.co/storage/v1/object/public/Image/Logo/Logo%20STREAMO%20AI.png"
            style={{height:36}}
            alt="Streamo AI Logo"
          />
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
          <h2 style={{color:'white', textAlign:'center', marginBottom:10, fontSize:24}}>Daftar Lagu</h2>
          <p style={{color:'white', textAlign:'center', marginBottom:25, opacity:0.9}}>{filtered.length} Lagu Ditemukan</p>

          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:20}}>
            {filtered.map((i, index)=>(
              <div key={i.id} onClick={()=>setPlayingIndex(index)} style={{
                background:'white',
                borderRadius:14,
                padding:12,
                boxShadow:'0 6px 15px rgba(0,0,0,0.15)',
                transition:'transform 0.2s',
                cursor:'pointer',
                border: playingIndex === index? '2px solid #00b894' : '2px solid transparent'
              }}
              onMouseOver={(e)=>e.currentTarget.style.transform='translateY(-4px)'}
              onMouseOut={(e)=>e.currentTarget.style.transform='translateY(0)'}
              >
                <img src={i.cover_url} style={{width:'100%', borderRadius:10, aspectRatio:'1/1', objectFit:'cover'}}/>
                <h3 style={{color:'#00b894', margin:'10px 0 6px', fontSize:15, fontWeight:600}}>{i.judul}</h3>
                <p style={{color:'#666', fontSize:12, margin:0}}>Klik untuk putar</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PLAYER BAWAH PAKE ICON SVG */}
      {playing && (
        <div style={{
          position:'fixed', bottom:0, left:0, right:0,
          background:'rgba(255,255,255,0.98)', backdropFilter:'blur(15px)',
          padding:'10px 16px',
          boxShadow:'0 -4px 20px rgba(0,0,0,0.15)', borderTop:'2px solid #00b894',
          display:'flex', flexDirection:'column', gap:8
        }}>

          {/* BARIS 1: COVER + JUDUL */}
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <img src={playing.cover_url} style={{width:48, height:48, borderRadius:8}}/>
            <div style={{flex:1, minWidth:0}}>
              <p style={{
                margin:0, fontSize:13, fontWeight:700, color:'#00b894',
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'
              }}>{playing.judul}</p>
              <p style={{margin:0, fontSize:11, color:'#666'}}>Streamo AI</p>
            </div>
          </div>

          {/* BARIS 2: TOMBOL ICON SVG */}
          <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:20}}>

            {/* PREV BUTTON */}
            <button onClick={playPrev} style={{background:'none', border:'none', cursor:'pointer', padding:5}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#00b894">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>

            <audio
              ref={audioRef}
              controls
              autoPlay
              onEnded={playNext}
              style={{width:'60%', maxWidth:300, height:32, accentColor:'#00b894'}}
              src={playing.mp3_url}
            ></audio>

            {/* NEXT BUTTON */}
            <button onClick={playNext} style={{background:'none', border:'none', cursor:'pointer', padding:5}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#00b894">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <footer style={{background:'rgba(0,0,0,0.15)', color:'white', textAlign:'center', padding:16, marginTop:30, fontSize:14}}>
        <p>© 2026 Streamo AI by ZIIPROJECT</p>
      </footer>
    </div>
  )
      }
