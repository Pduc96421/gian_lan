package com.gian_lan.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "mo_hinh")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MoHinh {

    @Id
    private String id;

    @Column(name = "ten_mo_hinh", nullable = false)
    private String tenMoHinh;

    @Column(nullable = false)
    private float accuracy;

    // "precision" là từ khoá MySQL → đặt tên cột khác
    @Column(name = "ket_qua_precision", nullable = false)
    private float precision;

    @Column(nullable = false)
    private float recall;

    @Column(name = "f1_score", nullable = false)
    private float f1Score;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false)
    private TrangThaiMoHinh trangThai;

    @Column(name = "duong_dan_mo_hinh")
    private String duongDanMoHinh;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @JoinColumn(name = "mo_hinh_id")
    private List<MoHinhMau> moHinhMaus = new ArrayList<>();
}
