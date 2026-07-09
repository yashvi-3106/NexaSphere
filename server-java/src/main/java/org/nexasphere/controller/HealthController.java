package org.nexasphere.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.management.ManagementFactory;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "healthy");
        
        // Get JVM uptime in seconds
        long uptimeMillis = ManagementFactory.getRuntimeMXBean().getUptime();
        response.put("uptime", uptimeMillis / 1000.0);
        
        return ResponseEntity.ok(response);
    }
}
