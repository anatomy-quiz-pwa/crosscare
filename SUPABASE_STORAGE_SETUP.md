# Supabase Storage 設定

## 儲存桶設定

在 Supabase 專案中需要建立以下儲存桶：

### 1. patient-files 儲存桶
- **用途**：儲存病患的檔案（圖片、PDF、Word 文件等）
- **權限**：公開讀取，認證用戶上傳
- **檔案命名**：`{timestamp}_{filename}`

### 2. patient-audio 儲存桶
- **用途**：儲存病患的語音錄製檔案
- **權限**：公開讀取，認證用戶上傳
- **檔案命名**：`{timestamp}_audio.wav`

## 設定步驟

### 1. 建立儲存桶

在 Supabase Dashboard 中：

1. 進入 **Storage** 頁面
2. 點擊 **New bucket**
3. 建立 `patient-files` 儲存桶
4. 建立 `patient-audio` 儲存桶

### 2. 設定儲存桶權限

#### patient-files 儲存桶政策：

```sql
-- 允許認證用戶上傳檔案
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'patient-files' AND 
  auth.role() = 'authenticated'
);

-- 允許公開讀取檔案
CREATE POLICY "Allow public reads" ON storage.objects
FOR SELECT USING (bucket_id = 'patient-files');

-- 允許檔案擁有者刪除檔案
CREATE POLICY "Allow owner deletes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'patient-files' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### patient-audio 儲存桶政策：

```sql
-- 允許認證用戶上傳音訊檔案
CREATE POLICY "Allow authenticated audio uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'patient-audio' AND 
  auth.role() = 'authenticated'
);

-- 允許公開讀取音訊檔案
CREATE POLICY "Allow public audio reads" ON storage.objects
FOR SELECT USING (bucket_id = 'patient-audio');

-- 允許檔案擁有者刪除音訊檔案
CREATE POLICY "Allow owner audio deletes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'patient-audio' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## 檔案儲存位置

### 測試模式
- **檔案**：儲存在瀏覽器的 `localStorage` 中
- **音訊**：儲存在瀏覽器的 `localStorage` 中
- **URL**：使用 `URL.createObjectURL()` 創建的本地 URL

### 真實模式
- **檔案**：上傳到 Supabase Storage 的 `patient-files` 儲存桶
- **音訊**：上傳到 Supabase Storage 的 `patient-audio` 儲存桶
- **URL**：Supabase 提供的公開 URL

## 資料庫欄位

### patients 表格新增欄位：

```sql
files JSONB,        -- 儲存檔案資訊陣列
audio_url TEXT      -- 儲存音訊檔案 URL
```

### 檔案資訊結構：

```json
{
  "name": "檔案名稱.pdf",
  "size": 1024000,
  "type": "application/pdf",
  "url": "https://supabase.co/storage/v1/object/public/patient-files/1234567890_檔案名稱.pdf"
}
```

## 注意事項

1. **檔案大小限制**：Supabase Storage 預設限制為 50MB
2. **檔案類型**：支援圖片、PDF、Word 文件等
3. **安全性**：檔案 URL 是公開的，請注意敏感資訊
4. **備份**：建議定期備份重要檔案
5. **清理**：定期清理不需要的檔案以節省空間
