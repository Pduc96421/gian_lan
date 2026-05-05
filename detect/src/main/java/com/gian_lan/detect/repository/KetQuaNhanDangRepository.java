package com.gian_lan.detect.repository;

import com.gian_lan.detect.entity.KetQuaNhanDang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KetQuaNhanDangRepository extends JpaRepository<KetQuaNhanDang, String> {
    List<KetQuaNhanDang> findByCameraCaThiIdOrderByThoiDiemPhatHienDesc(String cameraCaThiId);
}
