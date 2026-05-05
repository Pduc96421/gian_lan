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
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DetectServiceImpl implements DetectService {

    private final CaThiRepository caThiRepository;
    private final CameraCaThiRepository cameraCaThiRepository;
    private final KetQuaNhanDangRepository ketQuaNhanDangRepository;

    @Override
    public KetQuaNhanDang saveViolation(ViolationRequest request) {
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
}
