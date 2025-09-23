-- CrossCare Supabase 資料庫設定腳本
-- 請在 Supabase SQL Editor 中執行此腳本

-- 1. 建立病患表格
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  chief_complaint TEXT NOT NULL,
  first_visit_date DATE NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  medical_history TEXT,
  allergies TEXT, -- 相關治療處置紀錄
  notes TEXT,
  files JSONB DEFAULT '[]'::jsonb,
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 建立醫療人員表格
CREATE TABLE IF NOT EXISTS medical_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  line_user_id TEXT UNIQUE,
  email TEXT UNIQUE,
  name TEXT NOT NULL,
  profession TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 建立診療記錄表格
CREATE TABLE IF NOT EXISTS encounters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  medical_staff_id UUID REFERENCES medical_staff(id) ON DELETE SET NULL,
  encounter_date DATE NOT NULL,
  diagnosis TEXT NOT NULL,
  treatment TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 建立同意書表格
CREATE TABLE IF NOT EXISTS consents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  medical_staff_id UUID REFERENCES medical_staff(id) ON DELETE SET NULL,
  consent_type TEXT NOT NULL,
  consent_content TEXT NOT NULL,
  patient_signature TEXT,
  medical_staff_signature TEXT,
  signed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 建立檔案儲存表格
CREATE TABLE IF NOT EXISTS patient_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID REFERENCES medical_staff(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 建立語音記錄表格
CREATE TABLE IF NOT EXISTS patient_audio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  duration INTEGER,
  recorded_by UUID REFERENCES medical_staff(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at);
CREATE INDEX IF NOT EXISTS idx_encounters_patient_id ON encounters(patient_id);
CREATE INDEX IF NOT EXISTS idx_encounters_date ON encounters(encounter_date);
CREATE INDEX IF NOT EXISTS idx_consents_patient_id ON consents(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_files_patient_id ON patient_files(patient_id);

-- 8. 啟用 Row Level Security (RLS)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_audio ENABLE ROW LEVEL SECURITY;

-- 9. 建立安全政策 (暫時允許所有操作，後續可根據需求調整)
-- 先刪除現有政策（如果存在），然後重新建立
DROP POLICY IF EXISTS "Allow all operations on patients" ON patients;
DROP POLICY IF EXISTS "Allow all operations on medical_staff" ON medical_staff;
DROP POLICY IF EXISTS "Allow all operations on encounters" ON encounters;
DROP POLICY IF EXISTS "Allow all operations on consents" ON consents;
DROP POLICY IF EXISTS "Allow all operations on patient_files" ON patient_files;
DROP POLICY IF EXISTS "Allow all operations on patient_audio" ON patient_audio;

-- 重新建立政策
CREATE POLICY "Allow all operations on patients" ON patients FOR ALL USING (true);
CREATE POLICY "Allow all operations on medical_staff" ON medical_staff FOR ALL USING (true);
CREATE POLICY "Allow all operations on encounters" ON encounters FOR ALL USING (true);
CREATE POLICY "Allow all operations on consents" ON consents FOR ALL USING (true);
CREATE POLICY "Allow all operations on patient_files" ON patient_files FOR ALL USING (true);
CREATE POLICY "Allow all operations on patient_audio" ON patient_audio FOR ALL USING (true);

-- 10. 建立更新時間的觸發器函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. 為需要的表格建立更新觸發器
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_staff_updated_at BEFORE UPDATE ON medical_staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_encounters_updated_at BEFORE UPDATE ON encounters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. 建立 Storage Buckets (如果需要的話)
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('patient-files', 'patient-files', true),
  ('patient-audio', 'patient-audio', true)
ON CONFLICT (id) DO NOTHING;

-- 13. 設定 Storage 政策
-- 先刪除現有政策（如果存在）
DROP POLICY IF EXISTS "Allow public access to patient files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload patient files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to patient audio" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload patient audio" ON storage.objects;

-- 重新建立 Storage 政策
CREATE POLICY "Allow public access to patient files" ON storage.objects FOR SELECT USING (bucket_id = 'patient-files');
CREATE POLICY "Allow authenticated users to upload patient files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'patient-files');
CREATE POLICY "Allow public access to patient audio" ON storage.objects FOR SELECT USING (bucket_id = 'patient-audio');
CREATE POLICY "Allow authenticated users to upload patient audio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'patient-audio');

-- 完成設定
SELECT 'CrossCare 資料庫設定完成！' as message;
