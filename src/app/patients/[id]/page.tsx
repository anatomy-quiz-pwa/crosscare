'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface Patient {
  id: string
  name: string
  chief_complaint: string
  first_visit_date: string
  phone: string
  address: string
  medical_history: string
  allergies: string
  notes: string
  created_at: string
  updated_at?: string
  created_by?: string
  updated_by?: string
}

export default function PatientDetail() {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Patient>({
    id: '',
    name: '',
    chief_complaint: '',
    first_visit_date: '',
    phone: '',
    address: '',
    medical_history: '',
    allergies: '',
    notes: '',
    created_at: '',
    updated_at: '',
    created_by: '',
    updated_by: ''
  })
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string

  useEffect(() => {
    if (patientId) {
      loadPatientData()
    }
  }, [patientId])

  const loadPatientData = async () => {
    try {
      // 檢查是否為測試模式
      const isTestMode = localStorage.getItem('test_mode') === 'true'
      
      if (isTestMode) {
        // 測試模式：使用模擬資料
        const mockPatient: Patient = {
          id: patientId,
          name: '張小明',
          chief_complaint: '頭痛、發燒',
          first_visit_date: '1990-05-15',
          phone: '0912-345-678',
          address: '台北市信義區信義路五段7號',
          medical_history: '高血壓、糖尿病',
          allergies: '青黴素過敏',
          notes: '病患對某些藥物有過敏反應，需要特別注意',
          created_at: '2024-01-15T10:00:00Z'
        }
        setPatient(mockPatient)
        setFormData(mockPatient)
        setLoading(false)
        return
      }

      // 真實模式：從資料庫載入
      const supabase = createClient()
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single()

      if (error) {
        setError('找不到病患資料')
        return
      }

      setPatient(data)
      setFormData(data)
    } catch {
      setError('載入資料時發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    try {
      // 檢查是否為測試模式
      const isTestMode = localStorage.getItem('test_mode') === 'true'
      
      if (isTestMode) {
        // 測試模式：模擬成功
        console.log('測試模式：更新病患資料', formData)
        setPatient(formData)
        setIsEditing(false)
        return
      }

      // 真實模式：更新資料庫
      const supabase = createClient()
      const { error } = await supabase
        .from('patients')
        .update({
          name: formData.name,
          chief_complaint: formData.chief_complaint,
          first_visit_date: formData.first_visit_date,
          phone: formData.phone,
          address: formData.address,
          medical_history: formData.medical_history,
          allergies: formData.allergies,
          notes: formData.notes
        })
        .eq('id', patientId)

      if (error) {
        setError(`更新失敗: ${error.message}`)
        return
      }

      setPatient(formData)
      setIsEditing(false)
    } catch {
      setError('更新時發生錯誤')
    }
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

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">錯誤</h2>
          <p className="text-gray-600 mb-4">{error || '找不到病患資料'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回儀表板
          </button>
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
              <h1 className="text-3xl font-bold text-gray-900">病患資料</h1>
              <p className="text-gray-600">{patient.name}</p>
            </div>
            <div className="flex space-x-4">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  編輯資料
                </button>
              )}
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
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <form className="space-y-6">
              {/* 基本資料 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">基本資料</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      姓名
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{patient.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      初診日期
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        name="first_visit_date"
                        value={formData.first_visit_date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {new Date(patient.first_visit_date).toLocaleDateString('zh-TW')}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      電話
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{patient.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      地址
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{patient.address || '未填寫'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 主述 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">主述</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    主述
                  </label>
                  {isEditing ? (
                    <textarea
                      name="chief_complaint"
                      value={formData.chief_complaint}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{patient.chief_complaint}</p>
                  )}
                </div>
              </div>

              {/* 醫療資訊 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">醫療資訊</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      病史
                    </label>
                    {isEditing ? (
                      <textarea
                        name="medical_history"
                        value={formData.medical_history}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{patient.medical_history || '無特殊病史'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      相關治療處置紀錄
                    </label>
                    {isEditing ? (
                      <textarea
                        name="allergies"
                        value={formData.allergies}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{patient.allergies || '無相關治療處置紀錄'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 備註 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">備註</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    備註
                  </label>
                  {isEditing ? (
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{patient.notes || '無備註'}</p>
                  )}
                </div>
              </div>

              {/* 儲存資訊 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">儲存資訊</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      建立日期
                    </label>
                    <p className="text-gray-900">
                      {new Date(patient.created_at).toLocaleString('zh-TW')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      建立者
                    </label>
                    <p className="text-gray-900">
                      {patient.created_by || '系統'}
                    </p>
                  </div>
                  {patient.updated_at && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          最後更新日期
                        </label>
                        <p className="text-gray-900">
                          {new Date(patient.updated_at).toLocaleString('zh-TW')}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          最後更新者
                        </label>
                        <p className="text-gray-900">
                          {patient.updated_by || '系統'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 編輯按鈕 */}
              {isEditing && (
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false)
                      setFormData(patient)
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    儲存變更
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
