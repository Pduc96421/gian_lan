package com.gian_lan.detect.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "sinh_vien")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SinhVien {
    @Id
    private String id;
    private String maSv;
    private String hoTen;
    private String lop;
}
