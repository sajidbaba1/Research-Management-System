package com.sajidbaba1.researchmanagementsystem.service;

import com.sajidbaba1.researchmanagementsystem.entity.ProjectRisk;
import com.sajidbaba1.researchmanagementsystem.repository.ProjectRiskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProjectRiskService {
    
    @Autowired
    private ProjectRiskRepository projectRiskRepository;
    
    public List<ProjectRisk> findAll() {
        return projectRiskRepository.findAll();
    }
    
    public Optional<ProjectRisk> findById(Long id) {
        return projectRiskRepository.findById(id);
    }
    
    public ProjectRisk save(ProjectRisk risk) {
        return projectRiskRepository.save(risk);
    }
    
    public void deleteById(Long id) {
        projectRiskRepository.deleteById(id);
    }
    
    public List<ProjectRisk> findByProjectId(Long projectId) {
        return projectRiskRepository.findByProjectId(projectId);
    }
    
    public List<ProjectRisk> findByProjectIdAndStatus(Long projectId, String status) {
        return projectRiskRepository.findByProjectIdAndStatus(projectId, status);
    }
    
    public List<ProjectRisk> findByProjectIdAndCategory(Long projectId, String category) {
        return projectRiskRepository.findByProjectIdAndCategory(projectId, category);
    }
    
    public List<ProjectRisk> findByProjectIdAndProbability(Long projectId, Integer probability) {
        return projectRiskRepository.findByProjectIdAndProbability(projectId, probability);
    }
    
    public List<ProjectRisk> findByProjectIdAndImpact(Long projectId, Integer impact) {
        return projectRiskRepository.findByProjectIdAndImpact(projectId, impact);
    }
    
    public List<ProjectRisk> findByProjectIdAndStatusIn(Long projectId, List<String> statuses) {
        return projectRiskRepository.findByProjectIdAndStatusIn(projectId, statuses);
    }
    
    public long countHighRiskByProjectId(Long projectId) {
        return projectRiskRepository.findByProjectId(projectId).stream()
            .filter(risk -> "HIGH".equals(risk.getImpact()) && "HIGH".equals(risk.getProbability()))
            .count();
    }
}
