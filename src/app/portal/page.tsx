'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function Portal() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 檢查是否為測試模式
      const isTestMode = localStorage.getItem('test_mode') === 'true'
      
      if (isTestMode) {
        // 測試模式：從 localStorage 查詢病患資料
        const storedPatients = localStorage.getItem('test_patients')
        
        if (storedPatients) {
          const patients = JSON.parse(storedPatients)
          const patient = patients.find((p: { name: string; phone: string }) => 
            p.name === name && p.phone === phone
          )
          
          if (patient) {
            router.push(`/portal/patients/${patient.id}`)
            return
          }
        }
        
        setError('找不到符合的病患資料，請確認姓名和電話是否正確')
        setLoading(false)
        return
      }

      // 真實模式：從 Supabase 查詢
      const supabase = createClient()
      
      // 查詢病患資料
      const { data: patients, error } = await supabase
        .from('patients')
        .select('*')
        .eq('name', name)
        .eq('phone', phone)

      if (error) {
        console.error('Supabase error:', error)
        setError('查詢時發生錯誤')
        return
      }

      if (!patients || patients.length === 0) {
        setError('找不到符合的病患資料，請確認姓名和電話是否正確')
        return
      }

      // 找到病患，重定向到病患資料頁面
      const patient = patients[0]
      router.push(`/portal/patients/${patient.id}`)
    } catch (err) {
      console.error('查詢錯誤:', err)
      setError('查詢時發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              CrossCare
            </h1>
            <p className="text-gray-600">病患入口</p>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="請輸入您的姓名"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                電話
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="請輸入您的電話號碼"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '查詢中...' : '查看我的資料'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-green-600 hover:text-green-800 text-sm">
              返回首頁
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
