package com.gian_lan.dataset.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "mau_hanh_vi")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MauHanhVi {

    @Id
    private String id;

    @Column(name = "duong_dan_du_lieu")
    private String duongDanDuLieu;

    @Column(name = "ngay_tao")
    private String ngayTao;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hanh_vi_id", nullable = false)
    private HanhViGianLan hanhViGianLan;
}
