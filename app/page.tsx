'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export default function Home() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    supabase.from('lagu').select().then(res => {
      console.log(res)
      setData(res.data || [])
    })
  }, [])

  return (
    <div style={{padding: 20}}>
      <h1>Daftar Lagu</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
