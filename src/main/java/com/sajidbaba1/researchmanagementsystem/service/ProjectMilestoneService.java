package com.sajidbaba1.researchmanagementsystem.service;

import com.sajidbaba1.researchmanagementsystem.entity.ProjectMilestone;
import com.sajidbaba1.researchmanagementsystem.repository.ProjectMilestoneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProjectMilestoneService {
    
    @Autowired
    private ProjectMilestoneRepository projectMilestoneRepository;
    
    public List<ProjectMilestone> findAll() {
        return projectMilestoneRepository.findAll();
    }
    
    public Optional<ProjectMilestone> findById(Long id) {
        return projectMilestoneRepository.findById(id);
    }
    
    public ProjectMilestone save(ProjectMilestone milestone) {
        return projectMilestoneRepository.save(milestone);
    }
    
    public void deleteById(Long id) {
        projectMilestoneRepository.deleteById(id);
    }
    
    public List<ProjectMilestone> findByProjectId(Long projectId) {
        return projectMilestoneRepository.findByProjectId(projectId);
    }
    
    public List<ProjectMilestone> findByProjectIdAndStatus(Long projectId, String status) {
        return projectMilestoneRepository.findByProjectIdAndStatus(projectId, status);
    }
    
    public List<ProjectMilestone> findByProjectIdOrderByDueDateAsc(Long projectId) {
        return projectMilestoneRepository.findByProjectIdOrderByDueDateAsc(projectId);
    }
    
    public List<ProjectMilestone> findByProjectIdAndStatusIn(Long projectId, List<String> statuses) {
        return projectMilestoneRepository.findByProjectIdAndStatusIn(projectId, statuses);
    }
}
