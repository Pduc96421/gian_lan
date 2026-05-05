package com.gian_lan.detect.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Entity
@Table(name = "ca_thi")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CaThi {
    @Id
    private String id;
    
    private Date thoiGianBatDau;
    private Integer thoiLuongPhut;
    
    @Enumerated(EnumType.STRING)
    private TrangThaiCaThi trangThai;
    
    @ManyToOne
    @JoinColumn(name = "phong_id")
    private Phong phong;
    
    @ManyToOne
    @JoinColumn(name = "mon_id")
    private Mon mon;
}
