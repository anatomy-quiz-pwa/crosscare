import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // 檢查是否為測試模式
  if (typeof window !== 'undefined' && localStorage.getItem('test_mode') === 'true') {
    // 測試模式：返回一個模擬的 Supabase 客戶端
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
        signUp: () => Promise.resolve({ data: { user: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        updateUser: () => Promise.resolve({ data: { user: null }, error: null }),
      },
      from: () => ({
        select: () => ({
          order: () => Promise.resolve({ data: [], error: null })
        }),
        insert: () => Promise.resolve({ data: null, error: null })
      })
    } as any
  }

  // 檢查環境變數是否存在
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // 如果沒有環境變數，返回一個會拋出錯誤的客戶端
    return {
      auth: {
        getUser: () => Promise.reject(new Error('Supabase 環境變數未設定')),
        signInWithPassword: () => Promise.reject(new Error('Supabase 環境變數未設定')),
        signUp: () => Promise.reject(new Error('Supabase 環境變數未設定')),
        signOut: () => Promise.reject(new Error('Supabase 環境變數未設定')),
        updateUser: () => Promise.reject(new Error('Supabase 環境變數未設定')),
      },
      from: () => ({
        select: () => ({
          order: () => Promise.reject(new Error('Supabase 環境變數未設定'))
        }),
        insert: () => Promise.reject(new Error('Supabase 環境變數未設定'))
      })
    } as any
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
