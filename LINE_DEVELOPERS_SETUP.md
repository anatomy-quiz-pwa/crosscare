# LINE Developers Console 設定指南

## 步驟 1：登入 LINE Developers Console

1. 前往：https://developers.line.biz/
2. 點擊 "Log in with LINE"
3. 使用您的 LINE 帳號登入

## 步驟 2：建立 Provider

1. 登入後，如果沒有 Provider，點擊 "Create a new provider"
2. 輸入 Provider 名稱：`CrossCare`
3. 點擊 "Create"

## 步驟 3：建立 LINE Login Channel

1. 在 Provider 頁面，點擊 "Create a new channel"
2. 選擇 **"LINE Login"**
3. 填寫以下資訊：
   - **Channel name**: `CrossCare Medical System`
   - **Channel description**: `醫療照護管理系統`
   - **App types**: 選擇 `Web app`
   - **Email address**: 您的電子郵件
   - **Privacy policy URL**: 暫時留空
   - **Terms of use URL**: 暫時留空
4. 勾選同意條款
5. 點擊 "Create"

## 步驟 4：取得認證資訊

建立完成後，在 Channel 的 "Basic settings" 頁面：

### 複製 Channel ID
- 這就是您的 `NEXT_PUBLIC_LINE_CLIENT_ID`
- 格式類似：`1234567890`

### 複製 Channel Secret
- 這就是您的 `LINE_CLIENT_SECRET`
- 格式類似：`abcdef1234567890abcdef1234567890`

## 步驟 5：設定 Callback URL

1. 在 Channel 設定中，點擊 "LINE Login" 頁面
2. 在 "Callback URL" 中添加：
   - 開發環境：`http://localhost:3000/api/auth/line/callback`
   - 生產環境：`https://your-vercel-domain.vercel.app/api/auth/line/callback`

## 步驟 6：設定 Scopes

在 "LINE Login" 頁面的 "OpenID Connect" 區塊：
- 勾選 `profile`
- 勾選 `openid`

## 完成後的環境變數

將取得的資訊填入 Vercel 環境變數：

```
NEXT_PUBLIC_LINE_CLIENT_ID = 您的 Channel ID
LINE_CLIENT_SECRET = 您的 Channel Secret
```

## 注意事項

1. **Channel Secret 要保密**：不要分享給任何人
2. **Callback URL 要正確**：確保與您的網站網址一致
3. **測試環境**：可以先在 localhost 測試，再設定生產環境

## 常見問題

### Q: 找不到 "LINE Login" 選項？
A: 確保您選擇的是 "LINE Login" 類型的 Channel，不是 "Messaging API"

### Q: Channel Secret 在哪裡？
A: 在 "Basic settings" 頁面，需要點擊 "Issue" 按鈕才會顯示

### Q: Callback URL 設定錯誤？
A: 確保 URL 格式正確，且包含完整的路徑 `/api/auth/line/callback`
