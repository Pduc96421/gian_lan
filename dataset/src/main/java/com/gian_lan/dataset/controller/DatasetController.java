package com.gian_lan.dataset.controller;

import com.gian_lan.dataset.dto.ApiResponse;
import com.gian_lan.dataset.entity.HanhViGianLan;
import com.gian_lan.dataset.entity.MauHanhVi;
import com.gian_lan.dataset.service.DatasetService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dataset")
public class DatasetController {

    private final DatasetService datasetService;

    public DatasetController(DatasetService datasetService) {
        this.datasetService = datasetService;
    }

    @GetMapping("/samples")
    public ApiResponse<List<MauHanhVi>> timKiemMau(
            @RequestParam(required = false, defaultValue = "") String tenHanhVi) {
        return ApiResponse.ok(datasetService.timKiemMauTheoTenHanhVi(tenHanhVi));
    }

    @GetMapping("/samples/{id}")
    public ApiResponse<MauHanhVi> chiTietMau(@PathVariable String id) {
        return datasetService.layChiTietMauHanhVi(id)
                .map(ApiResponse::ok)
                .orElse(ApiResponse.fail(404, "Không tìm thấy mẫu"));
    }

    @GetMapping("/behaviors")
    public ApiResponse<List<HanhViGianLan>> danhSachHanhVi() {
        return ApiResponse.ok(datasetService.layDanhSachHanhVi());
    }
}
