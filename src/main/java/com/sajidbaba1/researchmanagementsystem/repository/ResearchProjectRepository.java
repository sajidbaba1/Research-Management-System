package com.sajidbaba1.researchmanagementsystem.repository;

import com.sajidbaba1.researchmanagementsystem.entity.ResearchProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ResearchProjectRepository extends JpaRepository<ResearchProject, Long> {
    
    @Query("SELECT COUNT(p) FROM ResearchProject p WHERE p.status = :status")
    long countByStatus(@Param("status") String status);
    
    @Query("SELECT p.status, COUNT(p) FROM ResearchProject p GROUP BY p.status")
    List<Object[]> countByStatus();
}