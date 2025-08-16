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
        
        // Handle null dates and edge cases
        LocalDate startDate = project.getStartDate();
        LocalDate endDate = project.getEndDate();
        LocalDate today = LocalDate.now();
        
        if (startDate == null) {
            startDate = today;
        }
        
        if (endDate == null) {
            endDate = startDate.plusDays(30); // Default 30 days if no end date
        }
        
        // Calculate duration
        long durationDays = Math.max(1, ChronoUnit.DAYS.between(startDate, endDate));
        analytics.setDurationDays(durationDays);
        
        // Calculate actual duration based on current date
        long actualDurationDays = Math.max(0, ChronoUnit.DAYS.between(startDate, today));
        analytics.setActualDurationDays(actualDurationDays);
        
        // Calculate completion rate
        double completionRate = 0.0;
        if (durationDays > 0) {
            completionRate = Math.min(100.0, Math.max(0.0, 
                (double) actualDurationDays / durationDays * 100));
            
            // If project is overdue, cap at 100%
            if (today.isAfter(endDate)) {
                completionRate = 100.0;
            }
        }
        
        analytics.setCompletionRate(completionRate);
        analytics.setActualEndDate(today.isAfter(endDate) ? today : endDate);
        
        // Determine on-time completion
        boolean onTimeCompletion = today.isBefore(endDate) || today.equals(endDate);
        analytics.setOnTimeCompletion(onTimeCompletion);
        
        return analyticsRepository.save(analytics);
    }

    public void calculateAllProjectsAnalytics() {
        List<ResearchProject> projects = projectRepository.findAll();
        for (ResearchProject project : projects) {
            try {
                calculateProjectAnalytics(project.getId());
            } catch (Exception e) {
                System.err.println("Error calculating analytics for project " + project.getId() + ": " + e.getMessage());
            }
        }
    }

    public void deleteById(Long id) {
        analyticsRepository.deleteById(id);
    }
}
