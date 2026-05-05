package com.gian_lan.detect.repository;

import com.gian_lan.detect.entity.CameraCaThi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CameraCaThiRepository extends JpaRepository<CameraCaThi, String> {
    List<CameraCaThi> findByCaThiId(String caThiId);
}
