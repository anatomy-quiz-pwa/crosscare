'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface PatientForm {
  name: string
  chief_complaint: string
  first_visit_date: string
  phone: string
  address: string
  medical_history: string
  allergies: string
  notes: string
}

export default function NewPatient() {
  const [formData, setFormData] = useState<PatientForm>({
    name: '',
    chief_complaint: '',
    first_visit_date: '',
    phone: '',
    address: '',
    medical_history: '',
    allergies: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [fileUrls, setFileUrls] = useState<string[]>([])
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const fileArray = Array.from(files)
      setUploadedFiles(prev => [...prev, ...fileArray])
      
      // 為每個檔案創建預覽 URL
      fileArray.forEach(file => {
        const url = URL.createObjectURL(file)
        setFileUrls(prev => [...prev, url])
      })
      
      console.log('檔案上傳:', fileArray.map(f => f.name))
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    setFileUrls(prev => prev.filter((_, i) => i !== index))
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
      }
      
      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error('錄音失敗:', err)
      setError('無法啟動錄音，請檢查麥克風權限')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      // 停止所有音軌
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('表單提交開始')
    setLoading(true)
    setError('')

    try {
      // 檢查是否為測試模式
      const isTestMode = localStorage.getItem('test_mode') === 'true'
      console.log('測試模式:', isTestMode)
      
      if (isTestMode) {
        // 測試模式：儲存到 localStorage
        const newPatient = {
          id: Date.now().toString(), // 使用時間戳作為 ID
          name: formData.name,
          chief_complaint: formData.chief_complaint,
          first_visit_date: formData.first_visit_date,
          phone: formData.phone,
          address: formData.address,
          medical_history: formData.medical_history,
          allergies: formData.allergies,
          notes: formData.notes,
          files: uploadedFiles.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file) // 在測試模式下使用本地 URL
          })),
          audio: audioBlob ? {
            size: audioBlob.size,
            type: audioBlob.type,
            url: audioUrl
          } : null,
          created_at: new Date().toISOString()
        }
        
        // 儲存到 localStorage
        const storedPatients = localStorage.getItem('test_patients')
        const patients = storedPatients ? JSON.parse(storedPatients) : []
        patients.push(newPatient)
        localStorage.setItem('test_patients', JSON.stringify(patients))
        
        console.log('測試模式：新增病患', newPatient)
        setSuccess(true)
        setTimeout(() => {
          router.push('/patients')
        }, 2000)
        return
      }

      // 真實模式：儲存到 Supabase
      const supabase = createClient()
      
      console.log('開始上傳檔案到 Supabase Storage...')
      
      // 先上傳檔案到 Supabase Storage
      const fileUrls: string[] = []
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          const fileName = `${Date.now()}_${file.name}`
          console.log('上傳檔案:', fileName)
          
          const { data: fileData, error: fileError } = await supabase.storage
            .from('patient-files')
            .upload(fileName, file)
          
          if (fileError) {
            console.error('檔案上傳失敗:', fileError)
            setError(`檔案上傳失敗: ${fileError.message}`)
            return
          }
          
          console.log('檔案上傳成功:', fileData)
          
          // 獲取檔案公開 URL
          const { data: urlData } = supabase.storage
            .from('patient-files')
            .getPublicUrl(fileName)
          
          fileUrls.push(urlData.publicUrl)
          console.log('檔案 URL:', urlData.publicUrl)
        }
      }
      
      // 上傳音訊檔案
      let uploadedAudioUrl: string | null = null
      if (audioBlob) {
        const audioFileName = `${Date.now()}_audio.wav`
        console.log('上傳音訊檔案:', audioFileName)
        
        const { data: audioData, error: audioError } = await supabase.storage
          .from('patient-audio')
          .upload(audioFileName, audioBlob)
        
        if (audioError) {
          console.error('音訊上傳失敗:', audioError)
          setError(`音訊上傳失敗: ${audioError.message}`)
          return
        }
        
        console.log('音訊上傳成功:', audioData)
        
        const { data: audioUrlData } = supabase.storage
          .from('patient-audio')
          .getPublicUrl(audioFileName)
        
        uploadedAudioUrl = audioUrlData.publicUrl
        console.log('音訊 URL:', uploadedAudioUrl)
      }
      
      console.log('開始儲存病患資料到資料庫...')
      console.log('病患資料:', {
        name: formData.name,
        chief_complaint: formData.chief_complaint,
        first_visit_date: formData.first_visit_date,
        phone: formData.phone,
        address: formData.address,
        medical_history: formData.medical_history,
        allergies: formData.allergies,
        notes: formData.notes,
        files: fileUrls,
        audio_url: uploadedAudioUrl
      })
      
      // 儲存病患資料到資料庫
      const { data: insertData, error } = await supabase
        .from('patients')
        .insert({
          name: formData.name,
          chief_complaint: formData.chief_complaint,
          first_visit_date: formData.first_visit_date,
          phone: formData.phone,
          address: formData.address,
          medical_history: formData.medical_history,
          allergies: formData.allergies,
          notes: formData.notes,
          files: fileUrls,
          audio_url: uploadedAudioUrl
        })
        .select()

      if (error) {
        console.error('Supabase 插入錯誤:', error)
        setError(`儲存失敗: ${error.message}`)
        return
      }

      console.log('病患資料儲存成功:', insertData)

      setSuccess(true)
      setTimeout(() => {
        router.push('/patients')
      }, 2000)
    } catch (err) {
      console.error('新增病患錯誤:', err)
      setError('新增病患時發生錯誤')
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
              <h1 className="text-3xl font-bold text-gray-900">新增病患</h1>
              <p className="text-gray-600">建立新的病患檔案</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              返回儀表板
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 基本資料 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">基本資料</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      姓名 *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="請輸入病患姓名"
                    />
                  </div>
                  <div>
                    <label htmlFor="first_visit_date" className="block text-sm font-medium text-gray-700 mb-2">
                      初診日期 *
                    </label>
                    <input
                      type="date"
                      id="first_visit_date"
                      name="first_visit_date"
                      value={formData.first_visit_date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      電話 *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="請輸入電話號碼"
                    />
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      地址
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="請輸入地址"
                    />
                  </div>
                </div>
              </div>

              {/* 主述 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">主述</h2>
                <div>
                  <label htmlFor="chief_complaint" className="block text-sm font-medium text-gray-700 mb-2">
                    主述 *
                  </label>
                  <textarea
                    id="chief_complaint"
                    name="chief_complaint"
                    value={formData.chief_complaint}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="請描述病患的主要症狀或問題"
                  />
                </div>
              </div>

              {/* 醫療資訊 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">醫療資訊</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="medical_history" className="block text-sm font-medium text-gray-700 mb-2">
                      病史
                    </label>
                    <textarea
                      id="medical_history"
                      name="medical_history"
                      value={formData.medical_history}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="請輸入病患病史"
                    />
                  </div>
                  <div>
                    <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-2">
                      相關治療處置紀錄
                    </label>
                    <textarea
                      id="allergies"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="請輸入相關治療處置紀錄"
                    />
                  </div>
                </div>
              </div>

              {/* 檔案上傳 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">檔案上傳</h2>
                <div>
                  <label htmlFor="file_upload" className="block text-sm font-medium text-gray-700 mb-2">
                    上傳檔案
                  </label>
                  <input
                    type="file"
                    id="file_upload"
                    onChange={handleFileUpload}
                    multiple
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    支援格式：圖片、PDF、Word 文件
                  </p>
                  
                  {/* 顯示已上傳的檔案 */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-gray-700">已上傳的檔案：</p>
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{file.name}</span>
                            <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            移除
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 語音錄製 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">語音錄製</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        isRecording 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      } transition-colors`}
                    >
                      {isRecording ? '停止錄音' : '開始錄音'}
                    </button>
                    {isRecording && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600">錄音中...</span>
                      </div>
                    )}
                  </div>
                  
                  {audioUrl && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">錄音檔案：</p>
                      <audio controls className="w-full">
                        <source src={audioUrl} type="audio/wav" />
                        您的瀏覽器不支援音訊播放
                      </audio>
                    </div>
                  )}
                </div>
              </div>

              {/* 備註 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">備註</h2>
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
              </div>

              {/* 錯誤和成功訊息 */}
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 text-green-600 rounded-lg">
                  病患資料新增成功！正在前往患者列表...
                </div>
              )}

              {/* 提交按鈕 */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '儲存中...' : '儲存病患資料'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
