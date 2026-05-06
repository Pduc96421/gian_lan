package com.gian_lan.model.service.impl;

import com.gian_lan.model.dto.KetQuaTrainRequest;
import com.gian_lan.model.dto.MauHanhViRequest;
import com.gian_lan.model.entity.MoHinh;
import com.gian_lan.model.entity.MoHinhMau;
import com.gian_lan.model.entity.TrangThaiMoHinh;
import com.gian_lan.model.repository.MoHinhRepository;
import com.gian_lan.model.service.MoHinhService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import com.gian_lan.model.client.DetectServiceClient;
import com.gian_lan.model.dto.ApiResponse;
import com.gian_lan.model.entity.TkMoHinh;
import org.springframework.beans.BeanUtils;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class MoHinhServiceImpl implements MoHinhService {

    private final MoHinhRepository moHinhRepository;
    private final DetectServiceClient detectServiceClient;

    public MoHinhServiceImpl(MoHinhRepository moHinhRepository, DetectServiceClient detectServiceClient) {
        this.moHinhRepository = moHinhRepository;
        this.detectServiceClient = detectServiceClient;
    }

    @Override
    public List<TkMoHinh> layThongKeTatCaMoHinh() {
        return moHinhRepository.findAll().stream()
                .map(this::mapToTkMoHinh)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<TkMoHinh> layThongKeChiTiet(String id) {
        return moHinhRepository.findById(id).map(this::mapToTkMoHinh);
    }

    private TkMoHinh mapToTkMoHinh(MoHinh moHinh) {
        TkMoHinh tk = new TkMoHinh();
        BeanUtils.copyProperties(moHinh, tk);
        tk.setTongSoLuongMau(moHinh.getMoHinhMaus() != null ? moHinh.getMoHinhMaus().size() : 0);
        
        try {
            log.info("==> [Model -> Detect] Bắt đầu gọi detect-service để lấy thống kê vận hành cho model ID: {}", moHinh.getId());
            
            // Gọi detect-service qua Feign Client
            ApiResponse<Map<String, Object>> response = detectServiceClient.getOperationalStats(moHinh.getId());
            
            if (response != null && response.getResult() != null) {
                Map<String, Object> stats = response.getResult();
                tk.setSoCaThiSuDung(((Number) stats.getOrDefault("soCaThiSuDung", 0)).intValue());
                tk.setSoPhatHienViPham(((Number) stats.getOrDefault("soPhatHienViPham", 0)).intValue());
                log.info("<== [Model <- Detect] Nhận kết quả thống kê thành công cho model ID: {}", moHinh.getId());
            } else {
                log.warn("<!= [Model <- Detect] Kết quả trả về từ detect-service bị rỗng cho model ID: {}", moHinh.getId());
            }
        } catch (Exception e) {
            log.error("[Model x Detect] Lỗi khi gọi sang detect-service cho model {}: {}", moHinh.getId(), e.getMessage());
        }
        return tk;
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
        
        if (request.getMauHanhVis() != null) {
            moHinh.getMoHinhMaus().clear();
            for (MauHanhViRequest mauReq : request.getMauHanhVis()) {
                MoHinhMau mau = new MoHinhMau(
                    UUID.randomUUID().toString(), 
                    mauReq.getType(), 
                    mauReq.getId()
                );
                moHinh.getMoHinhMaus().add(mau);
            }
        }
        
        return moHinhRepository.save(moHinh);
    }
}
