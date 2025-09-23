import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            CrossCare
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            專業的醫療照護管理平台
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              醫療人員入口
            </h2>
            <p className="text-gray-600 mb-6">
              管理病患資料、記錄診療過程、處理醫療文件
            </p>
            <Link 
              href="/login" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              登入系統
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              病患入口
            </h2>
            <p className="text-gray-600 mb-6">
              查看個人醫療記錄、預約診療、管理同意書
            </p>
            <Link 
              href="/portal" 
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              進入病患入口
            </Link>
          </div>
        </div>
        
        <div className="text-gray-500">
          <p>© 2024 CrossCare. 保護您的醫療隱私，提供專業的照護服務。</p>
          <div className="mt-4">
            <Link 
              href="/test-supabase" 
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              🔧 檢查 Supabase 設定
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
