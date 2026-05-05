package com.gian_lan.detect.service;

import com.gian_lan.detect.dto.ViolationRequest;
import com.gian_lan.detect.entity.CaThi;
import com.gian_lan.detect.entity.CameraCaThi;
import com.gian_lan.detect.entity.KetQuaNhanDang;
import com.gian_lan.detect.entity.TrangThaiCaThi;

import java.util.List;

public interface DetectService {
    KetQuaNhanDang saveViolation(ViolationRequest request);
    List<KetQuaNhanDang> getViolationsByCameraCaThi(String cameraCaThiId);
    List<CameraCaThi> getCamerasByCaThi(String caThiId);
    CameraCaThi updateVideoSource(String cameraCaThiId, String videoSource);
    CaThi updateCaThiStatus(String caThiId, TrangThaiCaThi status);
    List<CaThi> getAllCaThi();
}
