import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('vip_packages')
      .select('*')
      .order('price', { ascending: true })

    if (error) {
      console.error('VIP packages fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch VIP packages' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [], { status: 200 })
  } catch (error) {
    console.error('VIP packages API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
