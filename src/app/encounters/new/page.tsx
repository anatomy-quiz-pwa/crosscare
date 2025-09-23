'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
}

interface EncounterForm {
  patient_id: string
  encounter_date: string
  diagnosis: string
  treatment: string
  notes: string
}

export default function NewEncounter() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [formData, setFormData] = useState<EncounterForm>({
    patient_id: '',
    encounter_date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    treatment: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      // 檢查是否為測試模式
      const isTestMode = localStorage.getItem('test_mode') === 'true'
      
      if (isTestMode) {
        // 測試模式：從 localStorage 載入真實的病患資料
        const storedPatients = localStorage.getItem('test_patients')
        
        if (storedPatients) {
          setPatients(JSON.parse(storedPatients))
        }
        return
      }

      // 真實模式：從資料庫載入
      const supabase = createClient()
      const { data, error } = await supabase
        .from('patients')
        .select('id, name, chief_complaint, first_visit_date, phone')
        .order('name')

      if (error) {
        setError('載入病患資料時發生錯誤')
        return
      }

      setPatients(data || [])
    } catch (err) {
      setError('載入病患資料時發生錯誤')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 檢查是否為測試模式
      const isTestMode = localStorage.getItem('test_mode') === 'true'
      
      if (isTestMode) {
        // 測試模式：儲存到 localStorage
        const newEncounter = {
          id: Date.now().toString(), // 使用時間戳作為 ID
          patient_id: formData.patient_id,
          encounter_date: formData.encounter_date,
          diagnosis: formData.diagnosis,
          treatment: formData.treatment,
          notes: formData.notes,
          created_at: new Date().toISOString()
        }
        
        // 儲存到 localStorage
        const storedEncounters = localStorage.getItem('test_encounters')
        const encounters = storedEncounters ? JSON.parse(storedEncounters) : []
        encounters.push(newEncounter)
        localStorage.setItem('test_encounters', JSON.stringify(encounters))
        
        console.log('測試模式：新增診療記錄', newEncounter)
        setSuccess(true)
        setTimeout(() => {
          router.push('/encounters')
        }, 2000)
        return
      }

      // 真實模式：儲存到 Supabase
      const supabase = createClient()
      
      const { error } = await supabase
        .from('encounters')
        .insert({
          patient_id: formData.patient_id,
          encounter_date: formData.encounter_date,
          diagnosis: formData.diagnosis,
          treatment: formData.treatment,
          notes: formData.notes
        })

      if (error) {
        console.error('Supabase error:', error)
        setError(`儲存失敗: ${error.message}`)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/encounters')
      }, 2000)
    } catch (err) {
      console.error('新增診療記錄錯誤:', err)
      setError('新增診療記錄時發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">新增診療記錄</h1>
              <p className="text-gray-600">建立新的診療記錄</p>
            </div>
            <button
              onClick={() => router.push('/encounters')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              返回診療記錄
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 選擇病患 */}
              <div>
                <label htmlFor="patient_id" className="block text-sm font-medium text-gray-700 mb-2">
                  選擇病患 *
                </label>
                <select
                  id="patient_id"
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">請選擇病患</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} - {patient.chief_complaint} - {new Date(patient.first_visit_date).toLocaleDateString('zh-TW')}
                    </option>
                  ))}
                </select>
              </div>

              {/* 診療日期 */}
              <div>
                <label htmlFor="encounter_date" className="block text-sm font-medium text-gray-700 mb-2">
                  診療日期 *
                </label>
                <input
                  type="date"
                  id="encounter_date"
                  name="encounter_date"
                  value={formData.encounter_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 診斷 */}
              <div>
                <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-2">
                  診斷 *
                </label>
                <textarea
                  id="diagnosis"
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="請輸入診斷結果"
                />
              </div>

              {/* 治療 */}
              <div>
                <label htmlFor="treatment" className="block text-sm font-medium text-gray-700 mb-2">
                  治療 *
                </label>
                <textarea
                  id="treatment"
                  name="treatment"
                  value={formData.treatment}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="請輸入治療方式"
                />
              </div>

              {/* 備註 */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  備註
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="請輸入其他備註事項"
                />
              </div>

              {/* 錯誤和成功訊息 */}
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 text-green-600 rounded-lg">
                  診療記錄新增成功！正在返回診療記錄頁面...
                </div>
              )}

              {/* 提交按鈕 */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.push('/encounters')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '儲存中...' : '儲存診療記錄'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
