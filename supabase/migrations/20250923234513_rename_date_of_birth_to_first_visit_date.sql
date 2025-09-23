-- 將患者生日欄位改名為初診日期
-- 變更摘要: 將 patients 表的 date_of_birth 欄位改名為 first_visit_date
-- 預估影響行數: 所有 patients 表的記錄
-- 索引相容性: 無影響，因為沒有針對此欄位的索引
-- 觸發器相容性: 無影響

-- 開始事務
BEGIN;

-- 1. 將 date_of_birth 欄位改名為 first_visit_date
ALTER TABLE patients RENAME COLUMN date_of_birth TO first_visit_date;

-- 2. 更新欄位註解以反映新的用途
COMMENT ON COLUMN patients.first_visit_date IS '患者初診日期';

-- 提交變更
COMMIT;

-- 驗證變更
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'patients' 
AND column_name = 'first_visit_date';
