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
  const [tab, setTab] = useState<'semua' | 'favorit' | 'playlist'>('semua')
  const [playlists, setPlaylists] = useState<{[key:string]: string[]}>({})
  const [activePlaylist, setActivePlaylist] = useState<string | null>(null)
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [showAddToPlaylist, setShowAddToPlaylist] = useState<string | null>(null) // id lagu yg kebuka menu
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [isShuffle, setIsShuffle] = useState(false)
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off')
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const fav = localStorage.getItem('streamo_favorites')
    const pls = localStorage.getItem('streamo_playlists')
    if(fav) setFavorites(JSON.parse(fav))
    if(pls) setPlaylists(JSON.parse(pls))
  }, [])

  useEffect(() => {
    localStorage.setItem('streamo_favorites', JSON.stringify(favorites))
  }, [favorites])
  useEffect(() => {
    localStorage.setItem('streamo_playlists', JSON.stringify(playlists))
  }, [playlists])

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
    const handleEnded = () => {
      if(repeatMode === 'one') {
        audio.currentTime = 0
        audio.play()
      } else {
        playNext()
      }
    }
    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('ended', handleEnded)
    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [playingIndex, repeatMode])

  let baseList = lagu
  if(tab === 'favorit') baseList = lagu.filter(l => favorites.includes(l.id))
  if(tab === 'playlist' && activePlaylist) baseList = lagu.filter(l => playlists[activePlaylist]?.includes(l.id))

  const filtered = baseList.filter(l =>
    l.judul.toLowerCase().includes(search.toLowerCase())
  )

  const playing = playingIndex!== null? filtered[playingIndex] : null
  const getRandomIndex = () => Math.floor(Math.random() * filtered.length)

  const playNext = () => {
    if(playingIndex === null || filtered.length === 0) return
    let nextIndex
    if(isShuffle) {
      nextIndex = getRandomIndex()
      while(nextIndex === playingIndex && filtered.length > 1) nextIndex = getRandomIndex()
    } else {
      nextIndex = (playingIndex + 1) % filtered.length
    }
    if(nextIndex === 0 && playingIndex === filtered.length - 1 && repeatMode === 'off') {
      setIsPlaying(false)
      return
    }
    setPlayingIndex(nextIndex)
    setIsPlaying(true)
    setProgress(0)
  }

  const playPrev = () => {
    if(playingIndex === null || filtered.length === 0) return
    let prevIndex
    if(isShuffle) {
      prevIndex = getRandomIndex()
    } else {
      prevIndex = (playingIndex - 1 + filtered.length) % filtered.length
    }
    setPlayingIndex(prevIndex)
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

  const toggleFavorite = (id: string, e: any) => {
    e.stopPropagation()
    setFavorites(prev =>
      prev.includes(id)? prev.filter(f => f!== id) : [...prev, id]
    )
  }

  const createPlaylist = () => {
    if(!newPlaylistName.trim()) return
    setPlaylists(prev => ({...prev, [newPlaylistName]: []}))
    setNewPlaylistName('')
    setShowPlaylistModal(false)
  }

  const toggleAddToPlaylist = (songId: string, playlistName: string) => {
    setPlaylists(prev => {
      const current = prev[playlistName] || []
      const isIn = current.includes(songId)
      return {
      ...prev,
        [playlistName]: isIn? current.filter(id => id!== songId) : [...current, songId]
      }
    })
  }

  return (
    <div style={{background:'linear-gradient(135deg, #00b894 0%, #0984e3 100%)', minHeight:'100vh', fontFamily:'Poppins, sans-serif', paddingBottom:95}} onClick={()=>setShowAddToPlaylist(null)}>

      <header style={{background:'rgba(255,255,255,0.98)', padding:'10px 20px', position:'sticky', top:0, backdropFilter:'blur(10px)', boxShadow:'0 2px 10px rgba(0,0,0,0.1)'}}>
        <div style={{maxWidth:1200, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <img src="https://tfiihtfbilhyobituuve.supabase.co/storage/v1/object/public/Image/Logo/Logo%20STREAMO%20AI.png" style={{height:36}}/>
          <input type="text" placeholder="Cari lagu..." onChange={(e)=>setSearch(e.target.value)} style={{padding:'8px 14px', borderRadius:20, border:'1.5px solid #00b894', width:160, fontSize:14, outline:'none', color:'#00b894'}}/>
        </div>
      </header>

      <div style={{maxWidth:1200, margin:'0 auto', padding:'20px 20px 0'}}>
        <div style={{display:'flex', gap:10, background:'rgba(255,255,255,0.2)', padding:4, borderRadius:12, marginBottom:10}}>
          <button onClick={()=>{setTab('semua'); setActivePlaylist(null); setPlayingIndex(null)}} style={{flex:1, padding:'8px 16px', borderRadius:8, border:'none', cursor:'pointer', background: tab==='semua'? 'white' : 'transparent', color: tab==='semua'? '#00b894' : 'white', fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:6}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
            Semua
          </button>
          <button onClick={()=>{setTab('favorit'); setActivePlaylist(null); setPlayingIndex(null)}} style={{flex:1, padding:'8px 16px', borderRadius:8, border:'none', cursor:'pointer', background: tab==='favorit'? 'white' : 'transparent', color: tab==='favorit'? '#00b894' : 'white', fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:6}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            Favorit ({favorites.length})
          </button>
          <button onClick={()=>{setTab('playlist'); setPlayingIndex(null)}} style={{flex:1, padding:'8px 16px', borderRadius:8, border:'none', cursor:'pointer', background: tab==='playlist'? 'white' : 'transparent', color: tab==='playlist'? '#00b894' : 'white', fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:6}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
            Playlist
          </button>
        </div>

        {tab === 'playlist' && (
          <div style={{display:'flex', gap:8, flexWrap:'wrap', marginBottom:15}}>
            {Object.keys(playlists).map(name => (
              <button key={name} onClick={()=>{setActivePlaylist(name)}} style={{padding:'6px 12px', borderRadius:20, border:'1px solid white', cursor:'pointer', background: activePlaylist === name? 'white' : 'transparent', color: activePlaylist === name? '#00b894' : 'white', fontSize:12}}>
                {name} ({playlists[name].length})
              </button>
            ))}
            <button onClick={()=>setShowPlaylistModal(true)} style={{padding:'6px 12px', borderRadius:20, border:'1px dashed white', background:'transparent', color:'white', cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', gap:4}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              Buat Playlist
            </button>
          </div>
        )}
      </div>

      {showPlaylistModal && (
        <div onClick={()=>setShowPlaylistModal(false)} style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100}}>
          <div onClick={(e)=>e.stopPropagation()} style={{background:'white', padding:20, borderRadius:12, width:300}}>
            <h3 style={{color:'#00b894', marginTop:0}}>Nama Playlist</h3>
            <input value={newPlaylistName} onChange={(e)=>setNewPlaylistName(e.target.value)} placeholder="Contoh: Lagu Galau" style={{width:'100%', padding:8, border:'1px solid #ddd', borderRadius:6, marginBottom:10}}/>
            <button onClick={createPlaylist} style={{width:'100%', padding:10, background:'#00b894', color:'white', border:'none', borderRadius:6, cursor:'pointer'}}>Buat</button>
          </div>
        </div>
      )}

      <div style={{padding:'20px'}}>
        <div style={{maxWidth:1200, margin:'0 auto'}}>
          <p style={{color:'white', textAlign:'center', marginBottom:25, opacity:0.9}}>{filtered.length} Lagu</p>

          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:20}}>
            {filtered.map((i, index)=>(
              <div key={i.id} onClick={()=>{setPlayingIndex(index); setIsPlaying(true)}} style={{background:'white', borderRadius:14, padding:12, boxShadow:'0 6px 15px rgba(0,0,0,0.15)', cursor:'pointer', border: playingIndex === index? '2px solid #00b894' : '2px solid transparent', position:'relative'}}>

                {/* MENU ATAS KAN */}
                <div style={{position:'absolute', top:12, right:12, display:'flex', gap:5}}>
                  <button onClick={(e)=>toggleFavorite(i.id, e)} style={{background:'rgba(255,255,255,0.9)', border:'none', borderRadius:'50%', width:30, height:30, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
                    {favorites.includes(i.id)? <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff4757"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}
                  </button>

                  {/* TOMBOL... BARU */}
                  <div style={{position:'relative'}}>
                    <button onClick={(e)=>{e.stopPropagation(); setShowAddToPlaylist(showAddToPlaylist === i.id? null : i.id)}} style={{background:'rgba(255,255,255,0.9)', border:'none', borderRadius:'50%', width:30, height:30, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#666"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                    </button>

                    {/* POPOVER PLAYLIST */}
                    {showAddToPlaylist === i.id && (
                      <div onClick={(e)=>e.stopPropagation()} style={{position:'absolute', right:0, top:35, background:'white', borderRadius:8, boxShadow:'0 4px 12px rgba(0,0,0,0.2)', padding:8, width:180, zIndex:10}}>
                        <p style={{margin:'0 0 8px', fontSize:12, fontWeight:600, color:'#00b894'}}>Tambah ke Playlist</p>
                        {Object.keys(playlists).length === 0?
                          <p style={{fontSize:12, color:'#999'}}>Buat playlist dulu</p> :
                          Object.keys(playlists).map(name => (
                            <label key={name} style={{display:'flex', alignItems:'center', gap:8, padding:'6px 4px', cursor:'pointer', fontSize:13}}>
                              <input
                                type="checkbox"
                                checked={playlists[name].includes(i.id)}
                                onChange={()=>toggleAddToPlaylist(i.id, name)}
                              />
                              {name}
                            </label>
                          ))
                        }
                        <button onClick={()=>setShowPlaylistModal(true)} style={{width:'100%', marginTop:8, padding:6, fontSize:12, background:'#f1f1f1', border:'none', borderRadius:4, cursor:'pointer', color:'#00b894'}}>Buat Playlist Baru</button>
                      </div>
                    )}
                  </div>
                </div>

                <img src={i.cover_url} style={{width:'100%', borderRadius:10, aspectRatio:'1/1', objectFit:'cover'}}/>
                <h3 style={{color:'#00b894', margin:'10px 0 6px', fontSize:15, fontWeight:600}}>{i.judul}</h3>
                <p style={{color:'#666', fontSize:12, margin:0}}>{i.artis || 'Unknown Artist'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {playing && <audio ref={audioRef} src={playing.mp3_url} />}

      {playing && (
        <div style={{position:'fixed', bottom:0, left:0, right:0, background:'rgba(255,255,255,0.98)', backdropFilter:'blur(15px)', boxShadow:'0 -4px 20px rgba(0,0,0,0.15)', borderTop:'2px solid #00b894'}}>
          <div onClick={handleSeek} style={{width:'100%', height:3, background:'#d0e9e4', cursor:'pointer'}}><div style={{width:`${progress}%`, height:'100%', background:'#00b894'}}></div></div>

          <div style={{padding:'6px 12px', display:'flex', alignItems:'center', gap:10}}>
            <img src={playing.cover_url} style={{width:40, height:40, borderRadius:6}}/>
            <div style={{flex:1, minWidth:0}}>
              <p style={{margin:0, fontSize:12, fontWeight:700, color:'#00b894', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{playing.judul}</p>
              <p style={{margin:0, fontSize:10, color:'#666', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{playing.artis || 'Unknown Artist'}</p>
            </div>

            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <button onClick={()=>setIsShuffle(!isShuffle)} style={{background:'none', border:'none', cursor:'pointer', padding:2}}><svg width="18" height="18" viewBox="0 0 24 24" fill={isShuffle? '#00b894' : '#aaa'}><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4v.01L14 7.34 4.34 17H3v2h2l10-10.94V22h2V8.94L19.66 11l1.41-1.41L14.5 4z"/></svg></button>
              <button onClick={playPrev} style={{background:'none', border:'none', cursor:'pointer', padding:2}}><svg width="18" height="18" viewBox="0 0 24 24" fill="#00b894"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg></button>
              <button onClick={togglePlay} style={{background:'#00b894', border:'none', borderRadius:'50%', width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>{isPlaying? <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>}</button>
              <button onClick={playNext} style={{background:'none', border:'none', cursor:'pointer', padding:2}}><svg width="18" height="18" viewBox="0 0 24 24" fill="#00b894"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg></button>
              <button onClick={()=>setRepeatMode(repeatMode === 'off'? 'all' : repeatMode === 'all'? 'one' : 'off')} style={{background:'none', border:'none', cursor:'pointer', padding:2, position:'relative'}}><svg width="18" height="18" viewBox="0 0 24 24" fill={repeatMode!== 'off'? '#00b894' : '#aaa'}><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>{repeatMode === 'one' && <span style={{fontSize:8, position:'absolute', bottom:2, right:2, color: '#00b894', fontWeight:700}}>1</span>}</button>
            </div>
          </div>
        </div>
      )}

      <footer style={{background:'rgba(0,0,0,0.15)', color:'white', textAlign:'center', padding:16, marginTop:30, fontSize:14}}><p>© 2026 Streamo AI by ZIIPROJECT</p></footer>
    </div>
  )
      }
