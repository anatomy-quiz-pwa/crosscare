# CrossCare - 醫療照護管理系統

專業的醫療照護管理平台，提供病患資料管理、診療記錄、同意書處理等功能。

## 功能特色

- 🔐 安全的身份驗證系統
- 📱 LINE 登入整合
- 👥 病患資料管理
- 📋 診療記錄管理
- ✍️ 數位同意書簽署
- 📱 PWA 支援，可安裝為手機應用程式
- 🎨 現代化的使用者介面

## 登入方式

### 醫療人員
- **LINE 登入**: 使用 LINE 帳號快速登入
- **電子郵件登入**: 傳統的電子郵件和密碼登入
- **註冊流程**: LINE 登入後需填寫姓名和職業

### 病患
- **姓名 + 電話查詢**: 輸入姓名和電話號碼查詢個人資料
- **個人資料查看**: 查看個人資料、醫療資訊和診療記錄

## 技術架構

- **前端框架**: Next.js 15
- **語言**: TypeScript
- **樣式**: Tailwind CSS
- **資料庫**: Supabase (PostgreSQL)
- **身份驗證**: Supabase Auth + LINE Login
- **PWA**: next-pwa

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 環境變數設定

建立 `.env.local` 檔案並設定以下變數：

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# LINE Login Configuration
NEXT_PUBLIC_LINE_CLIENT_ID=your_line_client_id_here
LINE_CLIENT_SECRET=your_line_client_secret_here

# Base URL for LINE callback
NEXT_PUBLIC_BASE_URL=http://localhost:3001
```

### 3. 啟動開發伺服器

```bash
npm run dev
```

開啟 [http://localhost:3001](http://localhost:3001) 查看結果。

## 專案結構

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # 醫療人員儀表板
│   ├── login/             # 登入頁面
│   ├── register/          # 醫療人員註冊頁面
│   ├── portal/            # 病患入口
│   │   └── patients/      # 病患資料頁面
│   ├── api/               # API 路由
│   │   └── auth/          # 身份驗證 API
│   └── layout.tsx         # 根布局
├── lib/                   # 工具函數
│   └── supabase.ts        # Supabase 客戶端
└── components/            # React 元件
```

## 資料庫結構

### 主要表格
- `patients` - 病患資料
- `medical_staff` - 醫療人員資料
- `encounters` - 診療記錄
- `consents` - 同意書記錄

## 部署

### Vercel 部署

1. 將專案推送到 GitHub
2. 在 Vercel 中連接 GitHub 倉庫
3. 設定環境變數
4. 部署

### 其他平台

專案支援部署到任何支援 Next.js 的平台。

## 開發指南

### 新增頁面

在 `src/app/` 目錄下建立新的資料夾和 `page.tsx` 檔案。

### 新增元件

在 `src/components/` 目錄下建立新的 React 元件。

### 資料庫操作

使用 Supabase 客戶端進行資料庫操作：

```typescript
import { createClient } from '@/lib/supabase'

const supabase = createClient()
const { data, error } = await supabase
  .from('table_name')
  .select('*')
```

## LINE 登入設定

1. 在 [LINE Developers Console](https://developers.line.biz/) 建立應用程式
2. 設定 Callback URL: `https://your-domain.com/api/auth/line/callback`
3. 複製 Channel ID 和 Channel Secret
4. 設定環境變數

## 授權

本專案採用 MIT 授權條款。

## 支援

如有問題或建議，請提交 Issue 或 Pull Request。
