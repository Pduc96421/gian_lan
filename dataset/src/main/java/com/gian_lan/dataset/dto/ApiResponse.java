package com.gian_lan.dataset.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
    private int code;
    private String message;
    private T result;

    public static <T> ApiResponse<T> ok(T result) {
        return new ApiResponse<>(200, "Thành công", result);
    }

    public static <T> ApiResponse<T> ok(String message, T result) {
        return new ApiResponse<>(200, message, result);
    }

    public static <T> ApiResponse<T> fail(int code, String message) {
        return new ApiResponse<>(code, message, null);
    }
}
