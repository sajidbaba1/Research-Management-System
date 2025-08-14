package com.sajidbaba1.researchmanagementsystem.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
public class ResearchAnalytics {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long projectId;
    private String projectTitle;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate actualEndDate;
    private Double completionRate;
    private Long durationDays;
    private Long actualDurationDays;
    private Boolean onTimeCompletion;
    
    private LocalDate calculatedDate;
}
