package com.sajidbaba1.researchmanagementsystem.repository;

import com.sajidbaba1.researchmanagementsystem.entity.ProjectDeliverable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectDeliverableRepository extends JpaRepository<ProjectDeliverable, Long> {
    
    List<ProjectDeliverable> findByProjectId(Long projectId);
    
    List<ProjectDeliverable> findByProjectIdAndStatus(Long projectId, String status);
    
    List<ProjectDeliverable> findByProjectIdAndType(Long projectId, String type);
    
    List<ProjectDeliverable> findByProjectIdAndResponsiblePerson(Long projectId, String responsiblePerson);
    
    @Query("SELECT d FROM ProjectDeliverable d WHERE d.project.id = :projectId AND d.status IN :statuses")
    List<ProjectDeliverable> findByProjectIdAndStatusIn(@Param("projectId") Long projectId, @Param("statuses") List<String> statuses);
}
