package com.gian_lan.model.repository;

import com.gian_lan.model.entity.MoHinh;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MoHinhRepository extends JpaRepository<MoHinh, String> {
    List<MoHinh> findByTenMoHinhContainingIgnoreCase(String keyword);
}
