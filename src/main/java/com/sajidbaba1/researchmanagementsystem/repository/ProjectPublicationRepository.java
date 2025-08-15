package com.sajidbaba1.researchmanagementsystem.repository;

import com.sajidbaba1.researchmanagementsystem.entity.ProjectPublication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectPublicationRepository extends JpaRepository<ProjectPublication, Long> {
    
    List<ProjectPublication> findByProjectId(Long projectId);
    
    List<ProjectPublication> findByProjectIdAndStatus(Long projectId, String status);
    
    List<ProjectPublication> findByProjectIdAndType(Long projectId, String type);
    
    List<ProjectPublication> findByAuthorsContaining(String author);
    
    @Query("SELECT p FROM ProjectPublication p WHERE p.project.id = :projectId AND p.status IN :statuses")
    List<ProjectPublication> findByProjectIdAndStatusIn(@Param("projectId") Long projectId, @Param("statuses") List<String> statuses);
}
