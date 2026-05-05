package com.gian_lan.dataset.service;

import com.gian_lan.dataset.entity.HanhViGianLan;
import com.gian_lan.dataset.entity.MauHanhVi;

import java.util.List;
import java.util.Optional;

public interface DatasetService {
    List<MauHanhVi> timKiemMauTheoTenHanhVi(String tenHanhVi);
    Optional<MauHanhVi> layChiTietMauHanhVi(String id);
    List<HanhViGianLan> layDanhSachHanhVi();
}
