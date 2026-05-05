package com.gian_lan.detect;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class DetectApplication {

	public static void main(String[] args) {
		SpringApplication.run(DetectApplication.class, args);
	}

}
