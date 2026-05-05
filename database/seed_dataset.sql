-- ============================================================
-- SEED: gian_lan_dataset
-- Chạy file này trong MySQL Workbench sau khi service đã khởi
-- động lần đầu (để Hibernate tạo bảng trước).
-- ============================================================

USE gian_lan_dataset;

-- Xoá dữ liệu cũ (nếu có) để tránh trùng lặp
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE mau_hanh_vi;
TRUNCATE TABLE hanh_vi_gian_lan;
SET FOREIGN_KEY_CHECKS = 1;

-- ── Bảng: hanh_vi_gian_lan ──────────────────────────────────
INSERT INTO hanh_vi_gian_lan (id, ten_hanh_vi, mo_ta) VALUES
(
    'hv-0001-nhb',
    'Nhìn bài người khác',
    'Thí sinh cúi đầu hoặc quay người nhìn sang bài của thí sinh bên cạnh trong quá trình thi.'
),
(
    'hv-0002-dth',
    'Sử dụng điện thoại',
    'Thí sinh lén lút sử dụng điện thoại di động để tra cứu tài liệu hoặc liên lạc trong phòng thi.'
),
(
    'hv-0003-ttl',
    'Truyền tài liệu',
    'Thí sinh chuyền phiếu ghi chú, tờ giấy hoặc các tài liệu gian lận cho thí sinh khác.'
),
(
    'hv-0004-tdb',
    'Trao đổi bài làm',
    'Thí sinh trao đổi bài làm, bàn bạc câu trả lời hoặc chỉ bài cho nhau trong giờ thi.'
);

-- ── Bảng: mau_hanh_vi ───────────────────────────────────────
-- Mỗi hành vi gian lận có nhiều mẫu video ghi lại
INSERT INTO mau_hanh_vi (id, duong_dan_du_lieu, ngay_tao, hanh_vi_id) VALUES

-- Nhìn bài người khác (3 mẫu)
('mhv-001', '/data/nhin_bai/cam_truoc_001.mp4', '2024-01-10', 'hv-0001-nhb'),
('mhv-002', '/data/nhin_bai/cam_truoc_002.mp4', '2024-01-11', 'hv-0001-nhb'),
('mhv-003', '/data/nhin_bai/cam_ben_001.mp4',   '2024-01-12', 'hv-0001-nhb'),

-- Sử dụng điện thoại (3 mẫu)
('mhv-004', '/data/dien_thoai/cam_tren_001.mp4', '2024-02-05', 'hv-0002-dth'),
('mhv-005', '/data/dien_thoai/cam_tren_002.mp4', '2024-02-06', 'hv-0002-dth'),
('mhv-006', '/data/dien_thoai/cam_goc_001.mp4',  '2024-02-07', 'hv-0002-dth'),

-- Truyền tài liệu (2 mẫu)
('mhv-007', '/data/tai_lieu/cam_truoc_001.mp4',  '2024-03-01', 'hv-0003-ttl'),
('mhv-008', '/data/tai_lieu/cam_tren_001.mp4',   '2024-03-02', 'hv-0003-ttl'),

-- Trao đổi bài làm (2 mẫu)
('mhv-009', '/data/trao_doi/cam_truoc_001.mp4',  '2024-04-15', 'hv-0004-tdb'),
('mhv-010', '/data/trao_doi/cam_goc_001.mp4',    '2024-04-16', 'hv-0004-tdb');

-- Kiểm tra kết quả
SELECT h.ten_hanh_vi, COUNT(m.id) AS so_mau
FROM hanh_vi_gian_lan h
LEFT JOIN mau_hanh_vi m ON m.hanh_vi_id = h.id
GROUP BY h.id, h.ten_hanh_vi;
