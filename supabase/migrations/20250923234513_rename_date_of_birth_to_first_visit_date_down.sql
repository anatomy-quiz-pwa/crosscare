-- 回滾：將初診日期欄位改回患者生日
-- 變更摘要: 將 patients 表的 first_visit_date 欄位改名回 date_of_birth
-- 預估影響行數: 所有 patients 表的記錄
-- 索引相容性: 無影響，因為沒有針對此欄位的索引
-- 觸發器相容性: 無影響

-- 開始事務
BEGIN;

-- 1. 將 first_visit_date 欄位改名回 date_of_birth
ALTER TABLE patients RENAME COLUMN first_visit_date TO date_of_birth;

-- 2. 更新欄位註解以反映原來的用途
COMMENT ON COLUMN patients.date_of_birth IS '患者生日';

-- 提交變更
COMMIT;

-- 驗證變更
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'patients' 
AND column_name = 'date_of_birth';
