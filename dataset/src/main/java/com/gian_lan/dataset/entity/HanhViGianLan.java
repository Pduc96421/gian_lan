package com.gian_lan.dataset.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "hanh_vi_gian_lan")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class HanhViGianLan {

    @Id
    private String id;

    @Column(name = "ten_hanh_vi", nullable = false)
    private String tenHanhVi;

    @Column(name = "mo_ta", columnDefinition = "TEXT")
    private String moTa;
}
