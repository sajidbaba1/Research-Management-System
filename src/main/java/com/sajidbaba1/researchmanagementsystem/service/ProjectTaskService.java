package com.sajidbaba1.researchmanagementsystem.service;

import com.sajidbaba1.researchmanagementsystem.entity.ProjectTask;
import com.sajidbaba1.researchmanagementsystem.repository.ProjectTaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProjectTaskService {
    
    @Autowired
    private ProjectTaskRepository projectTaskRepository;
    
    public List<ProjectTask> findAll() {
        return projectTaskRepository.findAll();
    }
    
    public Optional<ProjectTask> findById(Long id) {
        return projectTaskRepository.findById(id);
    }
    
    public ProjectTask save(ProjectTask task) {
        return projectTaskRepository.save(task);
    }
    
    public void deleteById(Long id) {
        projectTaskRepository.deleteById(id);
    }
    
    public List<ProjectTask> findByProjectId(Long projectId) {
        return projectTaskRepository.findByProjectId(projectId);
    }
    
    public List<ProjectTask> findByProjectIdAndStatus(Long projectId, String status) {
        return projectTaskRepository.findByProjectIdAndStatus(projectId, status);
    }
    
    public List<ProjectTask> findByProjectIdAndAssignedToId(Long projectId, Long assignedToId) {
        return projectTaskRepository.findByProjectIdAndAssignedToId(projectId, assignedToId);
    }
    
    public List<ProjectTask> findByProjectIdOrderByDueDateAsc(Long projectId) {
        return projectTaskRepository.findByProjectIdOrderByDueDateAsc(projectId);
    }
    
    public List<ProjectTask> findByProjectIdAndPriority(Long projectId, String priority) {
        return projectTaskRepository.findByProjectIdAndPriority(projectId, priority);
    }
    
    public List<ProjectTask> findByProjectIdAndStatusIn(Long projectId, List<String> statuses) {
        return projectTaskRepository.findByProjectIdAndStatusIn(projectId, statuses);
    }
}
