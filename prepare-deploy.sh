#!/bin/bash

echo "🚀 準備 Vercel 部署..."

# 檢查是否在正確的目錄
if [ ! -f "package.json" ]; then
    echo "❌ 錯誤：請在專案根目錄執行此腳本"
    exit 1
fi

# 檢查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  警告：您有未提交的更改"
    echo "請先提交您的更改："
    echo "  git add ."
    echo "  git commit -m '準備 Vercel 部署'"
    echo "  git push origin main"
    echo ""
fi

# 檢查必要的檔案
echo "📋 檢查部署檔案..."
required_files=("package.json" "next.config.ts" "vercel.json")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ 缺少檔案：$file"
        exit 1
    fi
done

# 檢查環境變數檔案
echo ""
echo "🔧 環境變數檢查："
if [ -f ".env.local" ]; then
    echo "✅ .env.local 存在"
    echo "請確保在 Vercel 中設定以下環境變數："
    echo "  - NEXT_PUBLIC_SUPABASE_URL"
    echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "  - NEXT_PUBLIC_LINE_CLIENT_ID"
    echo "  - LINE_CLIENT_SECRET"
    echo "  - NEXT_PUBLIC_BASE_URL (Vercel 會自動設定)"
else
    echo "⚠️  未找到 .env.local"
    echo "請確保在 Vercel 中設定所有必要的環境變數"
fi

echo ""
echo "📝 部署清單："
echo "1. 確保代碼已推送到 GitHub"
echo "2. 在 Vercel 中導入專案"
echo "3. 設定環境變數"
echo "4. 更新 LINE Login 回調 URL"
echo "5. 部署並測試"

echo ""
echo "📖 詳細步驟請參考：VERCEL_DEPLOYMENT_GUIDE.md"
echo ""
echo "🎉 準備完成！您可以開始 Vercel 部署了。"
