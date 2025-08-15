package com.sajidbaba1.researchmanagementsystem.repository;

import com.sajidbaba1.researchmanagementsystem.entity.ProjectBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectBudgetRepository extends JpaRepository<ProjectBudget, Long> {
    
    List<ProjectBudget> findByProjectId(Long projectId);
    
    List<ProjectBudget> findByProjectIdAndCategory(Long projectId, String category);
    
    List<ProjectBudget> findByProjectIdAndStatus(Long projectId, String status);
    
    @Query("SELECT SUM(b.budgetedAmount) FROM ProjectBudget b WHERE b.project.id = :projectId")
    Double sumBudgetedAmountByProjectId(@Param("projectId") Long projectId);
    
    @Query("SELECT SUM(b.actualAmount) FROM ProjectBudget b WHERE b.project.id = :projectId")
    Double sumActualAmountByProjectId(@Param("projectId") Long projectId);
}
