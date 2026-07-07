import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('server_info')
      .select('*')
      .single()

    if (error) {
      console.error('Server info fetch error:', error)
      return NextResponse.json(
        { 
          name: 'Private Java SMP',
          ip_address: 'private-java-smp.aternos.me',
          port: 46436,
          status: 'offline',
          player_count: 0,
          max_players: 20,
        },
        { status: 200 }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Server API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch server info' },
      { status: 500 }
    )
  }
}
