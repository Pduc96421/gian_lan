package com.gian_lan.detect.dto;

import lombok.Data;

@Data
public class ViolationRequest {
    private String cameraCaThiId;
    private String chiTiet;
    private String hinhAnhMinhChungUrl;
    private String hanhViGianLan;
    private String moHinhId;
}
