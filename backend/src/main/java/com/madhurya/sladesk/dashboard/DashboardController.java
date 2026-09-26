package com.madhurya.sladesk.dashboard;

import com.madhurya.sladesk.dashboard.dto.DashboardSummaryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService service;

    @GetMapping("/summary")
    public DashboardSummaryDto summary() {
        return service.summary();
    }
}