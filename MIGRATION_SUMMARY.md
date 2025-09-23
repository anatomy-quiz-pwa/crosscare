# 資料庫遷移總結：將患者生日改成初診日期

## 變更概述
將 `patients` 表的 `date_of_birth` 欄位改名為 `first_visit_date`，以更準確地反映該欄位的用途。

## 影響範圍
- **資料庫層面**：`patients` 表結構變更
- **應用程式層面**：所有引用 `date_of_birth` 的程式碼
- **使用者介面**：顯示標籤從「生日」改為「初診日期」

## 檔案變更清單

### 1. 資料庫遷移檔案
- `supabase/migrations/20250923234513_rename_date_of_birth_to_first_visit_date.sql` - 主要遷移
- `supabase/migrations/20250923234513_rename_date_of_birth_to_first_visit_date_down.sql` - 回滾遷移

### 2. 資料庫設定檔案
- `scripts/supabase-setup.sql` - 更新表結構定義
- `scripts/simple-database-setup.sql` - 更新表結構定義
- `scripts/update-database.sql` - 更新表結構定義
- `LINE_LOGIN_SETUP.md` - 更新範例表結構

### 3. 應用程式檔案
- `src/app/encounters/[id]/page.tsx` - 更新介面定義和顯示
- `src/app/portal/patients/[id]/page.tsx` - 更新介面定義和顯示
- `src/app/patients/[id]/page.tsx` - 更新介面定義、表單和顯示
- `src/app/patients/new/page.tsx` - 更新介面定義、表單和顯示
- `src/app/patients/page.tsx` - 更新介面定義和顯示
- `src/app/dashboard/page.tsx` - 更新介面定義和顯示
- `src/app/encounters/new/page.tsx` - 更新介面定義和查詢
- `src/app/encounters/page.tsx` - 更新介面定義

### 4. 測試和執行腳本
- `scripts/test-migration.sql` - 遷移測試腳本
- `scripts/apply-migration.sql` - 執行遷移腳本
- `scripts/rollback-migration.sql` - 回滾遷移腳本

## 變更詳情

### 資料庫變更
```sql
-- 主要變更
ALTER TABLE patients RENAME COLUMN date_of_birth TO first_visit_date;
COMMENT ON COLUMN patients.first_visit_date IS '患者初診日期';
```

### 應用程式變更
- 所有 TypeScript 介面中的 `date_of_birth: string` 改為 `first_visit_date: string`
- 所有表單欄位的 `name` 屬性從 `date_of_birth` 改為 `first_visit_date`
- 所有顯示標籤從「生日」改為「初診日期」
- 所有資料庫查詢中的欄位名稱更新

## 執行步驟

### 1. 測試遷移（在 staging 環境）
```bash
# 在 Supabase SQL Editor 中執行
\i scripts/test-migration.sql
```

### 2. 執行遷移（在 staging 環境）
```bash
# 在 Supabase SQL Editor 中執行
\i scripts/apply-migration.sql
```

### 3. 如需回滾
```bash
# 在 Supabase SQL Editor 中執行
\i scripts/rollback-migration.sql
```

## 風險評估
- **低風險**：僅為欄位改名，不涉及資料類型變更
- **無資料遺失**：所有現有資料將保持完整
- **無索引影響**：該欄位沒有相關索引
- **無約束影響**：該欄位沒有相關約束

## 驗證清單
- [ ] 遷移腳本語法正確
- [ ] 回滾腳本語法正確
- [ ] 所有應用程式檔案已更新
- [ ] 所有介面定義已更新
- [ ] 所有顯示標籤已更新
- [ ] 無 linting 錯誤

## 注意事項
1. 此遷移僅在 staging 環境執行，不直接影響 production
2. 執行前請確保已備份資料庫
3. 執行後請測試所有相關功能
4. 確認無誤後再考慮部署到 production
