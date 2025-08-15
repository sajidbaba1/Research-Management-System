package com.sajidbaba1.researchmanagementsystem.repository;

import com.sajidbaba1.researchmanagementsystem.entity.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    
    List<ProjectMember> findByProjectId(Long projectId);
    
    List<ProjectMember> findByProjectIdAndRole(Long projectId, String role);
    
    List<ProjectMember> findByProjectIdAndIsActiveTrue(Long projectId);
    
    @Query("SELECT pm FROM ProjectMember pm WHERE pm.project.id = :projectId AND pm.email = :email")
    ProjectMember findByProjectIdAndEmail(@Param("projectId") Long projectId, @Param("email") String email);
    
    @Query("SELECT pm FROM ProjectMember pm WHERE pm.email = :email")
    List<ProjectMember> findByEmail(@Param("email") String email);
}
