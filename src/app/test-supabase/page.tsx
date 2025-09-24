'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

interface TestResult {
  name: string
  status: 'success' | 'error' | 'pending'
  message: string
}

export default function TestSupabase() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: '環境變數檢查', status: 'pending', message: '檢查中...' },
    { name: 'Supabase 連接', status: 'pending', message: '檢查中...' },
    { name: '資料庫表格', status: 'pending', message: '檢查中...' },
    { name: 'Storage 存取', status: 'pending', message: '檢查中...' }
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    runTests()
  }, [])

  const updateTest = (index: number, status: 'success' | 'error', message: string) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message } : test
    ))
  }

  const runTests = async () => {
    setLoading(true)
    
    try {
      // 測試 1: 環境變數檢查
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey || 
          supabaseUrl.includes('your-project-id') || 
          supabaseKey.includes('your_supabase_anon_key')) {
        updateTest(0, 'error', '請在 .env.local 中設定正確的 Supabase URL 和 Key')
      } else {
        updateTest(0, 'success', '環境變數設定正確')
      }

      // 測試 2: Supabase 連接
      try {
        const supabase = createClient()
        const { data, error } = await supabase.from('patients').select('count').limit(1)
        
        if (error) {
          updateTest(1, 'error', `連接失敗: ${error.message}`)
        } else {
          updateTest(1, 'success', 'Supabase 連接成功')
        }
      } catch (err) {
        updateTest(1, 'error', `連接錯誤: ${err}`)
      }

      // 測試 3: 資料庫表格
      try {
        const supabase = createClient()
        const tables = ['patients', 'medical_staff', 'encounters', 'consents']
        let allTablesExist = true
        const missingTables: string[] = []

        for (const table of tables) {
          const { error } = await supabase.from(table).select('*').limit(1)
          if (error && error.code === 'PGRST116') {
            allTablesExist = false
            missingTables.push(table)
          }
        }

        if (allTablesExist) {
          updateTest(2, 'success', '所有必要的資料庫表格都存在')
        } else {
          updateTest(2, 'error', `缺少表格: ${missingTables.join(', ')}。請執行 supabase-setup.sql 腳本`)
        }
      } catch (err) {
        updateTest(2, 'error', `表格檢查錯誤: ${err}`)
      }

      // 測試 4: Storage 存取
      try {
        const supabase = createClient()
        const { data, error } = await supabase.storage.listBuckets()
        
        if (error) {
          updateTest(3, 'error', `Storage 存取失敗: ${error.message}`)
        } else {
          const buckets = data?.map(b => b.name) || []
          const requiredBuckets = ['patient-files', 'patient-audio']
          const missingBuckets = requiredBuckets.filter(b => !buckets.includes(b))
          
          if (missingBuckets.length === 0) {
            updateTest(3, 'success', 'Storage buckets 設定正確')
          } else {
            updateTest(3, 'error', `缺少 Storage buckets: ${missingBuckets.join(', ')}`)
          }
        }
      } catch (err) {
        updateTest(3, 'error', `Storage 檢查錯誤: ${err}`)
      }

    } catch (err) {
      console.error('測試過程中發生錯誤:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      default:
        return '⏳'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50'
      case 'error':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-yellow-600 bg-yellow-50'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              CrossCare Supabase 設定檢查
            </h1>
            <p className="text-gray-600">
              檢查您的 Supabase 設定是否正確
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {tests.map((test, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getStatusIcon(test.status)}</span>
                    <h3 className="font-semibold">{test.name}</h3>
                  </div>
                  <span className="text-sm font-medium">
                    {test.status === 'pending' ? '檢查中...' : 
                     test.status === 'success' ? '成功' : '失敗'}
                  </span>
                </div>
                <p className="mt-2 text-sm">{test.message}</p>
              </div>
            ))}
          </div>

          <div className="text-center space-y-4">
            <button
              onClick={runTests}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '檢查中...' : '重新檢查'}
            </button>
            
            <div className="text-sm text-gray-600">
              <p>如果所有檢查都通過，您就可以開始使用 CrossCare 系統了！</p>
              <p>如果有錯誤，請參考 <code className="bg-gray-100 px-2 py-1 rounded">SUPABASE_SETUP_GUIDE.md</code> 進行設定。</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">快速設定步驟：</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. 在 Supabase Dashboard 中取得 Project URL 和 API Key</li>
              <li>2. 更新 <code>.env.local</code> 檔案中的環境變數</li>
              <li>3. 在 Supabase SQL Editor 中執行 <code>scripts/supabase-setup.sql</code></li>
              <li>4. 重新啟動開發伺服器：<code>npm run dev</code></li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}