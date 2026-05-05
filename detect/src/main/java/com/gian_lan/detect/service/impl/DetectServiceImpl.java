package com.gian_lan.detect.service.impl;

import com.gian_lan.detect.dto.ViolationRequest;
import com.gian_lan.detect.entity.CaThi;
import com.gian_lan.detect.entity.CameraCaThi;
import com.gian_lan.detect.entity.KetQuaNhanDang;
import com.gian_lan.detect.entity.TrangThaiCaThi;
import com.gian_lan.detect.repository.CaThiRepository;
import com.gian_lan.detect.repository.CameraCaThiRepository;
import com.gian_lan.detect.repository.KetQuaNhanDangRepository;
import com.gian_lan.detect.service.DetectService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class DetectServiceImpl implements DetectService {

    private final CaThiRepository caThiRepository;
    private final CameraCaThiRepository cameraCaThiRepository;
    private final KetQuaNhanDangRepository ketQuaNhanDangRepository;

    @Override
    public KetQuaNhanDang saveViolation(ViolationRequest request) {
        log.info("==> [Detect] Lưu vi phạm mới: Model={}, CameraCaThi={}", request.getMoHinhId(), request.getCameraCaThiId());
        CameraCaThi cameraCaThi = cameraCaThiRepository.findById(request.getCameraCaThiId())
                .orElseThrow(() -> new RuntimeException("CameraCaThi not found"));

        KetQuaNhanDang violation = new KetQuaNhanDang();
        violation.setId(UUID.randomUUID().toString());
        violation.setThoiDiemPhatHien(new Date());
        violation.setChiTiet(request.getChiTiet());
        violation.setHinhAnhMinhChungUrl(request.getHinhAnhMinhChungUrl());
        violation.setHanhViGianLan(request.getHanhViGianLan());
        violation.setMoHinhId(request.getMoHinhId());
        violation.setCameraCaThi(cameraCaThi);

        return ketQuaNhanDangRepository.save(violation);
    }

    @Override
    public List<KetQuaNhanDang> getViolationsByCameraCaThi(String cameraCaThiId) {
        return ketQuaNhanDangRepository.findByCameraCaThiIdOrderByThoiDiemPhatHienDesc(cameraCaThiId);
    }

    @Override
    public List<CameraCaThi> getCamerasByCaThi(String caThiId) {
        return cameraCaThiRepository.findByCaThiId(caThiId);
    }

    @Override
    public CameraCaThi updateVideoSource(String cameraCaThiId, String videoSource) {
        CameraCaThi cameraCaThi = cameraCaThiRepository.findById(cameraCaThiId)
                .orElseThrow(() -> new RuntimeException("CameraCaThi not found"));
        cameraCaThi.setDuongDanVideo(videoSource);
        return cameraCaThiRepository.save(cameraCaThi);
    }

    @Override
    public CaThi updateCaThiStatus(String caThiId, TrangThaiCaThi status) {
        CaThi caThi = caThiRepository.findById(caThiId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ca thi"));
        caThi.setTrangThai(status);
        return caThiRepository.save(caThi);
    }

    @Override
    public List<CaThi> getAllCaThi() {
        return caThiRepository.findAll();
    }

    @Override
    public List<CaThi> layDanhSachCaThiTheoMoHinh(String modelId) {
        return ketQuaNhanDangRepository.findDistinctCaThiByMoHinhId(modelId);
    }

    @Override
    public Map<String, Object> layThongSoVanHanhMoHinh(String modelId) {
        log.info("==> [Detect] Đang tính toán thông số vận hành cho Model ID: {}", modelId);
        Map<String, Object> stats = new HashMap<>();
        stats.put("soCaThiSuDung", ketQuaNhanDangRepository.countDistinctCaThiByMoHinhId(modelId));
        stats.put("soPhatHienViPham", ketQuaNhanDangRepository.countByMoHinhId(modelId));
        log.info("<== [Detect] Trả về thống kê cho Model ID: {} - SoCaThi: {}, SoViPham: {}", 
                modelId, stats.get("soCaThiSuDung"), stats.get("soPhatHienViPham"));
        return stats;
    }

    @Override
    public List<KetQuaNhanDang> layDanhSachViPhamTheoCameraCaThiVaMoHinh(String cameraCaThiId, String modelId) {
        return ketQuaNhanDangRepository.findByCameraCaThiIdAndMoHinhId(cameraCaThiId, modelId);
    }
}
