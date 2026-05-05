package com.gian_lan.detect.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Table(name = "ket_qua_nhan_dang")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KetQuaNhanDang {
    @Id
    private String id;
    
    private Date thoiDiemPhatHien;
    
    @Column(columnDefinition = "TEXT")
    private String chiTiet;
    
    private String hinhAnhMinhChungUrl;
    
    private String hanhViGianLan;
    
    private String moHinhId;
    
    @ManyToOne
    @JoinColumn(name = "camera_ca_thi_id")
    private CameraCaThi cameraCaThi;
}
