package com.gian_lan.detect.repository;

import com.gian_lan.detect.entity.CaThi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CaThiRepository extends JpaRepository<CaThi, String> {
}
