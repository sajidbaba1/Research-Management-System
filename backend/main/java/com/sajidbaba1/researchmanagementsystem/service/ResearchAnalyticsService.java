package com.sajidbaba1.researchmanagementsystem.service;

import com.sajidbaba1.researchmanagementsystem.entity.ResearchAnalytics;
import com.sajidbaba1.researchmanagementsystem.entity.ResearchProject;
import com.sajidbaba1.researchmanagementsystem.repository.ResearchAnalyticsRepository;
import com.sajidbaba1.researchmanagementsystem.repository.ResearchProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class ResearchAnalyticsService {

    @Autowired
    private ResearchAnalyticsRepository analyticsRepository;

    @Autowired
    private ResearchProjectRepository projectRepository;

    public List<ResearchAnalytics> getAllAnalytics() {
        return analyticsRepository.findAllOrderByCalculatedDateDesc();
    }

    public List<ResearchAnalytics> getAnalyticsByProjectId(Long projectId) {
        return analyticsRepository.findByProjectId(projectId);
    }

    public ResearchAnalytics calculateProjectAnalytics(Long projectId) {
        Optional<ResearchProject> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) {
            return null;
        }

        ResearchProject project = projectOpt.get();
        ResearchAnalytics analytics = new ResearchAnalytics();
        
        analytics.setProjectId(project.getId());
        analytics.setProjectTitle(project.getTitle());
        analytics.setStartDate(project.getStartDate());
        analytics.setEndDate(project.getEndDate());
        analytics.setCalculatedDate(LocalDate.now());
        
        // Calculate duration
        long durationDays = ChronoUnit.DAYS.between(project.getStartDate(), project.getEndDate());
        analytics.setDurationDays(durationDays);
        
        // For completed projects, calculate actual duration
        LocalDate actualEndDate = project.getEndDate(); // Assuming this is actual completion
        analytics.setActualEndDate(actualEndDate);
        
        long actualDurationDays = ChronoUnit.DAYS.between(project.getStartDate(), actualEndDate);
        analytics.setActualDurationDays(actualDurationDays);
        
        // Calculate completion rate
        double completionRate = (double) durationDays / actualDurationDays * 100;
        analytics.setCompletionRate(Math.min(100.0, Math.max(0.0, completionRate)));
        
        // Check if completed on time
        boolean onTime = !actualEndDate.isAfter(project.getEndDate());
        analytics.setOnTimeCompletion(onTime);
        
        return analyticsRepository.save(analytics);
    }

    public void calculateAllProjectsAnalytics() {
        List<ResearchProject> projects = projectRepository.findAll();
        for (ResearchProject project : projects) {
            calculateProjectAnalytics(project.getId());
        }
    }
}
