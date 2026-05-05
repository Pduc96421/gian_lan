package com.gian_lan.model.config;

import com.gian_lan.model.entity.MoHinh;
import com.gian_lan.model.entity.MoHinhMau;
import com.gian_lan.model.entity.TrangThaiMoHinh;
import com.gian_lan.model.repository.MoHinhRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final MoHinhRepository moHinhRepository;

    public DataInitializer(MoHinhRepository moHinhRepository) {
        this.moHinhRepository = moHinhRepository;
    }

    @Override
    public void run(String... args) {
        if (moHinhRepository.count() > 0) return; // Đã có dữ liệu → bỏ qua

        List<MoHinh> models = List.of(
            build("mh-0001-nhb", "Mô hình phát hiện nhìn bài",
                0.9210f, 0.9030f, 0.9150f, 0.9090f, "/models/nhin_bai_v1.pkl",
                List.of(
                    new MoHinhMau("mhm-001", "TRAIN", "mhv-001"),
                    new MoHinhMau("mhm-002", "TRAIN", "mhv-002"),
                    new MoHinhMau("mhm-003", "TEST",  "mhv-003")
                )
            ),
            build("mh-0002-dth", "Mô hình phát hiện sử dụng điện thoại",
                0.8750f, 0.8620f, 0.8800f, 0.8710f, "/models/dien_thoai_v2.pkl",
                List.of(
                    new MoHinhMau("mhm-004", "TRAIN", "mhv-004"),
                    new MoHinhMau("mhm-005", "TRAIN", "mhv-005"),
                    new MoHinhMau("mhm-006", "TEST",  "mhv-006")
                )
            ),
            build("mh-0003-ttl", "Mô hình phát hiện truyền tài liệu",
                0.8430f, 0.8310f, 0.8570f, 0.8440f, "/models/tai_lieu_v1.pkl",
                List.of(
                    new MoHinhMau("mhm-007", "TRAIN", "mhv-007"),
                    new MoHinhMau("mhm-008", "TEST",  "mhv-008")
                )
            ),
            build("mh-0004-tdb", "Mô hình phát hiện trao đổi bài làm",
                0.8960f, 0.8810f, 0.9020f, 0.8910f, "/models/trao_doi_v1.pkl",
                List.of(
                    new MoHinhMau("mhm-009", "TRAIN", "mhv-009"),
                    new MoHinhMau("mhm-010", "TEST",  "mhv-010")
                )
            )
        );

        moHinhRepository.saveAll(models);
        System.out.println("[DataInitializer] Đã seed " + models.size() + " mô hình vào DB.");
    }

    private MoHinh build(String id, String ten, float acc, float prec, float rec, float f1,
                          String path, List<MoHinhMau> maus) {
        MoHinh m = new MoHinh();
        m.setId(id);
        m.setTenMoHinh(ten);
        m.setAccuracy(acc);
        m.setPrecision(prec);
        m.setRecall(rec);
        m.setF1Score(f1);
        m.setTrangThai(TrangThaiMoHinh.HOAN_THANH);
        m.setDuongDanMoHinh(path);
        m.setMoHinhMaus(maus);
        return m;
    }
}
