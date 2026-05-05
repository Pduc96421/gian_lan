package com.gian_lan.model.dto;

import lombok.Data;
import java.util.List;

@Data
public class KetQuaTrainRequest {
    private float accuracy;
    private float precision;
    private float recall;
    private float f1Score;
    private String duongDanMoHinh;
    private List<String> mauHanhViIds;
}
