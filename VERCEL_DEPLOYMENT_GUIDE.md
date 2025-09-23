# Vercel 部署指南

## 前置準備

### 1. 確保代碼已推送到 GitHub
```bash
git add .
git commit -m "準備 Vercel 部署"
git push origin main
```

### 2. 準備環境變數
您需要以下環境變數：
- `NEXT_PUBLIC_SUPABASE_URL`: 您的 Supabase 專案 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 您的 Supabase 匿名金鑰
- `NEXT_PUBLIC_LINE_CLIENT_ID`: LINE Login 用戶端 ID
- `LINE_CLIENT_SECRET`: LINE Login 用戶端密鑰

## 部署步驟

### 步驟 1：註冊 Vercel 帳號
1. 前往 [vercel.com](https://vercel.com)
2. 點擊 "Sign Up"
3. 選擇 "Continue with GitHub" 使用 GitHub 帳號登入

### 步驟 2：導入專案
1. 在 Vercel Dashboard 點擊 "New Project"
2. 選擇您的 GitHub 倉庫 `crosscare`
3. 點擊 "Import"

### 步驟 3：配置專案設定
Vercel 會自動偵測到這是 Next.js 專案，保持預設設定即可：
- **Framework Preset**: Next.js
- **Root Directory**: `./` (根目錄)
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (自動偵測)
- **Install Command**: `npm install`

### 步驟 4：設定環境變數
在專案設定頁面，點擊 "Environment Variables" 並添加：

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_LINE_CLIENT_ID = your_line_client_id
LINE_CLIENT_SECRET = your_line_client_secret
NEXT_PUBLIC_BASE_URL = https://your-project.vercel.app
NEXT_PUBLIC_DEV_MODE = false
```

**重要**：
- 將 `NEXT_PUBLIC_BASE_URL` 設為您的 Vercel 域名
- 確保所有環境變數都添加到 Production、Preview、Development 環境

### 步驟 5：部署
1. 點擊 "Deploy" 按鈕
2. 等待建置完成（約 2-5 分鐘）
3. 部署成功後，您會獲得一個 Vercel 域名（例如：`https://crosscare-abc123.vercel.app`）

## 部署後設定

### 1. 更新 LINE Login 回調 URL
在 LINE Developers Console：
1. 前往您的 LINE Login 頻道
2. 在 "Callback URL" 中添加：`https://your-project.vercel.app/api/auth/line/callback`
3. 儲存設定

### 2. 更新 Supabase 設定
如果需要，在 Supabase Dashboard 中更新：
- Site URL: `https://your-project.vercel.app`
- Redirect URLs: `https://your-project.vercel.app/**`

### 3. 測試功能
訪問您的 Vercel 域名，測試：
- [ ] 首頁載入
- [ ] 用戶註冊/登入
- [ ] LINE Login 功能
- [ ] 資料庫連接
- [ ] 所有主要功能

## 自動部署

設定完成後，每次推送代碼到 GitHub 的 `main` 分支都會自動觸發部署：
```bash
git add .
git commit -m "更新功能"
git push origin main
```

## 監控和日誌

在 Vercel Dashboard 中您可以：
- 查看部署歷史
- 監控網站效能
- 查看函數日誌
- 設定自訂域名

## 常見問題

### 建置失敗
- 檢查環境變數是否正確設定
- 確認 `package.json` 中的建置腳本
- 查看 Vercel 建置日誌

### LINE bot 功能問題
- 確認 LINE Login 回調 URL 已更新
- 檢查 LINE_CLIENT_SECRET 環境變數
- 測試 API 路由是否正常運作

### 資料庫連接問題
- 確認 Supabase URL 和 ANON_KEY 正確
- 檢查 Supabase 專案的 RLS 政策
- 確認網路連接正常

## 免費額度限制

Vercel 免費版限制：
- 每月 100GB 頻寬
- 無限制靜態請求
- 100GB 函數執行時間
- 無限制部署次數

對於大多數中小型應用來說，這些額度已經足夠使用。
