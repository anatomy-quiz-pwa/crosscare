import { NextResponse } from 'next/server'

export async function GET() {
  // 檢查所有 LINE 相關的環境變數
  const debugInfo = {
    NEXT_PUBLIC_LINE_CLIENT_ID: process.env.NEXT_PUBLIC_LINE_CLIENT_ID || 'NOT_FOUND',
    LINE_CLIENT_SECRET: process.env.LINE_CLIENT_SECRET || 'NOT_FOUND',
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'NOT_FOUND',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_FOUND',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'FOUND' : 'NOT_FOUND',
    NEXT_PUBLIC_DEV_MODE: process.env.NEXT_PUBLIC_DEV_MODE || 'NOT_FOUND',
  }

  // 生成 redirect_uri
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '')}/api/auth/line/callback`
  
  // 生成 LINE Auth URL
  const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_LINE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=debug123&scope=profile%20openid`

  return NextResponse.json({
    debugInfo,
    redirectUri,
    encodedRedirectUri: encodeURIComponent(redirectUri),
    lineAuthUrl,
    timestamp: new Date().toISOString()
  })
}
