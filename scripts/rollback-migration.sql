-- 回滾遷移：將初診日期改回患者生日
-- 請在 staging 環境執行此腳本

-- 開始事務
BEGIN;

-- 1. 執行回滾遷移
\i supabase/migrations/20250923234513_rename_date_of_birth_to_first_visit_date_down.sql

-- 2. 驗證回滾結果
SELECT 'Rollback completed. Verifying changes:' as info;

-- 檢查舊欄位是否已恢復
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'patients' 
AND column_name = 'date_of_birth';

-- 檢查新欄位是否已不存在
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'patients' 
AND column_name = 'first_visit_date';

-- 檢查資料完整性
SELECT 'Data integrity check:' as info;
SELECT COUNT(*) as total_patients FROM patients;
SELECT COUNT(*) as patients_with_date_of_birth 
FROM patients 
WHERE date_of_birth IS NOT NULL;

-- 提交變更
COMMIT;

SELECT 'Rollback completed successfully!' as result;
