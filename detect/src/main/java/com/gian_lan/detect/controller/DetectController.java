package com.gian_lan.detect.controller;

import com.gian_lan.detect.dto.StatusRequest;
import com.gian_lan.detect.dto.VideoSourceRequest;
import com.gian_lan.detect.dto.ViolationRequest;
import com.gian_lan.detect.entity.CaThi;
import com.gian_lan.detect.entity.CameraCaThi;
import com.gian_lan.detect.entity.KetQuaNhanDang;
import com.gian_lan.detect.service.DetectService;
import lombok.RequiredArgsConstructor;
import com.gian_lan.detect.dto.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/detect")
@RequiredArgsConstructor
public class DetectController {

    private final DetectService detectService;

    @PostMapping("/violations")
    public ApiResponse<KetQuaNhanDang> saveViolation(@RequestBody ViolationRequest request) {
        return ApiResponse.ok(detectService.saveViolation(request));
    }

    @GetMapping("/cameras/{cameraId}/violations")
    public ApiResponse<List<KetQuaNhanDang>> getViolations(@PathVariable String cameraId) {
        return ApiResponse.ok(detectService.getViolationsByCameraCaThi(cameraId));
    }

    @GetMapping("/ca-thi/{caThiId}/cameras")
    public ApiResponse<List<CameraCaThi>> getCamerasByCaThi(@PathVariable String caThiId) {
        return ApiResponse.ok(detectService.getCamerasByCaThi(caThiId));
    }

    @PutMapping("/cameras/{cameraId}/video-source")
    public ApiResponse<CameraCaThi> updateVideoSource(
            @PathVariable String cameraId,
            @RequestBody VideoSourceRequest request) {
        return ApiResponse.ok(detectService.updateVideoSource(cameraId, request.getDuongDanVideo()));
    }

    @PutMapping("/ca-thi/{caThiId}/status")
    public ApiResponse<CaThi> updateCaThiStatus(
            @PathVariable String caThiId,
            @RequestBody StatusRequest request) {
        return ApiResponse.ok(detectService.updateCaThiStatus(caThiId, request.getTrangThai()));
    }
    
    @GetMapping("/ca-thi")
    public ApiResponse<List<CaThi>> getAllCaThi() {
        return ApiResponse.ok(detectService.getAllCaThi());
    }

    @GetMapping("/ca-thi/by-model/{modelId}")
    public ApiResponse<List<CaThi>> getCaThiByModel(@PathVariable String modelId) {
        return ApiResponse.ok(detectService.layDanhSachCaThiTheoMoHinh(modelId));
    }

    @GetMapping("/operational-stats/{modelId}")
    public ApiResponse<Map<String, Object>> getOperationalStats(@PathVariable String modelId) {
        return ApiResponse.ok(detectService.layThongSoVanHanhMoHinh(modelId));
    }

    @GetMapping("/camera-ca-thi/{cameraCaThiId}/violations")
    public ApiResponse<List<KetQuaNhanDang>> getViolationsByCameraAndModel(
            @PathVariable String cameraCaThiId,
            @RequestParam String modelId) {
        return ApiResponse.ok(detectService.layDanhSachViPhamTheoCameraCaThiVaMoHinh(cameraCaThiId, modelId));
    }
}
