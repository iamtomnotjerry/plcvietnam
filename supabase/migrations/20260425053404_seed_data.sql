-- ============================================
-- SEED DATA FOR DEVELOPMENT
-- ============================================

-- Insert Fields
INSERT INTO public.fields (id, slug, name, description, icon) VALUES
  ('f1111111-1111-1111-1111-111111111111', 'plc', 'PLC', 'Programmable Logic Controller', '🔧'),
  ('f2222222-2222-2222-2222-222222222222', 'scada', 'SCADA', 'Supervisory Control and Data Acquisition', '📊'),
  ('f3333333-3333-3333-3333-333333333333', 'siemens', 'Siemens', 'Siemens Automation Systems', '⚙️'),
  ('f4444444-4444-4444-4444-444444444444', 'hmi', 'HMI', 'Human Machine Interface', '🖥️');

-- Insert Categories
INSERT INTO public.categories (id, slug, name, description, field_id) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'plc-basics', 'PLC Cơ Bản', 'Kiến thức nền tảng về PLC', 'f1111111-1111-1111-1111-111111111111'),
  ('c2222222-2222-2222-2222-222222222222', 'plc-advanced', 'PLC Nâng Cao', 'Kỹ thuật lập trình PLC nâng cao', 'f1111111-1111-1111-1111-111111111111'),
  ('c3333333-3333-3333-3333-333333333333', 'scada-systems', 'Hệ Thống SCADA', 'Thiết kế và triển khai SCADA', 'f2222222-2222-2222-2222-222222222222'),
  ('c4444444-4444-4444-4444-444444444444', 'siemens-s7', 'Siemens S7', 'Lập trình Siemens S7-300/400/1200/1500', 'f3333333-3333-3333-3333-333333333333');

-- Insert Tags
INSERT INTO public.tags (id, slug, name) VALUES
  ('t1111111-1111-1111-1111-111111111111', 'ladder-logic', 'Ladder Logic'),
  ('t2222222-2222-2222-2222-222222222222', 'structured-text', 'Structured Text'),
  ('t3333333-3333-3333-3333-333333333333', 'function-block', 'Function Block'),
  ('t4444444-4444-4444-4444-444444444444', 'tia-portal', 'TIA Portal'),
  ('t5555555-5555-5555-5555-555555555555', 'wincc', 'WinCC'),
  ('t6666666-6666-6666-6666-666666666666', 'modbus', 'Modbus'),
  ('t7777777-7777-7777-7777-777777777777', 'profinet', 'PROFINET'),
  ('t8888888-8888-8888-8888-888888888888', 'troubleshooting', 'Troubleshooting');

-- Insert Author Info
INSERT INTO public.author_info (id, name, bio, email, social_links) VALUES
  ('a1111111-1111-1111-1111-111111111111', 
   'Trần Văn Hiếu', 
   'Chuyên gia tư vấn tự động hóa công nghiệp và Quản lý Trung tâm Đào tạo SITRAIN tại Siemens Việt Nam. Hơn 15 năm kinh nghiệm triển khai 50+ dự án tự động hóa. Tác giả bộ sách TIA Portal. Admin cộng đồng PLC Việt Nam 5.000+ thành viên.',
   'tran.van.hieu@siemens.com',
   '{"linkedin": "https://linkedin.com/in/tran-van-hieu-siemens", "github": "https://github.com/plcvietnam"}'::jsonb
  );

-- Note: Posts will be created via API after authentication is set up
-- This is because posts require author_id which comes from auth.users
