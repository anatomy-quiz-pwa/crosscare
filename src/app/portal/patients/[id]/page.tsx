'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
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
  files?: { name: string; url: string }[]
  audio_url?: string
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

export default function PatientPortal() {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [encounters, setEncounters] = useState<Encounter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const params = useParams()
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
        // 測試模式：從 localStorage 載入資料
        const storedPatients = localStorage.getItem('test_patients')
        const storedEncounters = localStorage.getItem('test_encounters')
        
        if (storedPatients) {
          const patients = JSON.parse(storedPatients)
          const patient = patients.find((p: { id: string }) => p.id === patientId)
          
          if (patient) {
            setPatient(patient)
            
            // 載入該病患的診療記錄
            if (storedEncounters) {
              const encounters = JSON.parse(storedEncounters)
              const patientEncounters = encounters.filter((e: { patient_id: string }) => e.patient_id === patientId)
              setEncounters(patientEncounters)
            }
            
            setLoading(false)
            return
          }
        }
        
        setError('找不到病患資料')
        setLoading(false)
        return
      }

      // 真實模式：從 Supabase 載入
      const supabase = createClient()
      
      // 載入病患資料
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single()

      if (patientError) {
        console.error('Patient error:', patientError)
        setError('找不到病患資料')
        return
      }

      setPatient(patientData)

      // 載入診療記錄
      const { data: encountersData, error: encountersError } = await supabase
        .from('encounters')
        .select('*')
        .eq('patient_id', patientId)
        .order('encounter_date', { ascending: false })

      if (encountersError) {
        console.error('Encounters error:', encountersError)
      } else {
        setEncounters(encountersData || [])
      }
    } catch (err) {
      console.error('Load data error:', err)
      setError('載入資料時發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
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
          <a 
            href="/portal" 
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            返回病患入口
          </a>
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
              <h1 className="text-3xl font-bold text-gray-900">CrossCare</h1>
              <p className="text-gray-600">病患資料查詢</p>
            </div>
            <a 
              href="/portal" 
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              返回病患入口
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Patient Info */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">個人資料</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">姓名</p>
                <p className="text-lg text-gray-900">{patient.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">初診日期</p>
                <p className="text-lg text-gray-900">
                  {new Date(patient.first_visit_date).toLocaleDateString('zh-TW')}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">電話</p>
                <p className="text-lg text-gray-900">{patient.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">地址</p>
                <p className="text-lg text-gray-900">{patient.address || '未填寫'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">主訴</p>
                <p className="text-lg text-gray-900">{patient.chief_complaint || '未填寫'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">備註</p>
                <p className="text-lg text-gray-900">{patient.notes || '無備註'}</p>
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">醫療資訊</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">病史</p>
                <p className="text-gray-900">{patient.medical_history || '無特殊病史'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">相關治療處置紀錄</p>
                <p className="text-gray-900">{patient.allergies || '無相關治療處置紀錄'}</p>
              </div>
            </div>
          </div>

          {/* Encounters */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">診療記錄</h2>
            {encounters.length > 0 ? (
              <div className="space-y-4">
                {encounters.map((encounter) => (
                  <div key={encounter.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        診療日期: {new Date(encounter.encounter_date).toLocaleDateString('zh-TW')}
                      </h3>
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
              <p className="text-gray-500 text-center py-8">尚無診療記錄</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
