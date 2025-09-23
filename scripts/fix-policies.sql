-- CrossCare 政策修復腳本
-- 如果遇到政策已存在的錯誤，請執行此腳本

-- 刪除所有現有的政策
DROP POLICY IF EXISTS "Allow all operations on patients" ON patients;
DROP POLICY IF EXISTS "Allow all operations on medical_staff" ON medical_staff;
DROP POLICY IF EXISTS "Allow all operations on encounters" ON encounters;
DROP POLICY IF EXISTS "Allow all operations on consents" ON consents;
DROP POLICY IF EXISTS "Allow all operations on patient_files" ON patient_files;
DROP POLICY IF EXISTS "Allow all operations on patient_audio" ON patient_audio;

-- 刪除 Storage 政策
DROP POLICY IF EXISTS "Allow public access to patient files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload patient files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to patient audio" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload patient audio" ON storage.objects;

-- 重新建立所有政策
CREATE POLICY "Allow all operations on patients" ON patients FOR ALL USING (true);
CREATE POLICY "Allow all operations on medical_staff" ON medical_staff FOR ALL USING (true);
CREATE POLICY "Allow all operations on encounters" ON encounters FOR ALL USING (true);
CREATE POLICY "Allow all operations on consents" ON consents FOR ALL USING (true);
CREATE POLICY "Allow all operations on patient_files" ON patient_files FOR ALL USING (true);
CREATE POLICY "Allow all operations on patient_audio" ON patient_audio FOR ALL USING (true);

-- 重新建立 Storage 政策
CREATE POLICY "Allow public access to patient files" ON storage.objects FOR SELECT USING (bucket_id = 'patient-files');
CREATE POLICY "Allow authenticated users to upload patient files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'patient-files');
CREATE POLICY "Allow public access to patient audio" ON storage.objects FOR SELECT USING (bucket_id = 'patient-audio');
CREATE POLICY "Allow authenticated users to upload patient audio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'patient-audio');

-- 完成修復
SELECT '政策修復完成！' as message;

