package com.gian_lan.model.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class TkMoHinh extends MoHinh {
    private int soCaThiSuDung;
    private int soPhatHienViPham;
    private int tongSoLuongMau;
}
