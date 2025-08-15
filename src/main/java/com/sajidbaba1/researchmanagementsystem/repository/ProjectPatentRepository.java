package com.sajidbaba1.researchmanagementsystem.repository;

import com.sajidbaba1.researchmanagementsystem.entity.ProjectPatent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectPatentRepository extends JpaRepository<ProjectPatent, Long> {
    
    List<ProjectPatent> findByProjectId(Long projectId);
    
    List<ProjectPatent> findByProjectIdAndStatus(Long projectId, String status);
    
    List<ProjectPatent> findByProjectIdAndType(Long projectId, String type);
    
    List<ProjectPatent> findByInventorsContaining(String inventor);
    
    @Query("SELECT p FROM ProjectPatent p WHERE p.project.id = :projectId AND p.status IN :statuses")
    List<ProjectPatent> findByProjectIdAndStatusIn(@Param("projectId") Long projectId, @Param("statuses") List<String> statuses);
}
