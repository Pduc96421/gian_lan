package com.gian_lan.model.entity;

public enum TrangThaiMoHinh {
    HOAN_THANH("Hoàn thành"),
    DANG_TRAIN("Đang huấn luyện");

    private final String label;

    TrangThaiMoHinh(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
