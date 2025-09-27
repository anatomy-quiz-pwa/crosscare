import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  // 驗證 state 參數以防止 CSRF 攻擊
  if (!state) {
    return NextResponse.redirect(new URL('/login?error=invalid_state', request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url))
  }

  try {
    // 使用 LINE 授權碼交換 access token
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '')}/api/auth/line/callback`,
        client_id: process.env.NEXT_PUBLIC_LINE_CLIENT_ID!,
        client_secret: process.env.LINE_CLIENT_SECRET!,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error('LINE token error:', tokenData)
      return NextResponse.redirect(new URL('/login?error=token_error', request.url))
    }

    // 使用 access token 獲取用戶資料
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    })

    const profileData = await profileResponse.json()

    if (!profileResponse.ok) {
      console.error('LINE profile error:', profileData)
      return NextResponse.redirect(new URL('/login?error=profile_error', request.url))
    }

    // 建立 Supabase 客戶端
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          },
        },
      }
    )

    // 使用 LINE 用戶 ID 作為唯一識別符
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: `${profileData.userId}@line.user`,
      password: profileData.userId, // 使用 LINE 用戶 ID 作為密碼
    })

    if (signInError) {
      // 如果用戶不存在，嘗試註冊
      const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({
        email: `${profileData.userId}@line.user`,
        password: profileData.userId,
        options: {
          data: {
            line_user_id: profileData.userId,
            display_name: profileData.displayName,
            picture_url: profileData.pictureUrl,
          }
        }
      })

      if (signUpError) {
        console.error('Sign up error:', signUpError)
        return NextResponse.redirect(new URL('/login?error=signup_error', request.url))
      }
      
      // 記錄新用戶創建
      console.log('New user created:', newUser?.id)

      // 重定向到註冊頁面讓用戶填寫額外資訊
      return NextResponse.redirect(new URL(`/register?line_user_id=${profileData.userId}`, request.url))
    }

    // 登入成功，重定向到儀表板
    return NextResponse.redirect(new URL('/dashboard', request.url))

  } catch (error) {
    console.error('LINE callback error:', error)
    return NextResponse.redirect(new URL('/login?error=callback_error', request.url))
  }
}
