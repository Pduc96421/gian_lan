package com.gian_lan.detect.repository;

import com.gian_lan.detect.entity.KetQuaNhanDang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.gian_lan.detect.entity.CaThi;

import java.util.List;

@Repository
public interface KetQuaNhanDangRepository extends JpaRepository<KetQuaNhanDang, String> {
    List<KetQuaNhanDang> findByCameraCaThiIdOrderByThoiDiemPhatHienDesc(String cameraCaThiId);

    long countByMoHinhId(String moHinhId);

    @Query("SELECT COUNT(DISTINCT k.cameraCaThi.caThi.id) " +
            "FROM KetQuaNhanDang k " +
            "WHERE k.moHinhId = :moHinhId")
    long countDistinctCaThiByMoHinhId(String moHinhId);

    @Query("SELECT DISTINCT k.cameraCaThi.caThi " +
            "FROM KetQuaNhanDang k " +
            "WHERE k.moHinhId = :moHinhId")
    List<CaThi> findDistinctCaThiByMoHinhId(String moHinhId);

    @Query("SELECT k FROM KetQuaNhanDang k " +
            "WHERE k.cameraCaThi.id = :cameraCaThiId " +
            "AND k.moHinhId = :moHinhId " +
            "ORDER BY k.thoiDiemPhatHien DESC")
    List<KetQuaNhanDang> findByCameraCaThiIdAndMoHinhId(String cameraCaThiId, String moHinhId);
}
