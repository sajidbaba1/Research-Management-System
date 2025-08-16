package com.sajidbaba1.researchmanagementsystem.controller;

import com.sajidbaba1.researchmanagementsystem.entity.ResearchAnalytics;
import com.sajidbaba1.researchmanagementsystem.service.ResearchAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class ResearchAnalyticsController {

    @Autowired
    private ResearchAnalyticsService analyticsService;

    @GetMapping
    public List<ResearchAnalytics> getAllAnalytics() {
        return analyticsService.getAllAnalytics();
    }

    @GetMapping("/project/{projectId}")
    public List<ResearchAnalytics> getAnalyticsByProjectId(@PathVariable Long projectId) {
        return analyticsService.getAnalyticsByProjectId(projectId);
    }

    @PostMapping("/calculate/{projectId}")
    public ResearchAnalytics calculateProjectAnalytics(@PathVariable Long projectId) {
        return analyticsService.calculateProjectAnalytics(projectId);
    }

    @PostMapping("/calculate-all")
    public void calculateAllProjectsAnalytics() {
        analyticsService.calculateAllProjectsAnalytics();
    }
}
