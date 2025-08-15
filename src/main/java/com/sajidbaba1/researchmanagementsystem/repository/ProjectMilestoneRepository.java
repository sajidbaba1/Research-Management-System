package com.sajidbaba1.researchmanagementsystem.repository;

import com.sajidbaba1.researchmanagementsystem.entity.ProjectMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectMilestoneRepository extends JpaRepository<ProjectMilestone, Long> {
    
    List<ProjectMilestone> findByProjectId(Long projectId);
    
    List<ProjectMilestone> findByProjectIdAndStatus(Long projectId, String status);
    
    List<ProjectMilestone> findByProjectIdOrderByDueDateAsc(Long projectId);
    
    @Query("SELECT m FROM ProjectMilestone m WHERE m.project.id = :projectId AND m.status IN :statuses")
    List<ProjectMilestone> findByProjectIdAndStatusIn(@Param("projectId") Long projectId, @Param("statuses") List<String> statuses);
}
