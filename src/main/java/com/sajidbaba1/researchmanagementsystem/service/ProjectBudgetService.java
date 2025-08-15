package com.sajidbaba1.researchmanagementsystem.service;

import com.sajidbaba1.researchmanagementsystem.entity.ProjectBudget;
import com.sajidbaba1.researchmanagementsystem.repository.ProjectBudgetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProjectBudgetService {
    
    @Autowired
    private ProjectBudgetRepository projectBudgetRepository;
    
    public List<ProjectBudget> findAll() {
        return projectBudgetRepository.findAll();
    }
    
    public Optional<ProjectBudget> findById(Long id) {
        return projectBudgetRepository.findById(id);
    }
    
    public ProjectBudget save(ProjectBudget budget) {
        return projectBudgetRepository.save(budget);
    }
    
    public void deleteById(Long id) {
        projectBudgetRepository.deleteById(id);
    }
    
    public List<ProjectBudget> findByProjectId(Long projectId) {
        return projectBudgetRepository.findByProjectId(projectId);
    }
    
    public List<ProjectBudget> findByProjectIdAndCategory(Long projectId, String category) {
        return projectBudgetRepository.findByProjectIdAndCategory(projectId, category);
    }
    
    public List<ProjectBudget> findByProjectIdAndStatus(Long projectId, String status) {
        return projectBudgetRepository.findByProjectIdAndStatus(projectId, status);
    }
    
    public Double sumBudgetedAmountByProjectId(Long projectId) {
        return projectBudgetRepository.sumBudgetedAmountByProjectId(projectId);
    }
    
    public Double sumActualAmountByProjectId(Long projectId) {
        return projectBudgetRepository.sumActualAmountByProjectId(projectId);
    }
    
    public Double calculateBudgetUtilization(Long projectId) {
        Double budgeted = sumBudgetedAmountByProjectId(projectId);
        Double actual = sumActualAmountByProjectId(projectId);
        if (budgeted != null && budgeted > 0) {
            return (actual / budgeted) * 100;
        }
        return 0.0;
    }
}
