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
  const audioRef = useRef<HTMLAudioElement>(null)

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

  const filtered = lagu.filter(l =>
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

  const formatTime = (time: number) => {
    if(isNaN(time)) return '0:00'
    const m = Math.floor(time / 60)
    const s = Math.floor(time % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div style={{background:'linear-gradient(135deg, #00b894 0%, #0984e3 100%)', minHeight:'100vh', fontFamily:'Poppins, sans-serif', paddingBottom:140}}>

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
              <div key={i.id} onClick={()=>{setPlayingIndex(index); setIsPlaying(true)}} style={{
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

      {/* AUDIO HIDDEN */}
      {playing && <audio ref={audioRef} src={playing.mp3_url} onEnded={playNext} />}

      {/* PLAYER BAWAH DENGAN PROGRESS BAR FULL */}
      {playing && (
        <div style={{
          position:'fixed', bottom:0, left:0, right:0,
          background:'rgba(255,255,255,0.98)', backdropFilter:'blur(15px)',
          padding:'12px 0',
          boxShadow:'0 -4px 20px rgba(0,0,0,0.15)', borderTop:'2px solid #00b894'
        }}>

          {/* PROGRESS BAR FULL LEBAR */}
          <div onClick={handleSeek} style={{
            width:'100%', height:4, background:'#d0e9e4', cursor:'pointer', marginBottom:10
          }}>
            <div style={{
              width:`${progress}%`, height:'100%', background:'#00b894',
              transition:'width 0.1s linear'
            }}></div>
          </div>

          <div style={{padding:'0 16px', display:'flex', flexDirection:'column', gap:8}}>

            {/* BARIS 1: COVER + JUDUL + WAKTU */}
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <img src={playing.cover_url} style={{width:48, height:48, borderRadius:8}}/>
              <div style={{flex:1, minWidth:0}}>
                <p style={{
                  margin:0, fontSize:13, fontWeight:700, color:'#00b894',
                  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'
                }}>{playing.judul}</p>
                <p style={{margin:0, fontSize:11, color:'#666'}}>Streamo AI</p>
              </div>
              <p style={{fontSize:11, color:'#666', margin:0}}>
                {formatTime(audioRef.current?.currentTime || 0)} / {formatTime(audioRef.current?.duration || 0)}
              </p>
            </div>

            {/* BARIS 2: TOMBOL CUSTOM */}
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:24}}>

              {/* PREV */}
              <button onClick={playPrev} style={{background:'none', border:'none', cursor:'pointer', padding:5}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#00b894">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                </svg>
              </button>

              {/* PLAY/PAUSE */}
              <button onClick={togglePlay} style={{
                background:'#00b894', border:'none', borderRadius:'50%',
                width:40, height:40, cursor:'pointer', display:'flex',
                alignItems:'center', justifyContent:'center'
              }}>
                {isPlaying?
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg> :
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                }
              </button>

              {/* NEXT */}
              <button onClick={playNext} style={{background:'none', border:'none', cursor:'pointer', padding:5}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#00b894">
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
