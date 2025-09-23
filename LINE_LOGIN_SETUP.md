# CrossCare LINE 登入設定指南

## 為什麼 LINE 登入無法使用？

目前 LINE 登入功能無法使用是因為缺少必要的環境變數設定。以下是完整的設定步驟：

## 步驟 1: 建立 LINE 應用程式

### 1. 前往 LINE Developers Console
- 網址: https://developers.line.biz/
- 使用 LINE 帳號登入

### 2. 建立新的 Provider
- 點擊 "Create a new provider"
- 輸入 Provider 名稱（例如：CrossCare）

### 3. 建立 Channel
- 在 Provider 下建立 "Messaging API" Channel
- 輸入 Channel 名稱（例如：CrossCare Medical）
- 選擇 Channel 類型：Messaging API

### 4. 取得 Channel 資訊
- 複製 **Channel ID** (這就是 `NEXT_PUBLIC_LINE_CLIENT_ID`)
- 複製 **Channel Secret** (這就是 `LINE_CLIENT_SECRET`)

### 5. 設定 Callback URL
- 在 Channel 設定中找到 "Callback URL"
- 設定為：`http://localhost:3001/api/auth/line/callback` (開發環境)
- 或：`https://your-domain.com/api/auth/line/callback` (生產環境)

## 步驟 2: 建立 Supabase 專案

### 1. 前往 Supabase
- 網址: https://supabase.com/
- 建立新專案

### 2. 取得 API 金鑰
- 在專案設定中找到 "API"
- 複製 **Project URL** (這就是 `NEXT_PUBLIC_SUPABASE_URL`)
- 複製 **anon public** 金鑰 (這就是 `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## 步驟 3: 設定環境變數

### 1. 編輯 .env.local 檔案
```bash
# 在專案根目錄編輯 .env.local
nano .env.local
```

### 2. 填入以下內容
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# LINE Login Configuration
NEXT_PUBLIC_LINE_CLIENT_ID=your_line_channel_id_here
LINE_CLIENT_SECRET=your_line_client_secret_here

# Base URL for LINE callback
NEXT_PUBLIC_BASE_URL=http://localhost:3001
```

### 3. 重新啟動開發伺服器
```bash
npm run dev
```

## 步驟 4: 建立資料庫表格

在 Supabase SQL Editor 中執行以下 SQL：

```sql
-- 建立醫療人員表格
CREATE TABLE medical_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  line_user_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  profession TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立病患表格（更新版本）
CREATE TABLE patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  chief_complaint TEXT NOT NULL,
  first_visit_date DATE NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  medical_history TEXT,
  allergies TEXT, -- 相關治療處置紀錄
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立診療記錄表格
CREATE TABLE encounters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  encounter_date DATE NOT NULL,
  diagnosis TEXT NOT NULL,
  treatment TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立檔案儲存表格
CREATE TABLE patient_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立語音記錄表格
CREATE TABLE patient_audio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 測試功能

### 方法 1: 使用測試登入（推薦）
1. 點擊 "🧪 測試登入（開發模式）" 按鈕
2. 填寫姓名和職業
3. 進入儀表板

### 方法 2: 使用真實 LINE 登入
1. 完成上述設定步驟
2. 點擊 "使用 LINE 登入" 按鈕
3. 授權 LINE 帳號
4. 填寫姓名和職業

## 常見問題

### Q: 點擊 LINE 登入按鈕沒有反應？
A: 檢查環境變數是否正確設定，特別是 `NEXT_PUBLIC_LINE_CLIENT_ID`

### Q: LINE 授權後出現錯誤？
A: 檢查 Callback URL 是否正確設定，必須完全匹配

### Q: Supabase 連接失敗？
A: 檢查 Supabase URL 和 API 金鑰是否正確

### Q: 資料庫表格不存在？
A: 在 Supabase SQL Editor 中執行上述 SQL 建立表格

### Q: 儲存病患資料失敗？
A: 檢查表格結構是否包含所有必要欄位，特別是 `chief_complaint` 和 `notes`

## 開發模式

如果暫時不想設定 LINE 登入，可以使用測試登入功能：
- 點擊黃色的 "🧪 測試登入（開發模式）" 按鈕
- 這會模擬 LINE 登入成功，直接進入註冊頁面
- 可以測試所有功能而不需要真實的 LINE 設定
