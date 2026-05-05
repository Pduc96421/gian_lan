package com.gian_lan.dataset.service.impl;

import com.gian_lan.dataset.entity.HanhViGianLan;
import com.gian_lan.dataset.entity.MauHanhVi;
import com.gian_lan.dataset.repository.HanhViGianLanRepository;
import com.gian_lan.dataset.repository.MauHanhViRepository;
import com.gian_lan.dataset.service.DatasetService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DatasetServiceImpl implements DatasetService {

    private final MauHanhViRepository mauHanhViRepository;
    private final HanhViGianLanRepository hanhViGianLanRepository;

    public DatasetServiceImpl(MauHanhViRepository mauHanhViRepository,
                              HanhViGianLanRepository hanhViGianLanRepository) {
        this.mauHanhViRepository = mauHanhViRepository;
        this.hanhViGianLanRepository = hanhViGianLanRepository;
    }

    @Override
    public List<MauHanhVi> timKiemMauTheoTenHanhVi(String tenHanhVi) {
        if (tenHanhVi == null || tenHanhVi.isBlank()) return mauHanhViRepository.findAll();
        return mauHanhViRepository.findByHanhViGianLanTenHanhViContainingIgnoreCase(tenHanhVi);
    }

    @Override
    public Optional<MauHanhVi> layChiTietMauHanhVi(String id) {
        return mauHanhViRepository.findById(id);
    }

    @Override
    public List<HanhViGianLan> layDanhSachHanhVi() {
        return hanhViGianLanRepository.findAll();
    }
}
