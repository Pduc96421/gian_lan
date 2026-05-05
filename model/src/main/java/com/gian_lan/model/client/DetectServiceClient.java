package com.gian_lan.model.client;

import com.gian_lan.model.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "detect-service")
public interface DetectServiceClient {

    @GetMapping("/api/detect/operational-stats/{modelId}")
    ApiResponse<Map<String, Object>> getOperationalStats(@PathVariable("modelId") String modelId);
}
