import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { email, password, username } = await request.json()

  if (!email || !password || !username) {
    return NextResponse.json(
      { error: 'Missing email, password, or username' },
      { status: 400 }
    )
  }

  try {
    const supabase = await createClient()

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      )
    }

    // Sign up with email
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      console.error('Auth signup error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'User creation failed' },
        { status: 400 }
      )
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: data.user.id,
        username,
        rank: 'member',
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return NextResponse.json(
        { error: 'Profile creation failed. Please try again.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        message: 'Signup successful. You can now login.',
        user: {
          id: data.user.id,
          email: data.user.email,
          username,
          rank: 'member',
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
