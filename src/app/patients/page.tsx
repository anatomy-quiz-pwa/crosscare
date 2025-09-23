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
  updated_at?: string
  created_by?: string
  updated_by?: string
}

export default function PatientsList() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      // 檢查是否為測試模式
      const isTestMode = localStorage.getItem('test_mode') === 'true'
      
      if (isTestMode) {
        // 測試模式：從 localStorage 載入病患資料
        const storedPatients = localStorage.getItem('test_patients')
        
        if (storedPatients) {
          setPatients(JSON.parse(storedPatients))
        } else {
          setPatients([])
        }
        
        setLoading(false)
        return
      }

      // 真實模式：從資料庫載入
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

  // 篩選患者資料
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  )

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">患者資料管理</h1>
              <p className="text-gray-600">管理所有患者的資料</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/patients/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                新增患者
              </Link>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                返回儀表板
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 搜尋和統計 */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  搜尋患者
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="輸入姓名或電話號碼..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  共 {filteredPatients.length} 位患者
                </p>
                <p className="text-xs text-gray-500">
                  總計 {patients.length} 位患者
                </p>
              </div>
            </div>
          </div>

          {/* 患者列表 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {filteredPatients.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                {searchTerm ? '找不到符合條件的患者' : '尚無患者資料'}
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <li key={patient.id}>
                    <Link
                      href={`/patients/${patient.id}`}
                      className="block hover:bg-gray-50 transition-colors"
                    >
                      <div className="px-4 py-6 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-lg">
                                  {patient.name.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-lg font-medium text-gray-900">
                                {patient.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                <span>初診日期: {new Date(patient.first_visit_date).toLocaleDateString('zh-TW')}</span>
                                <span className="mx-2">•</span>
                                <span>電話: {patient.phone}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">
                              <div>建立: {new Date(patient.created_at).toLocaleDateString('zh-TW')}</div>
                              {patient.updated_at && (
                                <div className="text-xs text-gray-400">
                                  更新: {new Date(patient.updated_at).toLocaleDateString('zh-TW')}
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {patient.created_by && `建立者: ${patient.created_by}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
