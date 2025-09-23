-- 執行遷移：將患者生日改成初診日期
-- 請在 staging 環境執行此腳本

-- 開始事務
BEGIN;

-- 1. 執行遷移
\i supabase/migrations/20250923234513_rename_date_of_birth_to_first_visit_date.sql

-- 2. 驗證遷移結果
SELECT 'Migration completed. Verifying changes:' as info;

-- 檢查新的欄位是否存在
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'patients' 
AND column_name = 'first_visit_date';

-- 檢查舊欄位是否已不存在
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'patients' 
AND column_name = 'date_of_birth';

-- 檢查資料完整性
SELECT 'Data integrity check:' as info;
SELECT COUNT(*) as total_patients FROM patients;
SELECT COUNT(*) as patients_with_first_visit_date 
FROM patients 
WHERE first_visit_date IS NOT NULL;

-- 提交變更
COMMIT;

SELECT 'Migration applied successfully!' as result;
