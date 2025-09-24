'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

function RegisterForm() {
  const [name, setName] = useState('')
  const [profession, setProfession] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const lineUserId = searchParams.get('line_user_id')

  useEffect(() => {
    if (!lineUserId) {
      router.push('/login')
    }
  }, [lineUserId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 檢查是否為測試模式
      const isTestMode = lineUserId === 'demo_user_123'
      
      if (isTestMode) {
        // 測試模式：儲存用戶資訊到 localStorage 並跳轉到儀表板
        console.log('測試模式：跳轉到儀表板')
        localStorage.setItem('test_mode', 'true')
        localStorage.setItem('test_user_name', name)
        localStorage.setItem('test_user_profession', profession)
        router.push('/dashboard')
        return
      }

      const supabase = createClient()
      
      // 檢查 Supabase 連接
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setError('Supabase 環境變數未設定，請先設定資料庫連接')
        return
      }

      // 更新用戶資料
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          name: name,
          profession: profession,
          user_type: 'medical_staff'
        }
      })

      if (updateError) {
        console.error('Update user error:', updateError)
        setError(`更新用戶資料失敗: ${updateError.message}`)
        return
      }

      // 建立醫療人員檔案
      const { error: profileError } = await supabase
        .from('medical_staff')
        .insert({
          line_user_id: lineUserId,
          name: name,
          profession: profession,
          email: `${lineUserId}@line.user`
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // 檢查是否為表格不存在的錯誤
        if (profileError.message.includes('relation "medical_staff" does not exist')) {
          setError('資料庫表格不存在，請先建立必要的資料庫表格')
        } else {
          setError(`建立醫療人員檔案失敗: ${profileError.message}`)
        }
        return
      }

      router.push('/dashboard')
    } catch (err) {
      console.error('Registration error:', err)
      setError('註冊時發生錯誤，請檢查網路連接和資料庫設定')
    } finally {
      setLoading(false)
    }
  }

  if (!lineUserId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  const isTestMode = lineUserId === 'demo_user_123'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              CrossCare
            </h1>
            <p className="text-gray-600">醫療人員註冊</p>
            {isTestMode && (
              <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded text-sm">
                🧪 測試模式
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                姓名
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="請輸入您的姓名"
              />
            </div>

            <div>
              <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-2">
                職業
              </label>
              <select
                id="profession"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">請選擇您的職業</option>
                <option value="醫師">醫師</option>
                <option value="護理師">護理師</option>
                <option value="藥師">藥師</option>
                <option value="醫檢師">醫檢師</option>
                <option value="放射師">放射師</option>
                <option value="物理治療師">物理治療師</option>
                <option value="職能治療師">職能治療師</option>
                <option value="營養師">營養師</option>
                <option value="心理師">心理師</option>
                <option value="社工師">社工師</option>
                <option value="其他">其他</option>
              </select>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center p-3 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '註冊中...' : (isTestMode ? '進入儀表板' : '完成註冊')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/login" className="text-blue-600 hover:text-blue-800 text-sm">
              返回登入頁面
            </a>
          </div>

          {isTestMode && (
            <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">
              <p className="font-medium">測試模式說明：</p>
              <p>• 這是測試模式，不會實際建立資料庫記錄</p>
              <p>• 可以測試所有介面功能</p>
              <p>• 要使用真實功能，請設定 Supabase 和 LINE 登入</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Register() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
