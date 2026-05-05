-- ============================================================
-- SEED: gian_lan_model
-- Chạy file này trong MySQL Workbench sau khi service đã khởi
-- động lần đầu (để Hibernate tạo bảng trước).
-- ============================================================

USE gian_lan_model;

-- Xoá dữ liệu cũ (nếu có)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE mo_hinh_mau;
TRUNCATE TABLE mo_hinh;
SET FOREIGN_KEY_CHECKS = 1;

-- ── Bảng: mo_hinh ───────────────────────────────────────────
-- trang_thai: HOAN_THANH | DANG_TRAIN
INSERT INTO mo_hinh (id, ten_mo_hinh, accuracy, ket_qua_precision, recall, f1_score, trang_thai, duong_dan_mo_hinh) VALUES
(
    'mh-0001-nhb',
    'Mô hình phát hiện nhìn bài',
    0.9210, 0.9030, 0.9150, 0.9090,
    'HOAN_THANH',
    '/models/nhin_bai_v1.pkl'
),
(
    'mh-0002-dth',
    'Mô hình phát hiện sử dụng điện thoại',
    0.8750, 0.8620, 0.8800, 0.8710,
    'HOAN_THANH',
    '/models/dien_thoai_v2.pkl'
),
(
    'mh-0003-ttl',
    'Mô hình phát hiện truyền tài liệu',
    0.8430, 0.8310, 0.8570, 0.8440,
    'HOAN_THANH',
    '/models/tai_lieu_v1.pkl'
),
(
    'mh-0004-tdb',
    'Mô hình phát hiện trao đổi bài làm',
    0.8960, 0.8810, 0.9020, 0.8910,
    'HOAN_THANH',
    '/models/trao_doi_v1.pkl'
),
(
    'mh-0005-yolo',
    'Mô hình YOLOv8 Detection',
    0.9500, 0.9400, 0.9600, 0.9500,
    'HOAN_THANH',
    '/models/yolov8n.pt'
);

-- ── Bảng: mo_hinh_mau ────────────────────────────────────────
-- Ghi lại các mẫu dữ liệu đã dùng để train mỗi mô hình
-- (mau_hanh_vi_id tham chiếu sang database gian_lan_dataset)
INSERT INTO mo_hinh_mau (id, loai, mau_hanh_vi_id, mo_hinh_id) VALUES

-- Mô hình nhìn bài (dùng 3 mẫu từ dataset)
('mhm-001', 'TRAIN', 'mhv-001', 'mh-0001-nhb'),
('mhm-002', 'TRAIN', 'mhv-002', 'mh-0001-nhb'),
('mhm-003', 'TEST',  'mhv-003', 'mh-0001-nhb'),

-- Mô hình điện thoại (dùng 3 mẫu)
('mhm-004', 'TRAIN', 'mhv-004', 'mh-0002-dth'),
('mhm-005', 'TRAIN', 'mhv-005', 'mh-0002-dth'),
('mhm-006', 'TEST',  'mhv-006', 'mh-0002-dth'),

-- Mô hình tài liệu (dùng 2 mẫu)
('mhm-007', 'TRAIN', 'mhv-007', 'mh-0003-ttl'),
('mhm-008', 'TEST',  'mhv-008', 'mh-0003-ttl'),

-- Mô hình trao đổi bài (dùng 2 mẫu)
('mhm-009', 'TRAIN', 'mhv-009', 'mh-0004-tdb'),
('mhm-010', 'TEST',  'mhv-010', 'mh-0004-tdb');

-- Kiểm tra kết quả
SELECT
    m.ten_mo_hinh,
    m.trang_thai,
    ROUND(m.accuracy * 100, 1)          AS accuracy_pct,
    ROUND(m.ket_qua_precision * 100, 1) AS precision_pct,
    ROUND(m.recall * 100, 1)            AS recall_pct,
    ROUND(m.f1_score * 100, 1)          AS f1_pct,
    COUNT(mm.id)                         AS so_mau_train
FROM mo_hinh m
LEFT JOIN mo_hinh_mau mm ON mm.mo_hinh_id = m.id
GROUP BY m.id, m.ten_mo_hinh, m.trang_thai,
         m.accuracy, m.ket_qua_precision, m.recall, m.f1_score;
