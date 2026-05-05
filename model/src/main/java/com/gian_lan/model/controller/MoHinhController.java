package com.gian_lan.model.controller;

import com.gian_lan.model.dto.ApiResponse;
import com.gian_lan.model.dto.KetQuaTrainRequest;
import com.gian_lan.model.entity.MoHinh;
import com.gian_lan.model.entity.TkMoHinh;
import com.gian_lan.model.service.MoHinhService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/models")
public class MoHinhController {

    private final MoHinhService moHinhService;

    public MoHinhController(MoHinhService moHinhService) {
        this.moHinhService = moHinhService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MoHinh>>> timKiem(
            @RequestParam(required = false, defaultValue = "") String keyword) {
        return ResponseEntity.ok(ApiResponse.ok(moHinhService.timKiemMoHinh(keyword)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MoHinh>> chiTiet(@PathVariable String id) {
        return moHinhService.layChiTietMoHinh(id)
                .map(m -> ResponseEntity.ok(ApiResponse.ok(m)))
                .orElse(ResponseEntity.ok(ApiResponse.fail(404, "Không tìm thấy mô hình")));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<MoHinh>> batDauTrain(@PathVariable String id) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Bắt đầu huấn luyện", moHinhService.batDauTrain(id)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(400, e.getMessage()));
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<MoHinh>> huyTrain(@PathVariable String id) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Đã huỷ huấn luyện", moHinhService.huyTrain(id)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(400, e.getMessage()));
        }
    }

    @PutMapping("/{id}/save-trained")
    public ResponseEntity<ApiResponse<MoHinh>> luuSauTrain(
            @PathVariable String id,
            @RequestBody KetQuaTrainRequest request) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Lưu mô hình thành công", moHinhService.luuMoHinhSauTrain(id, request)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(400, e.getMessage()));
        }
    }

    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<List<TkMoHinh>>> layThongKeTatCaMoHinh() {
        return ResponseEntity.ok(ApiResponse.ok(moHinhService.layThongKeTatCaMoHinh()));
    }

    @GetMapping("/{id}/statistics")
    public ResponseEntity<ApiResponse<TkMoHinh>> layThongKeChiTiet(@PathVariable String id) {
        return moHinhService.layThongKeChiTiet(id)
                .map(tk -> ResponseEntity.ok(ApiResponse.ok(tk)))
                .orElse(ResponseEntity.ok(ApiResponse.fail(404, "Không tìm thấy thống kê cho mô hình")));
    }
}
