package com.sajidbaba1.researchmanagementsystem.repository;

import com.sajidbaba1.researchmanagementsystem.entity.ProjectTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectTaskRepository extends JpaRepository<ProjectTask, Long> {
    
    List<ProjectTask> findByProjectId(Long projectId);
    
    List<ProjectTask> findByProjectIdAndStatus(Long projectId, String status);
    
    List<ProjectTask> findByProjectIdAndAssignedToId(Long projectId, Long assignedToId);
    
    List<ProjectTask> findByProjectIdOrderByDueDateAsc(Long projectId);
    
    List<ProjectTask> findByProjectIdAndPriority(Long projectId, String priority);
    
    @Query("SELECT t FROM ProjectTask t WHERE t.project.id = :projectId AND t.status IN :statuses")
    List<ProjectTask> findByProjectIdAndStatusIn(@Param("projectId") Long projectId, @Param("statuses") List<String> statuses);
}
