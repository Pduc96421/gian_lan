package com.gian_lan.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "mo_hinh_mau")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MoHinhMau {

    @Id
    private String id;

    @Column(name = "loai")
    private String type;

    @Column(name = "mau_hanh_vi_id")
    private String mauHanhViId;
}
