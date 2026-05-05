INSERT INTO mon (id, ma_mon, ten_mon) VALUES
('mon-001', 'IT101', 'Nhập môn Lập trình'),
('mon-002', 'IT202', 'Cấu trúc Dữ liệu và Giải thuật'),
('mon-003', 'IT303', 'Trí tuệ Nhân tạo');

INSERT INTO phong (id, ten_phong, toa_nha) VALUES
('phong-101', '101', 'A1'),
('phong-102', '102', 'A1'),
('phong-201', '201', 'B2');

INSERT INTO sinh_vien (id, ma_sv, ho_ten, lop) VALUES
('sv-001', 'B20DCCN001', 'Nguyễn Văn A', 'D20CQCN01-B'),
('sv-002', 'B20DCCN002', 'Trần Thị B', 'D20CQCN01-B'),
('sv-003', 'B20DCCN003', 'Lê Văn C', 'D20CQCN02-B');

INSERT INTO ca_thi (id, thoi_gian_bat_dau, thoi_luong_phut, trang_thai, phong_id, mon_id) VALUES
('ct-001', '2026-05-10 07:00:00', 90, 'CHUA_BAT_DAU', 'phong-101', 'mon-001'),
('ct-002', '2026-05-10 09:30:00', 90, 'CHUA_BAT_DAU', 'phong-102', 'mon-002'),
('ct-003', '2026-05-10 13:00:00', 60, 'DANG_THI', 'phong-201', 'mon-003');

INSERT INTO chi_tiet_ca_thi (id, ca_thi_id, sinh_vien_id) VALUES
('ctct-001', 'ct-001', 'sv-001'),
('ctct-002', 'ct-001', 'sv-002'),
('ctct-003', 'ct-002', 'sv-003');

INSERT INTO camera (id, ten_camera, vi_tri) VALUES
('cam-001', 'Camera 1', 'Góc trái trên'),
('cam-002', 'Camera 2', 'Góc phải trên'),
('cam-003', 'Camera 3', 'Giữa trần');

INSERT INTO camera_ca_thi (id, ca_thi_id, camera_id, duong_dan_video) VALUES
('cct-001', 'ct-001', 'cam-001', NULL),
('cct-002', 'ct-001', 'cam-002', NULL),
('cct-003', 'ct-002', 'cam-003', NULL),
('cct-004', 'ct-003', 'cam-001', NULL);
