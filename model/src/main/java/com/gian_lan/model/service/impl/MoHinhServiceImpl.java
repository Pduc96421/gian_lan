package com.gian_lan.model.service.impl;

import com.gian_lan.model.dto.KetQuaTrainRequest;
import com.gian_lan.model.entity.MoHinh;
import com.gian_lan.model.entity.MoHinhMau;
import com.gian_lan.model.entity.TrangThaiMoHinh;
import com.gian_lan.model.repository.MoHinhRepository;
import com.gian_lan.model.service.MoHinhService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class MoHinhServiceImpl implements MoHinhService {

    private final MoHinhRepository moHinhRepository;

    public MoHinhServiceImpl(MoHinhRepository moHinhRepository) {
        this.moHinhRepository = moHinhRepository;
    }

    @Override
    public List<MoHinh> timKiemMoHinh(String keyword) {
        if (keyword == null || keyword.isBlank()) return moHinhRepository.findAll();
        return moHinhRepository.findByTenMoHinhContainingIgnoreCase(keyword);
    }

    @Override
    public Optional<MoHinh> layChiTietMoHinh(String id) {
        return moHinhRepository.findById(id);
    }

    @Override
    public MoHinh batDauTrain(String id) {
        MoHinh moHinh = moHinhRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy mô hình: " + id));
        if (moHinh.getTrangThai() != TrangThaiMoHinh.HOAN_THANH)
            throw new IllegalStateException("Chỉ có thể train mô hình đang ở trạng thái Hoàn thành");
        moHinh.setTrangThai(TrangThaiMoHinh.DANG_TRAIN);
        return moHinhRepository.save(moHinh);
    }

    @Override
    public MoHinh huyTrain(String id) {
        MoHinh moHinh = moHinhRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy mô hình: " + id));
        if (moHinh.getTrangThai() != TrangThaiMoHinh.DANG_TRAIN)
            throw new IllegalStateException("Chỉ có thể huỷ mô hình đang ở trạng thái Đang huấn luyện");
        moHinh.setTrangThai(TrangThaiMoHinh.HOAN_THANH);
        return moHinhRepository.save(moHinh);
    }

    @Override
    public MoHinh luuMoHinhSauTrain(String id, KetQuaTrainRequest request) {
        MoHinh moHinh = moHinhRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy mô hình: " + id));
        if (moHinh.getTrangThai() != TrangThaiMoHinh.DANG_TRAIN)
            throw new IllegalStateException("Mô hình phải đang ở trạng thái Đang huấn luyện");
        moHinh.setAccuracy(request.getAccuracy());
        moHinh.setPrecision(request.getPrecision());
        moHinh.setRecall(request.getRecall());
        moHinh.setF1Score(request.getF1Score());
        moHinh.setDuongDanMoHinh(request.getDuongDanMoHinh());
        moHinh.setTrangThai(TrangThaiMoHinh.HOAN_THANH);
        
        if (request.getMauHanhViIds() != null) {
            moHinh.getMoHinhMaus().clear();
            for (String mauHanhViId : request.getMauHanhViIds()) {
                MoHinhMau mau = new MoHinhMau(UUID.randomUUID().toString(), "TRAIN", mauHanhViId);
                moHinh.getMoHinhMaus().add(mau);
            }
        }
        
        return moHinhRepository.save(moHinh);
    }
}
