package com.gian_lan.dataset.config;

import com.gian_lan.dataset.entity.HanhViGianLan;
import com.gian_lan.dataset.entity.MauHanhVi;
import com.gian_lan.dataset.repository.HanhViGianLanRepository;
import com.gian_lan.dataset.repository.MauHanhViRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final HanhViGianLanRepository hanhViRepo;
    private final MauHanhViRepository     mauRepo;

    public DataInitializer(HanhViGianLanRepository hanhViRepo, MauHanhViRepository mauRepo) {
        this.hanhViRepo = hanhViRepo;
        this.mauRepo    = mauRepo;
    }

    @Override
    public void run(String... args) {
        if (hanhViRepo.count() > 0) return; // Đã có dữ liệu → bỏ qua

        // ── Hành vi gian lận ──────────────────────────────────
        HanhViGianLan hv1 = hanhViRepo.save(new HanhViGianLan(
            "hv-0001-nhb", "Nhìn bài người khác",
            "Thí sinh cúi đầu hoặc quay người nhìn sang bài của thí sinh bên cạnh trong quá trình thi."
        ));
        HanhViGianLan hv2 = hanhViRepo.save(new HanhViGianLan(
            "hv-0002-dth", "Sử dụng điện thoại",
            "Thí sinh lén lút sử dụng điện thoại di động để tra cứu tài liệu hoặc liên lạc trong phòng thi."
        ));
        HanhViGianLan hv3 = hanhViRepo.save(new HanhViGianLan(
            "hv-0003-ttl", "Truyền tài liệu",
            "Thí sinh chuyền phiếu ghi chú, tờ giấy hoặc các tài liệu gian lận cho thí sinh khác."
        ));
        HanhViGianLan hv4 = hanhViRepo.save(new HanhViGianLan(
            "hv-0004-tdb", "Trao đổi bài làm",
            "Thí sinh trao đổi bài làm, bàn bạc câu trả lời hoặc chỉ bài cho nhau trong giờ thi."
        ));

        // ── Mẫu hành vi ───────────────────────────────────────
        List<MauHanhVi> maus = List.of(
            // Nhìn bài (3 mẫu)
            new MauHanhVi("mhv-001", "/data/nhin_bai/cam_truoc_001.mp4", "2024-01-10", hv1),
            new MauHanhVi("mhv-002", "/data/nhin_bai/cam_truoc_002.mp4", "2024-01-11", hv1),
            new MauHanhVi("mhv-003", "/data/nhin_bai/cam_ben_001.mp4",   "2024-01-12", hv1),
            // Điện thoại (3 mẫu)
            new MauHanhVi("mhv-004", "/data/dien_thoai/cam_tren_001.mp4", "2024-02-05", hv2),
            new MauHanhVi("mhv-005", "/data/dien_thoai/cam_tren_002.mp4", "2024-02-06", hv2),
            new MauHanhVi("mhv-006", "/data/dien_thoai/cam_goc_001.mp4",  "2024-02-07", hv2),
            // Tài liệu (2 mẫu)
            new MauHanhVi("mhv-007", "/data/tai_lieu/cam_truoc_001.mp4",  "2024-03-01", hv3),
            new MauHanhVi("mhv-008", "/data/tai_lieu/cam_tren_001.mp4",   "2024-03-02", hv3),
            // Trao đổi (2 mẫu)
            new MauHanhVi("mhv-009", "/data/trao_doi/cam_truoc_001.mp4",  "2024-04-15", hv4),
            new MauHanhVi("mhv-010", "/data/trao_doi/cam_goc_001.mp4",    "2024-04-16", hv4)
        );
        mauRepo.saveAll(maus);

        System.out.println("[DataInitializer] Đã seed "
            + hanhViRepo.count() + " hành vi, "
            + mauRepo.count()    + " mẫu vào DB.");
    }
}
