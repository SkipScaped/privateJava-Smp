import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Missing email or password' },
      { status: 400 }
    )
  }

  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Auth error:', error)
      return NextResponse.json({ error: error.message || 'Invalid credentials' }, { status: 401 })
    }

    if (!data.user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user profile
    let profileData = null
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single()
      profileData = profile
    } catch (profileError) {
      console.error('Profile fetch error:', profileError)
    }

    return NextResponse.json(
      {
        message: 'Signed in successfully',
        user: {
          id: data.user.id,
          email: data.user.email,
          username: profileData?.username || data.user.email?.split('@')[0] || 'user',
          rank: profileData?.rank || 'member',
          avatar_url: profileData?.avatar_url,
        },
        session: data.session,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Signin error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
