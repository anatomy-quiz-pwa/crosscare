#!/bin/bash

# CrossCare 環境變數更新腳本
# 使用方法：./update-env.sh YOUR_PROJECT_URL YOUR_ANON_KEY

if [ $# -ne 2 ]; then
    echo "使用方法: $0 <SUPABASE_URL> <SUPABASE_ANON_KEY>"
    echo "範例: $0 https://abcdefghijklmnop.supabase.co eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    exit 1
fi

SUPABASE_URL=$1
SUPABASE_ANON_KEY=$2

# 備份現有的 .env.local
cp .env.local .env.local.backup

# 更新 .env.local
cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# LINE Login Configuration (可選)
NEXT_PUBLIC_LINE_CLIENT_ID=your_line_client_id_here
LINE_CLIENT_SECRET=your_line_client_secret_here

# Base URL for LINE callback
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# 開發模式設定
NEXT_PUBLIC_DEV_MODE=true
EOF

echo "✅ 環境變數已更新！"
echo "📝 備份檔案已儲存為 .env.local.backup"
echo "🔄 請重新啟動開發伺服器：npm run dev"

