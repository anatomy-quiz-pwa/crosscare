'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

interface Patient {
  id: string
  name: string
  first_visit_date: string
  phone: string
  created_at: string
}

export default function Dashboard() {
  const [user, setUser] = useState<{ email?: string; user_metadata?: { name?: string; profession?: string } } | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // 檢查是否為測試模式
    const isTestMode = localStorage.getItem('test_mode') === 'true'
    
    if (isTestMode) {
      // 測試模式：設定模擬用戶
      setUser({
        email: 'demo@test.com',
        user_metadata: {
          name: localStorage.getItem('test_user_name') || '測試用戶',
          profession: localStorage.getItem('test_user_profession') || '醫師'
        }
      })
      // 載入模擬病患資料
      loadMockPatients()
    } else {
      // 真實模式：檢查 Supabase 用戶
      const supabase = createClient()
      supabase.auth.getUser().then(({ data: { user } }: { data: { user: { id: string; email?: string; user_metadata?: any } | null } }) => {
        if (!user) {
          router.push('/login')
          return
        }
        setUser(user)
        loadPatients()
      })
    }
  }, [router])

  const loadMockPatients = () => {
    // 測試模式：從 localStorage 載入真實的病患資料
    const storedPatients = localStorage.getItem('test_patients')
    
    if (storedPatients) {
      setPatients(JSON.parse(storedPatients))
    } else {
      // 如果沒有儲存的資料，顯示空列表
      setPatients([])
    }
    
    setLoading(false)
  }

  const loadPatients = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading patients:', error)
        setError('載入病患資料時發生錯誤')
      } else {
        setPatients(data || [])
      }
    } catch (err) {
      console.error('Error:', err)
      setError('載入資料時發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    // 檢查是否為測試模式
    const isTestMode = localStorage.getItem('test_mode') === 'true'
    
    if (isTestMode) {
      // 測試模式：清除所有測試資料
      localStorage.removeItem('test_mode')
      localStorage.removeItem('test_user_name')
      localStorage.removeItem('test_user_profession')
      localStorage.removeItem('test_patients')
      localStorage.removeItem('test_encounters')
    } else {
      // 真實模式：登出 Supabase
      const supabase = createClient()
      await supabase.auth.signOut()
    }
    
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  const isTestMode = localStorage.getItem('test_mode') === 'true'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CrossCare 儀表板</h1>
              <p className="text-gray-600">
                歡迎回來，{user?.user_metadata?.name || user?.email}
                {isTestMode && (
                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                    🧪 測試模式
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              登出
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">快速操作</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/patients/new"
                className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                <h3 className="text-xl font-semibold mb-2">新增病患</h3>
                <p className="text-blue-100">建立新的病患檔案</p>
              </Link>
              <Link
                href="/patients"
                className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-colors text-center"
              >
                <h3 className="text-xl font-semibold mb-2">患者列表</h3>
                <p className="text-green-100">查看和管理所有患者資料</p>
              </Link>
              <Link
                href="/encounters"
                className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition-colors text-center"
              >
                <h3 className="text-xl font-semibold mb-2">診療記錄</h3>
                <p className="text-purple-100">查看和管理診療記錄</p>
              </Link>
              <Link
                href="/consents"
                className="bg-orange-600 text-white p-6 rounded-lg hover:bg-orange-700 transition-colors text-center"
              >
                <h3 className="text-xl font-semibold mb-2">同意書管理</h3>
                <p className="text-orange-100">處理病患同意書</p>
              </Link>
            </div>
          </div>

          {/* Recent Patients */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">最近病患</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {patients.slice(0, 5).map((patient) => (
                  <li key={patient.id}>
                    <Link
                      href={`/patients/${patient.id}`}
                      className="block hover:bg-gray-50 transition-colors"
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-semibold">
                                  {patient.name.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {patient.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                初診日期: {new Date(patient.first_visit_date).toLocaleDateString('zh-TW')}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(patient.created_at).toLocaleDateString('zh-TW')}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              {patients.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-500">
                  尚無病患資料
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {isTestMode && (
            <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-lg">
              <p className="font-medium">測試模式說明：</p>
              <p>• 這是測試模式，顯示的是模擬資料</p>
              <p>• 可以測試所有介面功能</p>
              <p>• 要使用真實功能，請設定 Supabase 資料庫</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
