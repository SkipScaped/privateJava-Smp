import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('announcements')
      .select('*, author:profiles(username, avatar_url)')
      .order('published_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Announcements fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch announcements' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [], { status: 200 })
  } catch (error) {
    console.error('Announcements API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
