-- 建立病患表格
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
  files JSONB,
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 更新現有表格（如果存在）
DO $$ 
BEGIN
  -- 新增 chief_complaint 欄位（如果不存在）
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'chief_complaint') THEN
    ALTER TABLE patients ADD COLUMN chief_complaint TEXT;
  END IF;
  
  -- 新增 notes 欄位（如果不存在）
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'notes') THEN
    ALTER TABLE patients ADD COLUMN notes TEXT;
  END IF;
  
  -- 新增 address 欄位（如果不存在）
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'address') THEN
    ALTER TABLE patients ADD COLUMN address TEXT;
  END IF;
  
  -- 新增 medical_history 欄位（如果不存在）
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'medical_history') THEN
    ALTER TABLE patients ADD COLUMN medical_history TEXT;
  END IF;
  
  -- 新增 allergies 欄位（如果不存在）
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'allergies') THEN
    ALTER TABLE patients ADD COLUMN allergies TEXT;
  END IF;
  
  -- 新增 files 欄位（如果不存在）
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'files') THEN
    ALTER TABLE patients ADD COLUMN files JSONB;
  END IF;
  
  -- 新增 audio_url 欄位（如果不存在）
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'audio_url') THEN
    ALTER TABLE patients ADD COLUMN audio_url TEXT;
  END IF;
  
  -- 移除緊急聯絡人欄位（如果存在）
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'emergency_contact') THEN
    ALTER TABLE patients DROP COLUMN emergency_contact;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'emergency_phone') THEN
    ALTER TABLE patients DROP COLUMN emergency_phone;
  END IF;
END $$;

-- 建立醫療人員表格
CREATE TABLE IF NOT EXISTS medical_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  line_user_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  profession TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立診療記錄表格
CREATE TABLE IF NOT EXISTS encounters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  encounter_date DATE NOT NULL,
  diagnosis TEXT NOT NULL,
  treatment TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 啟用 RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE encounters ENABLE ROW LEVEL SECURITY;

-- 建立安全政策
CREATE POLICY "Allow all operations on patients" ON patients FOR ALL USING (true);
CREATE POLICY "Allow all operations on medical_staff" ON medical_staff FOR ALL USING (true);
CREATE POLICY "Allow all operations on encounters" ON encounters FOR ALL USING (true);
