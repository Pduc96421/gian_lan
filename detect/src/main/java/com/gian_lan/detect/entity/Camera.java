package com.gian_lan.detect.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "camera")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Camera {
    @Id
    private String id;
    private String tenCamera;
    private String viTri;
}
