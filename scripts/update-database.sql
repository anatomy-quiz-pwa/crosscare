-- CrossCare 資料庫表格更新腳本
-- 在 Supabase SQL Editor 中執行此腳本

-- 1. 如果表格不存在，建立新的病患表格
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  chief_complaint TEXT NOT NULL,
  first_visit_date DATE NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  medical_history TEXT,
  allergies TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 如果表格已存在但缺少欄位，新增缺少的欄位
DO $$ 
BEGIN
  -- 檢查並新增 chief_complaint 欄位
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'chief_complaint') THEN
    ALTER TABLE patients ADD COLUMN chief_complaint TEXT;
  END IF;
  
  -- 檢查並新增 notes 欄位
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'notes') THEN
    ALTER TABLE patients ADD COLUMN notes TEXT;
  END IF;
  
  -- 移除緊急聯絡人欄位（如果存在）
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'emergency_contact') THEN
    ALTER TABLE patients DROP COLUMN emergency_contact;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'emergency_phone') THEN
    ALTER TABLE patients DROP COLUMN emergency_phone;
  END IF;
END $$;

-- 3. 建立醫療人員表格（如果不存在）
CREATE TABLE IF NOT EXISTS medical_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  line_user_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  profession TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 建立診療記錄表格（如果不存在）
CREATE TABLE IF NOT EXISTS encounters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  encounter_date DATE NOT NULL,
  diagnosis TEXT NOT NULL,
  treatment TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 建立檔案儲存表格（如果不存在）
CREATE TABLE IF NOT EXISTS patient_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 建立語音記錄表格（如果不存在）
CREATE TABLE IF NOT EXISTS patient_audio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 設定 RLS (Row Level Security) 政策
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_audio ENABLE ROW LEVEL SECURITY;

-- 8. 建立基本的安全政策（允許所有操作，實際使用時應根據需求調整）
CREATE POLICY "Allow all operations on patients" ON patients FOR ALL USING (true);
CREATE POLICY "Allow all operations on medical_staff" ON medical_staff FOR ALL USING (true);
CREATE POLICY "Allow all operations on encounters" ON encounters FOR ALL USING (true);
CREATE POLICY "Allow all operations on patient_files" ON patient_files FOR ALL USING (true);
CREATE POLICY "Allow all operations on patient_audio" ON patient_audio FOR ALL USING (true);
