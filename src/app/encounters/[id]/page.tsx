'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
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

interface Encounter {
  id: string
  patient_id: string
  encounter_date: string
  diagnosis: string
  treatment: string
  notes: string
  created_at: string
}

export default function EncounterDetail() {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [encounter, setEncounter] = useState<Encounter | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useParams()
  const encounterId = params.id as string

  useEffect(() => {
    loadEncounterDetail()
  }, [encounterId])

  const loadEncounterDetail = async () => {
    try {
      // 檢查是否為測試模式
      const isTestMode = localStorage.getItem('test_mode') === 'true'
      
      if (isTestMode) {
        // 測試模式：從 localStorage 載入真實資料
        const storedPatients = localStorage.getItem('test_patients')
        const storedEncounters = localStorage.getItem('test_encounters')
        
        if (storedPatients && storedEncounters) {
          const patients = JSON.parse(storedPatients)
          const encounters = JSON.parse(storedEncounters)
          
          const encounter = encounters.find((e: any) => e.id === encounterId)
          if (encounter) {
            const patient = patients.find((p: any) => p.id === encounter.patient_id)
            if (patient) {
              setPatient(patient)
              setEncounter(encounter)
              setLoading(false)
              return
            }
          }
        }
        
        setError('找不到診療記錄')
        setLoading(false)
        return
      }

      // 真實模式：從資料庫載入
      const supabase = createClient()
      
      // 載入診療記錄
      const { data: encounterData, error: encounterError } = await supabase
        .from('encounters')
        .select('*')
        .eq('id', encounterId)
        .single()

      if (encounterError) {
        setError('載入診療記錄時發生錯誤')
        return
      }

      setEncounter(encounterData)

      // 載入病患資料
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', encounterData.patient_id)
        .single()

      if (patientError) {
        setError('載入病患資料時發生錯誤')
        return
      }

      setPatient(patientData)
    } catch (err) {
      setError('載入資料時發生錯誤')
    } finally {
      setLoading(false)
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

  if (!patient || !encounter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">找不到診療記錄</p>
          <button
            onClick={() => router.push('/encounters')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回診療記錄
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
              <h1 className="text-3xl font-bold text-gray-900">診療記錄詳情</h1>
              <p className="text-gray-600">
                {patient.name} - {new Date(encounter.encounter_date).toLocaleDateString('zh-TW')}
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push(`/encounters/${encounterId}/edit`)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                編輯記錄
              </button>
              <button
                onClick={() => router.push('/encounters')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                返回診療記錄
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 病患資料 */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">病患資料</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">姓名</p>
                  <p className="text-gray-900">{patient.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">初診日期</p>
                  <p className="text-gray-900">{new Date(patient.first_visit_date).toLocaleDateString('zh-TW')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">電話</p>
                  <p className="text-gray-900">{patient.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">地址</p>
                  <p className="text-gray-900">{patient.address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">主訴</p>
                  <p className="text-gray-900">{patient.chief_complaint}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">病史</p>
                  <p className="text-gray-900">{patient.medical_history}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">相關治療處置紀錄</p>
                  <p className="text-gray-900">{patient.allergies}</p>
                </div>
                {patient.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">備註</p>
                    <p className="text-gray-900">{patient.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 診療記錄 */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">診療記錄</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">診療日期</p>
                  <p className="text-gray-900">{new Date(encounter.encounter_date).toLocaleDateString('zh-TW')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">診斷</p>
                  <p className="text-gray-900">{encounter.diagnosis}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">治療</p>
                  <p className="text-gray-900">{encounter.treatment}</p>
                </div>
                {encounter.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">備註</p>
                    <p className="text-gray-900">{encounter.notes}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">建立時間</p>
                  <p className="text-gray-900">{new Date(encounter.created_at).toLocaleString('zh-TW')}</p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
