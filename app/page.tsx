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
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [favorites, setFavorites] = useState<string[]>([])
  const [tab, setTab] = useState<'semua' | 'favorit'>('semua') // tab baru
  const audioRef = useRef<HTMLAudioElement>(null)

  // LOAD FAVORITE DARI LOCALSTORAGE
  useEffect(() => {
    const fav = localStorage.getItem('streamo_favorites')
    if(fav) setFavorites(JSON.parse(fav))
  }, [])

  // SIMPAN FAVORITE KE LOCALSTORAGE
  useEffect(() => {
    localStorage.setItem('streamo_favorites', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    supabase.from('lagu').select('*').then(({data})=>{
      setLagu(data || [])
    })
  }, [])

  useEffect(() => {
    if(audioRef.current) {
      isPlaying? audioRef.current.play() : audioRef.current.pause()
    }
  }, [isPlaying, playingIndex])

  useEffect(() => {
    const audio = audioRef.current
    if(!audio) return
    const updateProgress = () => setProgress((audio.currentTime / audio.duration) * 100 || 0)
    audio.addEventListener('timeupdate', updateProgress)
    return () => audio.removeEventListener('timeupdate', updateProgress)
  }, [playingIndex])

  // FILTER BERDASARKAN TAB + SEARCH
  const baseList = tab === 'favorit'? lagu.filter(l => favorites.includes(l.id)) : lagu
  const filtered = baseList.filter(l =>
    l.judul.toLowerCase().includes(search.toLowerCase())
  )

  const playing = playingIndex!== null? filtered[playingIndex] : null

  const playNext = () => {
    if(playingIndex === null) return
    setPlayingIndex((playingIndex + 1) % filtered.length)
    setIsPlaying(true)
    setProgress(0)
  }

  const playPrev = () => {
    if(playingIndex === null) return
    setPlayingIndex((playingIndex - 1 + filtered.length) % filtered.length)
    setIsPlaying(true)
    setProgress(0)
  }

  const togglePlay = () => setIsPlaying(!isPlaying)

  const handleSeek = (e: any) => {
    const audio = audioRef.current
    if(!audio) return
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    audio.currentTime = percent * audio.duration
  }

  // FUNCTION LIKE / UNLIKE
  const toggleFavorite = (id: string, e: any) => {
    e.stopPropagation() // biar ga ke trigger play
    setFavorites(prev =>
      prev.includes(id)? prev.filter(f => f!== id) : [...prev, id]
    )
  }

  return (
    <div style={{background:'linear-gradient(135deg, #00b894 0%, #0984e3 100%)', minHeight:'100vh', fontFamily:'Poppins, sans-serif', paddingBottom:95}}>

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

      {/* TABS BARU */}
      <div style={{maxWidth:1200, margin:'0 auto', padding:'20px 20px 0'}}>
        <div style={{display:'flex', gap:10, background:'rgba(255,255,255,0.2)', padding:4, borderRadius:12}}>
          <button onClick={()=>{setTab('semua'); setPlayingIndex(null)}} style={{
            flex:1, padding:'8px 16px', borderRadius:8, border:'none', cursor:'pointer',
            background: tab==='semua'? 'white' : 'transparent',
            color: tab==='semua'? '#00b894' : 'white', fontWeight:600
          }}>Semua Lagu</button>
          <button onClick={()=>{setTab('favorit'); setPlayingIndex(null)}} style={{
            flex:1, padding:'8px 16px', borderRadius:8, border:'none', cursor:'pointer',
            background: tab==='favorit'? 'white' : 'transparent',
            color: tab==='favorit'? '#00b894' : 'white', fontWeight:600
          }}>❤️ Favorit ({favorites.length})</button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{padding:'20px'}}>
        <div style={{maxWidth:1200, margin:'0 auto'}}>
          <p style={{color:'white', textAlign:'center', marginBottom:25, opacity:0.9}}>{filtered.length} Lagu Ditemukan</p>

          {filtered.length === 0 && tab === 'favorit' && (
            <p style={{color:'white', textAlign:'center'}}>Belum ada lagu favorit. Klik ❤️ di lagu buat nambahin</p>
          )}

          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:20}}>
            {filtered.map((i, index)=>(
              <div key={i.id} onClick={()=>{setPlayingIndex(index); setIsPlaying(true)}} style={{
                background:'white',
                borderRadius:14,
                padding:12,
                boxShadow:'0 6px 15px rgba(0,0,0,0.15)',
                transition:'transform 0.2s',
                cursor:'pointer',
                border: playingIndex === index? '2px solid #00b894' : '2px solid transparent',
                position:'relative'
              }}
              onMouseOver={(e)=>e.currentTarget.style.transform='translateY(-4px)'}
              onMouseOut={(e)=>e.currentTarget.style.transform='translateY(0)'}
              >
                {/* TOMBOL LIKE */}
                <button onClick={(e)=>toggleFavorite(i.id, e)} style={{
                  position:'absolute', top:16, right:16, background:'rgba(255,255,255,0.9)',
                  border:'none', borderRadius:'50%', width:32, height:32, cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center'
                }}>
                  {favorites.includes(i.id)?
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#ff4757"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg> :
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  }
                </button>

                <img src={i.cover_url} style={{width:'100%', borderRadius:10, aspectRatio:'1/1', objectFit:'cover'}}/>
                <h3 style={{color:'#00b894', margin:'10px 0 6px', fontSize:15, fontWeight:600}}>{i.judul}</h3>
                <p style={{color:'#666', fontSize:12, margin:0}}>{i.artis || 'Unknown Artist'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AUDIO HIDDEN */}
      {playing && <audio ref={audioRef} src={playing.mp3_url} onEnded={playNext} />}

      {/* PLAYER BAWAH COMPACT + ARTIS */}
      {playing && (
        <div style={{
          position:'fixed', bottom:0, left:0, right:0,
          background:'rgba(255,255,255,0.98)', backdropFilter:'blur(15px)',
          boxShadow:'0 -4px 20px rgba(0,0,0,0.15)', borderTop:'2px solid #00b894'
        }}>

          <div onClick={handleSeek} style={{
            width:'100%', height:3, background:'#d0e9e4', cursor:'pointer'
          }}>
            <div style={{
              width:`${progress}%`, height:'100%', background:'#00b894'
            }}></div>
          </div>

          <div style={{padding:'6px 12px', display:'flex', alignItems:'center', gap:10}}>
            <img src={playing.cover_url} style={{width:40, height:40, borderRadius:6}}/>

            <div style={{flex:1, minWidth:0}}>
              <p style={{
                margin:0, fontSize:12, fontWeight:700, color:'#00b894', lineHeight:1.3,
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'
              }}>{playing.judul}</p>
              <p style={{
                margin:0, fontSize:10, color:'#666', lineHeight:1.2,
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'
              }}>{playing.artis || 'Unknown Artist'}</p>
            </div>

            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <button onClick={playPrev} style={{background:'none', border:'none', cursor:'pointer', padding:2}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#00b894">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                </svg>
              </button>

              <button onClick={togglePlay} style={{
                background:'#00b894', border:'none', borderRadius:'50%',
                width:32, height:32, cursor:'pointer', display:'flex',
                alignItems:'center', justifyContent:'center'
              }}>
                {isPlaying?
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg> :
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                }
              </button>

              <button onClick={playNext} style={{background:'none', border:'none', cursor:'pointer', padding:2}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#00b894">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <footer style={{background:'rgba(0,0,0,0.15)', color:'white', textAlign:'center', padding:16, marginTop:30, fontSize:14}}>
        <p>© 2026 Streamo AI by ZIIPROJECT</p>
      </footer>
    </div>
  )
    }
