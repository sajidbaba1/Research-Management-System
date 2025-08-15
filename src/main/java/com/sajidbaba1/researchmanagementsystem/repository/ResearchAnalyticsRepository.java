package com.sajidbaba1.researchmanagementsystem.repository;

import com.sajidbaba1.researchmanagementsystem.entity.ResearchAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ResearchAnalyticsRepository extends JpaRepository<ResearchAnalytics, Long> {
    
    @Query("SELECT ra FROM ResearchAnalytics ra ORDER BY ra.calculatedDate DESC")
    List<ResearchAnalytics> findAllOrderByCalculatedDateDesc();
    
    List<ResearchAnalytics> findByProjectId(Long projectId);
}
