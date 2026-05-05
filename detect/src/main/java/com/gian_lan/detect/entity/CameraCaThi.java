package com.gian_lan.detect.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "camera_ca_thi")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CameraCaThi {
    @Id
    private String id;
    
    private String duongDanVideo;
    
    @ManyToOne
    @JoinColumn(name = "camera_id")
    private Camera camera;
    
    @ManyToOne
    @JoinColumn(name = "ca_thi_id")
    private CaThi caThi;
}
