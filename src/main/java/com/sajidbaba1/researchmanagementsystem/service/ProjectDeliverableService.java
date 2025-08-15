package com.sajidbaba1.researchmanagementsystem.service;

import com.sajidbaba1.researchmanagementsystem.entity.ProjectDeliverable;
import com.sajidbaba1.researchmanagementsystem.repository.ProjectDeliverableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProjectDeliverableService {
    
    @Autowired
    private ProjectDeliverableRepository projectDeliverableRepository;
    
    public List<ProjectDeliverable> findAll() {
        return projectDeliverableRepository.findAll();
    }
    
    public Optional<ProjectDeliverable> findById(Long id) {
        return projectDeliverableRepository.findById(id);
    }
    
    public ProjectDeliverable save(ProjectDeliverable deliverable) {
        return projectDeliverableRepository.save(deliverable);
    }
    
    public void deleteById(Long id) {
        projectDeliverableRepository.deleteById(id);
    }
    
    public List<ProjectDeliverable> findByProjectId(Long projectId) {
        return projectDeliverableRepository.findByProjectId(projectId);
    }
    
    public List<ProjectDeliverable> findByProjectIdAndStatus(Long projectId, String status) {
        return projectDeliverableRepository.findByProjectIdAndStatus(projectId, status);
    }
    
    public List<ProjectDeliverable> findByProjectIdAndType(Long projectId, String type) {
        return projectDeliverableRepository.findByProjectIdAndType(projectId, type);
    }
    
    public List<ProjectDeliverable> findByProjectIdAndResponsiblePerson(Long projectId, String responsiblePerson) {
        return projectDeliverableRepository.findByProjectIdAndResponsiblePerson(projectId, responsiblePerson);
    }
    
    public List<ProjectDeliverable> findByProjectIdAndStatusIn(Long projectId, List<String> statuses) {
        return projectDeliverableRepository.findByProjectIdAndStatusIn(projectId, statuses);
    }
}
