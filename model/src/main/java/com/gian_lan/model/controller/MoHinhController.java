package com.gian_lan.model.controller;

import com.gian_lan.model.dto.ApiResponse;
import com.gian_lan.model.dto.KetQuaTrainRequest;
import com.gian_lan.model.entity.MoHinh;
import com.gian_lan.model.entity.TkMoHinh;
import com.gian_lan.model.service.MoHinhService;
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
    public ApiResponse<List<MoHinh>> timKiem(
            @RequestParam(required = false, defaultValue = "") String keyword) {
        return ApiResponse.ok(moHinhService.timKiemMoHinh(keyword));
    }

    @GetMapping("/{id}")
    public ApiResponse<MoHinh> chiTiet(@PathVariable String id) {
        return moHinhService.layChiTietMoHinh(id)
                .map(ApiResponse::ok)
                .orElse(ApiResponse.fail(404, "Không tìm thấy mô hình"));
    }

    @PutMapping("/{id}/status")
    public ApiResponse<MoHinh> batDauTrain(@PathVariable String id) {
        try {
            return ApiResponse.ok("Bắt đầu huấn luyện", moHinhService.batDauTrain(id));
        } catch (Exception e) {
            return ApiResponse.fail(400, e.getMessage());
        }
    }

    @PutMapping("/{id}/cancel")
    public ApiResponse<MoHinh> huyTrain(@PathVariable String id) {
        try {
            return ApiResponse.ok("Đã huỷ huấn luyện", moHinhService.huyTrain(id));
        } catch (Exception e) {
            return ApiResponse.fail(400, e.getMessage());
        }
    }

    @PutMapping("/save-trained")
    public ApiResponse<MoHinh> luuSauTrain(
            @RequestBody KetQuaTrainRequest request) {
        try {
            return ApiResponse.ok("Lưu mô hình thành công", moHinhService.luuMoHinhSauTrain(request));
        } catch (Exception e) {
            return ApiResponse.fail(400, e.getMessage());
        }
    }

    @GetMapping("/statistics")
    public ApiResponse<List<TkMoHinh>> layThongKeTatCaMoHinh() {
        return ApiResponse.ok(moHinhService.layThongKeTatCaMoHinh());
    }

    @GetMapping("/{id}/statistics")
    public ApiResponse<TkMoHinh> layThongKeChiTiet(@PathVariable String id) {
        return moHinhService.layThongKeChiTiet(id)
                .map(ApiResponse::ok)
                .orElse(ApiResponse.fail(404, "Không tìm thấy thống kê cho mô hình"));
    }
}
