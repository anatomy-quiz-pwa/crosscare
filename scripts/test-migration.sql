-- 測試遷移腳本：將患者生日改成初診日期
-- 此腳本用於在 staging 環境測試遷移

-- 開始事務
BEGIN;

-- 1. 檢查當前 patients 表結構
SELECT 'Current patients table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'patients' 
ORDER BY ordinal_position;

-- 2. 檢查是否有 date_of_birth 欄位
SELECT 'Checking for date_of_birth column:' as info;
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'patients' 
AND column_name = 'date_of_birth';

-- 3. 檢查是否有 first_visit_date 欄位
SELECT 'Checking for first_visit_date column:' as info;
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'patients' 
AND column_name = 'first_visit_date';

-- 4. 檢查 patients 表的記錄數量
SELECT 'Current patients count:' as info;
SELECT COUNT(*) as patient_count FROM patients;

-- 5. 檢查是否有任何約束或索引依賴 date_of_birth
SELECT 'Checking constraints and indexes on date_of_birth:' as info;
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'patients' 
AND kcu.column_name = 'date_of_birth';

-- 6. 檢查索引
SELECT 'Checking indexes on date_of_birth:' as info;
SELECT 
    indexname, 
    indexdef
FROM pg_indexes 
WHERE tablename = 'patients' 
AND indexdef LIKE '%date_of_birth%';

-- 回滾測試（不實際執行遷移）
ROLLBACK;

SELECT 'Migration test completed - no changes were made' as result;
