# CrossCare Supabase 設定指南

## 🎯 快速設定步驟

### 步驟 1: 取得 Supabase 專案資訊

1. 前往您的 Supabase 專案：https://supabase.com/dashboard
2. 選擇您的 `crosscare` 專案
3. 在左側選單中點擊 **Settings** → **API**
4. 複製以下資訊：
   - **Project URL** (例如：`https://abcdefghijklmnop.supabase.co`)
   - **anon public** 金鑰 (很長的字串)

### 步驟 2: 更新環境變數

編輯 `.env.local` 檔案，將以下值替換為您的實際資訊：

```env
# 替換為您的 Supabase 專案 URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# 替換為您的 Supabase anon key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 步驟 3: 執行資料庫設定腳本

1. 在 Supabase 專案中，點擊左側選單的 **SQL Editor**
2. 點擊 **New query**
3. 複製 `scripts/supabase-setup.sql` 檔案的內容
4. 貼上到 SQL Editor 中
5. 點擊 **Run** 執行腳本

### 步驟 4: 驗證設定

執行以下命令重新啟動開發伺服器：

```bash
npm run dev
```

然後訪問 http://localhost:3000 測試功能。

## 📋 資料庫結構說明

### 主要表格

1. **patients** - 病患資料
   - 基本資料：姓名、生日、電話、地址
   - 醫療資訊：主述、病史、相關治療處置紀錄
   - 檔案：支援 JSON 格式的檔案列表
   - 語音：音訊檔案 URL

2. **medical_staff** - 醫療人員
   - LINE 用戶 ID 和電子郵件
   - 姓名和職業
   - 建立和更新時間

3. **encounters** - 診療記錄
   - 關聯病患和醫療人員
   - 診療日期、診斷、治療
   - 備註資訊

4. **consents** - 同意書
   - 同意書類型和內容
   - 數位簽名
   - 簽署時間

5. **patient_files** - 病患檔案
   - 檔案名稱、URL、類型、大小
   - 上傳者資訊

6. **patient_audio** - 語音記錄
   - 音訊檔案 URL
   - 錄音時長
   - 錄製者資訊

## 🔒 安全性設定

- **Row Level Security (RLS)** 已啟用
- 暫時設定為允許所有操作（開發階段）
- 生產環境需要調整安全政策

## 🗄️ Storage 設定

- **patient-files** bucket：儲存病患相關檔案
- **patient-audio** bucket：儲存語音記錄
- 支援公開存取（可根據需求調整）

## 🧪 測試模式

如果暫時不想設定 Supabase，系統仍可在測試模式下運作：
- 使用 localStorage 儲存資料
- 所有功能都可以正常測試
- 點擊 "🧪 測試登入（開發模式）" 按鈕

## ❓ 常見問題

### Q: 執行 SQL 腳本時出現錯誤？
A: 確保您有足夠的權限，或者分段執行腳本

### Q: 環境變數設定後仍然無法連接？
A: 重新啟動開發伺服器：`npm run dev`

### Q: 檔案上傳功能不工作？
A: 檢查 Storage buckets 是否正確建立，以及政策是否設定正確

### Q: 如何備份資料？
A: 在 Supabase Dashboard 中可以使用 Database → Backups 功能

## 🚀 下一步

設定完成後，您可以：
1. 測試所有功能
2. 設定 LINE Login（可選）
3. 自訂安全政策
4. 準備生產環境部署

