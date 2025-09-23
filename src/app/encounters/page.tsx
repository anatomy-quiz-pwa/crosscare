'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

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
}

interface Encounter {
  id: string
  patient_id: string
  encounter_date: string
  diagnosis: string
  treatment: string
  notes: string
  created_at: string
}

export default function Encounters() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [encounters, setEncounters] = useState<Encounter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<string>('all')
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // 檢查是否為測試模式
      const isTestMode = localStorage.getItem('test_mode') === 'true'
      
      if (isTestMode) {
        // 測試模式：從 localStorage 載入真實的病患資料
        const storedPatients = localStorage.getItem('test_patients')
        const storedEncounters = localStorage.getItem('test_encounters')
        
        if (storedPatients) {
          setPatients(JSON.parse(storedPatients))
        }
        
        if (storedEncounters) {
          setEncounters(JSON.parse(storedEncounters))
        }
        
        setLoading(false)
        return
      }

      // 真實模式：從資料庫載入
      const supabase = createClient()
      
      // 載入病患資料
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .order('name')

      if (patientsError) {
        setError('載入病患資料時發生錯誤')
        return
      }

      setPatients(patientsData || [])

      // 載入診療記錄
      const { data: encountersData, error: encountersError } = await supabase
        .from('encounters')
        .select('*')
        .order('encounter_date', { ascending: false })

      if (encountersError) {
        setError('載入診療記錄時發生錯誤')
        return
      }

      setEncounters(encountersData || [])
    } catch (err) {
      setError('載入資料時發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  const filteredEncounters = selectedPatient === 'all' 
    ? encounters 
    : encounters.filter(encounter => encounter.patient_id === selectedPatient)

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId)
    return patient ? patient.name : '未知病患'
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">診療記錄</h1>
              <p className="text-gray-600">查看和管理病患診療記錄</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/encounters/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                新增診療記錄
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
          {/* 篩選器 */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">篩選病患</h2>
            <div className="flex flex-wrap gap-4">
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">所有病患</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 診療記錄列表 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                診療記錄 ({filteredEncounters.length})
              </h2>
            </div>
            
            {filteredEncounters.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredEncounters.map((encounter) => (
                  <div key={encounter.id} className="p-6 hover:bg-gray-50 transition-colors">
                                         <div className="flex justify-between items-start mb-4">
                       <div>
                         <h3 className="text-lg font-medium text-gray-900">
                           {getPatientName(encounter.patient_id)}
                         </h3>
                         <p className="text-sm text-gray-500">
                           診療日期: {new Date(encounter.encounter_date).toLocaleDateString('zh-TW')}
                         </p>
                         <p className="text-xs text-gray-400">
                           主訴: {patients.find(p => p.id === encounter.patient_id)?.chief_complaint}
                         </p>
                       </div>
                      <div className="flex space-x-2">
                        <Link
                          href={`/encounters/${encounter.id}/edit`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          編輯
                        </Link>
                        <Link
                          href={`/encounters/${encounter.id}`}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          查看詳情
                        </Link>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">診斷</p>
                        <p className="text-gray-900">{encounter.diagnosis}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">治療</p>
                        <p className="text-gray-900">{encounter.treatment}</p>
                      </div>
                    </div>
                    
                    {encounter.notes && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-500">備註</p>
                        <p className="text-gray-900">{encounter.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                {selectedPatient === 'all' 
                  ? '尚無診療記錄' 
                  : '該病患尚無診療記錄'}
              </div>
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
