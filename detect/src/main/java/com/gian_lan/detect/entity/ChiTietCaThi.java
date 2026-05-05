package com.gian_lan.detect.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "chi_tiet_ca_thi")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietCaThi {
    @Id
    private String id;
    
    @ManyToOne
    @JoinColumn(name = "sinh_vien_id")
    private SinhVien sinhVien;
    
    @ManyToOne
    @JoinColumn(name = "ca_thi_id")
    private CaThi caThi;
}
