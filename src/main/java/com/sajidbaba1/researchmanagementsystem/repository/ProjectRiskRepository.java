package com.sajidbaba1.researchmanagementsystem.repository;

import com.sajidbaba1.researchmanagementsystem.entity.ProjectRisk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectRiskRepository extends JpaRepository<ProjectRisk, Long> {
    
    List<ProjectRisk> findByProjectId(Long projectId);
    
    List<ProjectRisk> findByProjectIdAndStatus(Long projectId, String status);
    
    List<ProjectRisk> findByProjectIdAndCategory(Long projectId, String category);
    
    List<ProjectRisk> findByProjectIdAndProbability(Long projectId, Integer probability);
    
    List<ProjectRisk> findByProjectIdAndImpact(Long projectId, Integer impact);
    
    @Query("SELECT r FROM ProjectRisk r WHERE r.project.id = :projectId AND r.status IN :statuses")
    List<ProjectRisk> findByProjectIdAndStatusIn(@Param("projectId") Long projectId, @Param("statuses") List<String> statuses);
}
