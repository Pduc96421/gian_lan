package com.gian_lan.dataset.repository;

import com.gian_lan.dataset.entity.MauHanhVi;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MauHanhViRepository extends JpaRepository<MauHanhVi, String> {
    List<MauHanhVi> findByHanhViGianLanTenHanhViContainingIgnoreCase(String keyword);
}
